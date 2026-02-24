import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const isAdmin = user.app_metadata?.role === "admin";
    if (!isAdmin) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    // Admin client with service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { action, ...params } = body;

    switch (action) {
      case "list_users": {
        const { page = 1, per_page = 25 } = params;
        const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: per_page });
        if (error) throw error;
        return jsonResponse(data);
      }

      case "get_user": {
        const { user_id } = params;
        const { data, error } = await adminClient.auth.admin.getUserById(user_id);
        if (error) throw error;
        return jsonResponse(data);
      }

      case "resend_confirmation": {
        const { user_id } = params;
        const { data: targetUser } = await adminClient.auth.admin.getUserById(user_id);
        if (!targetUser?.user?.email) throw new Error("User not found");
        const { error } = await adminClient.auth.admin.generateLink({ type: "signup", email: targetUser.user.email });
        if (error) throw error;
        return jsonResponse({ success: true });
      }

      case "reset_password": {
        const { user_id } = params;
        const { data: targetUser } = await adminClient.auth.admin.getUserById(user_id);
        if (!targetUser?.user?.email) throw new Error("User not found");
        const { error } = await adminClient.auth.admin.generateLink({ type: "recovery", email: targetUser.user.email });
        if (error) throw error;
        return jsonResponse({ success: true });
      }

      case "ban_user": {
        const { user_id } = params;
        const { error } = await adminClient.auth.admin.updateUserById(user_id, { ban_duration: "876000h" });
        if (error) throw error;
        return jsonResponse({ success: true });
      }

      case "unban_user": {
        const { user_id } = params;
        const { error } = await adminClient.auth.admin.updateUserById(user_id, { ban_duration: "none" });
        if (error) throw error;
        return jsonResponse({ success: true });
      }

      case "make_admin": {
        const { user_id } = params;
        const { error } = await adminClient.auth.admin.updateUserById(user_id, { app_metadata: { role: "admin" } });
        if (error) throw error;
        return jsonResponse({ success: true });
      }

      case "remove_admin": {
        const { user_id } = params;
        const { error } = await adminClient.auth.admin.updateUserById(user_id, { app_metadata: { role: "user" } });
        if (error) throw error;
        return jsonResponse({ success: true });
      }

      case "delete_user": {
        const { user_id } = params;
        const { error } = await adminClient.auth.admin.deleteUser(user_id);
        if (error) throw error;
        return jsonResponse({ success: true });
      }

      case "get_stats": {
        const { data: usersData } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 });
        const totalUsers = usersData?.total ?? 0;

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { count: reviewsThisWeek } = await adminClient
          .from("reviews").select("*", { count: "exact", head: true })
          .gte("created_at", weekAgo.toISOString());

        const { count: reviewsAllTime } = await adminClient
          .from("reviews").select("*", { count: "exact", head: true });

        const { data: energyData } = await adminClient.from("reviews").select("energy_score");
        const avgEnergy = energyData && energyData.length > 0
          ? Math.round((energyData.reduce((sum: number, r: any) => sum + (r.energy_score || 0), 0) / energyData.length) * 10) / 10
          : 0;

        const { count: activeStreaks } = await adminClient
          .from("profiles").select("*", { count: "exact", head: true })
          .gt("streak_count", 0);

        const { data: recentUsers } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const newSignups = recentUsers?.users?.filter((u: any) => new Date(u.created_at) >= weekAgo).length ?? 0;

        const signupsPerDay: Record<string, number> = {};
        for (let i = 0; i < 30; i++) {
          const d = new Date(); d.setDate(d.getDate() - i);
          signupsPerDay[d.toISOString().split("T")[0]] = 0;
        }
        recentUsers?.users?.forEach((u: any) => {
          const day = new Date(u.created_at).toISOString().split("T")[0];
          if (signupsPerDay[day] !== undefined) signupsPerDay[day]++;
        });

        const { data: recentReviews } = await adminClient
          .from("reviews").select("created_at")
          .gte("created_at", new Date(Date.now() - 12 * 7 * 86400000).toISOString());
        const reviewsPerWeek: Record<string, number> = {};
        for (let i = 0; i < 12; i++) {
          const d = new Date(); d.setDate(d.getDate() - i * 7);
          reviewsPerWeek[`W${d.toISOString().split("T")[0]}`] = 0;
        }
        recentReviews?.forEach((r: any) => {
          const d = new Date(r.created_at);
          const ws = new Date(d); ws.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1));
          const key = `W${ws.toISOString().split("T")[0]}`;
          if (reviewsPerWeek[key] !== undefined) reviewsPerWeek[key]++;
        });

        return jsonResponse({
          totalUsers, reviewsThisWeek: reviewsThisWeek ?? 0, reviewsAllTime: reviewsAllTime ?? 0,
          avgEnergy, activeStreaks: activeStreaks ?? 0, newSignups,
          signupsPerDay: Object.entries(signupsPerDay).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
          reviewsPerWeek: Object.entries(reviewsPerWeek).map(([week, count]) => ({ week: week.replace("W", ""), count })).sort((a, b) => a.week.localeCompare(b.week)),
        });
      }

      case "list_reviews": {
        const { page = 1, per_page = 50, user_id: uid, date_from, date_to } = params;
        let query = adminClient.from("reviews").select("*, profiles!inner(name, avatar_url)", { count: "exact" });
        if (uid) query = query.eq("user_id", uid);
        if (date_from) query = query.gte("created_at", date_from);
        if (date_to) query = query.lte("created_at", date_to);
        const from = (page - 1) * per_page;
        query = query.order("created_at", { ascending: false }).range(from, from + per_page - 1);
        const { data, count, error } = await query;
        if (error) throw error;
        return jsonResponse({ reviews: data, total: count });
      }

      case "get_review": {
        const { review_id } = params;
        const { data, error } = await adminClient.from("reviews").select("*, profiles(name, avatar_url)").eq("id", review_id).single();
        if (error) throw error;
        return jsonResponse(data);
      }

      case "delete_review": {
        const { review_id } = params;
        const { error } = await adminClient.from("reviews").delete().eq("id", review_id);
        if (error) throw error;
        return jsonResponse({ success: true });
      }

      case "update_setting": {
        const { key, value } = params;
        const { error } = await adminClient.from("app_settings").upsert({ key, value, updated_at: new Date().toISOString() });
        if (error) throw error;
        return jsonResponse({ success: true });
      }

      case "get_settings": {
        const { data, error } = await adminClient.from("app_settings").select("*");
        if (error) throw error;
        return jsonResponse(data);
      }

      case "list_users_enriched": {
        const { page = 1, per_page = 25, search, filter } = params;
        const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({ page, perPage: per_page });
        if (authError) throw authError;

        const userIds = authData.users.map((u: any) => u.id);
        const { data: profiles } = await adminClient.from("profiles").select("*").in("user_id", userIds);
        const { data: reviewCounts } = await adminClient.from("reviews").select("user_id").in("user_id", userIds);
        const { data: lastReviews } = await adminClient.from("reviews").select("user_id, created_at").in("user_id", userIds).order("created_at", { ascending: false });

        const reviewCountMap: Record<string, number> = {};
        reviewCounts?.forEach((r: any) => { reviewCountMap[r.user_id] = (reviewCountMap[r.user_id] || 0) + 1; });
        const lastReviewMap: Record<string, string> = {};
        lastReviews?.forEach((r: any) => { if (!lastReviewMap[r.user_id]) lastReviewMap[r.user_id] = r.created_at; });
        const profileMap: Record<string, any> = {};
        profiles?.forEach((p: any) => { profileMap[p.user_id] = p; });

        let enrichedUsers = authData.users.map((u: any) => ({
          id: u.id, email: u.email, created_at: u.created_at, banned_until: u.banned_until,
          role: u.app_metadata?.role || "user",
          name: profileMap[u.id]?.name || null, avatar_url: profileMap[u.id]?.avatar_url || null,
          streak_count: profileMap[u.id]?.streak_count || 0,
          total_reviews: reviewCountMap[u.id] || 0, last_review_date: lastReviewMap[u.id] || null,
        }));

        if (search) {
          const s = search.toLowerCase();
          enrichedUsers = enrichedUsers.filter((u: any) => u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s));
        }
        if (filter === "banned") enrichedUsers = enrichedUsers.filter((u: any) => u.banned_until && new Date(u.banned_until) > new Date());
        else if (filter === "admin") enrichedUsers = enrichedUsers.filter((u: any) => u.role === "admin");
        else if (filter === "active") enrichedUsers = enrichedUsers.filter((u: any) => !u.banned_until || new Date(u.banned_until) <= new Date());

        return jsonResponse({ users: enrichedUsers, total: authData.total });
      }

      default:
        return jsonResponse({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (err: any) {
    console.error("Admin action error:", err);
    return jsonResponse({ error: err.message || "Internal server error" }, 500);
  }
});

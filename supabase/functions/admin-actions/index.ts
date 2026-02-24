import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT and check admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create a client with the user's JWT to verify identity
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role in app_metadata
    const isAdmin = user.app_metadata?.role === "admin";
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client with service role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();

    switch (action) {
      // ── User Management ──
      case "list_users": {
        const { page = 1, per_page = 25 } = params;
        const { data, error } = await adminClient.auth.admin.listUsers({
          page,
          perPage: per_page,
        });
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_user": {
        const { user_id } = params;
        const { data, error } = await adminClient.auth.admin.getUserById(user_id);
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "resend_confirmation": {
        const { user_id } = params;
        const { data: targetUser } = await adminClient.auth.admin.getUserById(user_id);
        if (!targetUser?.user?.email) throw new Error("User not found");
        const { data, error } = await adminClient.auth.admin.generateLink({
          type: "signup",
          email: targetUser.user.email,
        });
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "reset_password": {
        const { user_id } = params;
        const { data: targetUser } = await adminClient.auth.admin.getUserById(user_id);
        if (!targetUser?.user?.email) throw new Error("User not found");
        const { data, error } = await adminClient.auth.admin.generateLink({
          type: "recovery",
          email: targetUser.user.email,
        });
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "ban_user": {
        const { user_id } = params;
        const { error } = await adminClient.auth.admin.updateUserById(user_id, {
          ban_duration: "876000h", // ~100 years
        });
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "unban_user": {
        const { user_id } = params;
        const { error } = await adminClient.auth.admin.updateUserById(user_id, {
          ban_duration: "none",
        });
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "make_admin": {
        const { user_id } = params;
        const { error } = await adminClient.auth.admin.updateUserById(user_id, {
          app_metadata: { role: "admin" },
        });
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "remove_admin": {
        const { user_id } = params;
        const { error } = await adminClient.auth.admin.updateUserById(user_id, {
          app_metadata: { role: "user" },
        });
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete_user": {
        const { user_id } = params;
        const { error } = await adminClient.auth.admin.deleteUser(user_id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ── Admin Stats ──
      case "get_stats": {
        // Total users
        const { data: usersData } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 });
        const totalUsers = usersData?.total ?? 0;

        // Reviews this week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { count: reviewsThisWeek } = await adminClient
          .from("reviews")
          .select("*", { count: "exact", head: true })
          .gte("created_at", weekAgo.toISOString());

        // Reviews all time
        const { count: reviewsAllTime } = await adminClient
          .from("reviews")
          .select("*", { count: "exact", head: true });

        // Avg energy score
        const { data: energyData } = await adminClient
          .from("reviews")
          .select("energy_score");
        const avgEnergy = energyData && energyData.length > 0
          ? Math.round((energyData.reduce((sum: number, r: any) => sum + (r.energy_score || 0), 0) / energyData.length) * 10) / 10
          : 0;

        // Active streaks
        const { count: activeStreaks } = await adminClient
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gt("streak_count", 0);

        // New signups last 7 days
        const { data: recentUsers } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const newSignups = recentUsers?.users?.filter((u: any) => {
          const created = new Date(u.created_at);
          return created >= weekAgo;
        }).length ?? 0;

        // Signups per day last 30 days
        const thirtyAgo = new Date();
        thirtyAgo.setDate(thirtyAgo.getDate() - 30);
        const signupsPerDay: Record<string, number> = {};
        for (let i = 0; i < 30; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          signupsPerDay[d.toISOString().split("T")[0]] = 0;
        }
        recentUsers?.users?.forEach((u: any) => {
          const day = new Date(u.created_at).toISOString().split("T")[0];
          if (signupsPerDay[day] !== undefined) signupsPerDay[day]++;
        });

        // Reviews per week last 12 weeks
        const { data: recentReviews } = await adminClient
          .from("reviews")
          .select("created_at")
          .gte("created_at", new Date(Date.now() - 12 * 7 * 86400000).toISOString());
        const reviewsPerWeek: Record<string, number> = {};
        for (let i = 0; i < 12; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i * 7);
          const weekKey = `W${d.toISOString().split("T")[0]}`;
          reviewsPerWeek[weekKey] = 0;
        }
        recentReviews?.forEach((r: any) => {
          const d = new Date(r.created_at);
          const weekStart = new Date(d);
          weekStart.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1));
          const weekKey = `W${weekStart.toISOString().split("T")[0]}`;
          if (reviewsPerWeek[weekKey] !== undefined) reviewsPerWeek[weekKey]++;
        });

        return new Response(JSON.stringify({
          totalUsers,
          reviewsThisWeek: reviewsThisWeek ?? 0,
          reviewsAllTime: reviewsAllTime ?? 0,
          avgEnergy,
          activeStreaks: activeStreaks ?? 0,
          newSignups,
          signupsPerDay: Object.entries(signupsPerDay)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date)),
          reviewsPerWeek: Object.entries(reviewsPerWeek)
            .map(([week, count]) => ({ week: week.replace("W", ""), count }))
            .sort((a, b) => a.week.localeCompare(b.week)),
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ── All Reviews (admin) ──
      case "list_reviews": {
        const { page = 1, per_page = 50, user_id, date_from, date_to } = params;
        let query = adminClient
          .from("reviews")
          .select("*, profiles!inner(name, avatar_url)", { count: "exact" });

        if (user_id) query = query.eq("user_id", user_id);
        if (date_from) query = query.gte("created_at", date_from);
        if (date_to) query = query.lte("created_at", date_to);

        const from = (page - 1) * per_page;
        const to = from + per_page - 1;
        query = query.order("created_at", { ascending: false }).range(from, to);

        const { data, count, error } = await query;
        if (error) throw error;
        return new Response(JSON.stringify({ reviews: data, total: count }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_review": {
        const { review_id } = params;
        const { data, error } = await adminClient
          .from("reviews")
          .select("*, profiles(name, avatar_url)")
          .eq("id", review_id)
          .single();
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete_review": {
        const { review_id } = params;
        const { error } = await adminClient
          .from("reviews")
          .delete()
          .eq("id", review_id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ── Settings ──
      case "update_setting": {
        const { key, value } = params;
        const { error } = await adminClient
          .from("app_settings")
          .upsert({ key, value, updated_at: new Date().toISOString() });
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_settings": {
        const { data, error } = await adminClient
          .from("app_settings")
          .select("*");
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ── Users with profiles (enriched) ──
      case "list_users_enriched": {
        const { page = 1, per_page = 25, search, filter } = params;
        
        // Get auth users
        const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
          page,
          perPage: per_page,
        });
        if (authError) throw authError;

        const userIds = authData.users.map((u: any) => u.id);

        // Get profiles
        const { data: profiles } = await adminClient
          .from("profiles")
          .select("*")
          .in("user_id", userIds);

        // Get review counts
        const { data: reviewCounts } = await adminClient
          .from("reviews")
          .select("user_id")
          .in("user_id", userIds);

        const reviewCountMap: Record<string, number> = {};
        reviewCounts?.forEach((r: any) => {
          reviewCountMap[r.user_id] = (reviewCountMap[r.user_id] || 0) + 1;
        });

        // Get last review dates
        const { data: lastReviews } = await adminClient
          .from("reviews")
          .select("user_id, created_at")
          .in("user_id", userIds)
          .order("created_at", { ascending: false });

        const lastReviewMap: Record<string, string> = {};
        lastReviews?.forEach((r: any) => {
          if (!lastReviewMap[r.user_id]) lastReviewMap[r.user_id] = r.created_at;
        });

        const profileMap: Record<string, any> = {};
        profiles?.forEach((p: any) => { profileMap[p.user_id] = p; });

        let enrichedUsers = authData.users.map((u: any) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          banned_until: u.banned_until,
          role: u.app_metadata?.role || "user",
          name: profileMap[u.id]?.name || null,
          avatar_url: profileMap[u.id]?.avatar_url || null,
          streak_count: profileMap[u.id]?.streak_count || 0,
          total_reviews: reviewCountMap[u.id] || 0,
          last_review_date: lastReviewMap[u.id] || null,
        }));

        // Apply search filter
        if (search) {
          const s = search.toLowerCase();
          enrichedUsers = enrichedUsers.filter((u: any) =>
            (u.name?.toLowerCase().includes(s)) || (u.email?.toLowerCase().includes(s))
          );
        }

        // Apply status filter
        if (filter === "banned") {
          enrichedUsers = enrichedUsers.filter((u: any) => u.banned_until && new Date(u.banned_until) > new Date());
        } else if (filter === "admin") {
          enrichedUsers = enrichedUsers.filter((u: any) => u.role === "admin");
        } else if (filter === "active") {
          enrichedUsers = enrichedUsers.filter((u: any) => !u.banned_until || new Date(u.banned_until) <= new Date());
        }

        return new Response(JSON.stringify({ users: enrichedUsers, total: authData.total }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

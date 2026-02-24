import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all reviews for this user
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("wins, blockers, ai_summary, focus_items, energy_score, week_start_date, answers")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (reviewsError) throw reviewsError;
    if (!reviews || reviews.length < 2) {
      return new Response(JSON.stringify({ 
        patterns: [],
        message: "Need at least 2 reviews to identify patterns." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const reviewsSummary = reviews.map((r, i) => {
      return `Review ${i + 1} (${r.week_start_date}):
- Win: ${r.wins || 'N/A'}
- Blockers: ${r.blockers || 'N/A'}
- Summary: ${r.ai_summary || 'N/A'}
- Energy: ${r.energy_score}/10
- Focus items: ${JSON.stringify(r.focus_items || [])}`;
    }).join("\n\n");

    const prompt = `Analyze these ${reviews.length} weekly reviews and identify recurring patterns. Return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "patterns": [
    {
      "theme": "Short theme name (2-4 words)",
      "description": "1-2 sentence description of the pattern",
      "frequency": "How often this appears (e.g. '4 out of 6 weeks')",
      "type": "positive" | "negative" | "neutral",
      "advice": "One actionable suggestion based on this pattern"
    }
  ],
  "energy_trend": "rising" | "falling" | "stable",
  "overall_insight": "A 2-sentence overall observation about their work patterns"
}

Rules:
- Identify 3-5 most significant recurring patterns
- type: "positive" for good habits, "negative" for recurring issues, "neutral" for observations
- Be specific and reference actual content from their reviews
- energy_trend: based on energy_score trajectory across reviews

Reviews:

${reviewsSummary}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      throw new Error("Anthropic API error");
    }

    const aiData = await response.json();
    let text = aiData.content?.[0]?.text;
    if (!text) throw new Error("No response from Anthropic");

    // Strip markdown code fences if present
    text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

    const result = JSON.parse(text);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-patterns error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

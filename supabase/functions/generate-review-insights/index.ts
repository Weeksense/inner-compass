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

    const { answers } = await req.json();
    if (!answers || !Array.isArray(answers) || answers.length !== 7) {
      return new Response(JSON.stringify({ error: "Expected 7 answers" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const questions = [
      "What was your biggest win this week?",
      "What did you not finish that you wanted to?",
      "What held you back the most?",
      "What task did you keep avoiding – and why?",
      "What drained your energy?",
      "What gave you energy or felt effortless?",
      "If you could change one thing about how you worked this week, what would it be?",
    ];

    const formattedAnswers = questions
      .map((q, i) => `Q: ${q}\nA: ${answers[i]}`)
      .join("\n\n");

    const prompt = `Analyze these weekly reflection answers and return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "summary": "A 2-3 sentence summary of the week",
  "biggest_win": "The single biggest win, rephrased encouragingly",
  "blockers": ["blocker 1", "blocker 2", "blocker 3"],
  "focus_items": ["action item 1", "action item 2", "action item 3"],
  "energy_score": 7
}

Rules:
- summary: 2-3 sentences capturing the week's overall theme
- biggest_win: reframe positively and encouragingly
- blockers: exactly 3 key things that held them back
- focus_items: exactly 3 specific, actionable items for next week
- energy_score: integer 1-10 based on overall tone

Here are the answers:

${formattedAnswers}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      throw new Error("Anthropic API error");
    }

    const aiData = await response.json();
    const text = aiData.content?.[0]?.text;
    if (!text) throw new Error("No response text from Anthropic");

    const insights = JSON.parse(text);

    // Clamp and normalize
    insights.energy_score = Math.max(1, Math.min(10, Math.round(insights.energy_score)));
    insights.focus_items = (insights.focus_items || []).slice(0, 3);
    insights.blockers = (insights.blockers || []).slice(0, 3);

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-review-insights error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

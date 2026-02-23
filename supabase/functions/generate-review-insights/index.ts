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
    // Authenticate
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
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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

    const systemPrompt = `You are an expert weekly review coach. Analyze the user's weekly reflection answers and generate structured insights. You MUST use the provided tool to return your analysis.`;

    const userPrompt = `Here are my weekly reflection answers:\n\n${formattedAnswers}\n\nPlease analyze these answers and generate insights.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_insights",
              description: "Return structured weekly review insights",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "A one-paragraph summary of the week (2-3 sentences)",
                  },
                  biggest_win: {
                    type: "string",
                    description: "The single biggest win, rephrased as an encouraging insight",
                  },
                  blockers: {
                    type: "string",
                    description: "Summary of what held the person back this week",
                  },
                  focus_items: {
                    type: "array",
                    items: { type: "string" },
                    description: "Exactly 3 specific, actionable focus items for next week",
                  },
                  energy_score: {
                    type: "number",
                    description: "Energy/mood score from 1-10 based on the overall tone of answers",
                  },
                },
                required: ["summary", "biggest_win", "blockers", "focus_items", "energy_score"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_insights" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI");
    }

    const insights = JSON.parse(toolCall.function.arguments);

    // Clamp energy score
    insights.energy_score = Math.max(1, Math.min(10, Math.round(insights.energy_score)));
    // Ensure exactly 3 focus items
    insights.focus_items = (insights.focus_items || []).slice(0, 3);

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

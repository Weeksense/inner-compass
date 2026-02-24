import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) throw new Error('RESEND_API_KEY not set');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current UTC time
    const now = new Date();
    const currentDay = (now.getUTCDay() + 6) % 7; // Monday=0
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();

    // Fetch profiles where review_day matches and review_time is within ±15 min
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, name, review_time, streak_count')
      .eq('review_day', currentDay);

    if (error) throw error;
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Filter by time window (±15 min)
    const matchingProfiles = profiles.filter(p => {
      if (!p.review_time) return false;
      const [h, m] = p.review_time.split(':').map(Number);
      const profileMinutes = h * 60 + m;
      const currentMinutes = currentHour * 60 + currentMinute;
      const diff = Math.abs(profileMinutes - currentMinutes);
      return diff <= 15 || diff >= 1425; // handle midnight wrap
    });

    // Get emails for matching users
    let sentCount = 0;
    for (const profile of matchingProfiles) {
      const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id);
      const email = userData?.user?.email;
      if (!email) continue;

      const firstName = profile.name?.split(' ')[0] || 'there';
      const streakText = profile.streak_count > 0
        ? `You're on a ${profile.streak_count}-week streak! Don't break it.`
        : `Start your streak this week – one review is all it takes.`;

      const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:48px 24px;">
    <h1 style="color:#f5a623;font-size:28px;margin:0 0 8px;">WeeklyReview</h1>
    <p style="color:#a0a0b0;font-size:14px;margin:0 0 32px;">Your reflection time is here</p>
    
    <div style="background-color:#14141f;border:1px solid #1e1e2e;border-radius:16px;padding:32px;">
      <p style="color:#f0f0f5;font-size:18px;margin:0 0 12px;">Hey ${firstName} 👋</p>
      <p style="color:#a0a0b0;font-size:15px;line-height:1.6;margin:0 0 20px;">
        It's time for your weekly review. Take 10 minutes to reflect on what worked, what didn't, and what you want to focus on next week.
      </p>
      <p style="color:#f5a623;font-size:14px;margin:0 0 24px;">🔥 ${streakText}</p>
      <a href="https://id-preview--02dec461-9558-4082-854a-feaf931e5eef.lovable.app/review"
         style="display:inline-block;background-color:#f5a623;color:#0a0a0f;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">
        Start Your Review →
      </a>
    </div>
    
    <p style="color:#555;font-size:12px;margin:32px 0 0;text-align:center;">
      WeeklyReview – understand your own weeks.
    </p>
  </div>
</body>
</html>`;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'WeeklyReview <onboarding@resend.dev>',
          to: [email],
          subject: 'Your weekly reflection is waiting 🔥',
          html,
        }),
      });

      if (res.ok) sentCount++;
    }

    return new Response(JSON.stringify({ sent: sentCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

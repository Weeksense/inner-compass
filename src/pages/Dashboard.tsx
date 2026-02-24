import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { PenLine, Calendar, TrendingUp, ChevronRight, Sparkles, ArrowUpRight, ArrowDownRight, Minus, Loader2 } from 'lucide-react';

interface ReviewSummary {
  id: string;
  week_start_date: string;
  wins: string;
  energy_score: number;
  created_at: string;
}

interface Pattern {
  theme: string;
  description: string;
  frequency: string;
  type: 'positive' | 'negative' | 'neutral';
  advice: string;
}

interface PatternsData {
  patterns: Pattern[];
  energy_trend?: 'rising' | 'falling' | 'stable';
  overall_insight?: string;
  message?: string;
}

const MILESTONES = [4, 8, 12, 16, 24, 52];

const Dashboard = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMilestone, setShowMilestone] = useState(false);
  const [patternsData, setPatternsData] = useState<PatternsData | null>(null);
  const [patternsLoading, setPatternsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('id, week_start_date, wins, energy_score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setReviews(data || []);
      setLoading(false);
      
      // Fetch patterns if 2+ reviews
      if (data && data.length >= 2) {
        fetchPatterns();
      }
    };
    fetchReviews();
    updateStreak();
  }, [user]);

  const fetchPatterns = async () => {
    setPatternsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-patterns');
      if (!error && data && !data.error) {
        setPatternsData(data);
      }
    } catch (err) {
      console.warn('Patterns fetch failed:', err);
    } finally {
      setPatternsLoading(false);
    }
  };

  const updateStreak = async () => {
    if (!user || !profile) return;
    
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(diff);
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    // Check if there's a review this week
    const { data: thisWeekReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .gte('week_start_date', thisWeekStart.toISOString().split('T')[0])
      .limit(1);

    if (!thisWeekReview || thisWeekReview.length === 0) return;

    const thisWeekStr = thisWeekStart.toISOString().split('T')[0];

    // If we already recorded this week, don't update streak again
    if (profile.last_review_date === thisWeekStr) return;

    // Calculate new streak
    const lastReviewDate = profile.last_review_date;
    let newStreak = 1;
    
    if (lastReviewDate) {
      const lastDate = new Date(lastReviewDate);
      const daysSinceLast = Math.floor((thisWeekStart.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLast >= 1 && daysSinceLast <= 7) {
        newStreak = (profile.streak_count || 0) + 1;
      }
    }

    const longestStreak = Math.max(newStreak, profile.longest_streak || 0);
    await supabase.from('profiles').update({
      streak_count: newStreak,
      longest_streak: longestStreak,
      last_review_date: thisWeekStr,
    }).eq('user_id', user.id);
    await refreshProfile();

    // Check milestone
    if (MILESTONES.includes(newStreak)) {
      setShowMilestone(true);
      setTimeout(() => setShowMilestone(false), 3000);
    }
  };

  const streak = profile?.streak_count || 0;

  // Build heatmap data for last 52 weeks
  const getHeatmapWeeks = () => {
    const weeks: { date: Date; hasReview: boolean }[] = [];
    const now = new Date();
    for (let i = 51; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      // Snap to Monday of that week
      const day = d.getDay();
      d.setDate(d.getDate() - ((day + 6) % 7));
      const weekStr = d.toISOString().split('T')[0];
      weeks.push({
        date: d,
        hasReview: reviews.some(r => r.week_start_date === weekStr),
      });
    }
    return weeks;
  };

  const heatmapWeeks = getHeatmapWeeks();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Milestone celebration overlay */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="text-center"
            >
              <div className="text-7xl mb-4">🔥</div>
              <div className="font-serif text-4xl text-primary glow-primary px-8 py-4 rounded-2xl bg-background/90 backdrop-blur-xl border border-primary/30">
                {streak} Week Streak!
              </div>
              <div className="mt-2 text-muted-foreground">You're on fire! Keep going.</div>
            </motion.div>
            {/* Particle glow */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary"
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((i / 12) * Math.PI * 2) * 200,
                  y: Math.sin((i / 12) * Math.PI * 2) * 200,
                  opacity: 0,
                }}
                transition={{ duration: 1.5, delay: 0.2 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto max-w-4xl px-6 py-12">
        {/* Welcome & Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-serif text-4xl text-foreground mb-2">
            {profile?.name ? `Hey, ${profile.name}` : 'Your Dashboard'}
          </h1>

          {/* Streak display */}
          <div className="mb-4">
            {streak > 0 ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <span className="text-2xl">🔥</span>
                <span className="text-lg font-semibold text-primary">{streak} week streak</span>
              </motion.div>
            ) : (
              <p className="text-muted-foreground">Start your streak this week</p>
            )}
          </div>

          <p className="text-muted-foreground mb-6">
            {reviews.length === 0
              ? "Ready for your first weekly review?"
              : `You've completed ${reviews.length} review${reviews.length > 1 ? 's' : ''}. Keep going!`}
          </p>
          <Button size="lg" onClick={() => navigate('/review')} className="glow-primary">
            <PenLine className="w-5 h-5 mr-2" />
            Start This Week's Review
          </Button>
        </motion.div>

        {/* Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl text-foreground">Review Calendar</h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {heatmapWeeks.map((w, i) => (
              <div
                key={i}
                title={w.date.toLocaleDateString()}
                className={`w-3.5 h-3.5 rounded-sm transition-colors ${
                  w.hasReview ? 'bg-primary' : 'bg-muted/50'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-muted/50" /> No review
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-primary" /> Completed
            </div>
          </div>
        </motion.div>

        {/* Patterns Section */}
        {reviews.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card-accent p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-xl text-foreground">Your Patterns</h2>
              {patternsData?.energy_trend && (
                <div className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground">
                  Energy:
                  {patternsData.energy_trend === 'rising' && <ArrowUpRight className="w-4 h-4 text-green-400" />}
                  {patternsData.energy_trend === 'falling' && <ArrowDownRight className="w-4 h-4 text-destructive" />}
                  {patternsData.energy_trend === 'stable' && <Minus className="w-4 h-4 text-muted-foreground" />}
                  <span className="capitalize">{patternsData.energy_trend}</span>
                </div>
              )}
            </div>

            {patternsLoading ? (
              <div className="flex items-center justify-center py-8 gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Analyzing your patterns...</span>
              </div>
            ) : patternsData?.patterns && patternsData.patterns.length > 0 ? (
              <>
                {patternsData.overall_insight && (
                  <p className="text-sm text-muted-foreground mb-5">{patternsData.overall_insight}</p>
                )}
                <div className="space-y-3">
                  {patternsData.patterns.map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-background/40 border border-border/30 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${
                          p.type === 'positive' ? 'bg-green-400' :
                          p.type === 'negative' ? 'bg-destructive' :
                          'bg-muted-foreground'
                        }`} />
                        <span className="font-medium text-foreground text-sm">{p.theme}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{p.frequency}</span>
                      </div>
                      <p className="text-sm text-secondary-foreground mb-2">{p.description}</p>
                      <p className="text-xs text-primary">💡 {p.advice}</p>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : patternsData?.message ? (
              <p className="text-sm text-muted-foreground py-4">{patternsData.message}</p>
            ) : (
              <p className="text-sm text-muted-foreground py-4">Complete more reviews to see your patterns emerge.</p>
            )}
          </motion.div>
        )}

        {/* Past Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl text-foreground">Past Reviews</h2>
          </div>

          {loading ? (
            <div className="glass-card p-8 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground">No reviews yet. Start your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <motion.button
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/insights/${r.id}`)}
                  className="glass-card p-5 w-full text-left flex items-center gap-4 hover:border-primary/30 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-muted-foreground mb-1">
                      Week of {new Date(r.week_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <p className="text-foreground truncate">
                      {r.wins || 'Review completed'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">
                      ⚡ {r.energy_score}/10
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;

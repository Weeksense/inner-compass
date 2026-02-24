import React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, AlertTriangle, Target, Zap } from 'lucide-react';
import WeekSenseLogo from '@/components/WeekSenseLogo';

/** Parse a value that might be a JSON array string into readable text */
const formatTextOrArray = (value: string | null | undefined, fallback: string): React.ReactNode => {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return (
        <ul className="space-y-2">
          {parsed.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    }
  } catch {
    // Not JSON
  }
  return value;
};

interface SharedReviewData {
  wins: string;
  blockers: string;
  ai_summary: string;
  focus_items: string[];
  energy_score: number;
  week_start_date: string;
}

const SharedReview = () => {
  const { token } = useParams();
  const [review, setReview] = useState<SharedReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchSharedReview = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('wins, blockers, ai_summary, focus_items, energy_score, week_start_date')
        .eq('share_token', token)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setReview({
          ...data,
          focus_items: (data.focus_items as string[]) || [],
        });
      }
      setLoading(false);
    };
    if (token) fetchSharedReview();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !review) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-foreground mb-3">Review not found</h1>
          <p className="text-muted-foreground">This link may have expired or been removed.</p>
        </div>
      </div>
    );
  }

  const energyPercentage = (review.energy_score / 10) * 100;
  const weekDateFormatted = new Date(review.week_start_date).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/3 blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-3xl relative z-10">
        {/* Branding header */}
        <div className="flex justify-center mb-8">
          <WeekSenseLogo />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-12">
            <span className="text-sm text-muted-foreground">Week of {weekDateFormatted}</span>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mt-2 mb-4">Weekly Review</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">{review.ai_summary}</p>
          </div>

          {/* Energy Score */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Energy Score</span>
              <span className="ml-auto font-serif text-2xl text-foreground">{review.energy_score}/10</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
                initial={{ width: 0 }}
                animate={{ width: `${energyPercentage}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Biggest Win */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif text-xl text-foreground">Biggest Win</h3>
              </div>
              <div className="text-secondary-foreground leading-relaxed">{formatTextOrArray(review.wins, 'No wins recorded')}</div>
            </motion.div>

            {/* Blockers */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="font-serif text-xl text-foreground">What Held Back</h3>
              </div>
              <div className="text-secondary-foreground leading-relaxed">{formatTextOrArray(review.blockers, 'No blockers recorded')}</div>
            </motion.div>
          </div>

          {/* Focus Items */}
          {review.focus_items.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-serif text-xl text-foreground">Focus for Next Week</h3>
              </div>
              <div className="space-y-4">
                {review.focus_items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-primary font-semibold">{i + 1}</span>
                    </div>
                    <p className="text-secondary-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Footer branding */}
          <div className="text-center text-sm text-muted-foreground">
            Reflected with <span className="text-primary">WeekSense</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SharedReview;

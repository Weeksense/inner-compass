import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Trophy, AlertTriangle, Target, Zap, Share2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import ShareCard from '@/components/ShareCard';

interface ReviewData {
  id: string;
  wins: string;
  blockers: string;
  ai_summary: string;
  focus_items: string[];
  energy_score: number;
  answers: Record<string, string>;
  week_start_date: string;
}

const Insights = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const fetchReview = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        toast.error('Review not found');
        navigate('/dashboard');
        return;
      }
      setReview({
        ...data,
        focus_items: (data.focus_items as string[]) || [],
      });
      setLoading(false);
    };
    fetchReview();
  }, [id]);

  if (loading || !review) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const energyPercentage = (review.energy_score / 10) * 100;
  const weekDateFormatted = new Date(review.week_start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/3 blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-3xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-12">
            <span className="text-sm text-muted-foreground">Week of {weekDateFormatted}</span>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mt-2 mb-4">Your Week in Review</h1>
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
              <motion.div className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary" initial={{ width: 0 }} animate={{ width: `${energyPercentage}%` }} transition={{ duration: 1, delay: 0.3 }} />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Biggest Win */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif text-xl text-foreground">Your Biggest Win</h3>
              </div>
              <p className="text-secondary-foreground leading-relaxed">{review.wins || 'No wins recorded'}</p>
            </motion.div>

            {/* Blockers */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="font-serif text-xl text-foreground">What Held You Back</h3>
              </div>
              <p className="text-secondary-foreground leading-relaxed">{review.blockers || 'No blockers recorded'}</p>
            </motion.div>
          </div>

          {/* Focus Items */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-serif text-xl text-foreground">Your Focus for Next Week</h3>
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

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={() => setShareOpen(true)}>
              <Share2 className="w-4 h-4 mr-2" /> Share Insights
            </Button>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>

      <ShareCard
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        reviewId={review.id}
        weekDate={weekDateFormatted}
        wins={review.wins}
        energyScore={review.energy_score}
        focusItems={review.focus_items}
        summary={review.ai_summary}
      />
    </div>
  );
};

export default Insights;

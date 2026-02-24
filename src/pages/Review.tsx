import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { REVIEW_QUESTIONS, QUESTION_ICONS } from '@/lib/constants';
import { ArrowRight, Loader2, Target, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ActiveGoal {
  id: string;
  title: string;
  target_date: string;
}

const Review = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(REVIEW_QUESTIONS.length).fill(''));
  const [phase, setPhase] = useState<'questions' | 'goals' | 'processing' | 'done'>('questions');
  const [activeGoals, setActiveGoals] = useState<ActiveGoal[]>([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState<Set<string>>(new Set());
  const [goalsLoading, setGoalsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentQ < REVIEW_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // After last question, check if user has active goals
      loadGoalsAndProceed();
    }
  };

  const loadGoalsAndProceed = async () => {
    setGoalsLoading(true);
    try {
      const { data } = await supabase
        .from('goals')
        .select('id, title, target_date')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .order('target_date', { ascending: true });

      if (data && data.length > 0) {
        setActiveGoals(data);
        setPhase('goals');
      } else {
        // No active goals, skip straight to submit
        submitReview();
      }
    } catch {
      submitReview();
    } finally {
      setGoalsLoading(false);
    }
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoalIds((prev) => {
      const next = new Set(prev);
      if (next.has(goalId)) next.delete(goalId);
      else next.add(goalId);
      return next;
    });
  };

  const submitReview = async (goalIds?: Set<string>) => {
    setPhase('processing');
    const goalsToLink = goalIds || selectedGoalIds;

    try {
      // Calculate week start (Monday)
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(now.setDate(diff));
      weekStart.setHours(0, 0, 0, 0);

      const answersObj: Record<string, string> = {};
      REVIEW_QUESTIONS.forEach((q, i) => { answersObj[`q${i + 1}`] = answers[i]; });

      // Call AI edge function for insights
      let aiInsights = {
        summary: 'Based on your reflection, this was a week of growth and challenges.',
        biggest_win: answers[0],
        blockers: answers[2],
        focus_items: ['Apply your biggest learning', 'Address what held you back', 'Do more of what gave you energy'],
        energy_score: 7,
      };

      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke('generate-review-insights', {
          body: { answers },
        });
        if (!fnError && fnData && !fnData.error) {
          aiInsights = fnData;
        } else {
          console.warn('AI fallback used:', fnError || fnData?.error);
        }
      } catch (aiErr) {
        console.warn('AI call failed, using fallback:', aiErr);
      }

      const { data, error } = await supabase.from('reviews').insert({
        user_id: user!.id,
        week_start_date: weekStart.toISOString().split('T')[0],
        answers: answersObj,
        ai_summary: aiInsights.summary,
        wins: aiInsights.biggest_win,
        blockers: aiInsights.blockers,
        focus_items: aiInsights.focus_items,
        energy_score: aiInsights.energy_score,
      }).select().single();

      if (error) throw error;

      // Link goals to this review
      if (goalsToLink.size > 0) {
        const progressRows = Array.from(goalsToLink).map((goalId) => ({
          goal_id: goalId,
          review_id: data.id,
        }));
        await supabase.from('goal_progress').insert(progressRows);
      }

      await new Promise(res => setTimeout(res, 1500));
      navigate(`/insights/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save review');
      setPhase('questions');
    }
  };

  if (phase === 'processing') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
            <div className="absolute inset-3 rounded-full border-2 border-t-accent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <div className="absolute inset-6 rounded-full bg-primary/10 animate-pulse-glow" />
          </div>
          <h2 className="font-serif text-3xl text-foreground mb-3">Processing your week...</h2>
          <p className="text-muted-foreground">Finding your patterns and insights</p>
        </motion.div>
      </div>
    );
  }

  // Goal check-in step
  if (phase === 'goals') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Full progress bar */}
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: '100%' }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="w-full max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4 text-muted-foreground">
                <Target className="w-6 h-6 text-primary" />
                <span className="text-sm">Goal Check-in</span>
              </div>

              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-3 leading-snug">
                Which goals did you make progress on?
              </h2>
              <p className="text-muted-foreground mb-8">Select any goals you worked toward this week. You can skip if none apply.</p>

              <div className="space-y-3 mb-10">
                {activeGoals.map((goal, i) => {
                  const isSelected = selectedGoalIds.has(goal.id);
                  return (
                    <motion.button
                      key={goal.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => toggleGoal(goal.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        isSelected
                          ? 'border-primary/50 bg-primary/10'
                          : 'border-border/50 bg-muted/20 hover:border-border'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium truncate">{goal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Target: {new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => { setPhase('questions'); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => submitReview(new Set())}>
                    Skip
                  </Button>
                  <Button onClick={() => submitReview()} size="lg">
                    {selectedGoalIds.size > 0
                      ? `Finish with ${selectedGoalIds.size} goal${selectedGoalIds.size > 1 ? 's' : ''}`
                      : 'Finish Review'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${((currentQ + 1) / REVIEW_QUESTIONS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4 text-muted-foreground">
                <span className="text-2xl">{QUESTION_ICONS[currentQ]}</span>
                <span className="text-sm">Question {currentQ + 1} of {REVIEW_QUESTIONS.length}</span>
              </div>

              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-8 leading-snug">
                {REVIEW_QUESTIONS[currentQ]}
              </h2>

              <textarea
                value={answers[currentQ]}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[currentQ] = e.target.value;
                  setAnswers(newAnswers);
                }}
                placeholder="Take your time..."
                rows={5}
                className="w-full bg-muted/30 border border-border/50 rounded-xl p-6 text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-lg"
                autoFocus
              />

              <div className="flex items-center justify-between mt-8">
                {currentQ > 0 && (
                  <button
                    onClick={() => setCurrentQ(currentQ - 1)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Previous
                  </button>
                )}
                <div className="flex-1" />
                <AnimatePresence>
                  {answers[currentQ].trim().length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Button onClick={handleNext} size="lg" disabled={goalsLoading}>
                        {goalsLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        {currentQ === REVIEW_QUESTIONS.length - 1 ? 'Finish Review' : 'Next'}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Review;

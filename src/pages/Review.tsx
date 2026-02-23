import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { REVIEW_QUESTIONS, QUESTION_ICONS } from '@/lib/constants';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Review = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(REVIEW_QUESTIONS.length).fill(''));
  const [phase, setPhase] = useState<'questions' | 'processing' | 'done'>('questions');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentQ < REVIEW_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      submitReview();
    }
  };

  const submitReview = async () => {
    setPhase('processing');

    try {
      // Calculate week start (Monday)
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(now.setDate(diff));
      weekStart.setHours(0, 0, 0, 0);

      const answersObj: Record<string, string> = {};
      REVIEW_QUESTIONS.forEach((q, i) => { answersObj[`q${i + 1}`] = answers[i]; });

      // Placeholder AI summary
      const placeholderSummary = `Based on your reflection, this was a week of growth and challenges. You made meaningful progress while navigating obstacles.`;

      const { data, error } = await supabase.from('reviews').insert({
        user_id: user!.id,
        week_start_date: weekStart.toISOString().split('T')[0],
        answers: answersObj,
        ai_summary: placeholderSummary,
        wins: answers[0],
        blockers: answers[2],
        focus_items: [
          "Apply your biggest learning from this week",
          "Address what held you back",
          "Do more of what gave you energy",
        ],
        energy_score: 7,
      }).select().single();

      if (error) throw error;

      // Short delay for the beautiful loading animation
      await new Promise(res => setTimeout(res, 2000));
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
                      <Button onClick={handleNext} size="lg">
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const slides = [
  {
    icon: <Sparkles className="w-12 h-12 text-primary" />,
    title: "Welcome to WeekSense",
    desc: "You're about to build a habit that changes everything: making sense of your own weeks.",
  },
  {
    icon: <BookOpen className="w-12 h-12 text-primary" />,
    title: "How it works",
    desc: "Every week, you'll answer 7 simple questions. Our AI finds your patterns, wins, and blindspots — so you can be more intentional.",
  },
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [reviewDay, setReviewDay] = useState(0); // Sunday
  const [reviewTime, setReviewTime] = useState('18:00');
  const [saving, setSaving] = useState(false);
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        user_id: user.id,
        name,
        review_day: reviewDay,
        review_time: reviewTime,
        streak_count: 0,
      });
      if (error) throw error;
      await refreshProfile();
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const totalSteps = 3;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step < 2 ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-8 md:p-12 text-center"
            >
              <div className="mb-6">{slides[step].icon}</div>
              <h2 className="font-serif text-3xl text-foreground mb-4">{slides[step].title}</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">{slides[step].desc}</p>
              <Button onClick={() => setStep(step + 1)} size="lg">
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-8 md:p-12"
            >
              <h2 className="font-serif text-3xl text-foreground mb-2">Set up your review</h2>
              <p className="text-muted-foreground mb-8">Tell us a bit about yourself.</p>

              <div className="space-y-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Your name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Preferred review day</label>
                  <div className="grid grid-cols-4 gap-2">
                    {DAYS_OF_WEEK.map((day, i) => (
                      <button
                        key={day}
                        onClick={() => setReviewDay(i)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          i === reviewDay
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Preferred time</label>
                  <Input
                    type="time"
                    value={reviewTime}
                    onChange={(e) => setReviewTime(e.target.value)}
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <Button onClick={handleFinish} className="w-full" size="lg" disabled={!name.trim() || saving}>
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>Start Reviewing <ArrowRight className="ml-2 w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;

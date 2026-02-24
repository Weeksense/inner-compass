import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Target, Plus, Check, Trash2, X, CalendarIcon, Trophy, TrendingUp, ChevronLeft, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Goal {
  id: string;
  title: string;
  target_date: string;
  status: string;
  created_at: string;
}

interface LinkedReview {
  id: string;
  week_start_date: string;
  wins: string;
  energy_score: number;
  created_at: string;
}

const GoalsSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);
  const [progressCounts, setProgressCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [linkedReviews, setLinkedReviews] = useState<LinkedReview[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    const [activeRes, completedRes] = await Promise.all([
      supabase
        .from('goals')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .order('target_date', { ascending: true }),
      supabase
        .from('goals')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })
        .limit(20),
    ]);

    const allGoals = [...(activeRes.data || []), ...(completedRes.data || [])];
    setGoals(activeRes.data || []);
    setCompletedGoals(completedRes.data || []);

    if (allGoals.length > 0) {
      const goalIds = allGoals.map((g) => g.id);
      const { data: progressData } = await supabase
        .from('goal_progress')
        .select('goal_id')
        .in('goal_id', goalIds);

      const counts: Record<string, number> = {};
      progressData?.forEach((p) => {
        counts[p.goal_id] = (counts[p.goal_id] || 0) + 1;
      });
      setProgressCounts(counts);
    }

    setLoading(false);
  };

  const openGoalDetail = async (goal: Goal) => {
    setSelectedGoal(goal);
    setDetailLoading(true);
    
    const { data: progressData } = await supabase
      .from('goal_progress')
      .select('review_id')
      .eq('goal_id', goal.id);

    if (progressData && progressData.length > 0) {
      const reviewIds = progressData.map((p) => p.review_id);
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('id, week_start_date, wins, energy_score, created_at')
        .in('id', reviewIds)
        .order('created_at', { ascending: false });
      setLinkedReviews(reviewsData || []);
    } else {
      setLinkedReviews([]);
    }
    setDetailLoading(false);
  };

  const addGoal = async () => {
    if (!newTitle.trim() || !newDate) return;
    const { error } = await supabase.from('goals').insert({
      user_id: user!.id,
      title: newTitle.trim(),
      target_date: format(newDate, 'yyyy-MM-dd'),
    });
    if (error) {
      toast.error('Could not add goal');
      return;
    }
    toast.success('Goal added!');
    setNewTitle('');
    setNewDate(undefined);
    setShowForm(false);
    fetchGoals();
  };

  const completeGoal = async (id: string) => {
    await supabase.from('goals').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', id);
    toast.success('Goal completed! 🎉');
    fetchGoals();
  };

  const archiveGoal = async (id: string) => {
    await supabase.from('goals').update({ status: 'archived' }).eq('id', id);
    fetchGoals();
  };

  const daysUntil = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day left';
    return `${diff} days left`;
  };

  if (loading) return null;

  // Goal detail view
  if (selectedGoal) {
    const timeLabel = daysUntil(selectedGoal.target_date);
    const isCompleted = selectedGoal.status === 'completed';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="glass-card p-6 mb-8"
      >
        <button
          onClick={() => setSelectedGoal(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to goals
        </button>

        <div className="flex items-start gap-3 mb-5">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
            isCompleted ? "bg-primary/20" : "border-2 border-primary/40"
          )}>
            {isCompleted && <Check className="w-4 h-4 text-primary" />}
            {!isCompleted && <Target className="w-4 h-4 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-serif text-lg",
              isCompleted ? "text-foreground/70 line-through" : "text-foreground"
            )}>
              {selectedGoal.title}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className={cn(
                "text-xs",
                timeLabel === 'Overdue' ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {isCompleted ? 'Completed' : timeLabel}
              </span>
              <span className="text-xs text-muted-foreground">
                Target: {new Date(selectedGoal.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Linked Reviews ({linkedReviews.length})
          </span>
        </div>

        {detailLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : linkedReviews.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No reviews linked to this goal yet. Link reviews during your weekly check-in.
          </p>
        ) : (
          <div className="space-y-2">
            {linkedReviews.map((r, i) => (
              <motion.button
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/insights/${r.id}`)}
                className="w-full text-left p-3.5 rounded-xl bg-background/40 border border-border/30 hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Week of {new Date(r.week_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    {r.energy_score}/10
                  </div>
                </div>
                <p className="text-sm text-foreground mt-1 truncate">
                  {r.wins || 'Review completed'}
                </p>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="glass-card p-6 mb-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h2 className="font-serif text-xl text-foreground">Goals</h2>
        <div className="ml-auto flex items-center gap-1">
          {completedGoals.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs"
            >
              <Trophy className="w-3.5 h-3.5 mr-1" />
              {showHistory ? 'Active' : `${completedGoals.length} completed`}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Add goal form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-muted/30 border border-border/30">
              <Input
                placeholder="What's your goal?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && addGoal()}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[180px] justify-start text-left font-normal",
                      !newDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {newDate ? format(newDate, "MMM d, yyyy") : "Target date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newDate}
                    onSelect={setNewDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={addGoal} disabled={!newTitle.trim() || !newDate} size="sm">
                Add
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active goals */}
      {!showHistory && (
        <>
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No active goals. Set one to stay focused!
            </p>
          ) : (
            <div className="space-y-2">
              {goals.map((goal, i) => {
                const timeLabel = daysUntil(goal.target_date);
                const isOverdue = timeLabel === 'Overdue';
                const progressCount = progressCounts[goal.id] || 0;
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border/30 group cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => openGoalDetail(goal)}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); completeGoal(goal.id); }}
                      className="w-6 h-6 rounded-full border-2 border-primary/40 flex items-center justify-center hover:bg-primary/20 transition-colors flex-shrink-0"
                      title="Mark complete"
                    >
                      <Check className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{goal.title}</p>
                      <div className="flex items-center gap-3">
                        <p className={`text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {timeLabel}
                        </p>
                        {progressCount > 0 && (
                          <span className="flex items-center gap-1 text-xs text-primary">
                            <TrendingUp className="w-3 h-3" />
                            {progressCount} review{progressCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); archiveGoal(goal.id); }}
                      className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Completed goals history */}
      {showHistory && (
        <div className="space-y-2">
          {completedGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No completed goals yet.</p>
          ) : (
            completedGoals.map((goal, i) => {
              const progressCount = progressCounts[goal.id] || 0;
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border/30 cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => openGoalDetail(goal)}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/70 line-through truncate">{goal.title}</p>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-muted-foreground">
                        Target: {new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      {progressCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-primary">
                          <TrendingUp className="w-3 h-3" />
                          {progressCount} review{progressCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </motion.div>
  );
};

export default GoalsSection;

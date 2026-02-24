import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Target, Plus, Check, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface Goal {
  id: string;
  title: string;
  target_date: string;
  status: string;
  created_at: string;
}

const GoalsSection = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user!.id)
      .eq('status', 'active')
      .order('target_date', { ascending: true });
    setGoals(data || []);
    setLoading(false);
  };

  const addGoal = async () => {
    if (!newTitle.trim() || !newDate) return;
    const { error } = await supabase.from('goals').insert({
      user_id: user!.id,
      title: newTitle.trim(),
      target_date: newDate,
    });
    if (error) {
      toast.error('Could not add goal');
      return;
    }
    toast.success('Goal added!');
    setNewTitle('');
    setNewDate('');
    setShowForm(false);
    fetchGoals();
  };

  const completeGoal = async (id: string) => {
    await supabase.from('goals').update({ status: 'completed' }).eq('id', id);
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
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </Button>
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
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-40"
              />
              <Button onClick={addGoal} disabled={!newTitle.trim() || !newDate} size="sm">
                Add
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals list */}
      {goals.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No active goals. Set one to stay focused!
        </p>
      ) : (
        <div className="space-y-2">
          {goals.map((goal, i) => {
            const timeLabel = daysUntil(goal.target_date);
            const isOverdue = timeLabel === 'Overdue';
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border/30 group"
              >
                <button
                  onClick={() => completeGoal(goal.id)}
                  className="w-6 h-6 rounded-full border-2 border-primary/40 flex items-center justify-center hover:bg-primary/20 transition-colors flex-shrink-0"
                  title="Mark complete"
                >
                  <Check className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{goal.title}</p>
                  <p className={`text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {timeLabel}
                  </p>
                </div>
                <button
                  onClick={() => archiveGoal(goal.id)}
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
    </motion.div>
  );
};

export default GoalsSection;

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Search } from 'lucide-react';
import { useAdminAction } from '@/hooks/useAdmin';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface AdminGoal {
  id: string;
  title: string;
  target_date: string;
  status: string;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
}

const AdminGoals = () => {
  const [goals, setGoals] = useState<AdminGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const adminAction = useAdminAction();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await adminAction('list_goals');
      setGoals(data.goals || []);
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = goals.filter((g) => {
    const matchesSearch =
      !search ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      (g.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (g.user_email || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: goals.length,
    active: goals.filter((g) => g.status === 'active').length,
    completed: goals.filter((g) => g.status === 'completed').length,
    archived: goals.filter((g) => g.status === 'archived').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground mb-8">Goals</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(['all', 'active', 'completed', 'archived'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`glass-card p-4 text-left transition-colors ${
              statusFilter === s ? 'border-primary/40' : ''
            }`}
          >
            <p className="text-xs text-muted-foreground capitalize mb-1">{s === 'all' ? 'Total' : s}</p>
            <p className="font-serif text-2xl text-foreground">{statusCounts[s]}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search goals or users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-muted-foreground font-medium">Goal</th>
                <th className="text-left p-4 text-muted-foreground font-medium">User</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Target</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((goal, i) => (
                <motion.tr
                  key={goal.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-4 text-foreground max-w-xs truncate">{goal.title}</td>
                  <td className="p-4 text-muted-foreground">{goal.user_name || goal.user_email || '—'}</td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={goal.status === 'completed' ? 'default' : goal.status === 'active' ? 'secondary' : 'outline'}
                    >
                      {goal.status}
                    </Badge>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No goals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminGoals;

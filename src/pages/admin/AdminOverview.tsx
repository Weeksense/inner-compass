import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Zap, TrendingUp, Flame, UserPlus } from 'lucide-react';
import { useAdminAction } from '@/hooks/useAdmin';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Stats {
  totalUsers: number;
  reviewsThisWeek: number;
  reviewsAllTime: number;
  avgEnergy: number;
  activeStreaks: number;
  newSignups: number;
  signupsPerDay: { date: string; count: number }[];
  reviewsPerWeek: { week: string; count: number }[];
}

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const adminAction = useAdminAction();

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await adminAction('get_stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-muted-foreground">Failed to load stats.</p>;
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary' },
    { label: 'Reviews This Week', value: stats.reviewsThisWeek, icon: FileText, color: 'text-primary' },
    { label: 'Reviews All Time', value: stats.reviewsAllTime, icon: TrendingUp, color: 'text-primary' },
    { label: 'Avg Energy Score', value: stats.avgEnergy, icon: Zap, color: 'text-primary' },
    { label: 'Active Streaks', value: stats.activeStreaks, icon: Flame, color: 'text-primary' },
    { label: 'New Signups (7d)', value: stats.newSignups, icon: UserPlus, color: 'text-primary' },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground mb-8">Overview</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </div>
            <p className="font-serif text-3xl text-foreground">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h2 className="font-serif text-lg text-foreground mb-4">Signups (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.signupsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(240 15% 8%)', border: '1px solid hsl(240 10% 16%)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'hsl(0 0% 95%)' }}
              />
              <Line type="monotone" dataKey="count" stroke="hsl(36 90% 55%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h2 className="font-serif text-lg text-foreground mb-4">Reviews per Week (Last 12 Weeks)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.reviewsPerWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 16%)" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(240 15% 8%)', border: '1px solid hsl(240 10% 16%)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'hsl(0 0% 95%)' }}
              />
              <Bar dataKey="count" fill="hsl(36 90% 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminOverview;

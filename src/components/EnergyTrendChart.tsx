import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Area, AreaChart } from 'recharts';
import { Zap } from 'lucide-react';

interface EnergyChartProps {
  reviews: { week_start_date: string; energy_score: number }[];
}

const EnergyTrendChart = ({ reviews }: EnergyChartProps) => {
  if (reviews.length < 2) return null;

  // Sort chronologically and take last 12 weeks
  const chartData = [...reviews]
    .sort((a, b) => a.week_start_date.localeCompare(b.week_start_date))
    .slice(-12)
    .map((r) => ({
      week: new Date(r.week_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      energy: r.energy_score,
    }));

  const avg = Math.round(
    chartData.reduce((sum, d) => sum + d.energy, 0) / chartData.length * 10
  ) / 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="glass-card p-6 mb-8"
    >
      <div className="flex items-center gap-3 mb-1">
        <Zap className="w-5 h-5 text-primary" />
        <h2 className="font-serif text-xl text-foreground">Energy Trend</h2>
        <span className="ml-auto text-sm text-muted-foreground">
          Avg: <span className="text-foreground font-medium">{avg}/10</span>
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Last {chartData.length} weeks</p>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              ticks={[0, 5, 10]}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem',
                fontSize: '0.8rem',
                color: 'hsl(var(--foreground))',
              }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
            />
            <Area
              type="monotone"
              dataKey="energy"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              fill="url(#energyGradient)"
              dot={{ r: 4, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default EnergyTrendChart;

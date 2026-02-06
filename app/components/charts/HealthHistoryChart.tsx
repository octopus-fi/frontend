'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { formatPercent } from '@/lib/utils';

// Preview data - 7 days of health factor history
const generatePreviewData = (currentHealth: number) => {
  const data = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = 6; i >= 0; i--) {
    const timestamp = now - (i * dayMs);
    const date = new Date(timestamp);

    // Generate realistic health factor variations
    const variance = (Math.random() - 0.5) * 0.3;
    let health = currentHealth + variance;

    // Simulate a dip 3 days ago
    if (i === 3) {
      health = Math.max(1.2, currentHealth - 0.4);
    }

    // Simulate recovery
    if (i === 2) {
      health = currentHealth - 0.2;
    }

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      health: Math.max(1.0, health),
      timestamp,
    });
  }

  return data;
};

interface HealthHistoryChartProps {
  currentHealth: number;
}

export function HealthHistoryChart({ currentHealth }: HealthHistoryChartProps) {
  const data = generatePreviewData(currentHealth);

  // Calculate trend
  const firstHealth = data[0].health;
  const lastHealth = data[data.length - 1].health;
  const trend = ((lastHealth - firstHealth) / firstHealth) * 100;
  const isPositive = trend >= 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const health = payload[0].value;
      const riskLevel =
        health >= 1.5 ? 'Safe' :
          health >= 1.2 ? 'Warning' : 'Critical';
      const color =
        health >= 1.5 ? '#10B981' :
          health >= 1.2 ? '#F59E0B' : '#EF4444';

      return (
        <div className="glass border border-white/20 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">
            {payload[0].payload.date}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold" style={{ color }}>
              {health.toFixed(2)}×
            </span>
            <Badge
              variant={
                riskLevel === 'Safe' ? 'success' :
                  riskLevel === 'Warning' ? 'warning' : 'danger'
              }
              className="text-xs"
            >
              {riskLevel}
            </Badge>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Health Factor History
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              {isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                {isPositive ? '+' : ''}{formatPercent(trend / 100)}
              </span>
            </Badge>
            <Badge variant="secondary" className="text-xs">
              7 Days
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0.8, 'auto']}
              tickFormatter={(value) => value.toFixed(1)}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Danger Zone (below 1.2) */}
            <ReferenceLine
              y={1.2}
              stroke="#EF4444"
              strokeDasharray="3 3"
              label={{
                value: 'Danger',
                position: 'right',
                fill: '#EF4444',
                fontSize: 12
              }}
            />

            {/* Warning Zone (below 1.5) */}
            <ReferenceLine
              y={1.5}
              stroke="#F59E0B"
              strokeDasharray="3 3"
              label={{
                value: 'Warning',
                position: 'right',
                fill: '#F59E0B',
                fontSize: 12
              }}
            />

            {/* Safe Zone (above 1.5) */}
            <ReferenceLine
              y={2.0}
              stroke="#10B981"
              strokeDasharray="3 3"
              label={{
                value: 'Safe',
                position: 'right',
                fill: '#10B981',
                fontSize: 12
              }}
            />

            <Area
              type="monotone"
              dataKey="health"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#healthGradient)"
            />

            <Line
              type="monotone"
              dataKey="health"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ fill: '#06b6d4', r: 4 }}
              activeDot={{ r: 6, fill: '#0ea5e9' }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Safe (&gt; 1.5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Warning (1.2 - 1.5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Critical (&lt; 1.2)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
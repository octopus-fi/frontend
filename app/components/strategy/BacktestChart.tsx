'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { formatPercent } from '@/lib/utils';
import type { StrategyBacktest } from '@/types/index';

interface BacktestChartProps {
  backtest: StrategyBacktest;
  compact?: boolean;
}

export function BacktestChart({ backtest, compact = false }: BacktestChartProps) {
  const isPositive = backtest.totalReturn >= 0;
  const chartHeight = compact ? 200 : 400;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass border border-white/20 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">
            {data.date}
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${data.cumulativeReturn >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
              {data.cumulativeReturn >= 0 ? '+' : ''}
              {formatPercent(data.cumulativeReturn / 100)}
            </span>
          </div>
          {!compact && (
            <p className="text-xs text-muted-foreground mt-1">
              Daily: {data.return >= 0 ? '+' : ''}{data.return.toFixed(2)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass glow-primary border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Backtest Results
            <Badge variant="secondary" className="text-xs ml-2">
              {backtest.period}
            </Badge>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Badge
              variant={isPositive ? 'success' : 'danger'}
              className="gap-1"
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isPositive ? '+' : ''}{formatPercent(backtest.totalReturn / 100)}
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        {!compact && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Total Return</div>
              <div className={`text-lg font-bold ${backtest.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                {backtest.totalReturn >= 0 ? '+' : ''}
                {formatPercent(backtest.totalReturn / 100)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Max Drawdown</div>
              <div className="text-lg font-bold text-red-400">
                -{formatPercent(backtest.maxDrawdown / 100)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Sharpe Ratio</div>
              <div className="text-lg font-bold text-primary">
                {backtest.sharpeRatio.toFixed(2)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
              <div className="text-lg font-bold text-green-500">
                {backtest.winRate.toFixed(0)}%
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Performance Chart */}
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart data={backtest.historicalPerformance}>
            <defs>
              <linearGradient id="returnGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? '#10B981' : '#EF4444'}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? '#10B981' : '#EF4444'}
                  stopOpacity={0}
                />
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
              tickFormatter={(value) => {
                // Show only every 5th date on compact
                if (compact) {
                  const index = backtest.historicalPerformance.findIndex(d => d.date === value);
                  return index % 5 === 0 ? value : '';
                }
                return value;
              }}
            />

            <YAxis
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Zero line */}
            <ReferenceLine
              y={0}
              stroke="#6B7280"
              strokeDasharray="3 3"
            />

            <Area
              type="monotone"
              dataKey="cumulativeReturn"
              stroke={isPositive ? '#10B981' : '#EF4444'}
              strokeWidth={2}
              fill="url(#returnGradient)"
            />

            <Line
              type="monotone"
              dataKey="cumulativeReturn"
              stroke={isPositive ? '#10B981' : '#EF4444'}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Rebalance Triggers */}
        {!compact && backtest.rebalanceTriggers && (
          <div className="mt-6 space-y-3">
            <div className="text-sm font-medium">Rebalance Triggers</div>
            <div className="space-y-2">
              {backtest.rebalanceTriggers.map((trigger, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-white/10"
                >
                  <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <div className="flex-1 text-sm">
                    <div className="font-medium mb-1">When {trigger.condition}</div>
                    <div className="text-muted-foreground">
                      Action: <span className="text-primary">{trigger.action.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics */}
        {!compact && (
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-background/50 border border-white/10">
              <div className="text-muted-foreground mb-1">Best Day</div>
              <div className="text-lg font-bold text-green-500">
                +{Math.max(...backtest.historicalPerformance.map(d => d.return)).toFixed(2)}%
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background/50 border border-white/10">
              <div className="text-muted-foreground mb-1">Worst Day</div>
              <div className="text-lg font-bold text-red-500">
                {Math.min(...backtest.historicalPerformance.map(d => d.return)).toFixed(2)}%
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
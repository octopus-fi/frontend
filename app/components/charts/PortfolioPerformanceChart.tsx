'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Activity, Calendar } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { useState } from 'react';

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

interface PortfolioPerformanceChartProps {
  initialValue?: number;
}

export function PortfolioPerformanceChart({ 
  initialValue = 100000 
}: PortfolioPerformanceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // Generate historical data based on time range
  const generateData = (range: TimeRange) => {
    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
      'all': 730,
    }[range];

    const data = [];
    let value = initialValue;
    let collateral = initialValue * 0.7;
    let debt = initialValue * 0.3;

    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));

      // Simulate realistic growth with some volatility
      const dailyChange = (Math.random() - 0.45) * 0.02; // Slightly positive bias
      value = value * (1 + dailyChange);
      collateral = collateral * (1 + dailyChange * 0.8);
      debt = debt * (1 + dailyChange * 0.3);

      // Format date based on range
      let dateStr;
      if (range === '7d') {
        dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (range === '30d' || range === '90d') {
        dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        dateStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }

      // Only add every nth point for longer ranges
      const step = range === 'all' ? 7 : range === '1y' ? 7 : range === '90d' ? 3 : 1;
      if (i % step === 0 || i === days) {
        data.push({
          date: dateStr,
          totalValue: value,
          collateral: collateral,
          debt: debt,
          netValue: value - debt,
        });
      }
    }

    return data;
  };

  const data = generateData(timeRange);
  const currentValue = data[data.length - 1].totalValue;
  const startValue = data[0].totalValue;
  const totalReturn = ((currentValue - startValue) / startValue) * 100;
  const isPositive = totalReturn >= 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass border border-white/20 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <span className="text-xs" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span className="text-sm font-bold" style={{ color: entry.color }}>
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Portfolio Performance
            </CardTitle>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant={isPositive ? 'success' : 'danger'} className="text-lg px-3 py-1">
                {isPositive ? '+' : ''}{formatPercent(totalReturn / 100)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {timeRange === '7d' ? 'Last 7 days' :
                 timeRange === '30d' ? 'Last 30 days' :
                 timeRange === '90d' ? 'Last 90 days' :
                 timeRange === '1y' ? 'Last year' : 'All time'}
              </span>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-1">
            {(['7d', '30d', '90d', '1y', 'all'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === 'all' ? 'All' : range.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Performance Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="totalValueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
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
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area 
              type="monotone" 
              dataKey="totalValue" 
              stroke="#06b6d4" 
              strokeWidth={3}
              fill="url(#totalValueGradient)"
              name="Total Value"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Breakdown Chart */}
        <div>
          <div className="text-sm font-medium mb-3">Value Breakdown</div>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={data}>
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
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="rect"
              />
              
              <Bar 
                dataKey="collateral" 
                fill="#10B981" 
                name="Collateral"
                radius={[4, 4, 0, 0]}
              />
              
              <Bar 
                dataKey="debt" 
                fill="#EF4444" 
                name="Debt"
                radius={[4, 4, 0, 0]}
              />
              
              <Line 
                type="monotone" 
                dataKey="netValue" 
                stroke="#06b6d4" 
                strokeWidth={2}
                dot={false}
                name="Net Value"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Current Value</div>
            <div className="text-lg font-bold">
              {formatCurrency(currentValue)}
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Start Value</div>
            <div className="text-lg font-bold">
              {formatCurrency(startValue)}
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Change</div>
            <div className={`text-lg font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{formatCurrency(currentValue - startValue)}
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Return</div>
            <div className={`text-lg font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{formatPercent(totalReturn / 100)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
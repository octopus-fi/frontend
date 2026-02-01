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
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, DollarSign, Percent } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';

interface APYProjectionChartProps {
  currentValue: number;
  currentAPY: number;
  projectionMonths?: number;
}

export function APYProjectionChart({ 
  currentValue, 
  currentAPY, 
  projectionMonths = 12 
}: APYProjectionChartProps) {
  // Generate projection data
  const generateProjection = () => {
    const data = [];
    let value = currentValue;
    const monthlyRate = currentAPY / 100 / 12;

    for (let i = 0; i <= projectionMonths; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: value,
        earnings: value - currentValue,
      });

      value = value * (1 + monthlyRate);
    }

    return data;
  };

  const projectionData = generateProjection();
  const finalValue = projectionData[projectionData.length - 1].value;
  const totalEarnings = finalValue - currentValue;

  // Calculate different APY scenarios
  const generateScenarios = () => {
    const data = [];
    const apyScenarios = {
      conservative: currentAPY * 0.7,
      expected: currentAPY,
      optimistic: currentAPY * 1.3,
    };

    for (let i = 0; i <= projectionMonths; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() + i);
      const monthStr = month.toLocaleDateString('en-US', { month: 'short' });

      const conservative = currentValue * Math.pow(1 + (apyScenarios.conservative / 100 / 12), i);
      const expected = currentValue * Math.pow(1 + (apyScenarios.expected / 100 / 12), i);
      const optimistic = currentValue * Math.pow(1 + (apyScenarios.optimistic / 100 / 12), i);

      data.push({
        month: monthStr,
        conservative,
        expected,
        optimistic,
      });
    }

    return data;
  };

  const scenarioData = generateScenarios();

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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            APY Projection
          </CardTitle>
          <Badge variant="secondary">
            {projectionMonths} Month Outlook
          </Badge>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 rounded-lg bg-background/50 border border-white/10">
            <div className="text-xs text-muted-foreground mb-1">Current Value</div>
            <div className="text-lg font-bold">
              {formatCurrency(currentValue)}
            </div>
          </div>

          <div className="text-center p-3 rounded-lg bg-background/50 border border-white/10">
            <div className="text-xs text-muted-foreground mb-1">Projected Value</div>
            <div className="text-lg font-bold text-primary">
              {formatCurrency(finalValue)}
            </div>
          </div>

          <div className="text-center p-3 rounded-lg bg-background/50 border border-white/10">
            <div className="text-xs text-muted-foreground mb-1">Total Earnings</div>
            <div className="text-lg font-bold text-green-500">
              +{formatCurrency(totalEarnings)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Projection Chart */}
        <div>
          <div className="text-sm font-medium mb-3">Portfolio Growth</div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="month" 
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
                dataKey="value" 
                stroke="#06b6d4" 
                strokeWidth={2}
                fill="url(#valueGradient)"
                name="Portfolio Value"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Scenario Comparison */}
        <div>
          <div className="text-sm font-medium mb-3">APY Scenarios</div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={scenarioData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.1)"
                vertical={false}
              />
              
              <XAxis 
                dataKey="month" 
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
                iconType="line"
              />
              
              <Line 
                type="monotone" 
                dataKey="conservative" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={false}
                name={`Conservative (${(currentAPY * 0.7).toFixed(1)}%)`}
                strokeDasharray="5 5"
              />
              
              <Line 
                type="monotone" 
                dataKey="expected" 
                stroke="#06b6d4" 
                strokeWidth={3}
                dot={false}
                name={`Expected (${currentAPY.toFixed(1)}%)`}
              />
              
              <Line 
                type="monotone" 
                dataKey="optimistic" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={false}
                name={`Optimistic (${(currentAPY * 1.3).toFixed(1)}%)`}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* APY Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Conservative</span>
            </div>
            <div className="text-xl font-bold text-amber-500">
              {formatPercent((currentAPY * 0.7) / 100)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              -30% from current
            </div>
          </div>

          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Expected</span>
            </div>
            <div className="text-xl font-bold text-primary">
              {formatPercent(currentAPY / 100)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Current APY
            </div>
          </div>

          <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Optimistic</span>
            </div>
            <div className="text-xl font-bold text-green-500">
              {formatPercent((currentAPY * 1.3) / 100)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              +30% from current
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
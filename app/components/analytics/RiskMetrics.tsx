'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Shield, AlertTriangle, TrendingDown, Activity } from 'lucide-react';
import { formatPercent, cn } from '@/lib/utils';

interface RiskMetricsProps {
  vaults?: Array<{
    id: string;
    health: number;
    ltv: number;
  }>;
}

export function RiskMetrics({ vaults = [] }: RiskMetricsProps) {
  // Calculate risk metrics
  const calculateRiskMetrics = () => {
    if (vaults.length === 0) {
      return {
        avgHealth: 0,
        minHealth: 0,
        maxHealth: 0,
        avgLTV: 0,
        atRiskCount: 0,
        safeCount: 0,
        warningCount: 0,
      };
    }

    const healths = vaults.map(v => v.health);
    const ltvs = vaults.map(v => v.ltv);

    return {
      avgHealth: healths.reduce((a, b) => a + b, 0) / healths.length,
      minHealth: Math.min(...healths),
      maxHealth: Math.max(...healths),
      avgLTV: ltvs.reduce((a, b) => a + b, 0) / ltvs.length,
      atRiskCount: vaults.filter(v => v.health < 1.2).length,
      safeCount: vaults.filter(v => v.health >= 1.5).length,
      warningCount: vaults.filter(v => v.health >= 1.2 && v.health < 1.5).length,
    };
  };

  const metrics = calculateRiskMetrics();

  // Radar chart data
  const radarData = [
    {
      metric: 'Health',
      value: Math.min(metrics.avgHealth / 3 * 100, 100),
      fullMark: 100,
    },
    {
      metric: 'Diversification',
      value: Math.min((vaults.length / 10) * 100, 100),
      fullMark: 100,
    },
    {
      metric: 'Liquidity',
      value: Math.min(((100 - metrics.avgLTV) / 100) * 100, 100),
      fullMark: 100,
    },
    {
      metric: 'Stability',
      value: metrics.minHealth >= 1.5 ? 100 : metrics.minHealth >= 1.2 ? 60 : 30,
      fullMark: 100,
    },
    {
      metric: 'Efficiency',
      value: Math.min(metrics.avgLTV, 100),
      fullMark: 100,
    },
  ];

  // Pie chart data for vault distribution
  const vaultDistribution = [
    { name: 'Safe', value: metrics.safeCount, color: '#10B981' },
    { name: 'Warning', value: metrics.warningCount, color: '#F59E0B' },
    { name: 'At Risk', value: metrics.atRiskCount, color: '#EF4444' },
  ].filter(item => item.value > 0);

  // Overall risk score (0-100)
  const calculateOverallRisk = () => {
    const healthScore = Math.min((metrics.avgHealth / 3) * 100, 100);
    const ltvScore = 100 - metrics.avgLTV;
    const stabilityScore = metrics.minHealth >= 1.5 ? 100 : metrics.minHealth >= 1.2 ? 60 : 30;
    
    return (healthScore * 0.4 + ltvScore * 0.3 + stabilityScore * 0.3);
  };

  const overallRiskScore = calculateOverallRisk();
  const getRiskLevel = () => {
    if (overallRiskScore >= 80) return { level: 'Low Risk', color: 'text-green-500', variant: 'success' as const };
    if (overallRiskScore >= 60) return { level: 'Medium Risk', color: 'text-yellow-500', variant: 'warning' as const };
    return { level: 'High Risk', color: 'text-red-500', variant: 'danger' as const };
  };

  const riskLevel = getRiskLevel();

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Risk Analysis
          </CardTitle>
          <Badge variant={riskLevel.variant} className="text-lg px-3 py-1">
            {riskLevel.level}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Risk Score */}
        <div className="text-center p-6 rounded-lg bg-background/50 border border-white/10">
          <div className="text-sm text-muted-foreground mb-2">Overall Risk Score</div>
          <div className={cn('text-5xl font-bold mb-2', riskLevel.color)}>
            {overallRiskScore.toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground">out of 100</div>
          
          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full transition-all duration-1000',
                overallRiskScore >= 80 ? 'bg-green-500' :
                overallRiskScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              )}
              style={{ width: `${overallRiskScore}%` }}
            />
          </div>
        </div>

        {/* Radar Chart */}
        <div>
          <div className="text-sm font-medium mb-3 text-center">Risk Profile</div>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis 
                dataKey="metric" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                tick={{ fill: '#9CA3AF', fontSize: 10 }}
              />
              <Radar 
                name="Risk Metrics" 
                dataKey="value" 
                stroke="#06b6d4" 
                fill="#06b6d4" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-background/50 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Avg Health Factor</span>
            </div>
            <div className="text-2xl font-bold">
              {metrics.avgHealth.toFixed(2)}×
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Min: {metrics.minHealth.toFixed(2)}× • Max: {metrics.maxHealth.toFixed(2)}×
            </div>
          </div>

          <div className="p-4 rounded-lg bg-background/50 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Avg LTV</span>
            </div>
            <div className="text-2xl font-bold">
              {metrics.avgLTV.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Utilization rate
            </div>
          </div>
        </div>

        {/* Vault Distribution */}
        {vaultDistribution.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-3 text-center">Vault Health Distribution</div>
            <div className="flex items-center gap-6">
              {/* Pie Chart */}
              <div className="shrink-0">
                <ResponsiveContainer width={150} height={150}>
                  <PieChart>
                    <Pie
                      data={vaultDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {vaultDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-2">
                {vaultDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{item.value}</span>
                      <span className="text-xs text-muted-foreground">
                        ({((item.value / vaults.length) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Risk Warnings */}
        {metrics.atRiskCount > 0 && (
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
              <div className="text-sm">
                <div className="font-semibold text-red-400 mb-1">
                  {metrics.atRiskCount} Vault{metrics.atRiskCount > 1 ? 's' : ''} at Risk
                </div>
                <p className="text-muted-foreground">
                  {metrics.atRiskCount > 1 ? 'These vaults have' : 'This vault has'} a health factor below 1.2×. 
                  Consider adding collateral or repaying debt immediately.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Recommendations</div>
          <div className="space-y-2 text-sm text-muted-foreground">
            {metrics.avgHealth < 1.5 && (
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Consider increasing collateral to improve average health factor</span>
              </div>
            )}
            {metrics.avgLTV > 65 && (
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>High average LTV detected. Consider repaying some debt for safety</span>
              </div>
            )}
            {vaults.length < 3 && (
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Diversify by creating more vaults with different strategies</span>
              </div>
            )}
            {metrics.atRiskCount === 0 && metrics.avgHealth >= 2.0 && (
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Portfolio is well-balanced and healthy. Good job!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
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
} from 'recharts';
import { Shield, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { formatPercent, cn } from '@/lib/utils';

interface RiskMetricsProps {
  ltv: number;
  healthFactor: number;
  healthStatus: string;
}

export function RiskMetrics({ ltv, healthFactor, healthStatus }: RiskMetricsProps) {
  // Calculate risk score (0-100)
  const calculateRiskScore = () => {
    if (healthFactor === Infinity) return 0;
    if (healthFactor >= 2.0) return 10;
    if (healthFactor >= 1.5) return 30;
    if (healthFactor >= 1.2) return 60;
    return 90;
  };

  const riskScore = calculateRiskScore();

  // Determine risk level
  const getRiskLevel = () => {
    if (riskScore >= 70) return { level: 'high', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' };
    if (riskScore >= 40) return { level: 'medium', color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' };
    return { level: 'low', color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' };
  };

  const risk = getRiskLevel();

  // Radar chart data - normalized scores
  const radarData = [
    {
      metric: 'Health',
      value: Math.min(100, healthFactor === Infinity ? 100 : (healthFactor / 2) * 100),
      fullMark: 100,
    },
    {
      metric: 'LTV',
      value: Math.max(0, 100 - (ltv / 70) * 100), // Lower LTV = higher score
      fullMark: 100,
    },
    {
      metric: 'Safety',
      value: 100 - riskScore,
      fullMark: 100,
    },
    {
      metric: 'Stability',
      value: healthFactor === Infinity ? 100 : Math.min(100, (2 - Math.abs(healthFactor - 1.5)) * 50),
      fullMark: 100,
    },
  ];

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Risk Assessment</CardTitle>
          <Badge 
            variant={
              risk.level === 'high' ? 'danger' :
              risk.level === 'medium' ? 'warning' : 'success'
            }
          >
            {risk.level === 'high' ? 'High Risk' :
             risk.level === 'medium' ? 'Medium Risk' : 'Low Risk'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Score */}
        <div className={cn('p-4 rounded-lg border', risk.bg)}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Risk Score</span>
            {risk.level === 'high' ? (
              <AlertTriangle className={cn('h-5 w-5', risk.color)} />
            ) : (
              <Shield className={cn('h-5 w-5', risk.color)} />
            )}
          </div>
          <div className={cn('text-3xl font-bold', risk.color)}>
            {riskScore}/100
          </div>
        </div>

        {/* Radar Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#ffffff15" />
              <PolarAngleAxis 
                dataKey="metric" 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <Radar
                name="Risk Metrics"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-500" />
              <span className="text-sm">Health Factor</span>
            </div>
            <span className="font-semibold">
              {healthFactor === Infinity ? '∞' : healthFactor.toFixed(2)}×
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm">Current LTV</span>
            </div>
            <span className="font-semibold">{ltv.toFixed(1)}%</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <span className="text-sm">Max LTV</span>
            </div>
            <span className="font-semibold">70.0%</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm">Liquidation LTV</span>
            </div>
            <span className="font-semibold">80.0%</span>
          </div>
        </div>

        {/* Risk Recommendations */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Recommendations</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            {risk.level === 'high' && (
              <>
                <p>• Add collateral immediately to reduce risk</p>
                <p>• Consider repaying debt to improve health</p>
                <p>• Enable AI auto-rebalance for protection</p>
              </>
            )}
            {risk.level === 'medium' && (
              <>
                <p>• Monitor your position closely</p>
                <p>• Consider adding collateral buffer</p>
                <p>• Keep some octUSD ready for repayment</p>
              </>
            )}
            {risk.level === 'low' && (
              <>
                <p>• Your position is healthy</p>
                <p>• You can borrow more if needed</p>
                <p>• Continue monitoring regularly</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
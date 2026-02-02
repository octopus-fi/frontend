'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Settings,
  Bot,
  ExternalLink,
  AlertTriangle,
  Shield,
  Activity,
} from 'lucide-react';
import { HealthFactorGauge } from './HealthFactorGauge';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';
import { 
  formatAmount,
  calculateLTV,
  calculateHealthFactor,
  getHealthStatus,
  useOctsuiPrice,
} from '@/sdk/index';

interface VaultCardProps {
  vaultId: string;
  collateral: bigint;
  debt: bigint;
  rewardReserve: bigint;
  index?: number;
  aiManaged?: boolean;
}

export function VaultCard({ 
  vaultId, 
  collateral, 
  debt, 
  rewardReserve,
  index = 0,
  aiManaged = false,
}: VaultCardProps) {
  const { data: price } = useOctsuiPrice();
  
  const collateralValue = price ? (Number(collateral) / 1e9) * price : 0;
  const debtValue = Number(debt) / 1e9;
  
  const ltv = calculateLTV(debtValue, collateralValue);
  const healthFactor = calculateHealthFactor(collateralValue, debtValue);
  const healthStatus = getHealthStatus(ltv);
  
  // Background gradient based on health
  const getBgGradient = () => {
    if (healthStatus.level === 'danger' || healthStatus.level === 'liquidatable') 
      return 'from-red-500/10 to-orange-500/10';
    if (healthStatus.level === 'warning') 
      return 'from-yellow-500/10 to-amber-500/10';
    return 'from-green-500/10 to-emerald-500/10';
  };

  const getRiskLevel = () => {
    if (healthStatus.level === 'danger' || healthStatus.level === 'liquidatable') 
      return 'high';
    if (healthStatus.level === 'warning') 
      return 'medium';
    return 'low';
  };

  const riskLevel = getRiskLevel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={cn(
        'glass border-primary/20 hover:border-primary/40 transition-all cursor-pointer group relative overflow-hidden',
        riskLevel === 'high' && 'border-red-500/30 hover:border-red-500/50'
      )}>
        {/* Risk gradient background */}
        <div className={cn(
          'absolute inset-0 gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity',
          getBgGradient()
        )} />

        {/* AI Badge */}
        {aiManaged && (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="electric" className="gap-1 animate-pulse-glow">
              <Bot className="h-3 w-3" />
              AI Active
            </Badge>
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">
                <Link href={`/dashboard/borrow/${vaultId}`} className="hover:text-primary transition-colors">
                  Vault #{vaultId.slice(0, 8)}
                  <ExternalLink className="inline h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={
                    riskLevel === 'high' ? 'danger' :
                    riskLevel === 'medium' ? 'warning' : 'success'
                  }
                >
                  {riskLevel === 'high' ? 'High Risk' :
                   riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk'}
                </Badge>
                <Badge variant="outline">
                  LTV: {ltv.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Health Factor Gauge */}
          <HealthFactorGauge 
            healthFactor={healthFactor}
            ltv={ltv}
            compact
          />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-cyan-500" />
                <span className="text-xs text-muted-foreground">Collateral</span>
              </div>
              <div className="font-mono font-semibold">
                {formatAmount(collateral)} octSUI
              </div>
              <p className="text-xs text-muted-foreground">
                ~{formatCurrency(collateralValue)}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">Debt</span>
              </div>
              <div className="font-mono font-semibold">
                {formatAmount(debt)} octUSD
              </div>
              <p className="text-xs text-muted-foreground">
                ~{formatCurrency(debtValue)}
              </p>
            </div>
          </div>

          {/* Health Status */}
          <div className={cn(
            'p-3 rounded-lg border',
            healthStatus.level === 'safe' && 'bg-green-500/10 border-green-500/20',
            healthStatus.level === 'warning' && 'bg-yellow-500/10 border-yellow-500/20',
            (healthStatus.level === 'danger' || healthStatus.level === 'liquidatable') && 'bg-red-500/10 border-red-500/20'
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {riskLevel === 'high' ? (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm font-medium">
                  Health: {healthFactor === Infinity ? '∞' : healthFactor.toFixed(2)}×
                </span>
              </div>
              <Badge 
                variant={
                  healthStatus.level === 'safe' ? 'success' :
                  healthStatus.level === 'warning' ? 'warning' : 'danger'
                }
                className="text-xs"
              >
                {healthStatus.label}
              </Badge>
            </div>
          </div>

          {/* Additional Stats */}
          {Number(rewardReserve) > 0 && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-500">Safety Reserve</span>
                <span className="text-xs font-mono text-blue-500">
                  {formatAmount(rewardReserve)} octSUI
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`/dashboard/borrow/${vaultId}`}>
                Manage
              </Link>
            </Button>
            {!aiManaged && (
              <Button variant="outline" size="sm" className="gap-1" asChild>
                <Link href={`/dashboard/borrow/${vaultId}`}>
                  <Bot className="h-4 w-4" />
                  Enable AI
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Zap,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  ExternalLink,
  Clock,
  Flame,
} from 'lucide-react';
import { formatCurrency, formatPercent, truncateAddress, cn } from '@/lib/utils';

interface LiquidatableVaultProps {
  vault: {
    id: string;
    owner: string;
    collateral: bigint;
    debt: bigint;
    health: number;
    liquidationPrice: number;
    currentPrice: number;
    profit: number;
    urgency: 'critical' | 'high' | 'medium';
    timeToLiquidation: number; // minutes
  };
  index?: number;
  onLiquidate?: (vaultId: string) => void;
}

export function LiquidatableVault({ vault, index = 0, onLiquidate }: LiquidatableVaultProps) {
  const [isLiquidating, setIsLiquidating] = useState(false);

  const collateralValue = Number(vault.collateral) / 1e9;
  const debtValue = Number(vault.debt) / 1e6;

  const getUrgencyColor = () => {
    if (vault.urgency === 'critical') return 'text-red-500';
    if (vault.urgency === 'high') return 'text-orange-500';
    return 'text-yellow-500';
  };

  const getUrgencyBadge = () => {
    if (vault.urgency === 'critical') return 'danger' as const;
    if (vault.urgency === 'high') return 'warning' as const;
    return 'secondary' as const;
  };

  const getUrgencyLabel = () => {
    if (vault.urgency === 'critical') return 'Critical';
    if (vault.urgency === 'high') return 'High';
    return 'Medium';
  };

  const handleLiquidate = async () => {
    setIsLiquidating(true);
    // Simulate liquidation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLiquidating(false);
    onLiquidate?.(vault.id);
  };

  const profitPercentage = (vault.profit / (collateralValue * vault.currentPrice)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={cn(
        'glass border-2 transition-all hover:shadow-xl group relative overflow-hidden',
        vault.urgency === 'critical' ? 'border-red-500/50 bg-red-500/5' :
        vault.urgency === 'high' ? 'border-orange-500/50 bg-orange-500/5' :
        'border-yellow-500/50 bg-yellow-500/5'
      )}>
        {/* Urgency Indicator */}
        <div className={cn(
          'absolute top-0 left-0 right-0 h-1',
          vault.urgency === 'critical' ? 'bg-red-500 animate-pulse' :
          vault.urgency === 'high' ? 'bg-orange-500' :
          'bg-yellow-500'
        )} />

        {/* Urgency Badge */}
        <div className="absolute top-4 right-4 z-10">
          <Badge variant={getUrgencyBadge()} className="gap-1 animate-pulse-glow">
            <Flame className={cn('h-3 w-3', getUrgencyColor())} />
            {getUrgencyLabel()} Priority
          </Badge>
        </div>

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between pr-32">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xl font-bold">
                  Vault #{truncateAddress(vault.id, 8)}
                </span>
                <button className="opacity-60 hover:opacity-100 transition-opacity">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm text-muted-foreground">
                Owner: {truncateAddress(vault.owner, 6)}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Health & Price Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-background/50 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                <span className="text-xs text-muted-foreground">Health Factor</span>
              </div>
              <div className={cn('text-2xl font-bold', getUrgencyColor())}>
                {vault.health.toFixed(3)}×
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Below liquidation threshold
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background/50 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Current Price</span>
              </div>
              <div className="text-2xl font-bold">${vault.currentPrice.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Liq: ${vault.liquidationPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Collateral & Debt */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Collateral (octSUI):</span>
              <span className="font-mono font-semibold">
                {collateralValue.toLocaleString()} (~{formatCurrency(collateralValue * vault.currentPrice)})
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Debt (octUSD):</span>
              <span className="font-mono font-semibold">
                {formatCurrency(debtValue)}
              </span>
            </div>
          </div>

          {/* Profit Estimation */}
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-400" />
                <span className="font-semibold text-green-400">Estimated Profit</span>
              </div>
              <Badge variant="success" className="text-base px-3">
                {formatPercent(profitPercentage / 100)}
              </Badge>
            </div>
            <div className="text-3xl font-bold text-green-500">
              {formatCurrency(vault.profit)}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Liquidation reward (3%) + protocol fee recovery
            </div>
          </div>

          {/* Time to Liquidation */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-white/10">
            <Clock className={cn('h-5 w-5', getUrgencyColor())} />
            <div className="flex-1">
              <div className="text-sm font-medium">Time to Liquidation</div>
              <div className={cn('text-xs', getUrgencyColor())}>
                {vault.timeToLiquidation < 60 
                  ? `~${vault.timeToLiquidation} minutes`
                  : `~${Math.floor(vault.timeToLiquidation / 60)} hours ${vault.timeToLiquidation % 60} minutes`
                }
              </div>
            </div>
          </div>

          {/* Liquidate Button */}
          <Button
            variant="electric"
            size="lg"
            className="w-full gap-2 text-lg"
            onClick={handleLiquidate}
            loading={isLiquidating}
          >
            <Zap className="h-5 w-5" />
            {isLiquidating ? 'Executing Flash Liquidation...' : 'Flash Liquidate'}
          </Button>

          {/* Warning */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-3 flex gap-2 text-xs">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-muted-foreground">
                Flash liquidation requires flash loan. Gas fees and slippage may apply.
                Estimated execution time: 15-30 seconds.
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </motion.div>
  );
}
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, XCircle, Shield } from 'lucide-react';

interface HealthFactorGaugeProps {
  healthFactor: number;
  ltv: number;
  compact?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function HealthFactorGauge({
  healthFactor,
  ltv,
  compact = false,
  showLabel = true,
  className,
}: HealthFactorGaugeProps) {
  // Clamp value to reasonable range for display
  const displayValue = healthFactor === Infinity ? 3.0 : Math.min(healthFactor, 3.0);
  const percentage = (displayValue / 3.0) * 100;

  // Determine color and status based on health factor
  const getColorAndStatus = () => {
    if (healthFactor < 1.0) {
      return {
        color: '#EF4444',
        status: 'Liquidated',
        icon: XCircle,
        glowClass: 'shadow-red-500/50',
        badgeVariant: 'danger' as const,
        bgGradient: 'from-red-500/20 to-orange-500/20',
      };
    }
    if (healthFactor < 1.2) {
      return {
        color: '#EF4444',
        status: 'Critical Risk',
        icon: XCircle,
        glowClass: 'shadow-red-500/50',
        badgeVariant: 'danger' as const,
        bgGradient: 'from-red-500/20 to-orange-500/20',
      };
    }
    if (healthFactor < 1.5) {
      return {
        color: '#F59E0B',
        status: 'Medium Risk',
        icon: AlertTriangle,
        glowClass: 'shadow-yellow-500/50',
        badgeVariant: 'warning' as const,
        bgGradient: 'from-yellow-500/20 to-amber-500/20',
      };
    }
    return {
      color: '#10B981',
      status: 'Safe',
      icon: CheckCircle2,
      glowClass: 'shadow-green-500/50',
      badgeVariant: 'success' as const,
      bgGradient: 'from-green-500/20 to-emerald-500/20',
    };
  };

  const { color, status, icon: StatusIcon, glowClass, badgeVariant, bgGradient } = getColorAndStatus();

  // Compact version for VaultCard
  if (compact) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Health Factor</span>
          <Badge variant={badgeVariant} className="text-xs">
            {status}
          </Badge>
        </div>

        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {healthFactor === Infinity ? '∞' : healthFactor.toFixed(2)}×
          </span>
          <span className="text-muted-foreground">
            LTV: {ltv.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  }

  // Full version for vault detail page
  return (
    <Card className={cn('glass glow-primary', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Vault Health
          </CardTitle>
          <Badge variant={badgeVariant}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Circular Gauge */}
        <div className="flex justify-center">
          <div className="relative">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#ffffff10"
                strokeWidth="12"
              />

              {/* Progress circle */}
              <motion.circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 80}`}
                strokeDashoffset={`${2 * Math.PI * 80 * (1 - percentage / 100)}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - percentage / 100) }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                transform="rotate(-90 100 100)"
                className={glowClass}
              />
            </svg>

            {/* Center value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <StatusIcon
                className="h-8 w-8 mb-2"
                style={{ color }}
              />
              <div className="text-4xl font-bold" style={{ color }}>
                {healthFactor === Infinity ? '∞' : healthFactor.toFixed(2)}×
              </div>
              {showLabel && (
                <div className="text-xs text-muted-foreground mt-1">
                  Health Factor
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted">
            <div className="text-xs text-muted-foreground mb-1">Current LTV</div>
            <div className="text-2xl font-bold">
              {ltv.toFixed(1)}%
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted">
            <div className="text-xs text-muted-foreground mb-1">Max LTV</div>
            <div className="text-2xl font-bold">
              70.0%
            </div>
          </div>
        </div>

        {/* Progress Bar with Zones */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Safe Zone</span>
            <span>Liquidation</span>
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            {/* Colored zones */}
            <div className="absolute inset-y-0 left-0 w-[60%] bg-green-500/20" />
            <div className="absolute inset-y-0 left-[60%] w-[10%] bg-yellow-500/20" />
            <div className="absolute inset-y-0 left-[70%] w-[10%] bg-orange-500/20" />
            <div className="absolute inset-y-0 left-[80%] w-[20%] bg-red-500/20" />

            {/* Current progress fill */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(ltv, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 opacity-80 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              style={{ backgroundColor: color }}
            />

            {/* Current position indicator */}
            <motion.div
              initial={{ left: 0 }}
              animate={{ left: `${Math.min(ltv, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-y-0 w-0.5 -ml-px z-10"
              style={{ backgroundColor: color }}
            >
              <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent"
                style={{ borderBottomColor: color }}
              />
            </motion.div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="text-yellow-500">60%</span>
            <span className="text-orange-500">70%</span>
            <span className="text-red-500">80%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Warning message */}
        {healthFactor < 1.5 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'p-4 rounded-lg border flex items-start gap-3',
              healthFactor < 1.2 ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'
            )}
          >
            <AlertTriangle className={cn(
              'h-5 w-5 shrink-0 mt-0.5',
              healthFactor < 1.2 ? 'text-red-500' : 'text-yellow-500'
            )} />
            <div className="flex-1">
              <div className={cn(
                'font-semibold mb-1',
                healthFactor < 1.2 ? 'text-red-500' : 'text-yellow-500'
              )}>
                {healthFactor < 1.2 ? 'Critical: Immediate Action Required' : 'Warning: Health Declining'}
              </div>
              <p className="text-sm text-muted-foreground">
                {healthFactor < 1.2
                  ? 'Your vault is at high risk of liquidation. Add collateral or repay debt immediately.'
                  : 'Consider adding collateral or repaying debt to improve your vault health.'}
              </p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
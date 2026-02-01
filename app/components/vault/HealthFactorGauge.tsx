'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface HealthFactorGaugeProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showLiquidationPrice?: boolean;
  liquidationPrice?: number;
  className?: string;
}

export function HealthFactorGauge({
  value,
  size = 'md',
  showLabel = true,
  showLiquidationPrice = false,
  liquidationPrice,
  className,
}: HealthFactorGaugeProps) {
  // Clamp value to reasonable range for display
  const displayValue = Math.min(value, 3.0);
  const percentage = (displayValue / 3.0) * 100;
  
  // Determine color and status
  const getColorAndStatus = () => {
    if (value < 1.0) {
      return {
        color: '#EF4444',
        status: 'Liquidated',
        icon: XCircle,
        glowClass: 'glow-danger',
        badgeVariant: 'danger' as const,
      };
    }
    if (value < 1.2) {
      return {
        color: '#EF4444',
        status: 'Critical Risk',
        icon: XCircle,
        glowClass: 'glow-danger',
        badgeVariant: 'danger' as const,
      };
    }
    if (value < 1.5) {
      return {
        color: '#F59E0B',
        status: 'Medium Risk',
        icon: AlertTriangle,
        glowClass: 'glow-warning',
        badgeVariant: 'warning' as const,
      };
    }
    return {
      color: '#10B981',
      status: 'Safe',
      icon: CheckCircle2,
      glowClass: 'glow-safe',
      badgeVariant: 'success' as const,
    };
  };

  const { color, status, icon: StatusIcon, badgeVariant } = getColorAndStatus();

  // Size configurations
  const sizeConfig = {
    sm: {
      height: 80,
      width: 160,
      fontSize: 'text-lg',
      badgeSize: 'text-xs',
      iconSize: 'h-4 w-4',
    },
    md: {
      height: 120,
      width: 240,
      fontSize: 'text-3xl',
      badgeSize: 'text-sm',
      iconSize: 'h-5 w-5',
    },
    lg: {
      height: 160,
      width: 320,
      fontSize: 'text-4xl',
      badgeSize: 'text-base',
      iconSize: 'h-6 w-6',
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={cn('relative', className)}>
      {/* SVG Gauge */}
      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height}`}
        className="w-full h-full"
      >
        {/* Background arc */}
        <path
          d={`M 20 ${config.height - 20} A 100 100 0 0 1 ${config.width - 20} ${config.height - 20}`}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {/* Filled arc with animation */}
        <motion.path
          d={`M 20 ${config.height - 20} A 100 100 0 0 1 ${config.width - 20} ${config.height - 20}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="314"
          initial={{ strokeDashoffset: 314 }}
          animate={{ strokeDashoffset: 314 - (314 * percentage) / 100 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 8px ${color})`,
          }}
        />
        
        {/* Threshold markers */}
        {/* Liquidation threshold (1.0) */}
        <circle
          cx="20"
          cy={config.height - 20}
          r="4"
          fill="#EF4444"
          opacity="0.6"
        />
        
        {/* Warning threshold (1.5) */}
        <circle
          cx={config.width / 2}
          cy="30"
          r="4"
          fill="#F59E0B"
          opacity="0.6"
        />
        
        {/* Safe threshold (3.0) */}
        <circle
          cx={config.width - 20}
          cy={config.height - 20}
          r="4"
          fill="#10B981"
          opacity="0.6"
        />
      </svg>

      {/* Center value display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className={cn('font-bold counter-animate', config.fontSize)}
          style={{ color }}
        >
          {value === Infinity ? '∞' : value.toFixed(2)}
        </motion.div>
        
        {showLabel && (
          <div className="text-xs text-muted-foreground mt-1">
            Health Factor
          </div>
        )}
        
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-2"
        >
          <Badge variant={badgeVariant} className={cn('gap-1', config.badgeSize)}>
            <StatusIcon className={config.iconSize} />
            {status}
          </Badge>
        </motion.div>
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Liquidation
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Warning
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Safe
        </span>
      </div>

      {/* Liquidation price */}
      {showLiquidationPrice && liquidationPrice !== undefined && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-3 text-sm"
        >
          <span className="text-muted-foreground">Liquidation Price: </span>
          <span className="font-mono font-semibold text-red-400">
            ${liquidationPrice.toFixed(2)}
          </span>
        </motion.div>
      )}
    </div>
  );
}
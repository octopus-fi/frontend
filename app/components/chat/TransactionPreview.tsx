'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TxStep {
  step: number;
  description: string;
  icon: 'coins' | 'trend-up' | 'trend-down' | 'plus' | 'arrow-up' | 'shield' | 'zap';
}

export interface TxPreviewData {
  type: 'borrow' | 'repay' | 'add_collateral' | 'create_vault' | 'liquidate' | 'stake';
  title: string;
  summary: string;
  steps: TxStep[];
  details: Record<string, string | number>;
  estimatedGas: number;
  warnings?: string[];
}

interface TransactionPreviewProps {
  preview: TxPreviewData;
  onConfirm: () => void;
  onCancel: () => void;
  confirmed?: boolean;
}

// ─── Icon resolver ───────────────────────────────────────────────────────────

function StepIcon({ name }: { name: TxStep['icon'] }) {
  const props = { className: 'h-4 w-4' } as const;
  switch (name) {
    case 'coins':      return <Coins {...props} />;
    case 'trend-up':   return <TrendingUp {...props} />;
    case 'trend-down': return <TrendingDown {...props} />;
    case 'plus':       return <Plus {...props} />;
    case 'arrow-up':   return <ArrowUpCircle {...props} />;
    case 'shield':     return <ShieldCheck {...props} />;
    case 'zap':        return <Zap {...props} />;
    default:           return null;
  }
}

// ─── Type badge colour map ───────────────────────────────────────────────────

const typeBadgeClass: Record<TxPreviewData['type'], string> = {
  borrow:           'bg-primary/20 text-primary',
  repay:            'bg-green-500/20 text-green-400',
  add_collateral:   'bg-blue-500/20 text-blue-400',
  create_vault:     'bg-purple-500/20 text-purple-400',
  liquidate:        'bg-orange-500/20 text-orange-400',
  stake:            'bg-cyan-500/20 text-cyan-400',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function TransactionPreview({
  preview,
  onConfirm,
  onCancel,
  confirmed = false,
}: TransactionPreviewProps) {
  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-background/60 backdrop-blur overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded',
            typeBadgeClass[preview.type]
          )}>
            {preview.type.replace('_', ' ')}
          </span>
          <span className="text-sm font-semibold text-foreground">{preview.title}</span>
        </div>
        <Badge variant="outline" className="text-xs gap-1">
          <Zap className="h-3 w-3 text-amber-400" />
          ~{formatCurrency(preview.estimatedGas)} gas
        </Badge>
      </div>

      {/* Summary */}
      <p className="px-4 pt-3 text-sm text-muted-foreground">{preview.summary}</p>

      {/* Steps */}
      <div className="px-4 py-3 space-y-2">
        {preview.steps.map((s) => (
          <div
            key={s.step}
            className={cn(
              'flex items-start gap-3',
              confirmed && 'opacity-60'
            )}
          >
            {/* Number circle */}
            <div className={cn(
              'shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold',
              confirmed
                ? 'bg-green-500/20 text-green-400'
                : 'bg-primary/20 text-primary'
            )}>
              {confirmed ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.step}
            </div>

            {/* Text + icon */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="text-primary/60"><StepIcon name={s.icon} /></span>
              {s.description}
            </div>
          </div>
        ))}
      </div>

      {/* Details grid */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2 border-t border-white/10">
          {Object.entries(preview.details).map(([label, value]) => (
            <div key={label} className="flex justify-between col-span-2 sm:col-span-1">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-xs font-semibold text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {preview.warnings && preview.warnings.length > 0 && (
        <div className="mx-4 mb-3 p-2.5 rounded-lg bg-amber-500/8 border border-amber-500/20">
          {preview.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        {confirmed ? (
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Transaction submitted — awaiting confirmation
          </div>
        ) : (
          <>
            <Button variant="electric" size="sm" className="flex-1 gap-1.5" onClick={onConfirm}>
              <CheckCircle2 className="h-4 w-4" />
              Confirm Transaction
            </Button>
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
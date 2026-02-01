'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { HealthFactorGauge } from '@/components/vault/HealthFactorGauge';
import {
  TrendingUp,
  ArrowDown,
  CheckCircle2,
  Info,
  Wallet,
} from 'lucide-react';
import {
  calculateHealthFactor,
  calculateLiquidationPrice,
} from '@/lib/calculations/vault';
import { formatCurrency, cn } from '@/lib/utils';
import type { Vault } from '@/types/index';

interface RepayFormProps {
  vault: Vault;
  onSuccess?: () => void;
}

const MOCK_PRICE = 3.0;

export function RepayForm({ vault, onSuccess }: RepayFormProps) {
  const [repayAmount, setRepayAmount] = useState('');
  const [withdrawCollateral, setWithdrawCollateral] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const repayNum = parseFloat(repayAmount) || 0;
  const withdrawNum = parseFloat(withdrawAmount) || 0;
  const currentCollateral = Number(vault.collateral) / 1e9;
  const currentDebt = Number(vault.debt) / 1e6;
  
  const newDebt = Math.max(0, currentDebt - repayNum);
  const newCollateral = withdrawCollateral 
    ? Math.max(0, currentCollateral - withdrawNum)
    : currentCollateral;

  // Calculate new metrics
  const newHealth = newDebt > 0 
    ? calculateHealthFactor(newCollateral, newDebt, MOCK_PRICE)
    : Infinity;
  // const newLTV = calculateLTV(newCollateral, newDebt, MOCK_PRICE);
  const newLiqPrice = newDebt > 0 
    ? calculateLiquidationPrice(newCollateral, newDebt)
    : 0;

  // Validation
  const maxWithdraw = newDebt > 0
    ? Math.max(0, newCollateral - (newDebt * 1.3 / MOCK_PRICE)) // Keep 130% collateralization
    : newCollateral;

  const isValid = repayNum > 0 && 
    repayNum <= currentDebt &&
    (!withdrawCollateral || (withdrawNum > 0 && withdrawNum <= maxWithdraw)) &&
    (newDebt === 0 || newHealth >= 1.1);

  const handleRepay = async () => {
    if (!isValid) return;
    
    setIsSubmitting(true);
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setRepayAmount('');
    setWithdrawAmount('');
    setWithdrawCollateral(false);
    onSuccess?.();
  };

  const isFullRepayment = repayNum >= currentDebt;

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Repay Debt
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Repay Input */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Repay Amount</label>
            <span className="text-sm text-muted-foreground">
              Total Debt: {formatCurrency(currentDebt)}
            </span>
          </div>
          
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              className="h-14 text-xl pr-32"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRepayAmount(currentDebt.toString())}
              >
                MAX
              </Button>
              <Badge variant="secondary" className="font-mono">
                octUSD
              </Badge>
            </div>
          </div>
          
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-muted-foreground">
              Balance: 15,000 octUSD
            </span>
            {isFullRepayment && (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Full Repayment
              </Badge>
            )}
          </div>
        </div>

        {/* Optional Withdraw Collateral */}
        {repayNum > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-white/10">
              <div>
                <div className="font-medium">Withdraw Collateral</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Optional: Remove collateral after repaying
                </div>
              </div>
              <button
                onClick={() => setWithdrawCollateral(!withdrawCollateral)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  withdrawCollateral ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    withdrawCollateral ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            {withdrawCollateral && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4"
              >
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Withdraw Amount</label>
                  <span className="text-sm text-muted-foreground">
                    Max: {formatCurrency(maxWithdraw)} octSUI
                  </span>
                </div>
                
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="h-14 text-xl pr-32"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setWithdrawAmount(maxWithdraw.toFixed(2))}
                    >
                      MAX
                    </Button>
                    <Badge variant="secondary" className="font-mono">
                      octSUI
                    </Badge>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Impact Preview */}
        {repayNum > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            {/* Arrow Separator */}
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <ArrowDown className="h-4 w-4 text-green-500" />
              </div>
            </div>

            {/* Before/After Comparison */}
            <div className="grid grid-cols-2 gap-4">
              {/* Current State */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground text-center">Current</div>
                <Card className="border-white/10">
                  <CardContent className="p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Collateral:</span>
                      <span className="font-mono">{formatCurrency(currentCollateral)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Debt:</span>
                      <span className="font-mono">{formatCurrency(currentDebt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Health:</span>
                      <span className={cn(
                        'font-semibold',
                        vault.health >= 1.5 ? 'text-green-500' :
                        vault.health >= 1.2 ? 'text-yellow-500' : 'text-red-500'
                      )}>
                        {vault.health.toFixed(2)}×
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* New State */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground text-center">After Repay</div>
                <Card className="border-2 border-green-500/30">
                  <CardContent className="p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Collateral:</span>
                      <span className="font-mono font-semibold">
                        {formatCurrency(newCollateral)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Debt:</span>
                      <span className="font-mono font-semibold text-green-500">
                        {formatCurrency(newDebt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Health:</span>
                      <span className="font-semibold text-green-500">
                        {newHealth === Infinity ? '∞' : `${newHealth.toFixed(2)}×`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Health Factor Gauge (only if debt remains) */}
            {!isFullRepayment && (
              <div className="flex justify-center py-4">
                <HealthFactorGauge
                  value={newHealth}
                  size="md"
                  showLiquidationPrice
                  liquidationPrice={newLiqPrice}
                />
              </div>
            )}

            {/* Transaction Summary */}
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Repay Amount:</span>
                  <span className="font-mono font-semibold">
                    {formatCurrency(repayNum)}
                  </span>
                </div>
                {withdrawCollateral && withdrawNum > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Withdraw:</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(withdrawNum)} octSUI
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="font-medium">Remaining Debt:</span>
                  <span className="font-mono font-bold text-green-500">
                    {formatCurrency(newDebt)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Full Repayment Celebration */}
            {isFullRepayment && (
              <Card className="border-green-500/30 bg-green-500/10">
                <CardContent className="p-4 flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-green-400 mb-1">
                      🎉 Congratulations!
                    </p>
                    <p className="text-muted-foreground">
                      You&apos;re repaying your entire debt. Your vault will be debt-free and you can withdraw all collateral if desired.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Info Card */}
        <Card className="border-primary/20 bg-background/50">
          <CardContent className="p-4 flex gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                Repaying debt improves your vault health and reduces liquidation risk.
              </p>
              <div className="space-y-1 text-xs">
                <div>• Repay any amount up to total debt</div>
                <div>• Withdraw collateral after maintaining 130% ratio</div>
                <div>• No fees for repayment</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          variant="electric"
          size="lg"
          className="w-full gap-2"
          onClick={handleRepay}
          disabled={!isValid}
          loading={isSubmitting}
        >
          <Wallet className="h-5 w-5" />
          {isSubmitting ? 'Repaying...' : 
           isFullRepayment ? 'Repay All & Close' :
           `Repay ${repayNum || 0} octUSD`}
        </Button>
      </CardContent>
    </Card>
  );
}
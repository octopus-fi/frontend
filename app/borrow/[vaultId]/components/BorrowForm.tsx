'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { HealthFactorGauge } from '@/components/vault/HealthFactorGauge';
import {
  DollarSign,
  AlertTriangle,
  Info,
  ArrowDown,
} from 'lucide-react';
import {
  calculateHealthFactor,
  calculateLTV,
  calculateAvailableBorrow,
  calculateLiquidationPrice,
  validateVaultParams,
} from '@/lib/calculations/vault';
import { formatCurrency, cn } from '@/lib/utils';
import type { Vault } from '@/types/index';

interface BorrowFormProps {
  vault: Vault;
  onSuccess?: () => void;
}

const MOCK_PRICE = 3.0;

export function BorrowForm({ vault, onSuccess }: BorrowFormProps) {
  const [borrowAmount, setBorrowAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const borrowNum = parseFloat(borrowAmount) || 0;
  const currentCollateral = Number(vault.collateral) / 1e9;
  const currentDebt = Number(vault.debt) / 1e6;
  const newDebt = currentDebt + borrowNum;

  // Calculate new metrics
  const newHealth = calculateHealthFactor(currentCollateral, newDebt, MOCK_PRICE);
  const newLTV = calculateLTV(currentCollateral, newDebt, MOCK_PRICE);
  const newLiqPrice = calculateLiquidationPrice(currentCollateral, newDebt);
  const availableBorrow = calculateAvailableBorrow(currentCollateral, currentDebt, MOCK_PRICE);
  
  const validation = validateVaultParams(currentCollateral, newDebt, MOCK_PRICE);

  const handleBorrow = async () => {
    if (!validation.valid) return;
    
    setIsSubmitting(true);
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setBorrowAmount('');
    onSuccess?.();
  };

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Borrow More octUSD
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Borrow Input */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Borrow Amount</label>
            <span className="text-sm text-muted-foreground">
              Available: {formatCurrency(availableBorrow)}
            </span>
          </div>
          
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(e.target.value)}
              className="h-14 text-xl pr-32"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBorrowAmount(availableBorrow.toFixed(2))}
              >
                MAX
              </Button>
              <Badge variant="secondary" className="font-mono">
                octUSD
              </Badge>
            </div>
          </div>
        </div>

        {/* Impact Preview */}
        {borrowNum > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            {/* Arrow Separator */}
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowDown className="h-4 w-4 text-primary" />
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
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">LTV:</span>
                      <span className="font-mono">{vault.ltv}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* New State */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground text-center">After Borrow</div>
                <Card className={cn(
                  'border-2',
                  newHealth >= 1.5 ? 'border-green-500/30' :
                  newHealth >= 1.2 ? 'border-yellow-500/30' : 'border-red-500/30'
                )}>
                  <CardContent className="p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Debt:</span>
                      <span className="font-mono font-semibold">
                        {formatCurrency(newDebt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Health:</span>
                      <span className={cn(
                        'font-semibold',
                        newHealth >= 1.5 ? 'text-green-500' :
                        newHealth >= 1.2 ? 'text-yellow-500' : 'text-red-500'
                      )}>
                        {newHealth.toFixed(2)}×
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">LTV:</span>
                      <span className="font-mono">{newLTV.toFixed(1)}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Health Factor Gauge */}
            <div className="flex justify-center py-4">
              <HealthFactorGauge
                value={newHealth}
                size="md"
                showLiquidationPrice
                liquidationPrice={newLiqPrice}
              />
            </div>

            {/* Transaction Details */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Borrow Amount:</span>
                  <span className="font-mono font-semibold">
                    {formatCurrency(borrowNum)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Minting Fee (0.5%):</span>
                  <span className="font-mono">
                    {formatCurrency(borrowNum * 0.005)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="font-medium">You Receive:</span>
                  <span className="font-mono font-bold">
                    {formatCurrency(borrowNum * 0.995)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Warnings */}
            {!validation.valid && validation.error && (
              <Card className="border-red-500/30 bg-red-500/5">
                <CardContent className="p-4 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                  <div className="text-sm text-red-400">
                    {validation.error}
                  </div>
                </CardContent>
              </Card>
            )}

            {validation.valid && validation.warnings && validation.warnings.length > 0 && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                    <div className="text-sm space-y-1">
                      {validation.warnings.map((warning, i) => (
                        <p key={i} className="text-amber-400">{warning}</p>
                      ))}
                    </div>
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
                Borrowing octUSD against your collateral allows you to access liquidity while still earning staking rewards.
              </p>
              <div className="space-y-1 text-xs">
                <div>• 0% interest rate</div>
                <div>• Only 0.5% one-time minting fee</div>
                <div>• Maintain health factor above 1.1×</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          variant="electric"
          size="lg"
          className="w-full gap-2"
          onClick={handleBorrow}
          disabled={!borrowNum || !validation.valid}
          loading={isSubmitting}
        >
          <DollarSign className="h-5 w-5" />
          {isSubmitting ? 'Borrowing...' : `Borrow ${borrowNum || 0} octUSD`}
        </Button>
      </CardContent>
    </Card>
  );
}
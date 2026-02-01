'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calculator,
  TrendingUp,
  Info,
  Zap,
  DollarSign,
} from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';

export function ProfitCalculator() {
  const [collateral, setCollateral] = useState('10000');
  const [debt, setDebt] = useState('9500');
  const [currentPrice, setCurrentPrice] = useState('2.8');
  const [liquidationPrice, setLiquidationPrice] = useState('2.9');

  // Calculate liquidation profit
  const calculateProfit = () => {
    const collateralNum = parseFloat(collateral) || 0;
    const debtNum = parseFloat(debt) || 0;
    const currentPriceNum = parseFloat(currentPrice) || 0;
    const liqPriceNum = parseFloat(liquidationPrice) || 0;

    if (collateralNum === 0 || debtNum === 0 || currentPriceNum === 0) {
      return {
        collateralValue: 0,
        debtValue: 0,
        liquidatorReward: 0,
        protocolFee: 0,
        flashLoanFee: 0,
        gasCost: 0,
        netProfit: 0,
        profitPercentage: 0,
        canLiquidate: false,
      };
    }

    const collateralValue = collateralNum * currentPriceNum;
    const debtValue = debtNum;

    // Check if can liquidate (health < 1.1)
    const health = (collateralValue * 1.1) / debtValue;
    const canLiquidate = health < 1.1;

    // Liquidation mechanics
    const liquidatorReward = collateralValue * 0.03; // 3% reward
    const protocolFee = collateralValue * 0.02; // 2% protocol fee
    const flashLoanFee = debtValue * 0.0009; // 0.09% flash loan fee
    const gasCost = 5; // Estimated $5 gas

    // Net profit
    const netProfit = liquidatorReward - flashLoanFee - gasCost;
    const profitPercentage = (netProfit / debtValue) * 100;

    return {
      collateralValue,
      debtValue,
      liquidatorReward,
      protocolFee,
      flashLoanFee,
      gasCost,
      netProfit,
      profitPercentage,
      canLiquidate,
      health,
    };
  };

  const result = calculateProfit();
  const isProfitable = result.netProfit > 0;

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Profit Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Simulate liquidation scenarios to estimate profits
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Collateral (octSUI)
            </label>
            <Input
              type="number"
              value={collateral}
              onChange={(e) => setCollateral(e.target.value)}
              placeholder="10000"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Debt (octUSD)
            </label>
            <Input
              type="number"
              value={debt}
              onChange={(e) => setDebt(e.target.value)}
              placeholder="9500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Current Price ($)
              </label>
              <Input
                type="number"
                step="0.01"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                placeholder="2.8"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Liq. Price ($)
              </label>
              <Input
                type="number"
                step="0.01"
                value={liquidationPrice}
                onChange={(e) => setLiquidationPrice(e.target.value)}
                placeholder="2.9"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {result.collateralValue > 0 && (
          <div className="space-y-4">
            {/* Can Liquidate Status */}
            <div className="text-center p-4 rounded-lg border-2 border-dashed"
              style={{
                borderColor: result.canLiquidate ? '#10B981' : '#EF4444',
                backgroundColor: result.canLiquidate ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'
              }}
            >
              <div className="text-sm text-muted-foreground mb-1">
                Liquidation Status
              </div>
              <div className={`text-2xl font-bold ${result.canLiquidate ? 'text-green-500' : 'text-red-500'}`}>
                {result.canLiquidate ? 'Can Liquidate' : 'Cannot Liquidate'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Health: {result.health?.toFixed(3)}× (need &lt; 1.1×)
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Collateral Value:</span>
                <span className="font-mono font-semibold">
                  {formatCurrency(result.collateralValue)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Debt to Repay:</span>
                <span className="font-mono font-semibold">
                  {formatCurrency(result.debtValue)}
                </span>
              </div>

              <div className="h-px bg-white/10" />

              <div className="flex justify-between text-sm">
                <span className="text-green-400">Liquidator Reward (3%):</span>
                <span className="font-mono font-semibold text-green-400">
                  +{formatCurrency(result.liquidatorReward)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Flash Loan Fee (0.09%):</span>
                <span className="font-mono font-semibold text-red-400">
                  -{formatCurrency(result.flashLoanFee)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Est. Gas Cost:</span>
                <span className="font-mono font-semibold text-red-400">
                  -{formatCurrency(result.gasCost)}
                </span>
              </div>

              <div className="h-px bg-white/10" />

              {/* Net Profit */}
              <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                <span className="font-semibold">Net Profit:</span>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                    {isProfitable ? '+' : ''}{formatCurrency(result.netProfit)}
                  </div>
                  <div className={`text-xs ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                    {isProfitable ? '+' : ''}{formatPercent(result.profitPercentage / 100)} ROI
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <Card className="border-primary/20 bg-background/50">
              <CardContent className="p-4 flex gap-3 text-xs">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">How it works:</strong> Flash liquidation uses a flash loan to borrow octUSD, 
                    repays the vault's debt, seizes collateral, sells it, repays the flash loan, and keeps the profit.
                  </p>
                  <div className="pt-2 space-y-1">
                    <div>• Liquidator reward: 3% of collateral value</div>
                    <div>• Protocol fee: 2% (paid from collateral)</div>
                    <div>• Flash loan fee: 0.09% of borrowed amount</div>
                    <div>• Execution time: ~15-30 seconds</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {result.canLiquidate && isProfitable && (
              <Button variant="electric" className="w-full gap-2" disabled>
                <Zap className="h-4 w-4" />
                Execute Liquidation (Coming Soon)
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
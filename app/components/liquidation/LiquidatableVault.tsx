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
import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';

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
  // Fix: Debt is 9 decimals (1e9), not 6
  const debtValue = Number(vault.debt) / 1e9;

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

  const client = useSuiClient();
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleLiquidate = async () => {
    if (!account) return;
    setIsLiquidating(true);

    try {
      // 1. Get user's octUSD coins
      const { getUserCoins } = await import('@/sdk/queries');
      const { COIN_TYPES, PACKAGE_ID, MODULE_NAMES, SHARED_OBJECTS } = await import('@/sdk/constants');

      const coins = await getUserCoins(client, account.address, COIN_TYPES.OCTUSD);

      if (coins.length === 0) {
        alert("No octUSD found in your wallet to perform liquidation");
        setIsLiquidating(false);
        return;
      }

      // 2. Calculate amount to repay 
      const { getTotalBalance, mergeAndSplitCoins } = await import('@/sdk/utils/coins');
      const totalBalance = getTotalBalance(coins);
      const debtAmount = vault.debt;

      // Calculate Max Repayable based on Collateral
      // Constraint: (repay * 1.05) / price <= collateral
      // Therefore: repay <= (collateral * price) / 1.05

      // We use BigInt for precision. Price is number, so convert to scaled BigInt (1e9)
      const priceScaled = BigInt(Math.floor(vault.currentPrice * 1_000_000_000));
      const SCALING = 1_000_000_000n;

      // Formula: (collateral * priceScaled * 10000) / (10500 * SCALING)
      // Factors: 10000 (bps basis), 10500 (105% coverage requirement)
      const maxRepayableByCollateral = (vault.collateral * priceScaled * 10000n) / (10500n * SCALING);

      // Deduct a tiny safety buffer (e.g. 1000 units) to avoid rounding issues
      const safeMaxRepayable = maxRepayableByCollateral > 1000n ? maxRepayableByCollateral - 1000n : 0n;

      // Repay amount is min(UserBalance, VaultDebt, SafeMaxRepayable)
      let repayAmount = debtAmount;
      let capReason = "";

      if (totalBalance < repayAmount) {
        repayAmount = totalBalance;
        capReason = "User Balance";
      }

      if (safeMaxRepayable < repayAmount) {
        repayAmount = safeMaxRepayable;
        capReason = "Collateral Limit";
      }

      console.log('Liquidation Calc:', {
        debt: debtAmount.toString(),
        collateral: vault.collateral.toString(),
        price: vault.currentPrice,
        maxRepayable: safeMaxRepayable.toString(),
        finalRepay: repayAmount.toString(),
        capReason
      });

      // buffer for safety? Contract burns exact coin value.
      // const repayAmount = totalBalance < debtAmount ? totalBalance : debtAmount;

      if (repayAmount === 0n) {
        alert("Amount to repay is zero");
        setIsLiquidating(false);
        return;
      }

      // 3. Build Transaction
      const { Transaction } = await import('@mysten/sui/transactions');
      const tx = new Transaction();

      // Merge and split exact amount
      const paymentCoin = mergeAndSplitCoins(tx, coins, repayAmount);

      const proofBytes = new TextEncoder().encode(''); // No proof needed for hackathon demo

      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAMES.LIQUIDATION}::liquidate`,
        typeArguments: [COIN_TYPES.OCTSUI],
        arguments: [
          tx.object(SHARED_OBJECTS.BANK_ID),
          tx.object(vault.id),
          tx.object(SHARED_OBJECTS.ORACLE_ID),
          paymentCoin,
          tx.pure.vector('u8', Array.from(proofBytes)),
        ],
      });

      // 4. Reset web state logic (no-op for now as we redirect or refetch)

      // 5. Execute
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Liquidation successful:", result);
            onLiquidate?.(vault.id); // Trigger UI update
            // Optional: Add toast notification here
          },
          onError: (error) => {
            console.error("Liquidation failed:", error);
            alert(`Liquidation failed: ${error.message}`);
          },
          onSettled: () => {
            setIsLiquidating(false);
          }
        },
      );
    } catch (error: any) {
      console.error("Error building transaction:", error);
      setIsLiquidating(false);
    }
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
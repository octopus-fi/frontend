'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  calculateRepayPreview,
  calculateLTV,
  calculateHealthFactor,
  calculateCollateralValue,
  parseAmount,
  formatAmount,
  getUserCoins,
  COIN_TYPES,
  buildWithdrawCollateralTransaction,
  useOctsuiPrice,
  getHealthStatus,
  PROTOCOL_PARAMS
} from '@/sdk/index';
import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { useUIStore } from '@/store/ui-store';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import {
  CheckCircle2,
  Info,
  TrendingDown,
  Wallet,
  ArrowUp,
  AlertCircle,
} from 'lucide-react';

interface RepayFormProps {
  vaultId: string;
  currentCollateral: bigint;
  currentDebt: bigint;
  octusdBalance: bigint;
}

export function RepayForm({
  vaultId,
  currentCollateral,
  currentDebt,
  octusdBalance
}: RepayFormProps) {
  const [repayAmount, setRepayAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [step, setStep] = useState<'input' | 'processing'>('input');

  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const client = useSuiClient();
  const account = useCurrentAccount();
  const { data: price } = useOctsuiPrice();
  const { addNotification } = useUIStore();
  const queryClient = useQueryClient();

  // 1. Calculate impact of Repay
  const repayVal = parseFloat(repayAmount) || 0;
  const repayPreview = price ? calculateRepayPreview(
    repayVal,
    price,
    currentCollateral,
    currentDebt
  ) : null;

  const maxRepay = Math.min(
    Number(octusdBalance) / 1e9,
    Number(currentDebt) / 1e9
  );

  // 2. Calculate Combined Preview (Repay + Withdraw)
  const withdrawVal = parseFloat(withdrawAmount) || 0;
  const scaling = 1e9; // SCALING_FACTOR from calculations is number? Assuming 1e9 for local math.

  // Derived state after Repay
  const debtAfterRepayRaw = repayPreview ?
    (currentDebt > parseAmount(repayVal) ? currentDebt - parseAmount(repayVal) : 0n)
    : currentDebt;

  // Derived state after Withdraw (applied to post-repay state)
  const withdrawRaw = BigInt(Math.floor(withdrawVal * scaling));
  const collateralAfterWithdrawRaw = currentCollateral > withdrawRaw ? currentCollateral - withdrawRaw : 0n;

  // Calculate final metrics
  const priceRaw = price ? BigInt(Math.floor(price * scaling)) : 0n;
  const finalCollateralValueRaw = calculateCollateralValue(collateralAfterWithdrawRaw, priceRaw);

  const finalLtv = calculateLTV(debtAfterRepayRaw, finalCollateralValueRaw);
  const finalHealth = calculateHealthFactor(finalCollateralValueRaw, debtAfterRepayRaw);
  const finalStatus = getHealthStatus(finalLtv);

  // Validation for Withdraw
  // Check if final LTV > 70% (Use checks from calculation utils ideally, but simplified here)
  const isWithdrawSafe = finalLtv <= 70 || debtAfterRepayRaw === 0n;

  const handleMaxRepay = () => {
    setRepayAmount(maxRepay.toString());
  };

  const handleMaxWithdraw = () => {
    if (repayPreview && repayPreview.newWithdrawableCollateral > 0) {
      // If we are withdrawing everything (repaying full debt), use full collateral
      if (debtAfterRepayRaw === 0n) {
        setWithdrawAmount(formatAmount(currentCollateral));
      } else {
        setWithdrawAmount(repayPreview.newWithdrawableCollateral.toString());
      }
    }
  };

  const handleSubmit = async () => {
    const hasRepay = repayVal > 0;
    const hasWithdraw = withdrawVal > 0;

    if (!account || (!hasRepay && !hasWithdraw)) return;
    if (hasWithdraw && !isWithdrawSafe) {
      addNotification({ type: 'error', title: 'Unsafe Withdraw', message: 'This withdrawal would exceed max LTV.' });
      return;
    }

    setStep('processing');

    try {
      // Step 1: Repay (if needed)
      if (hasRepay) {
        const coins = await getUserCoins(client, account.address, COIN_TYPES.OCTUSD);
        if (coins.length === 0) {
          throw new Error('No octUSD tokens found to repay debt');
        }

        const { Transaction } = await import('@mysten/sui/transactions');
        const { PACKAGE_ID, SHARED_OBJECTS, MODULE_NAMES } = await import('@/sdk/constants');
        const repayTx = new Transaction();

        let primaryCoin = repayTx.object(coins[0].id);
        if (coins.length > 1) {
          const coinsToMerge = coins.slice(1).map(c => repayTx.object(c.id));
          repayTx.mergeCoins(primaryCoin, coinsToMerge);
        }

        const [coinToRepay] = repayTx.splitCoins(primaryCoin, [repayTx.pure.u64(parseAmount(repayAmount))]);

        repayTx.moveCall({
          target: `${PACKAGE_ID}::${MODULE_NAMES.VAULT_MANAGER}::repay`,
          typeArguments: [COIN_TYPES.OCTSUI],
          arguments: [
            repayTx.object(SHARED_OBJECTS.BANK_ID),
            repayTx.object(vaultId),
            coinToRepay,
          ],
        });

        await new Promise((resolve, reject) => {
          signAndExecute(
            { transaction: repayTx },
            {
              onSuccess: (result) => {
                addNotification({
                  type: 'success',
                  title: 'Repayment Successful',
                  message: `Repaid ${repayAmount} octUSD`,
                });
                resolve(result);
              },
              onError: (error) => reject(error),
            }
          );
        });
      }

      // Step 2: Withdraw (if needed)
      if (hasWithdraw) {
        const withdrawTx = buildWithdrawCollateralTransaction({
          vaultId,
          amount: parseAmount(withdrawAmount),
        });

        await new Promise((resolve, reject) => {
          signAndExecute(
            { transaction: withdrawTx },
            {
              onSuccess: (result) => {
                addNotification({
                  type: 'success',
                  title: 'Withdrawal Successful',
                  message: `Withdrew ${withdrawAmount} octSUI`,
                });
                resolve(result);
              },
              onError: (error) => reject(error),
            }
          );
        });
      }

      // Cleanup
      setRepayAmount('');
      setWithdrawAmount('');
      setStep('input');
      queryClient.invalidateQueries({ queryKey: ['vaultState'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });

    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Transaction Error',
        message: error.message,
      });
      setStep('input');
    }
  };

  const hasRepay = repayVal > 0;
  const hasWithdraw = withdrawVal > 0;

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-blue-500" />
            Repay & Withdraw
          </CardTitle>
          <Badge variant="outline">
            Debt: {formatAmount(currentDebt)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Repay Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Repay octUSD</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Balance: {formatAmount(octusdBalance)}
              </span>
            </div>
          </div>
          <div className="relative">
            <Input
              type="number"
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              placeholder="0.00"
              className="pr-20"
              disabled={step === 'processing'}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={handleMaxRepay}
              disabled={step === 'processing' || maxRepay === 0}
            >
              MAX
            </Button>
          </div>
        </div>

        {/* Arrow (Dynamic) */}
        <div className="flex justify-center">
          {hasRepay ? (
            <ArrowUp className="h-4 w-4 text-green-500 opacity-50" />
          ) : (
            <div className="h-4 w-4" /> // Spacer
          )}
        </div>

        {/* Withdraw Collateral (Always Visible) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Withdraw octSUI (Optional)</label>
            <span className="text-xs text-muted-foreground">
              Max: {repayPreview?.newWithdrawableCollateral.toFixed(2) || '0.00'}
            </span>
          </div>
          <div className="relative">
            <Input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              className="pr-20"
              disabled={step === 'processing'}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={handleMaxWithdraw}
              disabled={step === 'processing'}
            >
              MAX
            </Button>
          </div>
        </div>

        {/* Combined Preview */}
        {(hasRepay || hasWithdraw) && (
          <div className="p-4 rounded-lg bg-muted space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Final Debt</span>
              <span className="font-semibold">{formatCurrency(Number(debtAfterRepayRaw) / 1e9)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">New LTV</span>
              <span className={`font-semibold ${finalLtv < 50 ? 'text-green-500' :
                finalLtv < 65 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                {finalLtv.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">New Health Factor</span>
              <span className="font-semibold" style={{ color: finalStatus.color }}>
                {finalHealth === Infinity ? '∞' : finalHealth.toFixed(2)}×
              </span>
            </div>

            {!isWithdrawSafe && (
              <div className="flex items-center gap-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-500">Withdrawal too high! Keep LTV below 70%.</span>
              </div>
            )}

            {debtAfterRepayRaw === 0n && (
              <div className="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Debt fully paid
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button
          variant="electric"
          size="lg"
          className="w-full gap-2"
          onClick={handleSubmit}
          disabled={(!hasRepay && !hasWithdraw) || step === 'processing' || !account || (hasWithdraw && !isWithdrawSafe)}
        >
          {step === 'processing' ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : !account ? (
            'Connect Wallet'
          ) : !hasRepay && !hasWithdraw ? (
            'Enter Amount'
          ) : (
            <>
              <Wallet className="h-5 w-5" />
              {hasRepay && hasWithdraw ? 'Repay & Withdraw' : hasRepay ? 'Repay Debt' : 'Withdraw Collateral'}
            </>
          )}
        </Button>

        {/* Info */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-500 space-y-1">
              <p>• Repaying debt improves your health factor</p>
              <p>• You can withdraw independent of repayment (within LTV limits)</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
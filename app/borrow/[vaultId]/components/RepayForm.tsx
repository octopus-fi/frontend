'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  calculateRepayPreview,
  parseAmount,
  formatAmount,
  getUserCoins,
  COIN_TYPES,
  buildRepayWithAmountTransaction,
  buildWithdrawCollateralTransaction,
  useOctsuiPrice,
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

  // Calculate preview
  const preview = price ? calculateRepayPreview(
    parseFloat(repayAmount) || 0,
    price,
    currentCollateral,
    currentDebt
  ) : null;

  const maxRepay = Math.min(
    Number(octusdBalance) / 1e9,
    Number(currentDebt) / 1e9
  );

  const handleMaxRepay = () => {
    setRepayAmount(maxRepay.toString());
  };

  const handleMaxWithdraw = () => {
    if (preview && preview.newWithdrawableCollateral > 0) {
      setWithdrawAmount(preview.newWithdrawableCollateral.toString());
    }
  };

  const handleRepay = async () => {
    if (!account || !repayAmount || parseFloat(repayAmount) <= 0) return;

    setStep('processing');

    try {
      const coins = await getUserCoins(client, account.address, COIN_TYPES.OCTUSD);
      if (coins.length === 0) {
        addNotification({
          type: 'error',
          title: 'No octUSD found',
          message: 'You need octUSD tokens to repay debt',
        });
        setStep('input');
        return;
      }

      const repayTx = buildRepayWithAmountTransaction({
        vaultId,
        octusdCoinId: coins[0].id,
        amount: parseAmount(repayAmount),
      });

      await new Promise((resolve, reject) => {
        signAndExecute(
          { transaction: repayTx },
          {
            onSuccess: (result) => {
              addNotification({
                type: 'success',
                title: 'Repayment Successful!',
                message: `Repaid ${repayAmount} octUSD`,
              });
              resolve(result);
            },
            onError: (error) => {
              addNotification({
                type: 'error',
                title: 'Repayment Failed',
                message: error.message,
              });
              reject(error);
            },
          }
        );
      });

      // Step 2: Withdraw collateral if specified
      if (withdrawAmount && parseFloat(withdrawAmount) > 0) {
        const withdrawTx = buildWithdrawCollateralTransaction({
          vaultId,
          amount: parseAmount(withdrawAmount),
        });

        signAndExecute(
          { transaction: withdrawTx },
          {
            onSuccess: () => {
              addNotification({
                type: 'success',
                title: 'Withdrawal Successful!',
                message: `Withdrew ${withdrawAmount} octSUI`,
              });
              setRepayAmount('');
              setWithdrawAmount('');
              setStep('input');
              queryClient.invalidateQueries({ queryKey: ['vaultState'] });
              queryClient.invalidateQueries({ queryKey: ['balance'] });
            },
            onError: (error) => {
              addNotification({
                type: 'error',
                title: 'Withdrawal Failed',
                message: error.message,
              });
              setStep('input');
            },
          }
        );
      } else {
        // Only repaid, no withdrawal
        setRepayAmount('');
        setStep('input');
        queryClient.invalidateQueries({ queryKey: ['vaultState'] });
        queryClient.invalidateQueries({ queryKey: ['balance'] });
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Transaction Error',
        message: error.message,
      });
      setStep('input');
    }
  };

  const hasRepay = repayAmount && parseFloat(repayAmount) > 0;
  const hasWithdraw = withdrawAmount && parseFloat(withdrawAmount) > 0;
  const canWithdraw = preview && preview.newWithdrawableCollateral > 0;

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
            <span className="text-xs text-muted-foreground">
              Balance: {formatAmount(octusdBalance)}
            </span>
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
          <p className="text-xs text-muted-foreground">
            Current Debt: {formatAmount(currentDebt)} octUSD (~{formatCurrency(Number(currentDebt) / 1e9)})
          </p>
        </div>

        {/* Arrow */}
        {hasRepay && canWithdraw && (
          <div className="flex justify-center">
            <div className="p-2 rounded-full bg-green-500/10 border border-green-500/20">
              <ArrowUp className="h-4 w-4 text-green-500" />
            </div>
          </div>
        )}

        {/* Withdraw Collateral */}
        {hasRepay && canWithdraw && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Withdraw octSUI (Optional)</label>
              <span className="text-xs text-muted-foreground">
                Withdrawable: {preview?.newWithdrawableCollateral.toFixed(2) || '0.00'}
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
        )}

        {/* Preview */}
        {hasRepay && preview && (
          <div className="p-4 rounded-lg bg-muted space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Remaining Debt</span>
              <span className="font-semibold">
                {formatCurrency(preview.remainingDebtUsd)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">New LTV</span>
              <span className={`font-semibold ${
                preview.newLtvPercent < 50 ? 'text-green-500' :
                preview.newLtvPercent < 65 ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {preview.newLtvPercent.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">New Health Factor</span>
              <span className="font-semibold text-green-500">
                {preview.newHealthFactor === Infinity ? '∞' : preview.newHealthFactor.toFixed(2)}×
              </span>
            </div>

            {canWithdraw && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Withdrawable Collateral</span>
                <span className="font-semibold text-green-500">
                  {preview.newWithdrawableCollateral.toFixed(2)} octSUI
                </span>
              </div>
            )}

            {preview.remainingDebtUsd === 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <p className="text-sm text-green-500 font-medium">
                  This will fully repay your debt! You can withdraw all collateral.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button
          variant="electric"
          size="lg"
          className="w-full gap-2"
          onClick={handleRepay}
          disabled={!hasRepay || step === 'processing' || !account}
        >
          {step === 'processing' ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : !account ? (
            'Connect Wallet'
          ) : !hasRepay ? (
            'Enter Amount'
          ) : (
            <>
              <Wallet className="h-5 w-5" />
              {hasWithdraw ? 'Repay & Withdraw' : 'Repay Debt'}
            </>
          )}
        </Button>

        {/* Info */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-500 space-y-1">
              <p>• Repaying debt improves your health factor</p>
              <p>• You can withdraw collateral after reducing LTV</p>
              <p>• Full repayment allows withdrawing all collateral</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
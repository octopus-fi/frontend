'use client';

import { useState } from 'react';
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  useBorrowPreview,
  parseAmount,
  formatAmount,
  getUserCoins,
  COIN_TYPES,
  buildDepositCollateralWithAmountTransaction,
  buildBorrowTransaction,
} from '@/sdk/index';
import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { useUIStore } from '@/store/ui-store';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import {
  TrendingUp,
  AlertCircle,
  Info,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';

interface BorrowFormProps {
  vaultId: string;
  currentCollateral: bigint;
  currentDebt: bigint;
  maxBorrow: number;
  availableBorrow: number;
  octsuiBalance: bigint;
}

export function BorrowForm({
  vaultId,
  currentCollateral,
  currentDebt,
  maxBorrow,
  availableBorrow,
  octsuiBalance,
}: BorrowFormProps) {
  const [depositAmount, setDepositAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [step, setStep] = useState<'input' | 'confirm' | 'processing'>('input');

  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const client = useSuiClient();
  const account = useCurrentAccount();
  const { addNotification } = useUIStore();
  const queryClient = useQueryClient();

  // Real-time preview
  const preview = useBorrowPreview(
    parseFloat(depositAmount) || 0,
    parseFloat(borrowAmount) || 0
  );

  const handleMaxDeposit = () => {
    const maxAmount = Number(octsuiBalance) / 1e9;
    setDepositAmount(maxAmount.toString());
  };

  const handleMaxBorrow = () => {
    if (preview) {
      setBorrowAmount(preview.availableToBorrowUsd.toString());
    }
  };

  const handleBorrow = async () => {
    if (!account || !preview?.canBorrow) return;

    setStep('processing');

    try {
      // Step 1: Deposit collateral if needed
      if (depositAmount && parseFloat(depositAmount) > 0) {
        const coins = await getUserCoins(client, account.address, COIN_TYPES.OCTSUI);
        if (coins.length === 0) {
          addNotification({
            type: 'error',
            title: 'No octSUI found',
            message: 'You need octSUI to deposit as collateral',
          });
          setStep('input');
          return;
        }

        // Build transaction with coin merging
        const { Transaction } = await import('@mysten/sui/transactions');
        const { PACKAGE_ID, MODULE_NAMES } = await import('@/sdk/constants');
        const depositTx = new Transaction();

        // Merge all octSUI coins if there are multiple
        let primaryCoin = depositTx.object(coins[0].id);
        if (coins.length > 1) {
          const coinsToMerge = coins.slice(1).map(c => depositTx.object(c.id));
          depositTx.mergeCoins(primaryCoin, coinsToMerge);
        }

        // Split the exact amount to deposit
        const [coinToDeposit] = depositTx.splitCoins(primaryCoin, [depositTx.pure.u64(parseAmount(depositAmount))]);

        // Call deposit_collateral
        depositTx.moveCall({
          target: `${PACKAGE_ID}::${MODULE_NAMES.VAULT_MANAGER}::deposit_collateral`,
          typeArguments: [COIN_TYPES.OCTSUI],
          arguments: [
            depositTx.object(vaultId),
            coinToDeposit,
          ],
        });

        await new Promise((resolve, reject) => {
          signAndExecute(
            { transaction: depositTx },
            {
              onSuccess: (result) => {
                addNotification({
                  type: 'success',
                  title: 'Collateral Deposited!',
                  message: `Deposited ${depositAmount} octSUI`,
                });
                resolve(result);
              },
              onError: (error) => {
                addNotification({
                  type: 'error',
                  title: 'Deposit Failed',
                  message: error.message,
                });
                reject(error);
              }
            }
          );
        });
      }

      // Step 2: Borrow octUSD
      if (borrowAmount && parseFloat(borrowAmount) > 0) {
        const borrowTx = buildBorrowTransaction({
          vaultId,
          amount: parseAmount(borrowAmount),
        });

        signAndExecute(
          { transaction: borrowTx },
          {
            onSuccess: () => {
              addNotification({
                type: 'success',
                title: 'Borrow Successful!',
                message: `Borrowed ${borrowAmount} octUSD`,
              });
              setDepositAmount('');
              setBorrowAmount('');
              setStep('input');
              queryClient.invalidateQueries({ queryKey: ['vaultState'] });
              queryClient.invalidateQueries({ queryKey: ['balance'] });
            },
            onError: (error) => {
              addNotification({
                type: 'error',
                title: 'Borrow Failed',
                message: error.message,
              });
              setStep('input');
            },
          }
        );
      } else {
        // Only deposited collateral, no borrow
        setDepositAmount('');
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

  const maxDepositAmount = Number(octsuiBalance) / 1e9;
  const hasDeposit = depositAmount && parseFloat(depositAmount) > 0;
  const hasBorrow = borrowAmount && parseFloat(borrowAmount) > 0;

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Deposit & Borrow
          </CardTitle>
          <Badge variant="outline">0% Interest</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Deposit Collateral */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Deposit octSUI (Optional)</label>
            <span className="text-xs text-muted-foreground">
              Balance: {formatAmount(octsuiBalance)}
            </span>
          </div>
          <div className="relative">
            <Input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.00"
              className="pr-20"
              disabled={step === 'processing'}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={handleMaxDeposit}
              disabled={step === 'processing'}
            >
              MAX
            </Button>
          </div>
        </div>

        {/* Arrow */}
        {hasDeposit && (
          <div className="flex justify-center">
            <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
              <ArrowDown className="h-4 w-4 text-primary" />
            </div>
          </div>
        )}

        {/* Borrow Amount */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Borrow octUSD</label>
              <span className="text-xs text-muted-foreground">
                Available: {formatCurrency(Math.max(0, (preview?.maxBorrowUsd || maxBorrow) - (Number(currentDebt) / 1e9)))}
              </span>
            </div>
            <div className="relative">
              <Input
                type="number"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                placeholder="0.00"
                className="pr-20"
                disabled={step === 'processing'}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={handleMaxBorrow}
                disabled={step === 'processing'}
              >
                MAX
              </Button>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>Safe</span>
              <span>Risky</span>
            </div>
            <Slider
              defaultValue={[0]}
              value={[parseFloat(borrowAmount) || 0]}
              min={0}
              max={Math.max(0.01, (preview?.maxBorrowUsd || maxBorrow) - (Number(currentDebt) / 1e9))}
              step={0.01}
              onValueChange={(values) => setBorrowAmount(values[0].toString())}
              className="cursor-pointer"
            />
            <div className="relative w-full h-1.5 rounded-full overflow-hidden bg-muted/30">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-20" />
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, ((parseFloat(borrowAmount) || 0) / Math.max(0.01, (preview?.maxBorrowUsd || maxBorrow) - (Number(currentDebt) / 1e9))) * 100)}%`
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        {(hasDeposit || hasBorrow) && preview && (
          <div className="p-4 rounded-lg bg-muted space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">New LTV</span>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${preview.ltvPercent > 70 ? 'text-red-500' :
                  preview.ltvPercent > 60 ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                  {preview.ltvPercent.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">/ 70%</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Health Factor</span>
              <span className="font-semibold">
                {preview.healthFactor === Infinity ? '∞' : preview.healthFactor.toFixed(2)}×
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={
                preview.healthStatus === 'safe' ? 'success' :
                  preview.healthStatus === 'warning' ? 'warning' : 'danger'
              }>
                {preview.healthStatus}
              </Badge>
            </div>

            {preview.errorMessage && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-500">{preview.errorMessage}</p>
              </div>
            )}

            {preview.canBorrow && preview.healthStatus !== 'safe' && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-500">
                  This will increase your risk. Consider adding more collateral.
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
          onClick={handleBorrow}
          disabled={!preview?.canBorrow || step === 'processing' || !account || (!hasDeposit && !hasBorrow)}
        >
          {step === 'processing' ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : !account ? (
            'Connect Wallet'
          ) : !hasDeposit && !hasBorrow ? (
            'Enter Amount'
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              {hasDeposit && hasBorrow ? 'Deposit & Borrow' : hasDeposit ? 'Deposit Collateral' : 'Borrow octUSD'}
            </>
          )}
        </Button>

        {/* Info */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-500 space-y-1">
              <p>• Your octSUI collateral continues earning staking rewards</p>
              <p>• Borrow up to 70% LTV at 0% interest</p>
              <p>• Keep LTV below 80% to avoid liquidation</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Waves,
  ArrowRight,
  Info,
  TrendingUp,
  Lock,
  Unlock,
  Zap,
} from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  useBalances,
  usePoolStats,
  useOctsuiPrice,
  formatAmount,
  parseAmount,
  COIN_TYPES,
  getUserCoins,
} from "@/sdk/index";
import {
  useSignAndExecuteTransaction,
  useSuiClient,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import {
  buildStakeWithAmountTransaction,
  buildUnstakeWithAmountTransaction,
} from "@/sdk/index";
import { useUIStore } from "@/store/ui-store";
import { useQueryClient } from "@tanstack/react-query";

export default function StakePage() {
  const [mode, setMode] = useState<"stake" | "unstake">("stake");
  const [amount, setAmount] = useState("");

  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const client = useSuiClient();
  const account = useCurrentAccount();
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  const {
    mocksui: mocksuiBalance,
    octsui: octsuiBalance,
    isLoading: balancesLoading,
  } = useBalances();
  const { data: poolStats, isLoading: poolLoading } = usePoolStats();
  const { data: octsuiPrice } = useOctsuiPrice();

  const exchangeRate = 0.9842; // Can be calculated from pool stats if needed
  const estimatedAPY = poolStats ? (poolStats.rewardRateBps * 365) / 100 : 7.2;

  const handleStake = async () => {
    if (!amount || !account) return;

    try {
      // Get user's MOCKSUI coins
      const coins = await getUserCoins(
        client,
        account.address,
        COIN_TYPES.MOCKSUI,
      );
      if (coins.length === 0) {
        addNotification({
          type: "error",
          title: "No MOCKSUI found",
          message: "You need MOCKSUI tokens to stake",
        });
        return;
      }

      const amountRaw = parseAmount(amount);
      const tx = buildStakeWithAmountTransaction({
        coinObjectId: coins[0].id,
        amount: amountRaw,
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            addNotification({
              type: "success",
              title: "Staking Successful!",
              message: `Staked ${amount} MOCKSUI`,
            });
            setAmount("");
            queryClient.invalidateQueries({ queryKey: ["balance"] });
            queryClient.invalidateQueries({ queryKey: ["stakePositions"] });
          },
          onError: (error) => {
            addNotification({
              type: "error",
              title: "Staking Failed",
              message: error.message,
            });
          },
        },
      );
    } catch (error: any) {
      addNotification({
        type: "error",
        title: "Transaction Error",
        message: error.message,
      });
    }
  };

  const handleUnstake = async () => {
    if (!amount || !account) return;

    try {
      // Get user's octSUI coins
      const coins = await getUserCoins(
        client,
        account.address,
        COIN_TYPES.OCTSUI,
      );
      if (coins.length === 0) {
        addNotification({
          type: "error",
          title: "No octSUI found",
          message: "You need octSUI tokens to unstake",
        });
        return;
      }

      const amountRaw = parseAmount(amount);
      const tx = buildUnstakeWithAmountTransaction({
        octsuiCoinId: coins[0].id,
        amount: amountRaw,
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            addNotification({
              type: "success",
              title: "Unstaking Successful!",
              message: `Unstaked ${amount} octSUI`,
            });
            setAmount("");
            queryClient.invalidateQueries({ queryKey: ["balance"] });
          },
          onError: (error) => {
            addNotification({
              type: "error",
              title: "Unstaking Failed",
              message: error.message,
            });
          },
        },
      );
    } catch (error: any) {
      addNotification({
        type: "error",
        title: "Transaction Error",
        message: error.message,
      });
    }
  };

  const calculateOutput = () => {
    if (!amount) return 0;
    const input = parseFloat(amount);
    if (isNaN(input)) return 0;
    if (mode === "stake") {
      return input * exchangeRate;
    } else {
      return input / exchangeRate;
    }
  };

  const maxAmount =
    mode === "stake"
      ? Number(mocksuiBalance) / 1e9
      : Number(octsuiBalance) / 1e9;

  if (balancesLoading || poolLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading staking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-2"
        >
          Liquid Staking
        </motion.h1>
        <p className="text-muted-foreground text-lg">
          Stake SUI and receive octSUI - keep earning while you use your assets
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Total Staked
                </span>
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold">
                {poolStats ? formatAmount(poolStats.totalStaked) : "0.00"} SUI
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Current APY
                </span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-500">
                {formatPercent(estimatedAPY / 100)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Exchange Rate
                </span>
                <Zap className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold">
                {exchangeRate.toFixed(4)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Your octSUI
                </span>
                <Unlock className="h-4 w-4 text-cyan-500" />
              </div>
              <div className="text-2xl font-bold">
                {formatAmount(octsuiBalance)}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Staking Card */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass border-primary/20">
              <CardHeader>
                <CardTitle>Stake / Unstake</CardTitle>
                <CardDescription>
                  Convert between SUI and octSUI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mode Toggle */}
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setMode("stake")}
                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
                      mode === "stake"
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Lock className="h-4 w-4 inline mr-2" />
                    Stake
                  </button>
                  <button
                    onClick={() => setMode("unstake")}
                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
                      mode === "unstake"
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Unlock className="h-4 w-4 inline mr-2" />
                    Unstake
                  </button>
                </div>

                {/* Input Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        {mode === "stake" ? "Stake Amount" : "Unstake Amount"}
                      </label>
                      <span className="text-sm text-muted-foreground">
                        Balance:{" "}
                        {formatAmount(
                          mode === "stake" ? mocksuiBalance : octsuiBalance,
                        )}
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="text-2xl h-16 pr-20"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setAmount(maxAmount.toString())}
                      >
                        MAX
                      </Button>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
                      <ArrowRight className="h-5 w-5 text-primary rotate-90" />
                    </div>
                  </div>

                  {/* Output Preview */}
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">
                        You will receive
                      </span>
                      <Badge variant="outline">
                        {mode === "stake" ? "octSUI" : "MOCKSUI"}
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold">
                      {calculateOutput().toFixed(4)}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  variant="electric"
                  size="lg"
                  className="w-full gap-2"
                  onClick={mode === "stake" ? handleStake : handleUnstake}
                  disabled={!amount || isPending || !account}
                  loading={isPending}
                >
                  {isPending ? (
                    <>Processing...</>
                  ) : (
                    <>
                      {mode === "stake" ? (
                        <Lock className="h-5 w-5" />
                      ) : (
                        <Unlock className="h-5 w-5" />
                      )}
                      {mode === "stake" ? "Stake MOCKSUI" : "Unstake octSUI"}
                    </>
                  )}
                </Button>

                {!account && (
                  <p className="text-sm text-center text-amber-500">
                    Please connect your wallet to continue
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  How it Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="shrink-0 h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    Stake SUI
                  </h4>
                  <p className="text-sm text-muted-foreground ml-8">
                    Deposit your SUI tokens into the staking pool
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="shrink-0 h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    Receive octSUI
                  </h4>
                  <p className="text-sm text-muted-foreground ml-8">
                    Get liquid octSUI tokens representing your stake
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="shrink-0 h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    Earn Rewards
                  </h4>
                  <p className="text-sm text-muted-foreground ml-8">
                    Automatically earn ~{estimatedAPY.toFixed(1)}% APY on your
                    stake
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="shrink-0 h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    Use as Collateral
                  </h4>
                  <p className="text-sm text-muted-foreground ml-8">
                    Deposit octSUI as collateral to borrow octUSD
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="glass border-amber-500/20 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="text-amber-500 flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>• octSUI can be used as collateral in vaults</p>
                <p>• Staking rewards accrue automatically</p>
                <p>• Exchange rate increases over time as rewards accumulate</p>
                <p>• Unstaking returns your original SUI + rewards</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

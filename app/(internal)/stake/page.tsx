"use client";

import { useState, useEffect, useMemo } from "react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Waves,
  ArrowRight,
  Info,
  TrendingUp,
  Lock,
  Unlock,
  Zap,
  Gift,
  Bot,
} from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  useBalances,
  usePoolStats,
  useOctsuiPrice,
  useStakePosition,
  formatAmount,
  parseAmount,
  COIN_TYPES,
  getUserCoins,
  calculateEstimatedAPR,
  buildClaimRewardsTransaction,
  calculations,
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
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function StakePage() {
  const [mode, setMode] = useState<"stake" | "unstake">("stake");
  const [amount, setAmount] = useState("");
  const [isClaimPending, setIsClaimPending] = useState(false);

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
  const { positionId, position, isLoading: positionLoading, refetch: refetchPosition } = useStakePosition();

  /* 
   * Exchange Rate is fixed 1:1 in the contract (stake/unstake).
   * Rewards are minted as new octSUI, so 1 octSUI = 1 SUI share always.
   */
  const exchangeRate = 1;

  const estimatedAPR = poolStats
    ? calculateEstimatedAPR(poolStats.rewardRateBps, undefined, poolStats.totalStaked)
    : 0;

  // Check if claim is disabled due to AI auto-rebalance
  const isAutoRebalanceEnabled = position?.autoRebalanceEnabled ?? false;

  // Real-time reward simulation
  const [simulationRewards, setSimulationRewards] = useState(0n);
  // Track locally when we claimed to prevent "ghost rewards" from old on-chain data
  const [localLastClaimTime, setLocalLastClaimTime] = useState(0);

  useEffect(() => {
    if (!position || !poolStats) {
      setSimulationRewards(0n);
      return;
    }

    // If we just claimed and on-chain data is stale (older than our claim), show 0
    if (position.lastClaimTimeMs && position.lastClaimTimeMs < localLastClaimTime) {
      setSimulationRewards(0n);
      return;
    }

    // Initial set if we're not in a "just claimed" state
    if (simulationRewards === 0n && position.pendingRewards > 0n) {
      setSimulationRewards(position.pendingRewards);
    }

    const intervalId = setInterval(() => {
      // Safety check again inside interval
      if (position.lastClaimTimeMs && position.lastClaimTimeMs < localLastClaimTime) {
        return;
      }

      if (!position.shares || position.shares === 0n) return;

      const currentRewards = calculations.calculatePendingRewardsFromTime(
        position.shares,
        position.lastClaimTimeMs || Date.now(),
        Date.now(),
        poolStats.rewardRateBps,
        poolStats.rewardIntervalMs
      );

      // Only update if we have more rewards than the stored pending state
      if (currentRewards > position.pendingRewards) {
        setSimulationRewards(currentRewards);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [position, poolStats, localLastClaimTime]);

  // Use simulated rewards for display, fallback to static if loading
  const pendingRewards = simulationRewards > 0n ? simulationRewards : (position?.pendingRewards ?? 0n);

  const handleClaimRewards = async () => {
    if (!positionId || !account) return;

    setIsClaimPending(true);
    console.log("Starting claim rewards...");

    try {
      const tx = buildClaimRewardsTransaction({ stakePositionId: positionId });
      console.log("Transaction built:", tx);

      signAndExecute(
        {
          transaction: tx,
          chain: 'sui:testnet',
        },
        {
          onSuccess: (result) => {
            console.log("Claim transaction successful:", result);

            // Explicitly verify effects if available
            // @ts-ignore
            if (result.effects?.status?.status === 'failure') {
              // @ts-ignore
              console.error("Transaction failed on-chain:", result.effects.status.error);
              addNotification({
                type: "error",
                title: "Transaction Failed",
                // @ts-ignore
                message: result.effects.status.error || "Unknown on-chain error",
              });
              return;
            }

            // Optimistic update
            setSimulationRewards(0n);
            setLocalLastClaimTime(Date.now()); // Mark that we just claimed

            addNotification({
              type: "success",
              title: "Rewards Claimed!",
              message: `Successfully claimed ${formatAmount(pendingRewards)} octSUI`,
            });
            refetchPosition();
            queryClient.invalidateQueries({ queryKey: ["balance"] });
            queryClient.invalidateQueries({ queryKey: ["stakePosition"] });
          },
          onError: (error) => {
            console.error("Claim transaction error:", error);
            addNotification({
              type: "error",
              title: "Claim Failed",
              message: error.message || "Transaction rejected or failed",
            });
          },
          onSettled: () => {
            // small delay to ensure UI updates don't flicker
            setTimeout(() => setIsClaimPending(false), 500);
          },
        },
      );
    } catch (error: any) {
      console.error("Claim build error:", error);
      addNotification({
        type: "error",
        title: "Transaction Error",
        message: error.message,
      });
      setIsClaimPending(false);
    }
  };

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

      // Build transaction with coin merging for multiple coin objects
      const { Transaction } = await import('@mysten/sui/transactions');
      const { PACKAGE_ID, SHARED_OBJECTS, MODULE_NAMES } = await import('@/sdk/constants');
      const tx = new Transaction();

      // Merge all MOCKSUI coins if there are multiple
      let primaryCoin = tx.object(coins[0].id);
      if (coins.length > 1) {
        const coinsToMerge = coins.slice(1).map(c => tx.object(c.id));
        tx.mergeCoins(primaryCoin, coinsToMerge);
      }

      // Split the exact amount to stake
      const [coinToStake] = tx.splitCoins(primaryCoin, [tx.pure.u64(amountRaw)]);

      // Call stake with Clock parameter
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAMES.LIQUID_STAKING}::stake`,
        typeArguments: [COIN_TYPES.MOCKSUI],
        arguments: [
          tx.object(SHARED_OBJECTS.STAKING_POOL_ID),
          coinToStake,
          tx.object('0x6'), // Clock object
        ],
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
      const { getTotalBalance, mergeAndSplitCoins } = await import('@/sdk/index');

      // Check balance first
      const totalBalance = getTotalBalance(coins);

      if (totalBalance < amountRaw) {
        addNotification({
          type: "error",
          title: "Insufficient Balance",
          message: `You have ${formatAmount(totalBalance)} octSUI, but tried to unstake ${formatAmount(amountRaw)}`,
        });
        return;
      }

      console.log('UNSTAKE DEBUG:', {
        amountRaw: amountRaw.toString(),
        totalBalance: totalBalance.toString(),
        poolLimit: poolStats ? poolStats.totalStaked.toString() : 'undefined',
        shareLimit: position ? position.shares.toString() : 'undefined',
        positionId: positionId
      });

      let finalAmount = amountRaw;
      let isCapped = false;
      let capReason = "";

      // Check Pool Liquidity: Auto-cap if requested amount exceeds pool liquidity
      if (poolStats && poolStats.totalStaked < amountRaw) {
        console.warn(`Unstake amount ${amountRaw} exceeds pool liquidity ${poolStats.totalStaked}. Auto-capping.`);
        finalAmount = poolStats.totalStaked;
        isCapped = true;
        capReason = "Pool Liquidity";
      }

      // Build transaction
      const { Transaction } = await import('@mysten/sui/transactions');
      const { SHARED_OBJECTS, MODULE_NAMES } = await import('@/sdk/constants');
      const { mergeCoinsInTransaction } = await import('@/sdk/utils/coins');
      const tx = new Transaction();

      let coinToUnstake;

      // OPTIMIZATION: If unstaking entire balance (and it's within liquidity), skip split
      if (totalBalance <= finalAmount) {
        coinToUnstake = mergeCoinsInTransaction(tx, coins);
      } else {
        // Otherwise split the specific (potentially capped) amount
        coinToUnstake = mergeAndSplitCoins(tx, coins, finalAmount);
      }

      if (!positionId) {
        addNotification({
          type: "error",
          title: "No stake position found",
          message: "You must have a stake position to unstake.",
        });
        return;
      }

      // Call unstake
      tx.moveCall({
        target: `${COIN_TYPES.OCTSUI.split('::')[0]}::liquid_staking::unstake`,
        typeArguments: [COIN_TYPES.MOCKSUI],
        arguments: [
          tx.object(SHARED_OBJECTS.STAKING_POOL_ID),
          tx.object(positionId),
          coinToUnstake,
          tx.object('0x6'), // Clock
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            const message = isCapped
              ? `Unstaked ${formatAmount(finalAmount)} octSUI (${capReason} reached)`
              : `Unstaked ${formatAmount(finalAmount)} octSUI`;

            addNotification({
              type: isCapped ? "warning" : "success",
              title: isCapped ? "Partial Unstake Successful" : "Unstaking Successful!",
              message,
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
      // Unstake mode
      let output = input / exchangeRate;

      // Auto-cap simulation for UI
      if (poolStats) {
        try {
          const amountRaw = parseAmount(amount);
          let limit = poolStats.totalStaked;
          if (position && position.shares < limit) {
            limit = position.shares;
          }

          if (amountRaw > limit) {
            return Number(limit) / 1e9;
          }
        } catch (e) {
          // invalid input, ignore
        }
      }

      return output;
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
    <div className="container mx-auto p-6">
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
            Stake SUI and receive octSUI - keep earning while you use your
            assets
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass glow-primary border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Total Staked
                  </span>
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold">
                  {poolStats
                    ? formatAmount(poolStats.totalStaked)
                    : "0.00"}{" "}
                  SUI
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass glow-primary border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Current APY
                  </span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-500">
                  {formatPercent(estimatedAPR / 100)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass glow-primary border-primary/20">
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
            <Card className="glass glow-primary border-primary/20">
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
              <Card className="glass glow-primary border-primary/20">
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
                      className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${mode === "stake"
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      <Lock className="h-4 w-4 inline mr-2" />
                      Stake
                    </button>
                    <button
                      onClick={() => setMode("unstake")}
                      className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${mode === "unstake"
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
                          {mode === "stake"
                            ? "Stake Amount"
                            : "Unstake Amount"}
                        </label>
                        {(() => {
                          if (mode === 'unstake' && poolStats) {
                            const poolLimit = Number(poolStats.totalStaked) / 1e9;
                            const shareLimit = position ? Number(position.shares) / 1e9 : Infinity;
                            const effectiveLimit = Math.min(poolLimit, shareLimit);
                            const currentBalance = Number(octsuiBalance) / 1e9;

                            if (currentBalance > effectiveLimit) {
                              return (
                                <div className="flex flex-col items-end text-xs">
                                  <span className="text-amber-500 font-bold">Unstakable: {formatAmount(BigInt(Math.floor(effectiveLimit * 1e9)))}</span>
                                  <span>Total: {formatAmount(octsuiBalance)}</span>
                                </div>
                              );
                            }
                          }

                          return (
                            <span>
                              Balance:{" "}
                              {formatAmount(
                                mode === "stake"
                                  ? mocksuiBalance
                                  : octsuiBalance,
                              )}
                            </span>
                          );
                        })()}
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
                          onClick={() => {
                            let val = maxAmount;
                            // Smart MAX: If unstaking, cap to min(balance, poolLimit, shareLimit)
                            if (mode === "unstake" && poolStats) {
                              const poolLimit = Number(poolStats.totalStaked) / 1e9;
                              const shareLimit = position ? Number(position.shares) / 1e9 : Infinity;

                              // Take the smallest of all constraints
                              let limit = poolLimit;
                              if (shareLimit < limit) limit = shareLimit;

                              if (val > limit) {
                                val = limit;
                              }
                            }
                            setAmount(val.toString());
                          }}
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
                    onClick={
                      mode === "stake" ? handleStake : handleUnstake
                    }
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
                        {mode === "stake"
                          ? "Stake MOCKSUI"
                          : "Unstake octSUI"}
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
            {/* Rewards Card */}
            {positionId && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
              >
                <Card className="glass glow-primary border-green-500/20 bg-green-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-green-500" />
                        Your Rewards
                      </div>
                      {isAutoRebalanceEnabled && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1">
                          <Bot className="h-3 w-3" /> Auto
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Accrued Rewards</span>
                      <div className="text-2xl font-bold text-green-500">
                        {formatAmount(pendingRewards)} octSUI
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ~{formatCurrency(Number(pendingRewards) / 1e9 * (octsuiPrice || 0))} USD
                      </p>
                    </div>

                    <div className="pt-2">
                      {isAutoRebalanceEnabled ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-full">
                                <Button
                                  className="w-full gap-2 opacity-80"
                                  variant="outline"
                                  disabled
                                >
                                  <Lock className="h-4 w-4" />
                                  Claim Rewards
                                </Button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Disable AI auto-rebalance to claim manually</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Button
                          className="w-full gap-2"
                          variant="electric"
                          onClick={handleClaimRewards}
                          disabled={isClaimPending || pendingRewards === 0n}
                        >
                          {isClaimPending ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                          Claim Rewards
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="glass glow-primary">
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
                      Automatically earn ~{estimatedAPR.toFixed(1)}% APR
                      on your stake
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
              <Card className="glass glow-primary border-amber-500/20 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="text-amber-500 flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Important Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>• octSUI can be used as collateral in vaults</p>
                  <p>• Staking rewards accrue automatically</p>
                  <p>
                    • Exchange rate increases over time as rewards
                    accumulate
                  </p>
                  <p>• Unstaking returns your original SUI + rewards</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

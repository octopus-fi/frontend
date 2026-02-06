"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StrategyCard } from "@/components/strategy/StrategyCard";
import { UploadStrategyModal } from "@/components/strategy/UploadStrategyModal";
import {
  Search,
  Filter,
  TrendingUp,
  Users,
  Clock,
  Shield,
  Upload,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
// import type { Strategy } from '@/types/index';
import {
  useStakePosition,
  useVault,
  buildEnableAutoRebalanceTransaction,
  buildDisableAutoRebalanceTransaction,
  buildAuthorizeAITransaction
} from "@/sdk/index";
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/store/ui-store";
import { Switch } from "@/components/ui/switch";
import { Bot, Zap } from "lucide-react";
import { useAgentSocket } from "@/hooks/useAgentSocket";
import { useAgentStore } from "@/store/agent-store";
import { useEffect } from "react";

type SortBy = "performance" | "users" | "recent" | "tvl";
type FilterRisk = "all" | "conservative" | "moderate" | "aggressive";

export default function StrategiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("performance");
  const [filterRisk, setFilterRisk] = useState<FilterRisk>("all");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [isRebalancePending, setIsRebalancePending] = useState(false);

  const { positionId, position, refetch: refetchPosition } = useStakePosition();
  const { vaultId } = useVault();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { addNotification } = useUIStore();

  const { isConnected, requestStrategies } = useAgentSocket();
  const agentStrategies = useAgentStore((state) => state.agentStrategies);

  // Request strategies from agent on connect
  useEffect(() => {
    if (isConnected) {
      requestStrategies();
    }
  }, [isConnected, requestStrategies]);

  const isAutoRebalanceEnabled = position?.autoRebalanceEnabled ?? false;

  const handleToggleRebalance = async () => {
    if (!positionId || !vaultId || !account) {
      addNotification({
        type: "error",
        title: "Setup Required",
        message: "You need both a Vault and a Stake Position to enable auto-rebalance",
      });
      return;
    }

    setIsRebalancePending(true);
    try {
      const tx = isAutoRebalanceEnabled
        ? buildDisableAutoRebalanceTransaction({ stakePositionId: positionId })
        : buildEnableAutoRebalanceTransaction({ stakePositionId: positionId, vaultId });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            addNotification({
              type: "success",
              title: isAutoRebalanceEnabled ? "Auto-Rebalance Disabled" : "Auto-Rebalance Enabled",
              message: isAutoRebalanceEnabled
                ? "You can now mutually claim rewards"
                : "AI will now automatically compound your rewards",
            });
            refetchPosition();
          },
          onError: (error) => {
            addNotification({
              type: "error",
              title: "Transaction Failed",
              message: error.message,
            });
          },
          onSettled: () => {
            setIsRebalancePending(false);
          },
        }
      );
    } catch (error: any) {
      addNotification({
        type: "error",
        title: "Error",
        message: error.message,
      });
      setIsRebalancePending(false);
    }
  };

  // Fetch registered strategies real-time
  const { data: realStrategies = [] } = useQuery({
    queryKey: ['registered-strategies'],
    queryFn: async () => {
      // Import dynamically to avoid SSR issues if any
      const { getRegisteredStrategies } = await import('@/sdk/queries/strategies');

      const real = await getRegisteredStrategies(client as any);
      // Check signature of useSuiClient().
      // If useSuiClient returns client directly:
      // return getRegisteredStrategies(client);
      // I'll check if I can use client directly.
      // Usually: const client = useSuiClient(); client.queryEvents...
      return real;
    },
    enabled: !!account, // Or always? Public can view. enabled: true.
  });

  // Merge real and agent strategies
  const strategies = useMemo(() => {
    // Unique strategies by name or ID
    const all = [...realStrategies, ...agentStrategies];

    // Filter out duplicates (prefer real over agent if same name)
    const seen = new Set();
    return all.filter(s => {
      const key = s.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [realStrategies, agentStrategies]);

  console.log("realStrategies", realStrategies);
  console.log("agentStrategies", agentStrategies);
  console.log("strategies", strategies);
  // Calculate marketplace stats
  const stats = useMemo(() => {
    const totalStrategies = strategies.length;
    const onChainCount = realStrategies.length;
    const totalUsers = strategies.reduce((sum, s) => sum + s.totalUsers, 0);
    const totalTVL = strategies.reduce(
      (sum, s) => sum + Number(s.totalValueManaged),
      0
    );

    const avgReturn =
      strategies.reduce((sum, s) => sum + s.avg30dReturn, 0) /
      (totalStrategies || 1);

    const verifiedCount = strategies.filter((s) => s.verified).length;
    const unavailableCount = strategies.filter((s: any) => s.walrusDataUnavailable).length;

    return {
      totalStrategies,
      onChainCount,
      totalUsers,
      totalTVL,
      avgReturn,
      verifiedCount,
      unavailableCount,
    };
  }, [strategies, realStrategies]);

  // Filter and sort strategies
  const filteredStrategies = useMemo(() => {
    let filtered = strategies;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.creator.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Risk filter
    if (filterRisk !== "all") {
      filtered = filtered.filter((s) => {
        if (filterRisk === "conservative") return s.riskScore <= 3;
        if (filterRisk === "moderate")
          return s.riskScore >= 4 && s.riskScore <= 6;
        if (filterRisk === "aggressive") return s.riskScore >= 7;
        return true;
      });
    }

    // Verified filter
    if (showVerifiedOnly) {
      filtered = filtered.filter((s) => s.verified);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "performance":
          return b.avg30dReturn - a.avg30dReturn;
        case "users":
          return b.totalUsers - a.totalUsers;
        case "recent":
          return b.createdAt - a.createdAt;
        case "tvl":
          return Number(b.totalValueManaged) - Number(a.totalValueManaged);
        default:
          return 0;
      }
    });

    return sorted;
  }, [strategies, searchQuery, sortBy, filterRisk, showVerifiedOnly]);

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold mb-2"
            >
              Strategy Marketplace
            </motion.h1>
            <p className="text-muted-foreground text-lg">
              Clone proven strategies or create your own on Walrus
            </p>
          </div>

          <UploadStrategyModal />
        </div>

        {/* AI Auto-Rebalance Settings */}
        {true && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass border-primary/20 bg-primary/5">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${isAutoRebalanceEnabled ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      AI Auto-Rebalance
                      {isAutoRebalanceEnabled && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Active
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {!positionId || !vaultId
                        ? "Connect wallet, Stake SUI, and Create Vault to enable AI features."
                        : "Automatically compound your staking rewards into your vault collateral to prevent liquidation."
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    {(!positionId || !vaultId) ? "Setup Required" : (isAutoRebalanceEnabled ? "Enabled" : "Disabled")}
                  </span>
                  <Switch
                    checked={isAutoRebalanceEnabled}
                    onCheckedChange={handleToggleRebalance}
                    disabled={isRebalancePending || !positionId || !vaultId}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Marketplace Stats */}
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
                    Total Strategies
                  </span>
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold">
                  {stats.totalStrategies}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.onChainCount} on-chain marketplace strategies
                  {stats.unavailableCount > 0 && (
                    <span className="text-amber-500 ml-1">
                      ({stats.unavailableCount} expired)
                    </span>
                  )}
                </p>
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
                    Total Users
                  </span>
                  <Users className="h-4 w-4 text-cyan-500" />
                </div>
                <div className="text-2xl font-bold">
                  {stats.totalUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active strategy users
                </p>
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
                    Total TVL
                  </span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalTVL)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Managed by strategies
                </p>
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
                    Avg 30d Return
                  </span>
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-green-500">
                  +{stats.avgReturn.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average performance
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <Card className="glass">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search strategies by name, description, or creator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                {/* Sort Options */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Sort by:
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant={
                        sortBy === "performance" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSortBy("performance")}
                    >
                      Performance
                    </Button>
                    <Button
                      variant={sortBy === "users" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy("users")}
                    >
                      Users
                    </Button>
                    <Button
                      variant={sortBy === "tvl" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy("tvl")}
                    >
                      TVL
                    </Button>
                    <Button
                      variant={
                        sortBy === "recent" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSortBy("recent")}
                    >
                      Recent
                    </Button>
                  </div>
                </div>

                <div className="h-6 w-px bg-white/10" />

                {/* Risk Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Risk:
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant={
                        filterRisk === "all" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setFilterRisk("all")}
                    >
                      All
                    </Button>
                    <Button
                      variant={
                        filterRisk === "conservative"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => setFilterRisk("conservative")}
                      className="gap-1"
                    >
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Conservative
                    </Button>
                    <Button
                      variant={
                        filterRisk === "moderate" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setFilterRisk("moderate")}
                      className="gap-1"
                    >
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      Moderate
                    </Button>
                    <Button
                      variant={
                        filterRisk === "aggressive"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => setFilterRisk("aggressive")}
                      className="gap-1"
                    >
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      Aggressive
                    </Button>
                  </div>
                </div>

                <div className="h-6 w-px bg-white/10" />

                {/* Verified Filter */}
                <button
                  onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  <div
                    className={`h-4 w-4 rounded border-2 flex items-center justify-center ${showVerifiedOnly
                      ? "bg-primary border-primary"
                      : "border-muted-foreground"
                      }`}
                  >
                    {showVerifiedOnly && (
                      <div className="h-2 w-2 bg-white rounded-sm" />
                    )}
                  </div>
                  <span>Verified only</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredStrategies.length}{" "}
            {filteredStrategies.length === 1 ? "strategy" : "strategies"}
          </p>
        </div>

        {/* Strategy Grid */}
        {filteredStrategies.length > 0 ? (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStrategies.map((strategy, index) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                index={index}
                onClone={(id) => console.log("Clone strategy:", id)}
              />
            ))}
          </div>
        ) : (
          <Card className="glass">
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  No Strategies Found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search query
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterRisk("all");
                    setShowVerifiedOnly(false);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3">How It Works</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-medium mb-1">
                      Browse Strategies
                    </div>
                    <p className="text-muted-foreground">
                      Explore community-created strategies with proven
                      track records
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-medium mb-1">
                      Review Performance
                    </div>
                    <p className="text-muted-foreground">
                      Analyze backtest results and risk metrics stored on
                      Walrus
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-medium mb-1">
                      Clone to Your Vault
                    </div>
                    <p className="text-muted-foreground">
                      One-click clone any strategy to your vault with AI
                      management
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Why Walrus Storage?
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Immutable:</strong>{" "}
                  Strategies can't be changed after upload
                </p>
                <p>
                  <strong className="text-foreground">Verifiable:</strong>{" "}
                  All backtest results are cryptographically proven
                </p>
                <p>
                  <strong className="text-foreground">Permanent:</strong>{" "}
                  Your strategy lives forever on decentralized storage
                </p>
                <p>
                  <strong className="text-foreground">
                    Transparent:
                  </strong>{" "}
                  Full strategy code and parameters are public
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

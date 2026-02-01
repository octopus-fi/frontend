"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiquidatableVault } from "@/components/liquidation/LiquidatableVault";
import { ProfitCalculator } from "@/components/liquidation/ProfitCalculator";
import {
  Zap,
  Search,
  TrendingUp,
  DollarSign,
  Activity,
  AlertCircle,
  Filter,
  Flame,
  Info,
  Clock,
} from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

type FilterUrgency = "all" | "critical" | "high" | "medium";
type SortBy = "profit" | "urgency" | "debt" | "health";

// Mock liquidatable vaults
const mockLiquidatableVaults = [
  {
    id: "0xabc123",
    owner: "0xdef456",
    collateral: 5000000000000n, // 5,000 octSUI
    debt: 14500000000n, // 14,500 octUSD
    health: 1.05,
    liquidationPrice: 2.9,
    currentPrice: 2.8,
    profit: 420,
    urgency: "critical" as const,
    timeToLiquidation: 15,
  },
  {
    id: "0x789xyz",
    owner: "0x123abc",
    collateral: 8000000000000n, // 8,000 octSUI
    debt: 21000000000n, // 21,000 octUSD
    health: 1.08,
    liquidationPrice: 2.7,
    currentPrice: 2.8,
    profit: 672,
    urgency: "critical" as const,
    timeToLiquidation: 45,
  },
  {
    id: "0xdef789",
    owner: "0x456def",
    collateral: 3000000000000n, // 3,000 octSUI
    debt: 7800000000n, // 7,800 octUSD
    health: 1.09,
    liquidationPrice: 2.5,
    currentPrice: 2.8,
    profit: 252,
    urgency: "high" as const,
    timeToLiquidation: 90,
  },
  {
    id: "0xghi012",
    owner: "0x789ghi",
    collateral: 12000000000000n, // 12,000 octSUI
    debt: 31000000000n, // 31,000 octUSD
    health: 1.095,
    liquidationPrice: 2.6,
    currentPrice: 2.8,
    profit: 1008,
    urgency: "high" as const,
    timeToLiquidation: 120,
  },
  {
    id: "0xjkl345",
    owner: "0x012jkl",
    collateral: 6000000000000n, // 6,000 octSUI
    debt: 15500000000n, // 15,500 octUSD
    health: 1.099,
    liquidationPrice: 2.4,
    currentPrice: 2.8,
    profit: 504,
    urgency: "medium" as const,
    timeToLiquidation: 180,
  },
];

export default function LiquidatePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUrgency, setFilterUrgency] = useState<FilterUrgency>("all");
  const [sortBy, setSortBy] = useState<SortBy>("urgency");
  const [showCalculator, setShowCalculator] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    const totalOpportunities = mockLiquidatableVaults.length;
    const totalProfit = mockLiquidatableVaults.reduce(
      (sum, v) => sum + v.profit,
      0,
    );
    const totalDebt = mockLiquidatableVaults.reduce(
      (sum, v) => sum + Number(v.debt) / 1e6,
      0,
    );
    const criticalCount = mockLiquidatableVaults.filter(
      (v) => v.urgency === "critical",
    ).length;

    return {
      totalOpportunities,
      totalProfit,
      totalDebt,
      criticalCount,
      avgProfit: totalProfit / totalOpportunities,
    };
  }, []);

  // Filter and sort vaults
  const filteredVaults = useMemo(() => {
    let filtered = mockLiquidatableVaults;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (v) =>
          v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.owner.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Urgency filter
    if (filterUrgency !== "all") {
      filtered = filtered.filter((v) => v.urgency === filterUrgency);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "profit":
          return b.profit - a.profit;
        case "urgency":
          const urgencyOrder = { critical: 0, high: 1, medium: 2 };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        case "debt":
          return Number(b.debt) - Number(a.debt);
        case "health":
          return a.health - b.health;
        default:
          return 0;
      }
    });

    return sorted;
  }, [searchQuery, filterUrgency, sortBy]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-6">
            <div className="space-y-8 animate-fade-in">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold mb-2 flex items-center gap-3"
                  >
                    <Zap className="h-10 w-10 text-primary" />
                    Flash Liquidation
                  </motion.h1>
                  <p className="text-muted-foreground text-lg">
                    Liquidate unhealthy vaults and earn instant profits
                  </p>
                </div>

                <Button
                  variant={showCalculator ? "default" : "outline"}
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="gap-2"
                >
                  <Activity className="h-4 w-4" />
                  {showCalculator ? "Hide" : "Show"} Calculator
                </Button>
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
                          Total Opportunities
                        </span>
                        <Flame className="h-4 w-4 text-orange-500" />
                      </div>
                      <div className="text-3xl font-bold">
                        {stats.totalOpportunities}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.criticalCount} critical
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
                          Total Profit
                        </span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="text-3xl font-bold text-green-500">
                        {formatCurrency(stats.totalProfit)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Available to earn
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
                          Total Debt
                        </span>
                        <DollarSign className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="text-3xl font-bold">
                        {formatCurrency(stats.totalDebt)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        To be liquidated
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
                          Avg Profit
                        </span>
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-3xl font-bold text-primary">
                        {formatCurrency(stats.avgProfit)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Per liquidation
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Profit Calculator (Conditional) */}
              {showCalculator && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <ProfitCalculator />
                </motion.div>
              )}

              {/* Filters and Search */}
              <Card className="glass">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by vault ID or owner address..."
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
                              sortBy === "urgency" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setSortBy("urgency")}
                          >
                            Urgency
                          </Button>
                          <Button
                            variant={
                              sortBy === "profit" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setSortBy("profit")}
                          >
                            Profit
                          </Button>
                          <Button
                            variant={sortBy === "debt" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSortBy("debt")}
                          >
                            Debt
                          </Button>
                          <Button
                            variant={
                              sortBy === "health" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setSortBy("health")}
                          >
                            Health
                          </Button>
                        </div>
                      </div>

                      <div className="h-6 w-px bg-white/10" />

                      {/* Urgency Filter */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Priority:
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant={
                              filterUrgency === "all" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setFilterUrgency("all")}
                          >
                            All
                          </Button>
                          <Button
                            variant={
                              filterUrgency === "critical"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setFilterUrgency("critical")}
                            className="gap-1"
                          >
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            Critical
                          </Button>
                          <Button
                            variant={
                              filterUrgency === "high" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setFilterUrgency("high")}
                            className="gap-1"
                          >
                            <div className="h-2 w-2 rounded-full bg-orange-500" />
                            High
                          </Button>
                          <Button
                            variant={
                              filterUrgency === "medium" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setFilterUrgency("medium")}
                            className="gap-1"
                          >
                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                            Medium
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredVaults.length} liquidation{" "}
                  {filteredVaults.length === 1
                    ? "opportunity"
                    : "opportunities"}
                </p>
                {stats.criticalCount > 0 && (
                  <Badge variant="danger" className="gap-1 animate-pulse">
                    <Flame className="h-3 w-3" />
                    {stats.criticalCount} Critical - Act Fast!
                  </Badge>
                )}
              </div>

              {/* Liquidatable Vaults Grid */}
              {filteredVaults.length > 0 ? (
                <div className="grid lg:grid-cols-2 gap-6">
                  {filteredVaults.map((vault, index) => (
                    <LiquidatableVault
                      key={vault.id}
                      vault={vault}
                      index={index}
                      onLiquidate={(id) => console.log("Liquidated:", id)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="glass">
                  <CardContent className="p-12 text-center">
                    <div className="max-w-md mx-auto">
                      <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">
                        No Opportunities Found
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {searchQuery || filterUrgency !== "all"
                          ? "Try adjusting your filters or search query"
                          : "No vaults are currently eligible for liquidation. Check back later!"}
                      </p>
                      {(searchQuery || filterUrgency !== "all") && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchQuery("");
                            setFilterUrgency("all");
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Info Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-base">
                      How Flash Liquidation Works
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        1
                      </div>
                      <div>
                        <div className="font-medium mb-1">
                          Identify Opportunity
                        </div>
                        <p className="text-muted-foreground">
                          Find vaults with health factor below 1.1× that can be
                          liquidated
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        2
                      </div>
                      <div>
                        <div className="font-medium mb-1">Flash Loan</div>
                        <p className="text-muted-foreground">
                          Borrow octUSD instantly to repay the vault's debt
                          (0.09% fee)
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        3
                      </div>
                      <div>
                        <div className="font-medium mb-1">Seize & Sell</div>
                        <p className="text-muted-foreground">
                          Claim collateral with 3% liquidator bonus, sell for
                          octUSD
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        4
                      </div>
                      <div>
                        <div className="font-medium mb-1">Profit</div>
                        <p className="text-muted-foreground">
                          Repay flash loan and keep the remaining profit (all in
                          one transaction!)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Important Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong>Speed matters:</strong> Critical vaults can be
                        liquidated by anyone. First transaction wins the profit.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong>Flash loans:</strong> No capital required
                        upfront. Everything happens in a single atomic
                        transaction.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <DollarSign className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong>Fees:</strong> Flash loan (0.09%), gas fees
                        (~$5), and slippage may reduce final profit.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong>Risk:</strong> Transaction may fail if vault
                        becomes healthy or another liquidator acts first.
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

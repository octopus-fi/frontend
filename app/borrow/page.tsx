"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VaultCard } from "@/components/vault/VaultCard";
import { CreateVaultWizard } from "@/components/vault/CreateVaultWizard";
import {
  Plus,
  Search,
  TrendingUp,
  Shield,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Vault } from "@/types/index";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

// Mock data
const mockVaults: Vault[] = [
  {
    id: "0x1a2b3c4d",
    owner: "0x...",
    collateral: 10000000000000n, // 10,000 octSUI
    debt: 6000000000n, // 6,000 octUSD
    health: 2.1,
    ltv: 60,
    aiManaged: true,
    stakingApy: 14.2,
    createdAt: Date.now() - 86400000 * 7,
    lastUpdated: Date.now() - 3600000,
  },
  {
    id: "0x5e6f7g8h",
    owner: "0x...",
    collateral: 25000000000000n, // 25,000 octSUI
    debt: 15000000000n, // 15,000 octUSD
    health: 1.8,
    ltv: 60,
    aiManaged: true,
    stakingApy: 11.8,
    createdAt: Date.now() - 86400000 * 14,
    lastUpdated: Date.now() - 7200000,
    strategy: {
      id: "strategy-1",
      name: "Balanced Farmer",
      walrusBlobId: "0x...",
      maxLtv: 65,
      rebalanceThreshold: 1.4,
      targetHealth: 2.0,
      autoCompound: true,
      riskScore: 5,
    },
  },
  {
    id: "0x9i0j1k2l",
    owner: "0x...",
    collateral: 5000000000000n, // 5,000 octSUI
    debt: 3500000000n, // 3,500 octUSD
    health: 1.15,
    ltv: 70,
    aiManaged: false,
    stakingApy: 9.2,
    createdAt: Date.now() - 86400000 * 3,
    lastUpdated: Date.now() - 1800000,
  },
];

const portfolioStats = {
  totalCollateral: 40000,
  totalDebt: 24500,
  avgHealth: 1.75,
  totalVaults: 3,
};

export default function BorrowPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState<
    "all" | "low" | "medium" | "high"
  >("all");

  const filteredVaults = mockVaults.filter((vault) => {
    // Search filter
    if (
      searchQuery &&
      !vault.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Risk filter
    if (filterRisk !== "all") {
      if (filterRisk === "high" && vault.health >= 1.2) return false;
      if (
        filterRisk === "medium" &&
        (vault.health < 1.2 || vault.health >= 1.5)
      )
        return false;
      if (filterRisk === "low" && vault.health < 1.5) return false;
    }

    return true;
  });

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
                    className="text-4xl font-bold mb-2"
                  >
                    Vault Management
                  </motion.h1>
                  <p className="text-muted-foreground text-lg">
                    Borrow octUSD against your octSUI collateral at 0% interest
                  </p>
                </div>

                <Button
                  variant="electric"
                  size="lg"
                  onClick={() => setCreateModalOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Create Vault
                </Button>
              </div>

              {/* Portfolio Stats */}
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
                          Total Collateral
                        </span>
                        <Shield className="h-4 w-4 text-cyan-500" />
                      </div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(portfolioStats.totalCollateral)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Across {portfolioStats.totalVaults} vaults
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
                          Total Borrowed
                        </span>
                        <TrendingUp className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(portfolioStats.totalDebt)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        0% interest rate
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
                          Avg Health
                        </span>
                        <Zap className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold text-green-500">
                        {portfolioStats.avgHealth.toFixed(2)}×
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        All vaults healthy
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
                          AI Protected
                        </span>
                        <AlertTriangle className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-2xl font-bold">
                        {mockVaults.filter((v) => v.aiManaged).length}/
                        {mockVaults.length}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Vaults with AI
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Filters and Search */}
              <Card className="glass">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search vaults by ID..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Risk Filter */}
                    <div className="flex gap-2">
                      <Button
                        variant={filterRisk === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterRisk("all")}
                      >
                        All
                      </Button>
                      <Button
                        variant={filterRisk === "low" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterRisk("low")}
                        className="gap-1"
                      >
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Low Risk
                      </Button>
                      <Button
                        variant={
                          filterRisk === "medium" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setFilterRisk("medium")}
                        className="gap-1"
                      >
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        Medium
                      </Button>
                      <Button
                        variant={filterRisk === "high" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterRisk("high")}
                        className="gap-1"
                      >
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        High Risk
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vault Grid */}
              {filteredVaults.length > 0 ? (
                <div className="grid lg:grid-cols-2 gap-6">
                  {filteredVaults.map((vault, index) => (
                    <VaultCard key={vault.id} vault={vault} index={index} />
                  ))}
                </div>
              ) : (
                <Card className="glass">
                  <CardContent className="p-12 text-center">
                    <div className="max-w-md mx-auto">
                      <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">
                        No Vaults Found
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {searchQuery || filterRisk !== "all"
                          ? "Try adjusting your filters or search query"
                          : "Create your first vault to start borrowing octUSD"}
                      </p>
                      <Button
                        variant="electric"
                        onClick={() => setCreateModalOpen(true)}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create Vault
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Info Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass border-primary/20">
                  <CardHeader>
                    <CardTitle>Why Use Vaults?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        1
                      </div>
                      <div>
                        <div className="font-medium mb-1">
                          Keep Earning Staking Rewards
                        </div>
                        <p className="text-muted-foreground">
                          Your octSUI continues to earn ~7% APY even while used
                          as collateral
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        2
                      </div>
                      <div>
                        <div className="font-medium mb-1">
                          Zero Interest Borrowing
                        </div>
                        <p className="text-muted-foreground">
                          Pay 0% interest on borrowed octUSD - only a 0.5%
                          one-time minting fee
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        3
                      </div>
                      <div>
                        <div className="font-medium mb-1">AI Protection</div>
                        <p className="text-muted-foreground">
                          Enable AI to monitor and auto-rebalance your vault
                          24/7
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Pro Tip
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p>
                      <strong>Leverage Your Yield:</strong> Borrow octUSD
                      against your octSUI, swap it for more SUI, stake it, and
                      repeat! This creates a leverage loop that can boost your
                      APY to 15-20%.
                    </p>
                    <p className="text-muted-foreground">
                      Just make sure to enable AI auto-rebalance to keep your
                      vault safe during market volatility.
                    </p>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Learn About Leverage Strategies
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Create Vault Modal */}
              <CreateVaultWizard
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

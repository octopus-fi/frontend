"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Shield,
  Zap,
  Activity,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { useDashboard, formatAmount } from "@/sdk/index";
import { truncateAddress } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardPage() {
  const {
    vaultId,
    collateral,
    debt,
    rewardReserve,
    ltv,
    healthFactor,
    healthStatus,
    maxBorrow,
    availableBorrow,
    octsuiBalance,
    octusdBalance,
    mocksuiBalance,
    octsuiPrice,
    estimatedApy,
    isLoading,
  } = useDashboard();

  // Calculate portfolio metrics
  const collateralValue =
    octsuiPrice > 0 ? (Number(collateral) / 1e9) * octsuiPrice : 0;
  const debtValue = Number(debt) / 1e9;
  const totalValue = collateralValue;
  const netAPY = estimatedApy || 7.2;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show create vault prompt if no vault exists
  if (!vaultId) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-2"
          >
            Welcome to Octopus Finance 👋
          </motion.h1>
          <p className="text-muted-foreground text-lg">
            Get started by creating your first vault
          </p>
        </div>

        <Card className="glass border-primary/20 max-w-2xl mx-auto">
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Create Your First Vault</h3>
            <p className="text-muted-foreground mb-6">
              Create a vault to start depositing collateral and borrowing octUSD
            </p>
            <Button variant="electric" size="lg" asChild>
              <Link href="/borrow" className="gap-2">
                Create Vault
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="glass">
            <CardContent className="p-6 text-center">
              <Wallet className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Stake SUI</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Stake SUI to receive octSUI with ~{netAPY.toFixed(1)}% APY
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/stake">Stake Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Browse Strategies</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Explore AI-powered vault strategies
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/strategies">Explore</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6 text-center">
              <Activity className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">View Analytics</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Track your portfolio performance
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/analytics">View Analytics</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              {/* Welcome Section */}
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold mb-2"
                >
                  Welcome back 👋
                </motion.h1>
                <p className="text-muted-foreground text-lg">
                  {healthStatus === "safe"
                    ? "Your vault is healthy and performing well"
                    : healthStatus === "warning"
                      ? "Your vault health needs attention"
                      : "Warning: Your vault is at risk"}
                </p>
              </div>

              {/* Portfolio Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="glass border-primary/20 relative overflow-hidden group hover:shadow-xl transition-shadow">
                    <div className="absolute inset-0 gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Collateral
                      </CardTitle>
                      <Wallet className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold counter-animate">
                        {formatCurrency(collateralValue)}
                      </div>
                      <div className="flex items-center text-xs mt-2">
                        <span className="text-muted-foreground">
                          {formatAmount(collateral)} octSUI
                        </span>
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
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Borrowed
                      </CardTitle>
                      <Activity className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {formatCurrency(debtValue)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
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
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Health Factor
                      </CardTitle>
                      <Shield className="h-4 w-4 text-cyan-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {healthFactor === Infinity
                          ? "∞"
                          : healthFactor.toFixed(2)}
                        ×
                      </div>
                      <Badge
                        variant={
                          healthStatus === "safe"
                            ? "success"
                            : healthStatus === "warning"
                              ? "warning"
                              : "danger"
                        }
                        className="mt-2"
                      >
                        {healthStatus}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="glass border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Est. APY
                      </CardTitle>
                      <Zap className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-500">
                        {formatPercent(netAPY / 100)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        From staking rewards
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Vault Overview */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="glass">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Your Vault</CardTitle>
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/dashboard/borrow/${vaultId}`}
                            className="gap-2"
                          >
                            View Details
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Card className="border-white/5 hover:border-primary/30 transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">
                                    Vault {truncateAddress(vaultId, 6)}
                                  </span>
                                  <Badge
                                    variant={
                                      healthStatus === "safe"
                                        ? "success"
                                        : healthStatus === "warning"
                                          ? "warning"
                                          : "danger"
                                    }
                                  >
                                    Health:{" "}
                                    {healthFactor === Infinity
                                      ? "∞"
                                      : healthFactor.toFixed(2)}
                                    ×
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {formatAmount(collateral)} octSUI collateral
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">
                                  APY
                                </div>
                                <div className="text-xl font-bold text-green-500">
                                  {formatPercent(netAPY / 100)}
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>
                                  Borrowed: {formatCurrency(debtValue)}
                                </span>
                                <span>LTV: {ltv.toFixed(1)}%</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    ltv > 70
                                      ? "bg-red-500"
                                      : ltv > 60
                                        ? "bg-yellow-500"
                                        : "gradient-to-r from-primary to-secondary"
                                  }`}
                                  style={{ width: `${Math.min(ltv, 100)}%` }}
                                />
                              </div>
                            </div>

                            {/* Vault Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">
                                  Available to Borrow
                                </div>
                                <div className="font-semibold">
                                  {formatCurrency(availableBorrow)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">
                                  Safety Reserve
                                </div>
                                <div className="font-semibold">
                                  {formatAmount(rewardReserve)} octSUI
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </CardContent>
                  </Card>

                  {/* Balances Card */}
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle>Token Balances</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                              <span className="text-cyan-500 font-bold">M</span>
                            </div>
                            <div>
                              <div className="font-semibold">MOCKSUI</div>
                              <div className="text-xs text-muted-foreground">
                                Mock SUI Token
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-semibold">
                              {formatAmount(mocksuiBalance)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ~
                              {formatCurrency(
                                (Number(mocksuiBalance) / 1e9) * octsuiPrice,
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-primary font-bold">O</span>
                            </div>
                            <div>
                              <div className="font-semibold">octSUI</div>
                              <div className="text-xs text-muted-foreground">
                                Liquid Staking Token
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-semibold">
                              {formatAmount(octsuiBalance)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ~
                              {formatCurrency(
                                (Number(octsuiBalance) / 1e9) * octsuiPrice,
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                              <span className="text-green-500 font-bold">
                                $
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold">octUSD</div>
                              <div className="text-xs text-muted-foreground">
                                Stablecoin
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-semibold">
                              {formatAmount(octusdBalance)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ~{formatCurrency(Number(octusdBalance) / 1e9)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                  {/* Health Warning */}
                  {(healthStatus === "warning" ||
                    healthStatus === "danger" ||
                    healthStatus === "liquidatable") && (
                    <Card className="glass border-amber-500/50 bg-amber-500/5">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                          <CardTitle className="text-amber-500">
                            Health Warning
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Your vault health is {healthStatus}. Consider adding
                          collateral or repaying debt.
                        </p>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            asChild
                          >
                            <Link href={`/dashboard/borrow/${vaultId}`}>
                              Add Collateral
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            asChild
                          >
                            <Link href={`/dashboard/borrow/${vaultId}`}>
                              Repay Debt
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Actions */}
                  <Card className="glass border-primary/20">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href="/dashboard/stake">
                          <Wallet className="h-4 w-4 mr-2" />
                          Stake SUI
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href={`/dashboard/borrow/${vaultId}`}>
                          <Activity className="h-4 w-4 mr-2" />
                          Manage Vault
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href="/dashboard/strategies">
                          <Zap className="h-4 w-4 mr-2" />
                          Browse Strategies
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href="/dashboard/analytics">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          View Analytics
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Market Info */}
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle>Market Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          octSUI Price
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(octsuiPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Staking APY
                        </span>
                        <span className="font-semibold text-green-500">
                          {formatPercent(netAPY / 100)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Max LTV
                        </span>
                        <span className="font-semibold">70%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Liq. Threshold
                        </span>
                        <span className="font-semibold">80%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

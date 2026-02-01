"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PortfolioPerformanceChart } from "@/components/charts/PortfolioPerformanceChart";
import { APYProjectionChart } from "@/components/charts/APYProjectionChart";
import { RiskMetrics } from "@/components/analytics/RiskMetrics";
import {
  TrendingUp,
  DollarSign,
  Percent,
  Activity,
  Download,
  Calendar,
  Shield,
  Zap,
} from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

// Mock portfolio data
const portfolioData = {
  totalValue: 125420,
  change24h: 3.24,
  change7d: 8.15,
  change30d: 14.32,
  currentAPY: 14.2,
  totalEarned: 18420,
  totalDeposited: 107000,
  totalCollateral: 85000,
  totalBorrowed: 48000,
  vaults: [
    { id: "1", health: 2.1, ltv: 60 },
    { id: "2", health: 1.8, ltv: 64 },
    { id: "3", health: 1.15, ltv: 70 },
  ],
};

export default function AnalyticsPage() {
  const {
    totalValue,
    change24h,
    change7d,
    change30d,
    currentAPY,
    totalEarned,
    totalDeposited,
    vaults,
  } = portfolioData;

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
                    Analytics Dashboard
                  </motion.h1>
                  <p className="text-muted-foreground text-lg">
                    Deep insights into your portfolio performance
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Custom Range
                  </Button>
                  <Button variant="electric" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Report
                  </Button>
                </div>
              </div>

              {/* Key Performance Indicators */}
              <div className="grid md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="glass border-primary/20 relative overflow-hidden group">
                    <div className="absolute inset-0 gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Portfolio
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold counter-animate">
                        {formatCurrency(totalValue)}
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-2">
                        <Badge
                          variant={change24h >= 0 ? "success" : "danger"}
                          className="gap-1"
                        >
                          {change24h >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            "↓"
                          )}
                          {change24h >= 0 ? "+" : ""}
                          {formatPercent(change24h / 100)}
                        </Badge>
                        <span className="text-muted-foreground">24h</span>
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
                        Current APY
                      </CardTitle>
                      <Percent className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-500">
                        {formatPercent(currentAPY / 100)}
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-2">
                        <span className="text-muted-foreground">
                          Staking + Leverage
                        </span>
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
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Earned
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">
                        {formatCurrency(totalEarned)}
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-2">
                        <span className="text-muted-foreground">
                          {formatPercent(
                            ((totalEarned / totalDeposited) * 100) / 100,
                          )}{" "}
                          ROI
                        </span>
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
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        30-Day Change
                      </CardTitle>
                      <Activity className="h-4 w-4 text-cyan-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-500">
                        +{formatPercent(change30d / 100)}
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-2">
                        <span className="text-muted-foreground">
                          7d: +{formatPercent(change7d / 100)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Charts */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Portfolio Performance */}
                  <PortfolioPerformanceChart initialValue={totalDeposited} />

                  {/* APY Projection */}
                  <APYProjectionChart
                    currentValue={totalValue}
                    currentAPY={currentAPY}
                    projectionMonths={12}
                  />

                  {/* Performance Breakdown */}
                  <Card className="glass border-primary/20">
                    <CardHeader>
                      <CardTitle>Performance Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Staking Rewards */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                              <Zap className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                              <div className="font-medium">Staking Rewards</div>
                              <div className="text-sm text-muted-foreground">
                                octSUI yield
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-500">
                              {formatCurrency(totalEarned * 0.6)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ~7.2% APY
                            </div>
                          </div>
                        </div>

                        {/* Leverage Gains */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">
                                Leverage Multiplier
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Borrowing gains
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-primary">
                              {formatCurrency(totalEarned * 0.4)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              +7.0% bonus
                            </div>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="font-semibold">Total Earnings</div>
                          <div className="text-2xl font-bold text-primary">
                            {formatCurrency(totalEarned)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Risk & Stats */}
                <div className="space-y-6">
                  {/* Risk Metrics */}
                  <RiskMetrics vaults={vaults} />

                  {/* Quick Stats */}
                  <Card className="glass border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-base">
                        Portfolio Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Deposited:
                        </span>
                        <span className="font-mono font-semibold">
                          {formatCurrency(totalDeposited)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Earned:
                        </span>
                        <span className="font-mono font-semibold text-green-500">
                          +{formatCurrency(totalEarned)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-white/10">
                        <span className="text-muted-foreground">
                          Current Value:
                        </span>
                        <span className="font-mono font-semibold text-primary">
                          {formatCurrency(totalValue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ROI:</span>
                        <span className="font-mono font-semibold text-green-500">
                          +
                          {formatPercent(
                            ((totalEarned / totalDeposited) * 100) / 100,
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Asset Allocation */}
                  <Card className="glass border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-base">
                        Asset Allocation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Collateral */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">
                            Collateral (octSUI)
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(portfolioData.totalCollateral)}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full gradient-to-r from-green-500 to-emerald-500"
                            style={{
                              width: `${(portfolioData.totalCollateral / totalValue) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {(
                            (portfolioData.totalCollateral / totalValue) *
                            100
                          ).toFixed(1)}
                          % of portfolio
                        </div>
                      </div>

                      {/* Borrowed */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">
                            Borrowed (octUSD)
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(portfolioData.totalBorrowed)}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full gradient-to-r from-amber-500 to-orange-500"
                            style={{
                              width: `${(portfolioData.totalBorrowed / totalValue) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {(
                            (portfolioData.totalBorrowed / totalValue) *
                            100
                          ).toFixed(1)}
                          % of portfolio
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Time-based Stats */}
                  <Card className="glass border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-base">
                        Performance Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-white/10">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            24 Hours
                          </div>
                          <div
                            className={`text-sm font-bold ${change24h >= 0 ? "text-green-500" : "text-red-500"}`}
                          >
                            {change24h >= 0 ? "+" : ""}
                            {formatPercent(change24h / 100)}
                          </div>
                        </div>
                        <Badge variant={change24h >= 0 ? "success" : "danger"}>
                          {change24h >= 0 ? "↑" : "↓"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-white/10">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            7 Days
                          </div>
                          <div
                            className={`text-sm font-bold ${change7d >= 0 ? "text-green-500" : "text-red-500"}`}
                          >
                            {change7d >= 0 ? "+" : ""}
                            {formatPercent(change7d / 100)}
                          </div>
                        </div>
                        <Badge variant={change7d >= 0 ? "success" : "danger"}>
                          {change7d >= 0 ? "↑" : "↓"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-white/10">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            30 Days
                          </div>
                          <div
                            className={`text-sm font-bold ${change30d >= 0 ? "text-green-500" : "text-red-500"}`}
                          >
                            {change30d >= 0 ? "+" : ""}
                            {formatPercent(change30d / 100)}
                          </div>
                        </div>
                        <Badge variant={change30d >= 0 ? "success" : "danger"}>
                          {change30d >= 0 ? "↑" : "↓"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Bottom Info Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-base">
                      About Your Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      Your analytics dashboard provides real-time insights into
                      your portfolio performance, including historical trends,
                      risk metrics, and future projections.
                    </p>
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Risk analysis updated every 5 minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span>Performance tracked in real-time</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span>APY projections based on current rates</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Optimization Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Maintain health factors above 1.5× for safety</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Enable AI auto-rebalance on all vaults</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Diversify with multiple strategies</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Compound rewards weekly for maximum gains</span>
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

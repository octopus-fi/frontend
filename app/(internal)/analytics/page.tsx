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
  TrendingDown,
} from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { useDashboard, formatAmount } from "@/sdk/index";

export default function AnalyticsPage() {
  const {
    collateral,
    debt,
    ltv,
    healthFactor,
    healthStatus,
    octsuiPrice,
    estimatedApr,
    octsuiBalance,
    octusdBalance,
    mocksuiBalance,
    isLoading,
  } = useDashboard();

  // Calculate portfolio metrics
  const collateralValue =
    octsuiPrice > 0 ? (Number(collateral) / 1e9) * octsuiPrice : 0;
  const debtValue = Number(debt) / 1e9;
  const totalValue = collateralValue;
  const netWorth = collateralValue - debtValue;

  // Additional balances in USD
  const octsuiBalanceValue = (Number(octsuiBalance) / 1e9) * octsuiPrice;
  const mocksuiBalanceValue = (Number(mocksuiBalance) / 1e9) * octsuiPrice; // Assume same price
  const octusdBalanceValue = Number(octusdBalance) / 1e9;

  const totalPortfolioValue =
    collateralValue +
    octsuiBalanceValue +
    mocksuiBalanceValue +
    octusdBalanceValue;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold mb-2"
            >
              Analytics Dashboard
            </motion.h1>
            <p className="text-muted-foreground text-lg">
              Real-time insights into your portfolio performance
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Time Range
            </Button>
            <Button variant="electric" className="gap-2">
              <Download className="h-4 w-4" />
              Export
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
                  {formatCurrency(totalPortfolioValue)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Across all assets
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Net Worth
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(netWorth)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Assets - Liabilities
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
                  Est. APY
                </CardTitle>
                <Percent className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {formatPercent(estimatedApr / 100)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  From staking
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
        </div>

        {/* Charts and Risk Row */}
        <div className="grid lg:grid-cols-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-8"
          >
            <PortfolioPerformanceChart />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-4"
          >
            <RiskMetrics
              ltv={ltv}
              healthFactor={healthFactor}
              healthStatus={healthStatus}
            />
          </motion.div>
        </div>

        {/* Detailed Metrics and Market Row */}
        <div className="grid lg:grid-cols-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-8"
          >
            <Card className="glass h-full">
              <CardHeader>
                <CardTitle>Asset Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Assets Mapping */}
                  {[
                    { label: "Vault Collateral", amount: collateral, val: collateralValue, icon: Shield, color: "text-cyan-500", bg: "bg-cyan-500/20", unit: "octSUI" },
                    { label: "Wallet octSUI", amount: octsuiBalance, val: octsuiBalanceValue, icon: Activity, color: "text-primary", bg: "bg-primary/20", unit: "octSUI" },
                    { label: "MOCKSUI", amount: mocksuiBalance, val: mocksuiBalanceValue, icon: Zap, color: "text-blue-500", bg: "bg-blue-500/20", unit: "MOCKSUI" },
                    { label: "octUSD", amount: octusdBalance, val: octusdBalanceValue, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/20", unit: "octUSD" },
                  ].map((asset) => (
                    <div key={asset.label} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full ${asset.bg} flex items-center justify-center`}>
                          <asset.icon className={`h-5 w-5 ${asset.color}`} />
                        </div>
                        <div>
                          <div className="font-semibold">{asset.label}</div>
                          <div className="text-sm text-muted-foreground">{formatAmount(asset.amount)} {asset.unit}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(asset.val)}</div>
                        <div className="text-sm text-muted-foreground">
                          {((asset.val / totalPortfolioValue) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Debt */}
                  {Number(debt) > 0 && (
                    <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <div className="font-semibold text-red-500">Borrowed Debt</div>
                          <div className="text-sm text-red-500/70">{formatAmount(debt)} octUSD</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-red-500">-{formatCurrency(debtValue)}</div>
                        <div className="text-sm text-red-500/70">LTV: {ltv.toFixed(1)}%</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="lg:col-span-4"
          >
            <div className="space-y-6 flex flex-col h-full">
              <Card className="glass flex-1">
                <CardHeader>
                  <CardTitle>Market Prices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">octSUI Price</div>
                    <div className="text-2xl font-bold">{formatCurrency(octsuiPrice)}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">octUSD Price</div>
                    <div className="text-2xl font-bold">$1.00</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Staking APY</div>
                    <div className="text-2xl font-bold text-green-500">{formatPercent(estimatedApr / 100)}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions or Tips */}
              <Card className="glass bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                    <Activity className="h-4 w-4" />
                    AI Insights
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your portfolio is currently <b>{healthStatus.toUpperCase()}</b>. AI active protection is standing by to prevent any liquidation risk.
                  </p>
                  <Button variant="outline" className="w-full text-xs" size="sm">
                    Optimize Shield
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

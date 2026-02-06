"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BacktestChart } from "@/components/strategy/BacktestChart";
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  ExternalLink,
  Shield,
  Users,
  TrendingUp,
  AlertTriangle,
  Download,
  Code,
} from "lucide-react";
import {
  formatCurrency,
  formatPercent,
  truncateAddress,
  cn,
} from "@/lib/utils";
import { getMockStrategies, fetchStrategy } from "@/lib/walrus/client";

export default function StrategyDetailPage({
  params,
}: {
  params: { strategyId: string };
}) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // In production, fetch from Walrus by strategyId
  const strategies = getMockStrategies();
  const strategy =
    strategies.find((s) => s.id === params.strategyId) || strategies[0];

  // Mock full backtest data
  const backtest = {
    period: "30d",
    totalReturn: strategy.avg30dReturn,
    maxDrawdown: strategy.avg30dReturn * 0.3,
    sharpeRatio: 1.5 + strategy.riskScore * 0.1,
    winRate: 75 - strategy.riskScore * 2,
    historicalPerformance: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
        },
      ),
      return: (Math.random() * 2 - 0.5) * strategy.riskScore,
      cumulativeReturn: (i / 30) * strategy.avg30dReturn,
    })),
    rebalanceTriggers: [
      {
        condition: `health < ${strategy.rebalanceThreshold}`,
        action: "add_collateral",
      },
      { condition: `ltv > ${strategy.maxLtv}%`, action: "repay_debt" },
    ],
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(strategy.walrusBlobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClone = async () => {
    setLoading(true);
    // Simulate cloning
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    // Would redirect to vault with strategy applied
  };

  const getRiskColor = () => {
    if (strategy.riskScore <= 3) return "text-green-500";
    if (strategy.riskScore <= 6) return "text-yellow-500";
    return "text-red-500";
  };

  const getRiskBadgeVariant = () => {
    if (strategy.riskScore <= 3) return "success" as const;
    if (strategy.riskScore <= 6) return "warning" as const;
    return "danger" as const;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-8 animate-fade-in">
        {/* Breadcrumb & Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                href="/strategies"
                className="hover:text-primary transition-colors"
              >
                Strategies
              </Link>
              <span>/</span>
              <span>{strategy.name}</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold"
            >
              {strategy.name}
            </motion.h1>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/strategies">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <Button
              variant="electric"
              className="gap-2"
              onClick={handleClone}
              loading={loading}
            >
              <Copy className="h-4 w-4" />
              Clone to Vault
            </Button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {strategy.verified && (
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
          )}

          <Badge variant={getRiskBadgeVariant()}>
            Risk Score: {strategy.riskScore}/10
          </Badge>

          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {strategy.totalUsers} users
          </Badge>

          <Badge variant="outline" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            {formatCurrency(Number(strategy.totalValueManaged))} TVL
          </Badge>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="glass border-primary/20">
              <CardHeader>
                <CardTitle>About This Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {strategy.description}
                </p>

                {!strategy.verified && (
                  <Card className="border-amber-500/30 bg-amber-500/5">
                    <CardContent className="p-4 flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                      <div className="text-sm">
                        <div className="font-semibold text-amber-400 mb-1">
                          Unverified Strategy
                        </div>
                        <p className="text-muted-foreground">
                          This strategy has not been verified by the
                          Octopus team. Use at your own risk and always
                          review the parameters before cloning.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Backtest Results */}
            <BacktestChart backtest={backtest} />

            {/* Strategy Parameters */}
            <Card className="glass border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Strategy Parameters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-background/50 border border-white/10">
                    <div className="text-sm text-muted-foreground mb-2">
                      Maximum LTV
                    </div>
                    <div className="text-2xl font-bold">
                      {strategy.maxLtv}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      How much you can borrow relative to collateral
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-background/50 border border-white/10">
                    <div className="text-sm text-muted-foreground mb-2">
                      Target Health
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {strategy.targetHealth.toFixed(1)}×
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Desired health factor to maintain
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-background/50 border border-white/10">
                    <div className="text-sm text-muted-foreground mb-2">
                      Rebalance Threshold
                    </div>
                    <div className="text-2xl font-bold">
                      {strategy.rebalanceThreshold.toFixed(1)}×
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      AI rebalances when health drops below this
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-background/50 border border-white/10">
                    <div className="text-sm text-muted-foreground mb-2">
                      Auto-Compound
                    </div>
                    <div
                      className={cn(
                        "text-2xl font-bold",
                        strategy.autoCompound
                          ? "text-green-500"
                          : "text-muted-foreground",
                      )}
                    >
                      {strategy.autoCompound ? "Enabled" : "Disabled"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Automatically reinvest staking rewards
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">
                      30d Return
                    </div>
                    <div
                      className={cn(
                        "text-2xl font-bold",
                        strategy.avg30dReturn >= 0
                          ? "text-green-500"
                          : "text-red-500",
                      )}
                    >
                      {strategy.avg30dReturn >= 0 ? "+" : ""}
                      {formatPercent(strategy.avg30dReturn / 100)}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">
                      Max Drawdown
                    </div>
                    <div className="text-2xl font-bold text-red-400">
                      -{formatPercent(backtest.maxDrawdown / 100)}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">
                      Sharpe Ratio
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {backtest.sharpeRatio.toFixed(2)}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">
                      Win Rate
                    </div>
                    <div className="text-2xl font-bold text-green-500">
                      {backtest.winRate.toFixed(0)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="glass border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Strategy Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creator:</span>
                  <span className="font-mono font-semibold">
                    {truncateAddress(strategy.creator, 6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total Users:
                  </span>
                  <span className="font-semibold">
                    {strategy.totalUsers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TVL:</span>
                  <span className="font-semibold">
                    {formatCurrency(Number(strategy.totalValueManaged))}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-semibold">
                    {Math.floor(
                      (Date.now() - strategy.createdAt) / 86400000,
                    )}
                    d ago
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Last Updated:
                  </span>
                  <span className="font-semibold">
                    {Math.floor(
                      (Date.now() - strategy.lastUpdated) / 86400000,
                    )}
                    d ago
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Walrus Info */}
            <Card className="glass border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Stored on Walrus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Blob ID
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono flex-1 truncate p-2 rounded bg-background/50 border border-white/10">
                      {strategy.walrusBlobId}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="shrink-0 p-2 hover:bg-white/5 rounded transition-colors"
                      title="Copy blob ID"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>Immutable storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>Cryptographically verifiable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>Permanent availability</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 mt-3"
                >
                  <Download className="h-4 w-4" />
                  Download Full Strategy
                </Button>
              </CardContent>
            </Card>

            {/* Clone CTA */}
            <Card className="glass border-primary/20 animated-border">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold mb-2">
                  Ready to clone?
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Apply this strategy to your vault with one click
                </p>
                <Button
                  variant="electric"
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleClone}
                  loading={loading}
                >
                  <Copy className="h-5 w-5" />
                  Clone to Vault
                </Button>
              </CardContent>
            </Card>

            {/* Risk Warning */}
            {strategy.riskScore >= 7 && (
              <Card className="border-red-500/30 bg-red-500/5">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold text-red-400 mb-1">
                        High Risk Strategy
                      </div>
                      <p className="text-muted-foreground">
                        This strategy has a high risk score. Only use if
                        you understand the risks and can afford potential
                        losses.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

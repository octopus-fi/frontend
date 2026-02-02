'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortfolioPerformanceChart } from '@/components/charts/PortfolioPerformanceChart';
import { APYProjectionChart } from '@/components/charts/APYProjectionChart';
import { RiskMetrics } from '@/components/analytics/RiskMetrics';
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
} from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { 
  useDashboard,
  formatAmount,
} from '@/sdk/index';

export default function AnalyticsPage() {
  const {
    collateral,
    debt,
    ltv,
    healthFactor,
    healthStatus,
    octsuiPrice,
    estimatedApy,
    octsuiBalance,
    octusdBalance,
    mocksuiBalance,
    isLoading,
  } = useDashboard();

  // Calculate portfolio metrics
  const collateralValue = octsuiPrice > 0 ? (Number(collateral) / 1e9) * octsuiPrice : 0;
  const debtValue = Number(debt) / 1e9;
  const totalValue = collateralValue;
  const netWorth = collateralValue - debtValue;
  
  // Additional balances in USD
  const octsuiBalanceValue = (Number(octsuiBalance) / 1e9) * octsuiPrice;
  const mocksuiBalanceValue = (Number(mocksuiBalance) / 1e9) * octsuiPrice; // Assume same price
  const octusdBalanceValue = Number(octusdBalance) / 1e9;
  
  const totalPortfolioValue = collateralValue + octsuiBalanceValue + mocksuiBalanceValue + octusdBalanceValue;

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
                {formatPercent(estimatedApy / 100)}
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
                {healthFactor === Infinity ? '∞' : healthFactor.toFixed(2)}×
              </div>
              <Badge 
                variant={
                  healthStatus === 'safe' ? 'success' :
                  healthStatus === 'warning' ? 'warning' : 'danger'
                }
                className="mt-2"
              >
                {healthStatus}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PortfolioPerformanceChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <APYProjectionChart currentAPY={estimatedApy} />
        </motion.div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2"
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle>Asset Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Vault Collateral */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-cyan-500" />
                    </div>
                    <div>
                      <div className="font-semibold">Vault Collateral</div>
                      <div className="text-sm text-muted-foreground">
                        {formatAmount(collateral)} octSUI
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(collateralValue)}</div>
                    <div className="text-sm text-muted-foreground">
                      {((collateralValue / totalPortfolioValue) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Wallet octSUI */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Wallet octSUI</div>
                      <div className="text-sm text-muted-foreground">
                        {formatAmount(octsuiBalance)} octSUI
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(octsuiBalanceValue)}</div>
                    <div className="text-sm text-muted-foreground">
                      {((octsuiBalanceValue / totalPortfolioValue) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* MOCKSUI */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-semibold">MOCKSUI</div>
                      <div className="text-sm text-muted-foreground">
                        {formatAmount(mocksuiBalance)} MOCKSUI
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(mocksuiBalanceValue)}</div>
                    <div className="text-sm text-muted-foreground">
                      {((mocksuiBalanceValue / totalPortfolioValue) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* octUSD */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <div className="font-semibold">octUSD</div>
                      <div className="text-sm text-muted-foreground">
                        {formatAmount(octusdBalance)} octUSD
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(octusdBalanceValue)}</div>
                    <div className="text-sm text-muted-foreground">
                      {((octusdBalanceValue / totalPortfolioValue) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Debt */}
                {Number(debt) > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-red-500">Borrowed Debt</div>
                        <div className="text-sm text-red-500/70">
                          {formatAmount(debt)} octUSD
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-500">-{formatCurrency(debtValue)}</div>
                      <div className="text-sm text-red-500/70">
                        LTV: {ltv.toFixed(1)}%
                      </div>
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
        >
          <RiskMetrics 
            ltv={ltv}
            healthFactor={healthFactor}
            healthStatus={healthStatus}
          />
        </motion.div>
      </div>

      {/* Market Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="glass">
          <CardHeader>
            <CardTitle>Market Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-sm text-muted-foreground mb-1">octSUI Price</div>
                <div className="text-2xl font-bold">{formatCurrency(octsuiPrice)}</div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-sm text-muted-foreground mb-1">octUSD Price</div>
                <div className="text-2xl font-bold">$1.00</div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-sm text-muted-foreground mb-1">Staking APY</div>
                <div className="text-2xl font-bold text-green-500">{formatPercent(estimatedApy / 100)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
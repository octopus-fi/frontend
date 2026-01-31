'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Shield,
  Zap,
  Activity,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

// Mock data (will be replaced with real data)
const mockData = {
  portfolio: {
    totalValue: 125420,
    change24h: 3.24,
    totalCollateral: 85000,
    totalBorrowed: 48000,
    netAPY: 12.4,
  },
  vaults: [
    {
      id: '1',
      collateral: 10000,
      debt: 6000,
      health: 2.1,
      apy: 14.2,
    },
    {
      id: '2',
      collateral: 25000,
      debt: 15000,
      health: 1.8,
      apy: 11.8,
    },
  ],
  recentActivity: [
    {
      type: 'rebalance',
      vault: '1',
      timestamp: Date.now() - 3600000,
      message: 'AI auto-rebalanced vault #1',
    },
    {
      type: 'borrow',
      vault: '2',
      timestamp: Date.now() - 7200000,
      message: 'Borrowed 5,000 octUSD',
    },
  ],
};

export default function DashboardPage() {
  const { portfolio, vaults, recentActivity } = mockData;

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
          Your portfolio is performing well today
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
                Total Portfolio
              </CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold counter-animate">
                {formatCurrency(portfolio.totalValue)}
              </div>
              <div className="flex items-center text-xs mt-2">
                {portfolio.change24h >= 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">
                      +{formatPercent(portfolio.change24h / 100)}
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    <span className="text-red-500">
                      {formatPercent(portfolio.change24h / 100)}
                    </span>
                  </>
                )}
                <span className="text-muted-foreground ml-2">24h</span>
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
                Total Collateral
              </CardTitle>
              <Shield className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(portfolio.totalCollateral)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Locked in {vaults.length} vaults
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
                Total Borrowed
              </CardTitle>
              <Activity className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(portfolio.totalBorrowed)}
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
          transition={{ delay: 0.4 }}
        >
          <Card className="glass border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Net APY
              </CardTitle>
              <Zap className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {formatPercent(portfolio.netAPY / 100)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Staking + Leverage
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Vaults Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Vaults</CardTitle>
                <Button variant="electric" size="sm" asChild>
                  <Link href="/dashboard/borrow" className="gap-2">
                    Create Vault
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vaults.map((vault, i) => (
                  <motion.div
                    key={vault.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <Card className="border-white/5 hover:border-primary/30 transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                Vault #{vault.id}
                              </span>
                              <Badge 
                                variant={
                                  vault.health >= 1.5 ? 'success' :
                                  vault.health >= 1.2 ? 'warning' : 'danger'
                                }
                              >
                                Health: {vault.health.toFixed(2)}×
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatCurrency(vault.collateral)} collateral
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              APY
                            </div>
                            <div className="text-xl font-bold text-green-500">
                              {formatPercent(vault.apy / 100)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Borrowed: {formatCurrency(vault.debt)}</span>
                            <span>LTV: {((vault.debt / vault.collateral) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full gradient-to-r from-primary to-secondary transition-all"
                              style={{ width: `${(vault.debt / vault.collateral) * 100}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0"
                  >
                    <div className="shrink-0 mt-1">
                      {activity.type === 'rebalance' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Activity className="h-5 w-5 text-cyan-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/stake">
                  <Wallet className="h-4 w-4 mr-2" />
                  Stake SUI
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/borrow">
                  <Activity className="h-4 w-4 mr-2" />
                  Borrow octUSD
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/strategies">
                  <Zap className="h-4 w-4 mr-2" />
                  Browse Strategies
                </Link>
              </Button>
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
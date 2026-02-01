'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Waves,
  ArrowRight,
  Info,
  TrendingUp,
  Lock,
  Unlock,
  Zap,
} from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

// Mock data
const stakingStats = {
  totalStaked: 1250000000,
  currentAPY: 7.2,
  exchangeRate: 1.0042,
  userStaked: 10000,
  userOctSUI: 10042,
};

export default function StakePage() {
  const [mode, setMode] = useState<'stake' | 'unstake'>('stake');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStake = async () => {
    setIsLoading(true);
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setAmount('');
  };

  const handleUnstake = async () => {
    setIsLoading(true);
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setAmount('');
  };

  const calculateOutput = () => {
    if (!amount) return 0;
    const input = parseFloat(amount);
    if (mode === 'stake') {
      return input * stakingStats.exchangeRate;
    } else {
      return input / stakingStats.exchangeRate;
    }
  };

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
          Stake SUI and receive octSUI - keep earning while you use your assets
        </p>
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
                <span className="text-sm text-muted-foreground">Total Staked</span>
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(stakingStats.totalStaked / 1e9)} SUI
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
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Current APY</span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-500">
                {formatPercent(stakingStats.currentAPY / 100)}
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
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Exchange Rate</span>
                <Waves className="h-4 w-4 text-cyan-500" />
              </div>
              <div className="text-2xl font-bold font-mono">
                1:{stakingStats.exchangeRate.toFixed(4)}
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
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Your Staked</span>
                <Zap className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(stakingStats.userStaked)} SUI
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Staking Interface */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Staking Form */}
        <div className="lg:col-span-2">
          <Card className="glass border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {mode === 'stake' ? 'Stake SUI' : 'Unstake octSUI'}
                  </CardTitle>
                  <CardDescription>
                    {mode === 'stake' 
                      ? 'Receive liquid octSUI tokens while earning staking rewards'
                      : 'Convert octSUI back to SUI'
                    }
                  </CardDescription>
                </div>
                
                {/* Mode Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={mode === 'stake' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMode('stake')}
                    className="gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Stake
                  </Button>
                  <Button
                    variant={mode === 'unstake' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMode('unstake')}
                    className="gap-2"
                  >
                    <Unlock className="h-4 w-4" />
                    Unstake
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Input Section */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">
                      {mode === 'stake' ? 'Stake Amount' : 'Unstake Amount'}
                    </label>
                    <span className="text-sm text-muted-foreground">
                      Balance: {mode === 'stake' ? '50,000' : stakingStats.userOctSUI.toFixed(2)}{' '}
                      {mode === 'stake' ? 'SUI' : 'octSUI'}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-16 text-2xl pr-24"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAmount(mode === 'stake' ? '50000' : stakingStats.userOctSUI.toString())}
                      >
                        MAX
                      </Button>
                      <Badge variant="secondary" className="font-mono">
                        {mode === 'stake' ? 'SUI' : 'octSUI'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Arrow Indicator */}
                <div className="flex justify-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 border border-primary/20">
                    <ArrowRight className="h-6 w-6 text-primary rotate-90" />
                  </div>
                </div>

                {/* Output Section */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">
                      {mode === 'stake' ? 'You Receive' : 'You Receive'}
                    </label>
                  </div>
                  
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={calculateOutput().toFixed(4)}
                      disabled
                      className="h-16 text-2xl pr-24 bg-muted"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Badge variant="secondary" className="font-mono">
                        {mode === 'stake' ? 'octSUI' : 'SUI'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <p>
                        {mode === 'stake' 
                          ? 'octSUI is a liquid staking token that accrues staking rewards automatically. You can use it in DeFi while continuing to earn ~7% APY.'
                          : 'Unstaking is instant. Your octSUI will be converted back to SUI at the current exchange rate.'
                        }
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>• No lock-up period</span>
                        <span>• Instant liquidity</span>
                        <span>• Auto-compounding</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button 
                variant="electric" 
                size="lg" 
                className="w-full"
                onClick={mode === 'stake' ? handleStake : handleUnstake}
                loading={isLoading}
                disabled={!amount || parseFloat(amount) <= 0}
              >
                {isLoading ? 'Processing...' : mode === 'stake' ? 'Stake SUI' : 'Unstake octSUI'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          {/* How It Works */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div>
                  <div className="font-medium mb-1">Stake SUI</div>
                  <p className="text-muted-foreground">
                    Deposit your SUI into the staking pool
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <div>
                  <div className="font-medium mb-1">Receive octSUI</div>
                  <p className="text-muted-foreground">
                    Get liquid octSUI tokens instantly
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <div>
                  <div className="font-medium mb-1">Earn & Use</div>
                  <p className="text-muted-foreground">
                    Earn ~7% APY while using octSUI in DeFi
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Your Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Staked SUI</span>
                <span className="font-medium font-mono">
                  {formatCurrency(stakingStats.userStaked)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">octSUI Balance</span>
                <span className="font-medium font-mono">
                  {stakingStats.userOctSUI.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rewards Earned</span>
                <span className="font-medium font-mono text-green-500">
                  +{(stakingStats.userOctSUI - stakingStats.userStaked).toFixed(2)} SUI
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                <span className="text-muted-foreground">Estimated APY</span>
                <span className="font-medium text-green-500">
                  {formatPercent(stakingStats.currentAPY / 100)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="glass border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Use octSUI in Vaults</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Deposit octSUI as collateral and borrow octUSD at 0% interest
              </p>
              <Button variant="outline" className="w-full" asChild>
                <a href="/dashboard/borrow">
                  Create Vault
                  <ArrowRight className="h-4 w-4 ml-2" />
                </a>
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
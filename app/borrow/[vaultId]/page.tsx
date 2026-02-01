'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HealthFactorGauge } from '@/components/vault/HealthFactorGauge';
import { HealthHistoryChart } from '@/components/charts/HealthHistoryChart';
import { BorrowForm } from './components/BorrowForm';
import { RepayForm } from './components/RepayForm';
import {
  ArrowLeft,
  Settings,
  ExternalLink,
  Copy,
  CheckCircle2,
  TrendingUp,
  Shield,
  Activity,
  Clock,
  Bot,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency, formatPercent, truncateAddress, cn } from '@/lib/utils';
import { calculateLTV, calculateLiquidationPrice, calculateNetAPY } from '@/lib/calculations/vault';
import type { Vault } from '@/types/index';

// Mock vault data
const mockVault: Vault = {
  id: '0x1a2b3c4d5e6f7g8h',
  owner: '0xabcdef1234567890',
  collateral: 10000000000000n, // 10,000 octSUI
  debt: 6000000000n, // 6,000 octUSD
  health: 2.1,
  ltv: 60,
  aiManaged: true,
  stakingApy: 14.2,
  createdAt: Date.now() - 86400000 * 7,
  lastUpdated: Date.now() - 3600000,
  strategy: {
    id: 'strategy-1',
    name: 'Balanced Farmer',
    walrusBlobId: '0x...',
    maxLtv: 65,
    rebalanceThreshold: 1.4,
    targetHealth: 2.0,
    autoCompound: true,
    riskScore: 5,
  },
};

const MOCK_PRICE = 3.0;

// Mock transaction history
const mockTransactions = [
  {
    id: '1',
    type: 'rebalance' as const,
    timestamp: Date.now() - 3600000,
    description: 'AI auto-rebalanced vault',
    amount: 0,
  },
  {
    id: '2',
    type: 'borrow' as const,
    timestamp: Date.now() - 86400000,
    description: 'Borrowed octUSD',
    amount: 2000,
  },
  {
    id: '3',
    type: 'deposit' as const,
    timestamp: Date.now() - 86400000 * 3,
    description: 'Added collateral',
    amount: 5000,
  },
  {
    id: '4',
    type: 'create' as const,
    timestamp: Date.now() - 86400000 * 7,
    description: 'Vault created',
    amount: 5000,
  },
];

export default function VaultDetailPage({ params }: { params: { vaultId: string } }) {
  const [activeTab, setActiveTab] = useState<'borrow' | 'repay'>('borrow');
  const [copied, setCopied] = useState(false);

  const vault = mockVault; // In real app, fetch by params.vaultId
  const currentCollateral = Number(vault.collateral) / 1e9;
  const currentDebt = Number(vault.debt) / 1e6;
  
  const ltv = calculateLTV(currentCollateral, currentDebt, MOCK_PRICE);
  const liquidationPrice = calculateLiquidationPrice(currentCollateral, currentDebt);
  const netAPY = calculateNetAPY(currentCollateral, currentDebt);

  const handleCopy = () => {
    navigator.clipboard.writeText(vault.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Breadcrumb & Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/dashboard/borrow" className="hover:text-primary transition-colors">
              Vaults
            </Link>
            <span>/</span>
            <span>Vault #{truncateAddress(vault.id, 8)}</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold flex items-center gap-3"
          >
            Vault #{truncateAddress(vault.id, 8)}
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              title="Copy vault ID"
            >
              {copied ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </motion.h1>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/borrow">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vaults
            </Link>
          </Button>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge 
          variant={
            vault.health >= 1.5 ? 'success' :
            vault.health >= 1.2 ? 'warning' : 'danger'
          }
          className="gap-1"
        >
          <Shield className="h-3 w-3" />
          Health: {vault.health.toFixed(2)}×
        </Badge>
        
        {vault.aiManaged && (
          <Badge variant="electric" className="gap-1 animate-pulse-glow">
            <Bot className="h-3 w-3" />
            AI Active
          </Badge>
        )}
        
        {vault.strategy && (
          <Badge variant="outline" className="gap-1">
            <Zap className="h-3 w-3" />
            Strategy: {vault.strategy.name}
          </Badge>
        )}
        
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Created {Math.floor((Date.now() - vault.createdAt) / 86400000)} days ago
        </Badge>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Stats & Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Health Factor Gauge */}
          <Card className="glass border-primary/20">
            <CardContent className="p-8">
              <div className="flex justify-center">
                <HealthFactorGauge
                  value={vault.health}
                  size="lg"
                  showLiquidationPrice
                  liquidationPrice={liquidationPrice}
                />
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-2">
                    Collateral
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(currentCollateral)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    octSUI
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
                  <div className="text-sm text-muted-foreground mb-2">
                    Borrowed
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(currentDebt)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    octUSD
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
                  <div className="text-sm text-muted-foreground mb-2">
                    LTV Ratio
                  </div>
                  <div className={cn(
                    'text-2xl font-bold',
                    ltv > 70 ? 'text-red-400' :
                    ltv > 60 ? 'text-yellow-400' : 'text-green-400'
                  )}>
                    {ltv.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    / 75% max
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
                  <div className="text-sm text-muted-foreground mb-2">
                    Net APY
                  </div>
                  <div className="text-2xl font-bold text-green-500">
                    {formatPercent(netAPY / 100)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Earning
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Health History Chart */}
          <HealthHistoryChart currentHealth={vault.health} />

          {/* Transaction History */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTransactions.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {tx.type === 'rebalance' && <Bot className="h-5 w-5 text-primary" />}
                      {tx.type === 'borrow' && <TrendingUp className="h-5 w-5 text-cyan-500" />}
                      {tx.type === 'deposit' && <Shield className="h-5 w-5 text-green-500" />}
                      {tx.type === 'create' && <Zap className="h-5 w-5 text-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{tx.description}</span>
                        {tx.amount > 0 && (
                          <span className="font-mono text-sm">
                            {tx.type === 'borrow' && '+'}{formatCurrency(tx.amount)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Tab Selector */}
          <Card className="glass">
            <CardContent className="p-2">
              <div className="flex gap-1 bg-background/50 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('borrow')}
                  className={cn(
                    'flex-1 px-4 py-2 rounded-md font-medium transition-all',
                    activeTab === 'borrow'
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Borrow
                </button>
                <button
                  onClick={() => setActiveTab('repay')}
                  className={cn(
                    'flex-1 px-4 py-2 rounded-md font-medium transition-all',
                    activeTab === 'repay'
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Repay
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Forms */}
          {activeTab === 'borrow' ? (
            <BorrowForm vault={vault} />
          ) : (
            <RepayForm vault={vault} />
          )}

          {/* Quick Stats */}
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Collateral Value:</span>
                <span className="font-mono font-semibold">
                  {formatCurrency(currentCollateral * MOCK_PRICE)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Debt:</span>
                <span className="font-mono font-semibold">
                  {formatCurrency(currentDebt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Liq. Price:</span>
                <span className="font-mono font-semibold text-red-400">
                  ${liquidationPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-muted-foreground">Current SUI Price:</span>
                <span className="font-mono font-semibold text-green-500">
                  ${MOCK_PRICE.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* AI Status */}
          {vault.aiManaged && (
            <Card className="glass border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  AI Manager Active
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Monitoring every 5 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Auto-rebalance enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Compound rewards: Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Target health: 2.0×</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Configure AI Settings
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Warning if health is low */}
          {vault.health < 1.3 && (
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-red-400 mb-2">
                      ⚠️ Low Health Warning
                    </div>
                    <p className="text-muted-foreground mb-3">
                      Your vault is at risk. Consider adding collateral or repaying debt.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Add Collateral
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Repay Debt
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    
  );
}
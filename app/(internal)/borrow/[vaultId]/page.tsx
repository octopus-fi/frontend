"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HealthFactorGauge } from "@/components/vault/HealthFactorGauge";
import { BorrowForm } from "./components/BorrowForm";
import { RepayForm } from "./components/RepayForm";
import { AgentActivityPanel } from "@/components/agent/AgentActivityPanel";
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  TrendingUp,
  Shield,
  Activity,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, formatPercent, truncateAddress } from "@/lib/utils";
import {
  useVault,
  useVaultHealth,
  useOctsuiPrice,
  useBalances,
  formatAmount,
} from "@/sdk/index";

export default function VaultDetailPage() {
  const params = useParams();
  const vaultId = params.vaultId as string;
  const [activeTab, setActiveTab] = useState<"borrow" | "repay">("borrow");
  const [copied, setCopied] = useState(false);

  const { vault, isLoading: vaultLoading } = useVault();
  const health = useVaultHealth();
  const { data: price, isLoading: priceLoading } = useOctsuiPrice();
  const { octsui: octsuiBalance, octusd: octusdBalance } = useBalances();

  const isLoading = vaultLoading || priceLoading;

  const handleCopy = () => {
    navigator.clipboard.writeText(vaultId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading vault...</p>
        </div>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="glass border-amber-500/50 max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Vault Not Found</h3>
            <p className="text-muted-foreground mb-4">
              This vault doesn't exist or you don't have permission to view it.
            </p>
            <Button variant="outline" asChild>
              <Link href="/borrow">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Vaults
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const collateralValue = price ? (Number(vault.collateral) / 1e9) * price : 0;
  const debtValue = Number(vault.debt) / 1e9;

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-8 animate-fade-in">
        {/* Breadcrumb & Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                href="/borrow"
                className="hover:text-primary transition-colors"
              >
                Vaults
              </Link>
              <span>/</span>
              <span>Vault #{truncateAddress(vaultId, 8)}</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold flex items-center gap-3"
            >
              Vault #{truncateAddress(vaultId, 8)}
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
              <Link href="/borrow">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>

          </div>
        </div>

        {/* Health Warning */}
        {(health.status === "warning" ||
          health.status === "danger" ||
          health.status === "liquidatable") && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass border-amber-500/50 bg-amber-500/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-500 mb-1">
                        Vault Health Warning
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {health.status === "liquidatable"
                          ? "Your vault is at risk of liquidation! Add collateral or repay debt immediately."
                          : health.status === "danger"
                            ? "Your vault is at maximum LTV. Add collateral or repay debt to reduce risk."
                            : "Your vault health is declining. Consider adding collateral or repaying debt."}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab("borrow")}
                        >
                          Add Collateral
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab("repay")}
                        >
                          Repay Debt
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Collateral
                  </span>
                  <Shield className="h-4 w-4 text-cyan-500" />
                </div>
                <div className="text-2xl font-bold">
                  {formatAmount(vault.collateral)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ~{formatCurrency(collateralValue)}
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
                    Debt
                  </span>
                  <Activity className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold">
                  {formatAmount(vault.debt)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ~{formatCurrency(debtValue)}
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
                    LTV
                  </span>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold">
                  {health.ltv.toFixed(1)}%
                </div>
                <Badge
                  variant={
                    health.status === "safe"
                      ? "success"
                      : health.status === "warning"
                        ? "warning"
                        : "danger"
                  }
                  className="mt-2"
                >
                  {health.status}
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
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Health Factor
                  </span>
                  <Shield className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold">
                  {health.healthFactor === Infinity
                    ? "∞"
                    : health.healthFactor.toFixed(2)}
                  ×
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {health.healthFactor >= 1.5 ? "Healthy" : "At Risk"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Health Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <HealthFactorGauge
            healthFactor={health.healthFactor}
            ltv={health.ltv}
          />
        </motion.div>

        {/* Borrow/Repay Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <BorrowForm
              vaultId={vaultId}
              currentCollateral={vault.collateral}
              currentDebt={vault.debt}
              maxBorrow={health.maxBorrow}
              availableBorrow={health.availableBorrow}
              octsuiBalance={octsuiBalance}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <RepayForm
              vaultId={vaultId}
              currentCollateral={vault.collateral}
              currentDebt={vault.debt}
              octusdBalance={octusdBalance}
            />
          </motion.div>
        </div>

        {/* AI Agent Activity Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <AgentActivityPanel vaultId={vaultId} maxItems={3} />
        </motion.div>
      </div>
    </div>
  );
}

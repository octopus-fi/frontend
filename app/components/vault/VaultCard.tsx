"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Settings,
  Bot,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { HealthFactorGauge } from "./HealthFactorGauge";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { calculateLTV, getRiskLevel } from "@/lib/calculations/vault";
import type { Vault } from "@/types/index";

interface VaultCardProps {
  vault: Vault;
  index?: number;
}

export function VaultCard({ vault, index = 0 }: VaultCardProps) {
  const riskLevel = getRiskLevel(vault.health);
  const ltv = calculateLTV(vault.collateral, vault.debt, 3.0); // Mock price

  // Background gradient based on risk
  const getBgGradient = () => {
    if (riskLevel === "high") return "from-red-500/10 to-orange-500/10";
    if (riskLevel === "medium") return "from-yellow-500/10 to-amber-500/10";
    return "from-green-500/10 to-emerald-500/10";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={cn(
          "glass border-primary/20 hover:border-primary/40 transition-all cursor-pointer group relative overflow-hidden",
          riskLevel === "high" && "border-red-500/30 hover:border-red-500/50",
        )}
      >
        {/* Risk gradient background */}
        <div
          className={cn(
            "absolute inset-0 gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity",
            getBgGradient(),
          )}
        />

        {/* AI Badge */}
        {vault.aiManaged && (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="electric" className="gap-1 animate-pulse-glow">
              <Bot className="h-3 w-3" />
              AI Active
            </Badge>
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">
                <Link
                  href={`/dashboard/borrow/${vault.id}`}
                  className="hover:text-primary transition-colors"
                >
                  Vault #{vault.id.slice(0, 8)}
                  <ExternalLink className="inline h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={
                    riskLevel === "high"
                      ? "danger"
                      : riskLevel === "medium"
                        ? "warning"
                        : "success"
                  }
                >
                  {riskLevel === "high"
                    ? "High Risk"
                    : riskLevel === "medium"
                      ? "Medium Risk"
                      : "Low Risk"}
                </Badge>
                {vault.strategy && (
                  <Badge variant="outline">
                    Strategy: {vault.strategy.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Health Factor Gauge */}
          <div className="flex justify-center">
            <HealthFactorGauge
              value={vault.health}
              size="sm"
              showLabel={false}
            />
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Collateral</div>
              <div className="text-xl font-bold font-mono">
                {formatCurrency(Number(vault.collateral) / 1e9)}
              </div>
              <div className="text-xs text-muted-foreground">octSUI</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Borrowed</div>
              <div className="text-xl font-bold font-mono">
                {formatCurrency(Number(vault.debt) / 1e6)}
              </div>
              <div className="text-xs text-muted-foreground">octUSD</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">LTV Ratio</div>
              <div
                className={cn(
                  "text-xl font-bold",
                  ltv > 70
                    ? "text-red-400"
                    : ltv > 60
                      ? "text-yellow-400"
                      : "text-green-400",
                )}
              >
                {ltv.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Max: 75%</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Net APY</div>
              <div className="text-xl font-bold text-green-500 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {formatPercent(vault.stakingApy / 100)}
              </div>
              <div className="text-xs text-muted-foreground">Earning</div>
            </div>
          </div>

          {/* LTV Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Utilization</span>
              <span>{ltv.toFixed(1)}% / 75%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(ltv / 75) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full transition-all",
                  ltv > 70
                    ? "gradient-to-r from-red-500 to-orange-500"
                    : ltv > 60
                      ? "gradient-to-r from-yellow-500 to-amber-500"
                      : "gradient-to-r from-green-500 to-emerald-500",
                )}
              />
            </div>
          </div>

          {/* Warning Message */}
          {vault.health < 1.3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
            >
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-semibold text-red-400 mb-1">
                  ⚠️ Low Health Warning
                </div>
                <p className="text-muted-foreground">
                  Your vault is at risk of liquidation. Consider adding
                  collateral or repaying debt.
                </p>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="electric" className="flex-1" asChild>
              <Link href={`/dashboard/borrow/${vault.id}`}>Manage Vault</Link>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link href={`/dashboard/borrow/${vault.id}#settings`}>
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-white/5">
            Last updated: {new Date(vault.lastUpdated).toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

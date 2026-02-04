"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  Shield,
  CheckCircle2,
  ExternalLink,
  Copy,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import type { Strategy } from "@/types/index";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface StrategyCardProps {
  strategy: Strategy;
  index?: number;
  onClone?: (strategyId: string) => void;
}

export function StrategyCard({
  strategy,
  index = 0,
  onClone,
}: StrategyCardProps) {
  const getRiskColor = () => {
    if (strategy.riskScore <= 3) return "text-green-500";
    if (strategy.riskScore <= 6) return "text-yellow-500";
    return "text-red-500";
  };

  const getRiskLabel = () => {
    if (strategy.riskScore <= 3) return "Conservative";
    if (strategy.riskScore <= 6) return "Moderate";
    return "Aggressive";
  };

  const getRiskBadgeVariant = () => {
    if (strategy.riskScore <= 3) return "success" as const;
    if (strategy.riskScore <= 6) return "warning" as const;
    return "danger" as const;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={cn(
          "glass border-primary/20 hover:border-primary/40 transition-all group cursor-pointer relative overflow-hidden h-full",
          !strategy.verified && "border-amber-500/30",
          strategy.walrusDataUnavailable && "border-red-500/30 opacity-75",
        )}
      >
        {/* Verified Badge */}
        {strategy.verified && !strategy.walrusDataUnavailable && (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
          </div>
        )}

        {/* Unverified Warning */}
        {!strategy.verified && !strategy.walrusDataUnavailable && (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="warning" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Unverified
            </Badge>
          </div>
        )}

        {/* Walrus Data Unavailable Warning */}
        {strategy.walrusDataUnavailable && (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="danger" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Data Expired
            </Badge>
          </div>
        )}

        <CardHeader>
          <div className="pr-20">
            <CardTitle className="text-xl mb-2">
              <Link
                href={`/strategies/${strategy.id}`}
                className="hover:text-primary transition-colors flex items-center gap-2"
              >
                {strategy.name}
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {strategy.description}
            </p>
          </div>

          {/* Risk and Stats Badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant={getRiskBadgeVariant()}>
              Risk: {strategy.riskScore}/10
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {strategy.totalUsers} users
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Mini Chart Preview */}
          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strategy.backtestPreview}>
                <Line
                  type="monotone"
                  dataKey="return"
                  stroke={
                    strategy.riskScore <= 3
                      ? "#10B981"
                      : strategy.riskScore <= 6
                        ? "#F59E0B"
                        : "#EF4444"
                  }
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">
                30d Return
              </div>
              <div
                className={cn(
                  "text-lg font-bold",
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
              <div className="text-xs text-muted-foreground mb-1">Max LTV</div>
              <div className="text-lg font-bold">{strategy.maxLtv}%</div>
            </div>

            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">
                Target Health
              </div>
              <div className="text-lg font-bold text-primary">
                {strategy.targetHealth.toFixed(1)}×
              </div>
            </div>
          </div>

          {/* Strategy Details */}
          <div className="space-y-2 text-sm pt-2 border-t border-white/10">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Total Value Managed:
              </span>
              <span className="font-semibold">
                {formatCurrency(Number(strategy.totalValueManaged))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Rebalance Threshold:
              </span>
              <span className="font-semibold">
                {strategy.rebalanceThreshold.toFixed(1)}×
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auto-Compound:</span>
              <span
                className={cn(
                  "font-semibold",
                  strategy.autoCompound
                    ? "text-green-500"
                    : "text-muted-foreground",
                )}
              >
                {strategy.autoCompound ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>

          {/* Creator Info */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Created by {strategy.creator.slice(0, 8)}...</span>
            <span>•</span>
            <span>
              {Math.floor((Date.now() - strategy.createdAt) / 86400000)}d ago
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="electric" className="flex-1 gap-2" asChild>
              <Link href={`/strategies/${strategy.id}`}>View Details</Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                onClone?.(strategy.id);
              }}
              title="Clone to vault"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

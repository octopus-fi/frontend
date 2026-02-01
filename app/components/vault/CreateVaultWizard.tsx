"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HealthFactorGauge } from "./HealthFactorGauge";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Wallet,
  DollarSign,
  Bot,
  Info,
  AlertTriangle,
} from "lucide-react";
import {
  calculateHealthFactor,
  calculateLTV,
  calculateMaxBorrow,
  calculateLiquidationPrice,
  validateVaultParams,
  calculateNetAPY,
} from "@/lib/calculations/vault";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";

interface CreateVaultWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = [
  { id: 1, title: "Set Collateral", icon: Wallet },
  { id: 2, title: "Borrow Amount", icon: DollarSign },
  { id: 3, title: "AI Settings", icon: Bot },
  { id: 4, title: "Review", icon: Check },
];

const MOCK_PRICE = 3.0; // Mock SUI price

export function CreateVaultWizard({
  open,
  onOpenChange,
}: CreateVaultWizardProps) {
  const [step, setStep] = useState(1);
  const [collateral, setCollateral] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [enableAI, setEnableAI] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const collateralNum = parseFloat(collateral) || 0;
  const borrowNum = parseFloat(borrowAmount) || 0;

  const healthFactor =
    borrowNum > 0
      ? calculateHealthFactor(collateralNum, borrowNum, MOCK_PRICE)
      : Infinity;
  const ltv = calculateLTV(collateralNum, borrowNum, MOCK_PRICE);
  const maxBorrow = calculateMaxBorrow(collateralNum, MOCK_PRICE);
  const liquidationPrice = calculateLiquidationPrice(collateralNum, borrowNum);
  const netAPY = calculateNetAPY(collateralNum, borrowNum);
  const validation = validateVaultParams(collateralNum, borrowNum, MOCK_PRICE);

  const canProceed = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return collateralNum > 0;
      case 2:
        return validation.valid;
      case 3:
        return true;
      case 4:
        return validation.valid;
      default:
        return false;
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    onOpenChange(false);
    // Reset form
    setStep(1);
    setCollateral("");
    setBorrowAmount("");
    setEnableAI(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Vault</DialogTitle>
          <DialogDescription>
            Follow the steps to create your overcollateralized vault
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, index) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all",
                    step > s.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : step === s.id
                        ? "border-primary text-primary animate-pulse-glow"
                        : "border-muted text-muted-foreground",
                  )}
                >
                  {step > s.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <s.icon className="h-5 w-5" />
                  )}
                </div>
                <div
                  className={cn(
                    "text-xs mt-2 font-medium text-center",
                    step >= s.id ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.title}
                </div>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2",
                    step > s.id ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Collateral */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Collateral Amount
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={collateral}
                      onChange={(e) => setCollateral(e.target.value)}
                      className="h-16 text-2xl pr-32"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCollateral("10000")}
                      >
                        MAX
                      </Button>
                      <Badge variant="secondary" className="font-mono">
                        octSUI
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>Available: 50,000 octSUI</span>
                    <span>≈ {formatCurrency(collateralNum * MOCK_PRICE)}</span>
                  </div>
                </div>

                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-primary shrink-0" />
                      <div className="text-sm space-y-2">
                        <p>
                          octSUI is liquid staking token that earns ~7% APY. You
                          can use it as collateral while continuing to earn
                          staking rewards.
                        </p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>• No lock-up period</span>
                          <span>• Auto-compounding</span>
                          <span>• Always liquid</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 2: Borrow Amount */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Borrow Amount
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      className="h-16 text-2xl pr-32"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBorrowAmount(maxBorrow.toFixed(2))}
                      >
                        MAX
                      </Button>
                      <Badge variant="secondary" className="font-mono">
                        octUSD
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>Max Borrow: {formatCurrency(maxBorrow)}</span>
                    <span>0% Interest</span>
                  </div>
                </div>

                {/* Health Factor Preview */}
                {borrowNum > 0 && (
                  <div className="flex justify-center">
                    <HealthFactorGauge
                      value={healthFactor}
                      size="md"
                      showLiquidationPrice
                      liquidationPrice={liquidationPrice}
                    />
                  </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="glass">
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">
                        LTV Ratio
                      </div>
                      <div
                        className={cn(
                          "text-2xl font-bold",
                          ltv > 70
                            ? "text-red-400"
                            : ltv > 60
                              ? "text-yellow-400"
                              : "text-green-400",
                        )}
                      >
                        {ltv.toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass">
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">
                        Net APY
                      </div>
                      <div className="text-2xl font-bold text-green-500">
                        {formatPercent(netAPY / 100)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass">
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">
                        Liq. Price
                      </div>
                      <div className="text-2xl font-bold text-red-400">
                        ${liquidationPrice.toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Warnings */}
                {validation.warnings && validation.warnings.length > 0 && (
                  <Card className="border-amber-500/20 bg-amber-500/5">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                        <div className="text-sm space-y-1">
                          {validation.warnings.map((warning, i) => (
                            <p key={i}>{warning}</p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 3: AI Settings */}
            {step === 3 && (
              <div className="space-y-6">
                <Card className="glass border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="hrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          AI Vault Manager
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Let Claude AI monitor your vault 24/7 and
                          automatically rebalance before liquidation. AI will
                          compound rewards and maintain your target health
                          factor.
                        </p>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-white/10">
                          <div>
                            <div className="font-medium">
                              Enable AI Auto-Rebalance
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Recommended for all vaults
                            </div>
                          </div>
                          <button
                            onClick={() => setEnableAI(!enableAI)}
                            className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                              enableAI ? "bg-primary" : "bg-muted",
                            )}
                          >
                            <span
                              className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                enableAI ? "translate-x-6" : "translate-x-1",
                              )}
                            />
                          </button>
                        </div>

                        {enableAI && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-4 space-y-3"
                          >
                            <div className="text-sm font-medium">
                              AI Features:
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>
                                  Monitor health factor every 5 minutes
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>
                                  Auto-rebalance if health drops below 1.5×
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>
                                  Compound staking rewards automatically
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>Send alerts via Telegram/Email</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Optional: Strategy Selection */}
                <Card className="glass">
                  <CardContent className="p-6">
                    <div className="text-sm font-medium mb-3">
                      Clone Strategy (Optional)
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Apply a proven strategy from our marketplace to your vault
                    </p>
                    <Button variant="outline" className="w-full">
                      Browse Strategies
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <Card className="glass border-primary/20">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg">Vault Summary</h3>

                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Collateral
                        </div>
                        <div className="text-xl font-bold font-mono">
                          {collateral} octSUI
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ≈ {formatCurrency(collateralNum * MOCK_PRICE)}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">
                          Borrow
                        </div>
                        <div className="text-xl font-bold font-mono">
                          {borrowAmount} octUSD
                        </div>
                        <div className="text-xs text-muted-foreground">
                          0% interest
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <HealthFactorGauge
                        value={healthFactor}
                        size="md"
                        showLiquidationPrice
                        liquidationPrice={liquidationPrice}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          LTV Ratio:
                        </span>
                        <span className="ml-2 font-semibold">
                          {ltv.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Net APY:</span>
                        <span className="ml-2 font-semibold text-green-500">
                          {formatPercent(netAPY / 100)}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          AI Manager:
                        </span>
                        <span className="ml-2 font-semibold">
                          {enableAI ? "✅ Enabled" : "❌ Disabled"}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Strategy:</span>
                        <span className="ml-2 font-semibold">
                          {selectedStrategy || "None"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-primary shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium mb-2">Transaction Details</p>
                        <div className="space-y-1 text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Minting Fee (0.5%):</span>
                            <span className="font-mono">
                              {formatCurrency(borrowNum * 0.005)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Estimated Gas:</span>
                            <span className="font-mono">~0.001 SUI</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          <div className="flex-1" />

          {step < 4 ? (
            <Button
              variant="electric"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed(step)}
              className="gap-2"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="electric"
              onClick={handleCreate}
              loading={isSubmitting}
              className="gap-2"
            >
              Create Vault
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Plus, ArrowRight, Zap, TrendingUp } from "lucide-react";
import { useVault, useCreateVault } from "@/sdk/index";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function BorrowPage() {
  const router = useRouter();
  const { vaultId, isLoading } = useVault();
  const { createVault, isPending } = useCreateVault();

  // Redirect to vault detail if vault exists
  useEffect(() => {
    if (vaultId && !isLoading) {
      router.push(`/borrow/${vaultId}`);
    }
  }, [vaultId, isLoading, router]);

  const handleCreateVault = async () => {
    try {
      const newVaultId = await createVault();
      if (newVaultId) {
        router.push(`/borrow/${newVaultId}`);
      }
    } catch (error) {
      console.error("Failed to create vault:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading vault data...</p>
        </div>
      </div>
    );
  }

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
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              {/* Page Header */}
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold mb-2"
                >
                  Create Your Vault
                </motion.h1>
                <p className="text-muted-foreground text-lg">
                  Start borrowing octUSD against your octSUI collateral
                </p>
              </div>

              {/* Main Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="glass border-primary/20">
                  <CardContent className="p-12 text-center">
                    <Shield className="h-20 w-20 text-primary mx-auto mb-6" />
                    <h3 className="text-3xl font-bold mb-3">
                      Create Your First Vault
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                      A vault allows you to deposit octSUI as collateral and
                      borrow octUSD stablecoin against it. You can only have one
                      vault per collateral type.
                    </p>

                    <Button
                      variant="electric"
                      size="lg"
                      onClick={handleCreateVault}
                      disabled={isPending}
                      className="gap-2"
                    >
                      {isPending ? (
                        <>Creating Vault...</>
                      ) : (
                        <>
                          <Plus className="h-5 w-5" />
                          Create Vault
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Info Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="glass">
                    <CardContent className="p-6">
                      <Shield className="h-12 w-12 text-cyan-500 mb-4" />
                      <h4 className="font-semibold mb-2">Deposit Collateral</h4>
                      <p className="text-sm text-muted-foreground">
                        Deposit your octSUI tokens as collateral to secure your
                        borrowing position
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="glass">
                    <CardContent className="p-6">
                      <TrendingUp className="h-12 w-12 text-green-500 mb-4" />
                      <h4 className="font-semibold mb-2">Borrow octUSD</h4>
                      <p className="text-sm text-muted-foreground">
                        Borrow up to 70% of your collateral value in octUSD
                        stablecoin at 0% interest
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="glass">
                    <CardContent className="p-6">
                      <Zap className="h-12 w-12 text-amber-500 mb-4" />
                      <h4 className="font-semibold mb-2">AI Protection</h4>
                      <p className="text-sm text-muted-foreground">
                        Optional AI agent can automatically manage your vault to
                        prevent liquidation
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* How It Works */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>How Vaults Work</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <div className="shrink-0 h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">
                          Deposit octSUI Collateral
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Your octSUI continues earning staking rewards while
                          locked as collateral
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="shrink-0 h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">
                          Borrow Against Collateral
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Mint octUSD stablecoin worth up to 70% of your
                          collateral value
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="shrink-0 h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">
                          Maintain Healthy Position
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Keep your LTV below 70% to avoid liquidation. AI can
                          help manage this automatically.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="shrink-0 h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">
                          Repay and Withdraw
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Repay your debt anytime to unlock and withdraw your
                          collateral
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <div className="flex gap-4 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/stake">Stake SUI First</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/strategies">View Strategies</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  Waves,
  Brain,
  Shield,
  Zap,
  TrendingUp,
  Bot,
  Database,
  Lock,
  ArrowRight,
  Github,
  Twitter,
  MessageCircle,
  ChevronDown,
  Settings,
  LogOut,
  Wallet,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useWalletStore } from "@/store/wallet-store";
import { useUIStore } from "@/store/ui-store";
import { usePhantomWallet } from "@/hooks/usePhantomWallet";
import { formatCurrency, truncateAddress } from "@/lib/utils";

export default function LandingPage() {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { address, connected, balance, disconnect } = useWalletStore();
  const { toggleSidebar, notifications } = useUIStore();
  const { connectWallet, disconnectWallet } = usePhantomWallet();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10"
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.jpeg"
              alt="Octopus Logo"
              width={40}
              height={40}
              className="rounded-lg object-contain"
            />
            <span className="text-2xl font-bold gradient-text">
              Octopus Finance
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm hover:text-primary transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#stats"
              className="text-sm hover:text-primary transition-colors"
            >
              Stats
            </Link>

            {/* Wallet Connection */}
            {connected && address ? (
              <div className="relative">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                >
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="hidden sm:inline">
                    {truncateAddress(address)}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                <AnimatePresence>
                  {accountMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 glass border border-white/10 rounded-lg shadow-xl overflow-hidden"
                    >
                      {/* Balance Display */}
                      <div className="p-4 border-b border-white/10">
                        <div className="text-xs text-muted-foreground mb-2">
                          Total Balance
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">SUI</span>
                            <span className="font-mono font-bold">
                              {formatCurrency(Number(balance.sui) / 1e9)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">octSUI</span>
                            <span className="font-mono font-bold">
                              {formatCurrency(Number(balance.octSUI) / 1e9)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">octUSD</span>
                            <span className="font-mono font-bold">
                              {formatCurrency(Number(balance.octUSD) / 1e6)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/5 rounded-md transition-colors">
                          <Settings className="h-4 w-4" />
                          Settings
                        </button>
                        <button
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/5 rounded-md transition-colors text-red-400"
                          onClick={() => {
                            disconnectWallet();
                            setAccountMenuOpen(false);
                          }}
                        >
                          <LogOut className="h-4 w-4" />
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button
                variant="electric"
                className="gap-2"
                onClick={connectWallet}
              >
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Connect Wallet</span>
              </Button>
            )}
            {connected && (
              <Link href="/dashboard">
                <Button variant="electric" className="gap-2">
                  Launch App <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background mesh gradient */}
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="absolute inset-0 grid-pattern opacity-10" />

        {/* Animated connection lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
          <motion.line
            x1="10%" y1="20%"
            x2="90%" y2="80%"
            stroke="url(#gradient1)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.line
            x1="20%" y1="80%"
            x2="80%" y2="20%"
            stroke="url(#gradient2)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
              <stop offset="50%" stopColor="rgb(139, 92, 246)" stopOpacity="1" />
              <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0" />
              <stop offset="50%" stopColor="rgb(6, 182, 212)" stopOpacity="1" />
              <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block mb-6"
            >
              <div className="px-4 py-2 rounded-full border border-primary/50 bg-primary/10 backdrop-blur-sm">
                <span className="text-sm font-medium text-primary flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  First AI-Protected LST + CDP on Sui
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight font-display tracking-tight"
            >
              Borrow Stablecoins.
              <br />
              <span className="gradient-text text-shadow-glow">Never Get Liquidated.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              The first CDP with <span className="text-primary font-semibold">AI auto-rebalancing</span>.
              Borrow octUSD at <span className="text-green-500 font-semibold">0% interest</span> against your staked SUI.
              AI monitors 24/7 and rebalances before liquidation—automatically.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Button
                size="xl"
                variant="electric"
                className="gap-2 group px-10 h-16 text-lg relative overflow-hidden"
                asChild
              >
                <Link href="/dashboard">
                  <motion.span
                    className="relative z-10 flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start Earning Now
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </motion.span>
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="gap-2 px-10 h-16 text-lg border-white/20 hover:border-primary/50"
                asChild
              >
                <Link href="#how-it-works">
                  <motion.span
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Bot className="h-6 w-6" />
                    See How AI Works
                  </motion.span>
                </Link>
              </Button>
            </motion.div>

            {/* Value Props */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16 flex flex-wrap justify-center gap-6 text-sm"
            >
              {[
                { icon: CheckCircle, text: "0% Interest on Loans" },
                { icon: Shield, text: "AI Liquidation Protection" },
                { icon: TrendingUp, text: "Earn While You Borrow" },
                { icon: Zap, text: "Instant Borrowing" },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <item.icon className="h-4 w-4 text-green-500" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                { label: "Total Value Locked", value: "$125M+", icon: Lock, color: "text-cyan-500" },
                { label: "Vaults Protected", value: "12,450+", icon: Shield, color: "text-green-500" },
                { label: "Zero Liquidations", value: "100%", icon: Bot, color: "text-primary" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  <Card className="glass border-primary/20 spotlight">
                    <CardContent className="p-6 text-center">
                      <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                      <div className="text-3xl font-bold mb-1 counter-animate">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Floating animated elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 right-10 opacity-20 pointer-events-none hidden lg:block"
        >
          <div className="relative">
            {/* Main orb */}
            <div className="h-64 w-64 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 blur-2xl" />

            {/* Orbiting particles */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute top-0 left-1/2 h-4 w-4 rounded-full bg-cyan-400 blur-sm" />
            </motion.div>

            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute bottom-0 right-1/2 h-3 w-3 rounded-full bg-purple-400 blur-sm" />
            </motion.div>
          </div>
        </motion.div>

        {/* Secondary floating element */}
        <motion.div
          animate={{
            y: [0, 30, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/4 left-10 opacity-15 pointer-events-none hidden lg:block"
        >
          <div className="h-48 w-48 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-primary blur-3xl opacity-70" />
        </motion.div>

        {/* Floating code blocks (representing AI) */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute top-1/3 left-20 opacity-10 pointer-events-none hidden xl:block"
        >
          <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 backdrop-blur-sm font-mono text-xs text-primary">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <div className="h-2 w-2 rounded-full bg-red-500" />
            </div>
            <div className="space-y-1">
              <div className="h-2 w-24 bg-primary/30 rounded" />
              <div className="h-2 w-32 bg-primary/20 rounded" />
              <div className="h-2 w-20 bg-primary/40 rounded" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-5">
          <motion.div
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Floating geometric shapes */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 right-20 opacity-10 pointer-events-none hidden lg:block"
        >
          <div className="h-32 w-32 border-4 border-primary rounded-lg transform rotate-45" />
        </motion.div>

        <motion.div
          animate={{
            rotate: -360,
            y: [0, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 left-20 opacity-10 pointer-events-none hidden lg:block"
        >
          <div className="h-24 w-24 border-4 border-cyan-500" style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
        </motion.div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built Different. <span className="gradient-text">Built Better.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Revolutionary features that make borrowing safer, smarter, and more profitable
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Vault Protection",
                description:
                  "Claude AI monitors your vault every 5 minutes. When your health factor drops, it automatically adds collateral from your staking rewards—zero input required.",
                gradient: "from-purple-500 to-pink-500",
                stat: "24/7 Monitoring",
              },
              {
                icon: Database,
                title: "Strategy Marketplace",
                description:
                  "Clone battle-tested AI strategies from top performers. All stored on Walrus for transparency. Backtest history, performance metrics, everything verified on-chain.",
                gradient: "from-cyan-500 to-blue-500",
                stat: "Proven Strategies",
              },
              {
                icon: Zap,
                title: "Flash Liquidation Bots",
                description:
                  "Become a keeper and earn fees by protecting the protocol. AI predicts liquidations, executes with flash loans. Zero capital needed to start earning.",
                gradient: "from-orange-500 to-red-500",
                stat: "Instant Execution",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="h-full glass border-primary/20 hover:border-primary/50 transition-all group cursor-pointer spotlight overflow-hidden">
                  <CardContent className="p-8 relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <feature.icon className="h-24 w-24" />
                    </div>
                    <div
                      className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-primary/20`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold mb-2 font-display">{feature.title}</h3>
                      <div className="text-xs text-primary font-semibold">{feature.stat}</div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.sin(i) * 50, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
            className="absolute pointer-events-none"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
          >
            <div className="h-2 w-2 rounded-full bg-primary blur-sm" />
          </motion.div>
        ))}

        {/* Glowing orbs */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 blur-3xl pointer-events-none"
        />

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 blur-3xl pointer-events-none"
        />

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              From Zero to <span className="gradient-text">DeFi Hero</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Start earning in 3 simple steps
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-8">
            {[
              {
                step: "01",
                title: "Stake SUI, Get octSUI",
                description:
                  "Stake your SUI tokens to receive octSUI—liquid staking tokens that earn ~7% APY automatically. Your SUI keeps working while you unlock its full potential.",
                icon: Waves,
                benefit: "Earn 7% APY while borrowing",
              },
              {
                step: "02",
                title: "Borrow octUSD (0% Interest)",
                description:
                  "Use octSUI as collateral to borrow octUSD stablecoin. No interest. No hidden fees. Borrow up to 70% of your collateral value and deploy capital however you want.",
                icon: TrendingUp,
                benefit: "0% interest, 70% LTV",
              },
              {
                step: "03",
                title: "Enable AI Auto-Pilot",
                description:
                  "Activate Claude AI to watch your vault 24/7. When health dips, AI automatically uses your staking rewards to add collateral. Sleep peacefully—liquidation is impossible.",
                icon: Bot,
                benefit: "100% liquidation protection",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <Card className="glass border-primary/20 overflow-hidden group hover:border-primary/40 transition-all">
                  <CardContent className="p-8 flex items-start gap-6">
                    <div className="shrink-0">
                      <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <item.icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-mono text-primary mb-2">
                        STEP {item.step}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-semibold mb-3">
                        <CheckCircle className="h-3 w-3" />
                        {item.benefit}
                      </div>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card className="animated-border overflow-hidden">
              <CardContent className="p-12 md:p-16 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Stop Worrying About Liquidation.
                  <br />
                  <span className="gradient-text">Start Earning Today.</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of users who sleep soundly knowing their vaults are protected by AI.
                  No liquidations. No stress. Just yields.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button
                    size="xl"
                    variant="electric"
                    className="gap-2 min-w-[200px] h-14 text-lg"
                    asChild
                  >
                    <Link href="/dashboard">
                      <motion.span
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Launch App
                        <ArrowRight className="h-5 w-5" />
                      </motion.span>
                    </Link>
                  </Button>
                  <Button
                    size="xl"
                    variant="outline"
                    className="gap-2 min-w-[200px] h-14 text-lg"
                    asChild
                  >
                    <Link href="https://discord.gg/octopus">
                      <motion.span
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <MessageCircle className="h-5 w-5" />
                        Join Community
                      </motion.span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.jpeg"
                alt="Octopus Logo"
                width={24}
                height={24}
                className="rounded-md object-contain"
              />
              <span className="font-bold gradient-text">Octopus Finance</span>
            </div>

            <div className="flex gap-6">
              <Link
                href="https://github.com/octopus-fi"
                className="text-muted-foreground hover:text-primary transition-colors"
                target="_blank"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://twitter.com/OctopusFi"
                className="text-muted-foreground hover:text-primary transition-colors"
                target="_blank"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://discord.gg/octopus"
                className="text-muted-foreground hover:text-primary transition-colors"
                target="_blank"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2026 Octopus Finance. Built on Sui • Secured by AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

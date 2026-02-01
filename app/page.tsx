"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";

export default function LandingPage() {
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
            <Waves className="h-8 w-8 text-primary" />
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
            <Link href="/dashboard">
              <Button variant="electric" className="gap-2">
                Launch App <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background mesh gradient */}
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="absolute inset-0 grid-pattern opacity-10" />

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
                <span className="text-sm font-medium text-primary">
                  🎯 First AI-Managed CDP on Sui
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            >
              Never Get{" "}
              <span className="gradient-text text-shadow-glow">Liquidated</span>{" "}
              Again
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto"
            >
              AI agents monitor your vault 24/7, auto-rebalance before
              liquidation, and maximize your yield while you sleep. Built on
              Sui, powered by Claude.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="xl" variant="electric" className="gap-2 group">
                Start Earning
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="xl" variant="outline" className="gap-2">
                <Github className="h-5 w-5" />
                View Docs
              </Button>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                { label: "Total Value Locked", value: "$125M", icon: Lock },
                { label: "Vaults Protected", value: "12,450", icon: Shield },
                { label: "Avg Health Factor", value: "2.3×", icon: TrendingUp },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  <Card className="glass border-primary/20 spotlight">
                    <CardContent className="p-6 text-center">
                      <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
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

        {/* Floating octopus animation */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 right-10 opacity-20 pointer-events-none hidden lg:block"
        >
          <Waves className="h-64 w-64 text-primary" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 relative">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why <span className="gradient-text">Octopus Finance</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three breakthrough innovations that make DeFi safer and smarter
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Vault Manager",
                description:
                  "Claude monitors your vault every 5 minutes, auto-rebalances before liquidation, and compounds rewards automatically.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Database,
                title: "Walrus Strategy Marketplace",
                description:
                  "Clone proven strategies stored immutably on Walrus. Backtest data, performance history, all verifiable.",
                gradient: "from-cyan-500 to-blue-500",
              },
              {
                icon: Zap,
                title: "Flash Liquidations",
                description:
                  "AI keepers predict liquidations in advance, execute with flash loans. Zero upfront capital needed.",
                gradient: "from-orange-500 to-red-500",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <Card className="h-full glass border-primary/20 hover:border-primary/40 transition-all group cursor-pointer spotlight">
                  <CardContent className="p-8">
                    <div
                      className={`h-16 w-16 rounded-2xl gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
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
      <section id="how-it-works" className="py-20 px-6 relative">
        <div className="absolute inset-0 gradient-to-b from-transparent via-primary/5 to-transparent" />

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              From zero to earning in 3 simple steps
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-8">
            {[
              {
                step: "01",
                title: "Stake & Borrow",
                description:
                  "Stake SUI → Receive octSUI → Borrow octUSD at 0% interest. Your capital works while earning staking rewards.",
                icon: Waves,
              },
              {
                step: "02",
                title: "Enable AI Guardian",
                description:
                  "Activate Claude AI to monitor your vault 24/7. It auto-rebalances if health drops below 1.5×, preventing liquidation.",
                icon: Bot,
              },
              {
                step: "03",
                title: "Sleep Peacefully",
                description:
                  "AI handles everything: compounds rewards, rebalances positions, sends alerts. You just watch your balance grow.",
                icon: Shield,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <Card className="glass border-primary/20 overflow-hidden">
                  <CardContent className="p-8 flex items-start gap-6">
                    <div className="shrink-0">
                      <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                        <item.icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-mono text-primary mb-2">
                        STEP {item.step}
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
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
                  Ready to Join the Future of DeFi?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Start earning with AI-protected vaults. No liquidations. No
                  stress. Just yields.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="xl"
                    variant="electric"
                    className="gap-2 animate-pulse-glow"
                  >
                    Launch App
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button size="xl" variant="outline" className="gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Join Discord
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
              <Waves className="h-6 w-6 text-primary" />
              <span className="font-bold gradient-text">Octopus Finance</span>
            </div>

            <div className="flex gap-6">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2026 Octopus Finance. Built with 🐙 for HackMoney
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

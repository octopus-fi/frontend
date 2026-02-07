"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Waves,
  Menu,
  X,
  Wallet,
  LogOut,
  Settings,
  Bell,
  ChevronDown,
} from "lucide-react";
import { useWalletStore } from "@/store/wallet-store";
import { useUIStore } from "@/store/ui-store";
import { usePhantomWallet } from "@/hooks/usePhantomWallet";
import { truncateAddress, formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "@/sdk/hooks";

export function Header() {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { address, connected, disconnect } = useWalletStore();
  const { mocksuiBalance, octsuiBalance, octusdBalance } = useDashboard();
  const { toggleSidebar, notifications } = useUIStore();
  const { connectWallet, disconnectWallet } = usePhantomWallet();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 glass-dark">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Left: Logo + Menu Toggle */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/" className="flex items-center gap-2">
            <Waves className="h-6 w-6 text-primary animate-float" />
            <span className="hidden sm:inline font-bold gradient-text text-xl">
              Octopus Finance
            </span>
          </Link>
        </div>

        {/* Right: Balance + Notifications + Wallet */}
        <div className="flex items-center gap-4">
          {/* Real-time Balances (Desktop Only) */}
          {connected && address && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:flex items-center gap-6 pr-4 border-r border-white/10"
            >
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground leading-none mb-1 uppercase tracking-wider">SUI</span>
                <span className="text-sm font-mono font-bold text-primary">
                  {(Number(mocksuiBalance) / 1e9).toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground leading-none mb-1 uppercase tracking-wider">octSUI</span>
                <span className="text-sm font-mono font-bold text-primary">
                  {(Number(octsuiBalance) / 1e9).toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground leading-none mb-1 uppercase tracking-wider">octUSD</span>
                <span className="text-sm font-mono font-bold text-green-500">
                  {formatCurrency(Number(octusdBalance) / 1e9)}
                </span>
              </div>
            </motion.div>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative group">
            <Bell className="h-5 w-5 group-hover:text-primary transition-colors" />
            {unreadCount > 0 && (
              <Badge
                variant="danger"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>

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
                            {formatCurrency(Number(mocksuiBalance) / 1e9)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">octSUI</span>
                          <span className="font-mono font-bold">
                            {formatCurrency(Number(octsuiBalance) / 1e9)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">octUSD</span>
                          <span className="font-mono font-bold">
                            {formatCurrency(Number(octusdBalance) / 1e9)}
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
        </div>
      </div>
    </header>
  );
}

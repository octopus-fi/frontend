'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Waves,
  Menu,
  Wallet,
  LogOut,
  Settings,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { useWalletStore } from '@/store/wallet-store';
import { useUIStore } from '@/store/ui-store';
import { truncateAddress, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { address, connected, balance, disconnect } = useWalletStore();
  const { toggleSidebar, notifications } = useUIStore();
  
  const unreadCount = notifications.filter(n => !n.read).length;

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

        {/* Right: Notifications + Wallet */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
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
                          disconnect();
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
            <Button variant="electric" className="gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline cursor-pointer">Connect Wallet</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
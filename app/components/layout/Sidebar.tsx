'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Waves,
  Coins,
  Store,
  MessageSquare,
  Activity,
  Zap,
  TrendingUp,
  Settings,
  BookOpen,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Stake',
    href: '/stake',
    icon: Waves,
    badge: '~7% APY',
  },
  {
    name: 'Borrow',
    href: '/borrow',
    icon: Coins,
  },
  {
    name: 'Strategies',
    href: '/strategies',
    icon: Store,
    badge: 'New',
    badgeVariant: 'electric' as const,
  },
  {
    name: 'AI Chat',
    href: '/chat',
    icon: MessageSquare,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: TrendingUp,
  },
  {
    name: 'Liquidate',
    href: '/liquidate',
    icon: Zap,
  },
];

const bottomNavigation = [
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
  {
    name: 'Docs',
    href: '/docs',
    icon: BookOpen,
    external: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-white/10 glass-dark lg:translate-x-0",
          "lg:static lg:z-auto"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
            <div className="flex items-center gap-2">
              <Waves className="h-6 w-6 text-primary" />
              <span className="font-bold gradient-text">Octopus</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group relative overflow-hidden",
                    isActive
                      ? "bg-primary/10 text-primary shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                  // onClick={() => setSidebarOpen(false)}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-0 h-full w-1 bg-primary"
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    />
                  )}

                  <item.icon className={cn(
                    "h-5 w-5 shrink-0",
                    isActive && "animate-pulse"
                  )} />
                  
                  <span className="flex-1">{item.name}</span>
                  
                  {item.badge && (
                    <Badge 
                      variant={item.badgeVariant || "secondary"} 
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}

                  {/* Hover effect */}
                  <div className="absolute inset-0 gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                </Link>
              );
            })}
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t border-white/10 p-4 space-y-1">
            {bottomNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Version Badge */}
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>v1.0.0-beta</span>
              <Badge variant="success" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Testnet
              </Badge>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import { usePoolStats } from '@/sdk/index';
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
import { AgentStatusIndicator } from '@/components/agent/AgentActivityPanel';
import { formatPercent } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { data: poolStats } = usePoolStats();

  // Calculate APY from pool stats
  const estimatedApy = poolStats
    ? (poolStats.rewardRateBps * 365) / 100
    : 7.2;

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
      badge: `~${formatPercent(estimatedApy / 100)}`,
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
      href: '/settings',
      icon: Settings,
    },
    {
      name: 'Docs',
      href: '/docs',
      icon: BookOpen,
      external: true,
    },
  ];

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
          'fixed top-0 left-0 z-50 h-screen w-64 glass border-r border-primary/10',
          'flex flex-col',
          'lg:translate-x-0 lg:static',
          !sidebarOpen && 'pointer-events-none lg:pointer-events-auto'
        )}
      >
        {/* Close button for mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <div className="p-6 border-b border-primary/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:shadow-primary/50 transition-shadow">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg gradient-text">Octopus</h2>
              <p className="text-xs text-muted-foreground">Finance</p>
            </div>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all group',
                  'hover:bg-white/5 hover:shadow-md',
                  isActive && 'gradient-to-r from-primary/20 to-secondary/20 shadow-lg border border-primary/20'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                  )}
                />
                <span
                  className={cn(
                    'flex-1 font-medium transition-colors',
                    isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {item.name}
                </span>
                {item.badge && (
                  <Badge
                    variant={item.badgeVariant || 'outline'}
                    className="text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-primary/10 space-y-1">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                onClick={() => !item.external && setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all group',
                  'hover:bg-white/5',
                  isActive && 'bg-white/5'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                  )}
                />
                <span
                  className={cn(
                    'flex-1 font-medium transition-colors',
                    isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Agent Connection Status */}
        <div className="p-4 bg-primary/5 border-t border-primary/10">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              AI Agent Status
            </span>
            <AgentStatusIndicator />
          </div>
        </div>
      </motion.aside>
    </>
  );
}
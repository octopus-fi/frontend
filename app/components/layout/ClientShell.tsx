'use client';

import { WalletProvider } from '@/providers/WalletProvider';

export function ClientShell({ children }: { children: React.ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
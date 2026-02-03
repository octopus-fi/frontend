'use client';

import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider as DappKitWalletProvider } from '@mysten/dapp-kit';
import { getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';

// ─── QueryClient ─────────────────────────────────────────────────────────────
// Created inside the component (not at module scope) so Next.js does not share
// a single instance across concurrent server requests.

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // dapp-kit polls wallet state internally; keep staleTime at 0 so hooks
        // always re-fetch on mount, but don't hammer the node on transient errors.
        retry: 1,
      },
    },
  });
}

// ─── Network → URL map ───────────────────────────────────────────────────────
// getFullnodeUrl ships with @mysten/sui and returns the canonical fullnode URL
// for each network.  We use it as the default and allow env-var overrides so
// the team can point at a private RPC in CI or staging.

const networkUrls = {
  mainnet: { url: process.env.NEXT_PUBLIC_SUI_MAINNET_RPC || getJsonRpcFullnodeUrl('mainnet'), network: 'mainnet' as const },
  testnet: { url: process.env.NEXT_PUBLIC_SUI_TESTNET_RPC || getJsonRpcFullnodeUrl('testnet'), network: 'testnet' as const },
  devnet: { url: process.env.NEXT_PUBLIC_SUI_DEVNET_RPC || getJsonRpcFullnodeUrl('devnet'), network: 'devnet' as const },
} as const;

// ─── Active network ──────────────────────────────────────────────────────────
// Driven by an env var; defaults to testnet during development.

type NetworkName = keyof typeof networkUrls;
const activeNetwork: NetworkName =
  (process.env.NEXT_PUBLIC_SUI_NETWORK as NetworkName) ?? 'testnet';

// ─── Provider tree ───────────────────────────────────────────────────────────
//
// SuiClientProvider   – creates a SuiClient (fullnode RPC wrapper) and makes it
//                        available via useSuiClient().  We pass the URL directly
//                        rather than the network name so that env-var overrides
//                        are respected.
//
// DappKitWalletProvider – discovers wallets via the Sui Standard Wallet
//                          interface, manages connect/disconnect state, and
//                          exposes it through useCurrentAccount(),
//                          useConnectWallet(), useDisconnectWallet(), etc.
//                          autoconnectPriority lets us silently reconnect a
//                          previously-approved wallet on page load.

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => createQueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkUrls} defaultNetwork={activeNetwork}>
        <DappKitWalletProvider
        >
          {children}
        </DappKitWalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WalletState, TokenBalance } from "../types"

interface WalletStore extends WalletState {
  connect: (address: string) => void;
  disconnect: () => void;
  setNetwork: (network: 'mainnet' | 'testnet') => void;
  updateBalance: (balance: Partial<TokenBalance>) => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      // Initial state
      address: null,
      connected: false,
      network: 'testnet',
      balance: {
        sui: 0n,
        octSUI: 0n,
        octUSD: 0n,
      },
      
      // Actions
      connect: (address) => {
        set({ address, connected: true });
      },
      
      disconnect: () => {
        set({ 
          address: null, 
          connected: false,
          balance: {
            sui: 0n,
            octSUI: 0n,
            octUSD: 0n,
          }
        });
      },
      
      setNetwork: (network) => {
        set({ network });
      },
      
      updateBalance: (newBalance) => {
        set((state) => ({
          balance: { ...state.balance, ...newBalance }
        }));
      },
    }),
    {
      name: 'octopus-wallet-storage',
      // Only persist these fields
      partialize: (state) => ({
        address: state.address,
        network: state.network,
      }),
    }
  )
);
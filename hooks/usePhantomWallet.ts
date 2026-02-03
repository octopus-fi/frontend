"use client";

import { useEffect, useCallback } from "react";
import {
  useConnectWallet,
  useDisconnectWallet,
  useCurrentAccount,
  useSuiClient,
  useWallets,
} from "@mysten/dapp-kit";
import { useWalletStore } from "@/store/wallet-store";
import { useUIStore } from "@/store/ui-store";
import {toast} from "react-hot-toast"
// ─── Preferred wallet names (checked in order) ──────────────────────────────
// These match the `name` field each wallet extension registers under the Sui
// Standard Wallet interface.  If none of these are installed we fall back to
// the standard picker (connectAsync with no wallet argument).

const PREFERRED_WALLETS = ["Slush","Phantom", "Sui Wallet", "OKX Wallet"] as const;

export function usePhantomWallet() {
  // ── dapp-kit primitives ───────────────────────────────────────────────────
  const { mutateAsync: connectAsync } = useConnectWallet();
  const { mutateAsync: disconnectAsync } = useDisconnectWallet();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const wallets = useWallets(); // live list of detected wallet extensions

  // ── Zustand stores ────────────────────────────────────────────────────────
  const { connect, disconnect, updateBalance } = useWalletStore();
  const { addNotification, setLoading } = useUIStore();

  // ── Sync dapp-kit account → Zustand ───────────────────────────────────────
  // Runs whenever dapp-kit's current account changes (connect, disconnect,
  // or the user switches accounts inside the wallet extension).
  useEffect(() => {
    if (currentAccount) {
      connect(currentAccount.address);
    } else {
      disconnect();
    }
  }, [currentAccount, connect, disconnect]);

  // ── Fetch live SUI balance → Zustand ──────────────────────────────────────
  useEffect(() => {
    if (!currentAccount) return;

    let cancelled = false;

    async function fetchBalance() {
      try {
        const balance = await suiClient.getBalance({
          owner: currentAccount!.address,
          coinType: "0x2::sui::SUI",
        });

        if (!cancelled) {
          // Store as bigint to match the TokenBalance type.
          // octSUI / octUSD balances need their own coin-type queries once
          // contract addresses are live; for now we only populate SUI.
          updateBalance({ sui: BigInt(balance.totalBalance) });
        }
      } catch {
        // Non-fatal — wallet is still connected even if balance fetch fails.
      }
    }

    fetchBalance();

    return () => {
      cancelled = true;
    };
  }, [currentAccount, suiClient, updateBalance]);

  // ── connectWallet ─────────────────────────────────────────────────────────
  // 1. Walk PREFERRED_WALLETS in priority order.
  // 2. If a match is found in the live wallet list, connect to it directly
  //    (no picker shown — feels instant).
  // 3. If nothing matches, call connectAsync with no wallet argument so
  //    dapp-kit opens the standard wallet-selection picker.
  const connectWallet = useCallback(async () => {
    setLoading("wallet", true);
    try {
      // Find the first preferred wallet the user actually has installed.
      const target = PREFERRED_WALLETS.reduce<(typeof wallets)[0] | undefined>(
        (found, name) => found ?? wallets.find((w) => w.name === name),
        undefined,
      );

      if (target) {
        await connectAsync({ wallet: target });
        addNotification({
          type: "success",
          title: "Wallet connected",
          message: "Your wallet is now connected to Octopus Finance.",
        });
      } else {
        // No preferred wallet detected — open the standard picker.
        // await connectAsync({ wallet: "Slush" });
        toast.error("Please Install Phantom or Slush wallet.")
      }

    } catch (err) {
      // User rejected or no wallet installed at all.
      const message =
        err instanceof Error ? err.message : "Connection was cancelled.";
      addNotification({
        type: "error",
        title: "Connection failed",
        message,
      });
    } finally {
      setLoading("wallet", false);
    }
  }, [connectAsync, wallets, addNotification, setLoading]);

  // ── disconnectWallet ──────────────────────────────────────────────────────
  const disconnectWallet = useCallback(async () => {
    try {
      await disconnectAsync();
    } catch {
      // Best-effort; clear local state regardless.
    }
    disconnect();
    addNotification({
      type: "info",
      title: "Wallet disconnected",
      message: "You have been disconnected from Octopus Finance.",
    });
  }, [disconnectAsync, disconnect, addNotification]);

  return { connectWallet, disconnectWallet };
}

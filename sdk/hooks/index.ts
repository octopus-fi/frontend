/**
 * 🐙 Octopus Finance - React Hooks
 *
 * Ready-to-use React hooks for common operations
 *
 * @package @mysten/dapp-kit - Sui dApp Kit
 * @package @tanstack/react-query - For data fetching
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useSuiClient,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";

// Import all our functions
import * as queries from "../queries";
import * as calculations from "../calculations";
import { buildStakeWithAmountTransaction } from "../transactions/stake";
import { buildUnstakeWithAmountTransaction } from "../transactions/unstake";
import { buildDepositCollateralWithAmountTransaction } from "../transactions/deposit-collateral";
import { buildBorrowTransaction } from "../transactions/borrow";
import { buildRepayWithAmountTransaction } from "../transactions/repay";
import { buildWithdrawCollateralTransaction } from "../transactions/withdraw-collateral";
import { buildClaimRewardsTransaction } from "../transactions/claim-rewards";
import { buildCreateVaultTransaction } from "../transactions/create-vault";
import { buildFullAISetupTransaction } from "../transactions/authorize-ai";
import { PROTOCOL_PARAMS } from "../constants";

// ============================================================================
// DATA HOOKS
// ============================================================================

/**
 * Hook to get user's vault data
 *
 * @example
 * ```tsx
 * function VaultDashboard() {
 *   const { vault, isLoading, error } = useVault();
 *
 *   if (isLoading) return <Spinner />;
 *   if (!vault) return <CreateVaultButton />;
 *
 *   return (
 *     <div>
 *       <p>Collateral: {formatAmount(vault.collateral)} octSUI</p>
 *       <p>Debt: {formatAmount(vault.debt)} octUSD</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useVault() {
  const client = useSuiClient();
  const account = useCurrentAccount();

  const vaultIdQuery = useQuery({
    queryKey: ["vaultId", account?.address],
    queryFn: () => queries.getUserVaultId(client, account!.address),
    enabled: !!account?.address,
  });

  const vaultStateQuery = useQuery({
    queryKey: ["vaultState", vaultIdQuery.data],
    queryFn: () => queries.getVaultState(client, vaultIdQuery.data!),
    enabled: !!vaultIdQuery.data,
  });

  return {
    vaultId: vaultIdQuery.data,
    vault: vaultStateQuery.data,
    isLoading: vaultIdQuery.isLoading || vaultStateQuery.isLoading,
    error: vaultIdQuery.error || vaultStateQuery.error,
    refetch: () => {
      vaultIdQuery.refetch();
      vaultStateQuery.refetch();
    },
  };
}

/**
 * Hook to get octSUI price
 */
export function useOctsuiPrice() {
  const client = useSuiClient();

  return useQuery({
    queryKey: ["octsuiPrice"],
    queryFn: () => queries.getOctsuiPriceUsd(client),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to get user's balances
 */
export function useBalances() {
  const client = useSuiClient();
  const account = useCurrentAccount();

  const octsui = useQuery({
    queryKey: ["balance", "octsui", account?.address],
    queryFn: () => queries.getUserOctsuiBalance(client, account!.address),
    enabled: !!account?.address,
  });

  const octusd = useQuery({
    queryKey: ["balance", "octusd", account?.address],
    queryFn: () => queries.getUserOctusdBalance(client, account!.address),
    enabled: !!account?.address,
  });

  const mocksui = useQuery({
    queryKey: ["balance", "mocksui", account?.address],
    queryFn: () => queries.getUserMocksuiBalance(client, account!.address),
    enabled: !!account?.address,
  });

  return {
    octsui: octsui.data ?? 0n,
    octusd: octusd.data ?? 0n,
    mocksui: mocksui.data ?? 0n,
    isLoading: octsui.isLoading || octusd.isLoading || mocksui.isLoading,
  };
}

/**
 * Hook to get stake positions
 */
export function useStakePosition() {
  const client = useSuiClient();
  const account = useCurrentAccount();

  const positionsQuery = useQuery({
    queryKey: ["stakePositions", account?.address],
    queryFn: () => queries.getUserStakePositions(client, account!.address),
    enabled: !!account?.address,
  });

  const positionId = positionsQuery.data?.[0]; // Get first position

  const stateQuery = useQuery({
    queryKey: ["stakePositionState", positionId],
    queryFn: () => queries.getStakePositionState(client, positionId!),
    enabled: !!positionId,
  });

  return {
    positionId,
    position: stateQuery.data,
    isLoading: positionsQuery.isLoading || stateQuery.isLoading,
    refetch: () => {
      positionsQuery.refetch();
      stateQuery.refetch();
    },
  };
}

/**
 * Hook to get pool stats
 */
export function usePoolStats() {
  const client = useSuiClient();

  return useQuery({
    queryKey: ["poolStats"],
    queryFn: () => queries.getPoolStats(client),
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook for vault health calculations
 */
export function useVaultHealth() {
  const { vault } = useVault();
  const { data: price } = useOctsuiPrice();

  if (!vault || !price) {
    return {
      ltv: 0,
      healthFactor: Infinity,
      status: "safe" as const,
      maxBorrow: 0,
      availableBorrow: 0,
      maxWithdraw: 0,
    };
  }

  const collateralValue = (Number(vault.collateral) / 1e9) * price;
  const debt = Number(vault.debt) / 1e9;

  const preview = calculations.calculateBorrowPreview(
    0,
    0,
    price,
    vault.collateral,
    vault.debt,
  );

  const withdrawPreview = calculations.calculateWithdrawPreview(
    0,
    price,
    vault.collateral,
    vault.debt,
  );

  return {
    ltv: preview.ltvPercent,
    healthFactor: preview.healthFactor,
    status: preview.healthStatus,
    maxBorrow: preview.maxBorrowUsd,
    availableBorrow: preview.availableToBorrowUsd,
    maxWithdraw: withdrawPreview.maxWithdrawable,
    collateralValueUsd: collateralValue,
    debtUsd: debt,
  };
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to stake MOCKSUI
 */
export function useStake() {
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  const stake = async (coinId: string, amount: bigint) => {
    const tx = buildStakeWithAmountTransaction({
      coinObjectId: coinId,
      amount,
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["balance"] });
            queryClient.invalidateQueries({ queryKey: ["stakePositions"] });
            resolve(result);
          },
          onError: reject,
        },
      );
    });
  };

  return { stake, isPending };
}

/**
 * Hook to borrow octUSD
 */
export function useBorrow() {
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const { vaultId } = useVault();

  const borrow = async (amount: bigint) => {
    if (!vaultId) throw new Error("No vault found");

    const tx = buildBorrowTransaction({ vaultId, amount });

    return new Promise((resolve, reject) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["vaultState"] });
            queryClient.invalidateQueries({ queryKey: ["balance"] });
            resolve(result);
          },
          onError: reject,
        },
      );
    });
  };

  return { borrow, isPending };
}

/**
 * Hook for easy borrow preview (like in the image)
 * Use this for real-time UI updates as user types
 */
export function useBorrowPreview(depositAmount: number, borrowAmount: number) {
  const { vault } = useVault();
  const { data: price } = useOctsuiPrice();

  if (!price) {
    return null;
  }

  return calculations.calculateBorrowPreview(
    depositAmount,
    borrowAmount,
    price,
    vault?.collateral ?? 0n,
    vault?.debt ?? 0n,
  );
}

/**
 * Hook to create vault
 */
export function useCreateVault() {
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  const createVault = async () => {
    const tx = buildCreateVaultTransaction();

    return new Promise<string>((resolve, reject) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["vaultId"] });

            // Extract new vault ID
            const created = result.objectChanges?.find(
              (c) =>
                c.type === "created" &&
                (c as any).objectType?.includes("Vault"),
            );
            resolve((created as any)?.objectId || "");
          },
          onError: reject,
        },
      );
    });
  };

  return { createVault, isPending };
}

// ============================================================================
// COMPLETE DASHBOARD STATE
// ============================================================================

/**
 * All-in-one hook for dashboard data
 */
export function useDashboard() {
  const vault = useVault();
  const balances = useBalances();
  const price = useOctsuiPrice();
  const health = useVaultHealth();
  const position = useStakePosition();
  const pool = usePoolStats();

  return {
    // Vault
    vaultId: vault.vaultId,
    collateral: vault.vault?.collateral ?? 0n,
    debt: vault.vault?.debt ?? 0n,
    rewardReserve: vault.vault?.rewardReserve ?? 0n,

    // Health
    ltv: health.ltv,
    healthFactor: health.healthFactor,
    healthStatus: health.status,
    maxBorrow: health.maxBorrow,
    availableBorrow: health.availableBorrow,
    maxWithdraw: health.maxWithdraw,

    // Balances
    octsuiBalance: balances.octsui,
    octusdBalance: balances.octusd,
    mocksuiBalance: balances.mocksui,

    // Price
    octsuiPrice: price.data ?? 0,

    // Staking
    stakePositionId: position.positionId,
    shares: position.position?.shares ?? 0n,
    pendingRewards: position.position?.pendingRewards ?? 0n,
    autoRebalanceEnabled: position.position?.autoRebalanceEnabled ?? false,

    // Pool
    totalStaked: pool.data?.totalStaked ?? 0n,
    estimatedApy: pool.data
      ? calculations.calculateEstimatedAPY(pool.data.rewardRateBps)
      : 0,

    // Loading
    isLoading: vault.isLoading || balances.isLoading || price.isLoading,

    // Refresh
    refetch: () => {
      vault.refetch();
      position.refetch();
    },
  };
}

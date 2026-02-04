/**
 * 🐙 Octopus Finance - Read/Query Functions
 *
 * Helper functions to read on-chain state
 *
 * @package @mysten/sui - Sui TypeScript SDK
 * @package @mysten/dapp-kit - For React hooks (useSuiJsonRpcClient)
 */

import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import {
  PACKAGE_ID,
  SHARED_OBJECTS,
  COIN_TYPES,
  PROTOCOL_PARAMS,
  VaultState,
  PositionState,
  PoolStats,
} from "../constants";

const { SCALING_FACTOR } = PROTOCOL_PARAMS;

// ============================================================================
// VAULT QUERIES
// ============================================================================

/**
 * Get user's vault ID from registry
 *
 * @example
 * ```tsx
 * import { useSuiJsonRpcClient, useCurrentAccount } from '@mysten/dapp-kit';
 * import { getUserVaultId } from './queries';
 *
 * function VaultInfo() {
 *   const client = useSuiJsonRpcClient();
 *   const account = useCurrentAccount();
 *   const [vaultId, setVaultId] = useState<string | null>(null);
 *
 *   useEffect(() => {
 *     if (account?.address) {
 *       getUserVaultId(client, account.address).then(setVaultId);
 *     }
 *   }, [account]);
 *
 *   return <div>Vault: {vaultId || 'No vault'}</div>;
 * }
 * ```
 */
export async function getUserVaultId(
  client: SuiJsonRpcClient,
  userAddress: string,
): Promise<string | null> {
  try {
    // Step 1: Fetch the VaultRegistry to get the internal table ID
    const registry = await client.getObject({
      id: SHARED_OBJECTS.VAULT_REGISTRY_OCTSUI_ID,
      options: { showContent: true },
    });

    if (registry.data?.content?.dataType !== 'moveObject') {
      console.log('VaultRegistry not found or invalid');
      return null;
    }

    const registryFields = registry.data.content.fields as any;
    const tableId = registryFields.vaults?.fields?.id?.id;

    if (!tableId) {
      console.log('Table ID not found in registry');
      return null;
    }

    // Step 2: Query the table's dynamic field for the user's vault
    const dynamicField = await client.getDynamicFieldObject({
      parentId: tableId,
      name: {
        type: 'address',
        value: userAddress,
      },
    });

    if (dynamicField.data?.content?.dataType === 'moveObject') {
      const fields = dynamicField.data.content.fields as any;
      // The value in the table is the vault object ID
      return fields.value || null;
    }

    return null;
  } catch (error) {
    // User doesn't have a vault registered
    console.log('No vault found for user:', userAddress, error);
    return null;
  }
}

/**
 * Get vault state (collateral, debt, reward_reserve)
 */
export async function getVaultState(
  client: SuiJsonRpcClient,
  vaultId: string,
): Promise<VaultState | null> {
  try {
    const object = await client.getObject({
      id: vaultId,
      options: { showContent: true },
    });

    if (object.data?.content?.dataType !== "moveObject") {
      return null;
    }

    const fields = object.data.content.fields as any;

    return {
      collateral: parseBalance(fields.collateral),
      debt: BigInt(fields.debt || 0),
      rewardReserve: parseBalance(fields.reward_reserve),
    };
  } catch {
    return null;
  }
}

/**
 * Get all vaults owned by user (for multi-collateral support)
 * Currently only supports OCTSUI vaults
 */
export async function getUserVaults(
  client: SuiJsonRpcClient,
  userAddress: string,
): Promise<Array<{ id: string; type: string }>> {
  // For now, we only support OCTSUI vaults
  // Query the registry for the user's vault
  const vaultId = await getUserVaultId(client, userAddress);

  if (vaultId) {
    return [{
      id: vaultId,
      type: `${PACKAGE_ID}::vault_manager::Vault<${COIN_TYPES.OCTSUI}>`,
    }];
  }

  return [];
}

// ============================================================================
// STAKE POSITION QUERIES
// ============================================================================

/**
 * Get user's stake positions
 */
export async function getUserStakePositions(
  client: SuiJsonRpcClient,
  userAddress: string,
): Promise<string[]> {
  const objects = await client.getOwnedObjects({
    owner: userAddress,
    filter: {
      StructType: `${PACKAGE_ID}::liquid_staking::StakePosition`,
    },
    options: { showContent: true },
  });

  return objects.data.map((obj) => obj.data?.objectId || "").filter(Boolean);
}

/**
 * Get stake position state
 */
export async function getStakePositionState(
  client: SuiJsonRpcClient,
  positionId: string,
): Promise<PositionState | null> {
  try {
    const object = await client.getObject({
      id: positionId,
      options: { showContent: true },
    });

    if (object.data?.content?.dataType !== "moveObject") {
      return null;
    }

    const fields = object.data.content.fields as any;

    return {
      shares: BigInt(fields.shares || 0),
      pendingRewards: BigInt(fields.pending_rewards || 0),
      autoRebalanceEnabled: fields.auto_rebalance_enabled || false,
      linkedVaultId: fields.linked_vault_id?.fields?.some || undefined,
      lastClaimTimeMs: parseInt(fields.last_claim_time_ms || '0'),
    };
  } catch {
    return null;
  }
}

/**
 * Find user's stake position from shared objects
 * Since StakePosition is a shared object, we need to query events or use known position ID
 * 
 * @param client - Sui JSON RPC client
 * @param userAddress - User's address
 * @returns Position ID and state if found
 */
export async function findUserStakePosition(
  client: SuiJsonRpcClient,
  userAddress: string,
): Promise<{ positionId: string; state: PositionState } | null> {
  try {
    // Query StakeEvent to find user's stake position
    // The StakeEvent contains the position creation info
    const events = await client.queryEvents({
      query: {
        MoveEventType: `${PACKAGE_ID}::liquid_staking::StakeEvent`,
      },
      limit: 50,
      order: 'descending',
    });

    // Find the most recent stake event for this user
    for (const eventData of events.data) {
      const event = eventData.parsedJson as any;
      if (event?.user === userAddress) {
        // We found a stake event for this user
        // Now we need to get the position - it was created in the same transaction
        // Get transaction effects to find created objects
        const txn = await client.getTransactionBlock({
          digest: eventData.id.txDigest,
          options: { showObjectChanges: true },
        });

        const createdPosition = txn.objectChanges?.find(
          (change) =>
            change.type === 'created' &&
            change.objectType.includes('StakePosition')
        );

        if (createdPosition && 'objectId' in createdPosition) {
          const state = await getStakePositionState(client, createdPosition.objectId);
          if (state) {
            return {
              positionId: createdPosition.objectId,
              state,
            };
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.log('Error finding stake position:', error);
    return null;
  }
}

// ============================================================================
// POOL QUERIES
// ============================================================================

/**
 * Get staking pool statistics
 */
export async function getPoolStats(
  client: SuiJsonRpcClient,
  poolId: string = SHARED_OBJECTS.STAKING_POOL_ID,
): Promise<PoolStats | null> {
  try {
    const object = await client.getObject({
      id: poolId,
      options: { showContent: true },
    });

    if (object.data?.content?.dataType !== "moveObject") {
      return null;
    }

    const fields = object.data.content.fields as any;

    return {
      totalShares: BigInt(fields.total_shares || 0),
      totalRewards: BigInt(fields.total_rewards || 0),
      rewardRateBps: parseInt(fields.reward_rate_bps || 0),
      totalStaked: parseBalance(fields.asset_balance),
    };
  } catch {
    return null;
  }
}

// ============================================================================
// PRICE QUERIES
// ============================================================================

/**
 * Get current octSUI price from oracle
 * Returns price in USD scaled by 1e9 (e.g., 3.5 USD = 3_500_000_000)
 */
export async function getOctsuiPrice(
  client: SuiJsonRpcClient,
  oracleId: string = SHARED_OBJECTS.ORACLE_ID,
): Promise<bigint> {
  try {
    // Step 1: Get the Oracle object to find the prices table ID
    const oracle = await client.getObject({
      id: oracleId,
      options: { showContent: true },
    });

    if (oracle.data?.content?.dataType !== "moveObject") {
      console.log('Oracle object not found');
      return 3_500_000_000n; // Fallback to $3.5
    }

    const fields = oracle.data.content.fields as any;
    const pricesTableId = fields.prices?.fields?.id?.id;

    if (!pricesTableId) {
      console.log('Prices table not found in Oracle');
      return 3_500_000_000n; // Fallback to $3.5
    }

    // Step 2: Query the dynamic field for OCTSUI price
    // The key is a TypeName with the full type path
    const dynamicField = await client.getDynamicFieldObject({
      parentId: pricesTableId,
      name: {
        type: '0x1::type_name::TypeName',
        value: {
          name: COIN_TYPES.OCTSUI.replace('0x', ''),
        },
      },
    });

    if (dynamicField.data?.content?.dataType === 'moveObject') {
      const priceFields = dynamicField.data.content.fields as any;
      return BigInt(priceFields.value || 3_500_000_000);
    }

    return 3_500_000_000n; // Fallback to $3.5
  } catch (error) {
    console.log('Error fetching price:', error);
    return 3_500_000_000n; // Fallback to $3.5
  }
}

/**
 * Get price as human-readable number
 */
export async function getOctsuiPriceUsd(
  client: SuiJsonRpcClient,
  oracleId: string = SHARED_OBJECTS.ORACLE_ID,
): Promise<number> {
  const priceRaw = await getOctsuiPrice(client, oracleId);
  return Number(priceRaw) / Number(SCALING_FACTOR);
}

// ============================================================================
// COIN QUERIES
// ============================================================================

/**
 * Get user's coin balances for a specific type
 */
export async function getUserCoins(
  client: SuiJsonRpcClient,
  userAddress: string,
  coinType: string,
): Promise<Array<{ id: string; balance: bigint }>> {
  const coins = await client.getCoins({
    owner: userAddress,
    coinType,
  });

  return coins.data.map((coin) => ({
    id: coin.coinObjectId,
    balance: BigInt(coin.balance),
  }));
}

/**
 * Get user's octSUI balance
 */
export async function getUserOctsuiBalance(
  client: SuiJsonRpcClient,
  userAddress: string,
): Promise<bigint> {
  const coins = await getUserCoins(client, userAddress, COIN_TYPES.OCTSUI);
  return coins.reduce((sum, c) => sum + c.balance, 0n);
}

/**
 * Get user's octUSD balance
 */
export async function getUserOctusdBalance(
  client: SuiJsonRpcClient,
  userAddress: string,
): Promise<bigint> {
  const coins = await getUserCoins(client, userAddress, COIN_TYPES.OCTUSD);
  return coins.reduce((sum, c) => sum + c.balance, 0n);
}

/**
 * Get user's MOCKSUI balance
 */
export async function getUserMocksuiBalance(
  client: SuiJsonRpcClient,
  userAddress: string,
): Promise<bigint> {
  const coins = await getUserCoins(client, userAddress, COIN_TYPES.MOCKSUI);
  return coins.reduce((sum, c) => sum + c.balance, 0n);
}

// ============================================================================
// AI CAPABILITY QUERIES
// ============================================================================

/**
 * Check if AI is authorized for a vault
 */
export async function isAIAuthorizedForVault(
  client: SuiJsonRpcClient,
  aiAgentAddress: string,
  vaultId: string,
): Promise<boolean> {
  const objects = await client.getOwnedObjects({
    owner: aiAgentAddress,
    filter: {
      StructType: `${PACKAGE_ID}::ai_adapter::AICapability`,
    },
    options: { showContent: true },
  });

  for (const obj of objects.data) {
    if (obj.data?.content?.dataType === "moveObject") {
      const fields = obj.data.content.fields as any;
      if (fields.authorized_vault_id === vaultId) {
        return true;
      }
    }
  }

  return false;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseBalance(balanceField: any): bigint {
  if (!balanceField) return 0n;

  // Handle different balance formats
  if (typeof balanceField === "string" || typeof balanceField === "number") {
    return BigInt(balanceField);
  }

  // Nested field structure
  const value = balanceField.fields?.value || balanceField.value || 0;
  return BigInt(value);
}

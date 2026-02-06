/**
 * 🐙 Octopus Finance - Liquidation Queries
 * 
 * Functions to query vaults and check liquidation eligibility
 */

// Use any for SuiClient type as it comes from useSuiClient hook
type SuiClient = any;

import {
    PACKAGE_ID,
    SHARED_OBJECTS,
    COIN_TYPES,
    PROTOCOL_PARAMS,
} from '../constants';

const { SCALING_FACTOR, LIQUIDATION_THRESHOLD_BPS, LIQUIDATION_BONUS_BPS, MAX_LTV_BPS } = PROTOCOL_PARAMS;

// Liquidatable vault data structure
export interface LiquidatableVaultData {
    id: string;
    owner: string;
    collateral: bigint;
    debt: bigint;
    healthFactor: number;
    ltvBps: number;
    collateralValue: number;
    isLiquidatable: boolean;
    estimatedProfit: number;
    urgency: 'critical' | 'high' | 'medium';
}

/**
 * Get vault state from object ID
 */
async function getVaultData(
    client: SuiClient,
    vaultId: string,
): Promise<{ owner: string; collateral: bigint; debt: bigint } | null> {
    try {
        const object = await client.getObject({
            id: vaultId,
            options: { showContent: true },
        });

        if (object.data?.content?.dataType !== 'moveObject') {
            return null;
        }

        const fields = object.data.content.fields as any;
        const collateral = BigInt(fields.collateral?.fields?.value || fields.collateral || 0);
        const debt = BigInt(fields.debt || 0);
        const owner = fields.owner || '';

        return { owner, collateral, debt };
    } catch {
        return null;
    }
}

/**
 * Get current octSUI price from oracle
 */
import { getOctsuiPrice } from './index';

/**
 * Get current octSUI price from oracle
 */
export async function getOraclePrice(client: SuiClient): Promise<number> {
    try {
        const priceRaw = await getOctsuiPrice(client);
        return Number(priceRaw) / 1e9;
    } catch {
        return 0;
    }
}

/**
 * Calculate if a vault is liquidatable and get its details
 */
export function calculateVaultLiquidationStatus(
    collateral: bigint,
    debt: bigint,
    price: number,
): { isLiquidatable: boolean; healthFactor: number; ltvBps: number; collateralValue: number } {
    if (debt === 0n) {
        return {
            isLiquidatable: false,
            healthFactor: Infinity,
            ltvBps: 0,
            collateralValue: (Number(collateral) / 1e9) * price,
        };
    }

    const collateralAmount = Number(collateral) / 1e9;
    const collateralValue = collateralAmount * price;
    const debtValue = Number(debt) / 1e9;

    if (collateralValue === 0) {
        return {
            isLiquidatable: true,
            healthFactor: 0,
            ltvBps: 10000,
            collateralValue: 0,
        };
    }

    // LTV = debt / collateralValue * 10000
    const ltvBps = Math.round((debtValue / collateralValue) * 10000);

    // Health factor = (collateralValue * liquidationThreshold) / debt
    const healthFactor = (collateralValue * (LIQUIDATION_THRESHOLD_BPS / 10000)) / debtValue;

    // Liquidatable if LTV > 80%
    const isLiquidatable = ltvBps > LIQUIDATION_THRESHOLD_BPS;

    return { isLiquidatable, healthFactor, ltvBps, collateralValue };
}

/**
 * Calculate estimated liquidation profit
 * Liquidator gets 5% bonus on the collateral they seize
 */
export function calculateLiquidationProfit(
    repayAmount: number,
    price: number,
): { collateralToSeize: number; profit: number } {
    if (price === 0) return { collateralToSeize: 0, profit: 0 };

    // Collateral to seize = repayAmount * (1 + bonus) / price
    const bonusMultiplier = 1 + (LIQUIDATION_BONUS_BPS / 10000);
    const collateralToSeize = (repayAmount * bonusMultiplier) / price;

    // Profit = bonus portion of collateral value
    const profit = repayAmount * (LIQUIDATION_BONUS_BPS / 10000);

    return { collateralToSeize, profit };
}

/**
 * Determine urgency based on health factor
 */
function getUrgency(healthFactor: number): 'critical' | 'high' | 'medium' {
    if (healthFactor < 1.05) return 'critical';
    if (healthFactor < 1.08) return 'high';
    return 'medium';
}

/**
 * Get all vaults from registry and check if any are liquidatable
 * For hackathon: queries known vault IDs or uses ownedObjects query
 */
export async function getLiquidatableVaults(
    client: SuiClient,
): Promise<LiquidatableVaultData[]> {
    const liquidatableVaults: LiquidatableVaultData[] = [];

    try {
        // Get oracle price first
        const price = await getOraclePrice(client);
        if (price === 0) {
            console.log('Could not get oracle price');
            return [];
        }

        // Query all shared objects of type Vault<OCTSUI>
        // For hackathon this is acceptable with few vaults
        const vaultType = `${PACKAGE_ID}::vault_manager::Vault<${COIN_TYPES.OCTSUI}>`;

        // Use queryEvents to find vault creation, or query owned objects
        // For simplicity, we'll scan shared objects
        let cursor: string | null = null;
        const seenVaults = new Set<string>();

        // Method: Query events for vault creation OR directly check known vaults
        // Since vaults are shared objects, we can use getObject on known IDs
        // For demo, let's also try to find vaults via event query

        const events = await client.queryEvents({
            query: {
                MoveEventType: `${PACKAGE_ID}::vault_manager::RebalanceEvent`,
            },
            limit: 50,
        });

        // Extract vault IDs from events
        for (const event of events.data) {
            const parsedJson = event.parsedJson as any;
            if (parsedJson?.vault_id) {
                seenVaults.add(parsedJson.vault_id);
            }
        }

        // Also try to get vaults from registry
        // Query the VaultRegistry's table entries
        try {
            const registry = await client.getObject({
                id: SHARED_OBJECTS.VAULT_REGISTRY_OCTSUI_ID,
                options: { showContent: true },
            });

            if (registry.data?.content?.dataType === 'moveObject') {
                const registryFields = registry.data.content.fields as any;
                const tableId = registryFields.vaults?.fields?.id?.id;

                if (tableId) {
                    // Query dynamic fields of the table
                    const dynamicFields = await client.getDynamicFields({
                        parentId: tableId,
                        limit: 50,
                    });

                    for (const field of dynamicFields.data) {
                        // Get the actual vault ID from the dynamic field
                        const fieldObj = await client.getObject({
                            id: field.objectId,
                            options: { showContent: true },
                        });

                        if (fieldObj.data?.content?.dataType === 'moveObject') {
                            const fieldContent = fieldObj.data.content.fields as any;
                            if (fieldContent.value) {
                                seenVaults.add(fieldContent.value);
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.log('Could not query registry:', e);
        }

        // Now check each vault for liquidation eligibility
        for (const vaultId of seenVaults) {
            const vaultData = await getVaultData(client, vaultId);
            if (!vaultData) continue;

            const status = calculateVaultLiquidationStatus(
                vaultData.collateral,
                vaultData.debt,
                price,
            );

            // Only include if liquidatable (or close to it for demo)
            // For demo purposes, let's include vaults with health < 1.1
            if (status.healthFactor < 1.15 && vaultData.debt > 0n) {
                const debtValue = Number(vaultData.debt) / 1e9;
                const { profit } = calculateLiquidationProfit(debtValue, price);

                liquidatableVaults.push({
                    id: vaultId,
                    owner: vaultData.owner,
                    collateral: vaultData.collateral,
                    debt: vaultData.debt,
                    healthFactor: status.healthFactor,
                    ltvBps: status.ltvBps,
                    collateralValue: status.collateralValue,
                    isLiquidatable: status.isLiquidatable,
                    estimatedProfit: profit,
                    urgency: getUrgency(status.healthFactor),
                });
            }
        }

        // Sort by urgency (critical first) then by profit
        liquidatableVaults.sort((a, b) => {
            const urgencyOrder = { critical: 0, high: 1, medium: 2 };
            if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
                return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
            }
            return b.estimatedProfit - a.estimatedProfit;
        });

    } catch (error) {
        console.error('Error fetching liquidatable vaults:', error);
    }

    return liquidatableVaults;
}

/**
 * Get detailed liquidation status for a specific vault
 */
export async function getVaultLiquidationDetails(
    client: SuiClient,
    vaultId: string,
): Promise<LiquidatableVaultData | null> {
    try {
        const price = await getOraclePrice(client);
        if (price === 0) return null;

        const vaultData = await getVaultData(client, vaultId);
        if (!vaultData) return null;

        const status = calculateVaultLiquidationStatus(
            vaultData.collateral,
            vaultData.debt,
            price,
        );

        const debtValue = Number(vaultData.debt) / 1e9;
        const { profit } = calculateLiquidationProfit(debtValue, price);

        return {
            id: vaultId,
            owner: vaultData.owner,
            collateral: vaultData.collateral,
            debt: vaultData.debt,
            healthFactor: status.healthFactor,
            ltvBps: status.ltvBps,
            collateralValue: status.collateralValue,
            isLiquidatable: status.isLiquidatable,
            estimatedProfit: profit,
            urgency: getUrgency(status.healthFactor),
        };
    } catch {
        return null;
    }
}

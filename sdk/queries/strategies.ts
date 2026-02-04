import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { PACKAGE_ID } from "../constants";
import { fetchStrategy, StrategyTemplate } from "@/lib/walrus/client";
import { Strategy } from "@/types/index";

/**
 * Fetch all registered strategies from on-chain events
 * Resolves the Walrus Blob content for each strategy
 */
export async function getRegisteredStrategies(client: SuiJsonRpcClient): Promise<Strategy[]> {
    try {
        // 1. Query StrategyRegistered events
        const events = await client.queryEvents({
            query: {
                MoveModule: {
                    package: PACKAGE_ID,
                    module: "strategy_registry",
                },
            },
            order: "descending",
        });

        const strategies: Strategy[] = [];

        // 2. Process events and fetch content
        for (const event of events.data) {
            if (event.type.includes("StrategyRegistered")) {
                const { name, blob_id } = event.parsedJson as { name: string; blob_id: string };

                // Fetch content from Walrus
                const template = await fetchStrategy(blob_id);

                if (template?.metadata) {
                    // Convert Template to Strategy format used by UI
                    strategies.push({
                        id: blob_id, // Use blobId as ID
                        name: template.metadata.name,
                        creator: template.metadata.creator || event.sender, // Fallback to event sender
                        walrusBlobId: blob_id,
                        description: template.metadata.description,
                        maxLtv: template.parameters.maxLtv,
                        targetHealth: template.parameters.targetHealth,
                        rebalanceThreshold: template.parameters.rebalanceThreshold,
                        autoCompound: template.parameters.autoCompound,
                        // Use stored stats or defaults
                        avg30dReturn: template.performance?.avg30dReturn || 0,
                        totalUsers: template.performance?.totalUsers || 0,
                        riskScore: template.performance?.riskScore || 5,
                        totalValueManaged: BigInt(template.performance?.totalValueManaged || 0),
                        verified: true, // Registered strategies are verified by definition (admin only)
                        createdAt: template.metadata.createdAt || Number(event.timestampMs) || Date.now(),
                        lastUpdated: Date.now(),
                        backtestPreview: [], // Would need real backtest data
                    });
                } else {
                    // Walrus blob not available (404/expired) - create placeholder with on-chain data
                    // This ensures we show registered strategies even if Walrus data is unavailable
                    strategies.push({
                        id: blob_id,
                        name: name || `Strategy ${blob_id.slice(0, 8)}...`,
                        creator: event.sender || 'Unknown',
                        walrusBlobId: blob_id,
                        description: '⚠️ Strategy data unavailable - Walrus blob may have expired on testnet',
                        maxLtv: 0,
                        targetHealth: 0,
                        rebalanceThreshold: 0,
                        autoCompound: false,
                        avg30dReturn: 0,
                        totalUsers: 0,
                        riskScore: 5,
                        totalValueManaged: 0n,
                        verified: true, // Still verified on-chain, just data unavailable
                        createdAt: Number(event.timestampMs) || Date.now(),
                        lastUpdated: Date.now(),
                        backtestPreview: [],
                        // @ts-ignore - Add flag to indicate data is unavailable
                        walrusDataUnavailable: true,
                    });
                }
            }
        }

        return strategies;
    } catch (e) {
        console.error("Failed to fetch registered strategies:", e);
        return [];
    }
}

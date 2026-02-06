/**
 * Walrus Storage Client
 * Handles interaction with Walrus decentralized storage for strategy marketplace
 */

import { Strategy, StrategyBacktest } from '@/types/index';

// Walrus configuration
const WALRUS_API_URL = process.env.NEXT_PUBLIC_WALRUS_API_URL || 'https://api.walrus.site';
const STORAGE_EPOCHS = 5; // Testnet limit - epochs are short on testnet

export interface WalrusUploadResponse {
  blobId: string;
  epochs: number;
  size: number;
  cost: number;
}

export interface StrategyMetadata {
  name: string;
  description: string;
  creator: string;
  version: string;
  createdAt: number;
  tags: string[];
}

export interface StrategyParameters {
  maxLtv: number;
  targetHealth: number;
  rebalanceThreshold: number;
  autoCompound: boolean;
  emergencyAction: 'add_collateral' | 'repay_debt';
}

export interface StrategyTemplate {
  metadata: StrategyMetadata;
  parameters: StrategyParameters;
  backtest: StrategyBacktest;
  performance: {
    avg30dReturn: number;
    totalUsers: number;
    riskScore: number;
    totalValueManaged: number;
  };
}

/**
 * Upload strategy to Walrus
 */
export async function uploadStrategy(
  strategy: StrategyTemplate
): Promise<WalrusUploadResponse> {
  try {
    // Serialize strategy to JSON
    const blob = new Blob([JSON.stringify(strategy, null, 2)], {
      type: 'application/json',
    });

    // Calculate size and cost
    const size = blob.size;
    const cost = calculateStorageCost(size, STORAGE_EPOCHS);

    // In production, this would upload to Walrus
    // Generate a temporary ID based on content hash if needed
    const blobId = await hashStrategy(strategy);

    // Store in localStorage for demo
    if (typeof window !== 'undefined') {
      const key = `walrus_blob_${blobId}`;
      const reader = new FileReader();

      const text = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsText(blob);
      });

      localStorage.setItem(key, text);
    }

    return {
      blobId,
      epochs: STORAGE_EPOCHS,
      size,
      cost,
    };
  } catch (error) {
    console.error('Failed to upload strategy:', error);
    throw new Error('Strategy upload failed');
  }
}

const WALRUS_AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";

/**
 * Fetch strategy from Walrus via Aggregator
 */
export async function fetchStrategy(
  blobId: string
): Promise<StrategyTemplate | null> {
  try {
    const response = await fetch(`${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`);

    if (!response.ok) {
      // console.warn(`Failed to fetch blob ${blobId}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    // Validate structure before returning
    if (!validateStrategyStructure(data)) {
      console.warn(`Invalid strategy structure for blob ${blobId}`);
      return null;
    }

    return data as StrategyTemplate;
  } catch (error) {
    console.error('Failed to fetch strategy:', error);
    return null;
  }
}

/**
 * List all available strategies
 * Note: This now requires a SuiClient to query chain events, 
 * so specific implementation should be in sdk/queries
 */
export async function listStrategies(): Promise<Strategy[]> {
  // Real listing happens in sdk/queries via events
  return [];
}

/**
 * Verify strategy blob integrity
 */
export async function verifyStrategy(
  blobId: string,
  expectedHash?: string
): Promise<boolean> {
  try {
    const strategy = await fetchStrategy(blobId);
    if (!strategy) return false;

    // In production, verify cryptographic hash matching the blobId or registry hash
    // For now we just validate structure
    return validateStrategyStructure(strategy);
  } catch (error) {
    return false;
  }
}

/**
 * Calculate storage cost
 */
function calculateStorageCost(bytes: number, epochs: number): number {
  // Walrus pricing: ~$0.10 per GB per year
  const costPerByte = 0.0000001; // $0.10 / 1GB
  return bytes * costPerByte * epochs;
}

/**
 * Generate a unique blob ID for temporary use
 */
function generateBlobId(): string {
  return '0x' + Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

/**
 * Hash strategy for verification
 */
async function hashStrategy(strategy: StrategyTemplate): Promise<string> {
  const text = JSON.stringify(strategy);
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback for non-browser environments
  return generateBlobId();
}

/**
 * Validate strategy structure
 */
function validateStrategyStructure(strategy: any): boolean {
  return (
    !!strategy &&
    !!strategy.metadata &&
    typeof strategy.metadata.name === 'string' &&
    !!strategy.parameters &&
    typeof strategy.parameters.maxLtv !== 'undefined'
  );
}

export default {
  uploadStrategy,
  fetchStrategy,
  listStrategies,
  verifyStrategy,
};
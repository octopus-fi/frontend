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
    // For now, simulate the upload
    const blobId = generateMockBlobId();

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
  // Return mocks for now, real listing happens in sdk/queries via events
  return getMockStrategies();
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
 * Generate mock blob ID
 */
function generateMockBlobId(): string {
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
  return generateMockBlobId();
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

/**
 * Generate mock strategy
 */
function generateMockStrategy(blobId: string): StrategyTemplate {
  const strategies = getMockStrategyTemplates();
  return strategies[Math.floor(Math.random() * strategies.length)];
}

/**
 * Get mock strategies for demo
 */
export function getMockStrategies(): Strategy[] {
  return [
    {
      id: '1',
      name: 'Conservative Farmer',
      creator: '0xAlice...',
      walrusBlobId: '0xabc123...',
      description: 'Low-risk strategy focused on stability. Maintains health above 2.0× and auto-compounds rewards weekly.',
      maxLtv: 50,
      targetHealth: 2.5,
      rebalanceThreshold: 2.0,
      autoCompound: true,
      avg30dReturn: 8.5,
      totalUsers: 342,
      riskScore: 2,
      totalValueManaged: 2450000n,
      verified: true,
      createdAt: Date.now() - 86400000 * 90,
      lastUpdated: Date.now() - 86400000 * 7,
      backtestPreview: [
        { date: 'Day 1', return: 0 },
        { date: 'Day 2', return: 0.2 },
        { date: 'Day 3', return: 0.5 },
        { date: 'Day 4', return: 0.4 },
        { date: 'Day 5', return: 0.7 },
        { date: 'Day 6', return: 0.9 },
        { date: 'Day 7', return: 1.2 },
      ],
    },
    {
      id: '2',
      name: 'Balanced Farmer',
      creator: '0xBob...',
      walrusBlobId: '0xdef456...',
      description: 'Moderate risk with balanced approach. Targets 1.8× health and leverages up to 65% LTV for higher yields.',
      maxLtv: 65,
      targetHealth: 1.8,
      rebalanceThreshold: 1.5,
      autoCompound: true,
      avg30dReturn: 14.2,
      totalUsers: 189,
      riskScore: 5,
      totalValueManaged: 1890000n,
      verified: true,
      createdAt: Date.now() - 86400000 * 60,
      lastUpdated: Date.now() - 86400000 * 3,
      backtestPreview: [
        { date: 'Day 1', return: 0 },
        { date: 'Day 2', return: 0.5 },
        { date: 'Day 3', return: 1.2 },
        { date: 'Day 4', return: 1.0 },
        { date: 'Day 5', return: 1.8 },
        { date: 'Day 6', return: 2.1 },
        { date: 'Day 7', return: 2.8 },
      ],
    },
    {
      id: '3',
      name: 'Aggressive Yield Maximizer',
      creator: '0xCarol...',
      walrusBlobId: '0xghi789...',
      description: 'High-risk, high-reward. Pushes LTV to 70% and maintains minimum safe health. For experienced users only.',
      maxLtv: 70,
      targetHealth: 1.4,
      rebalanceThreshold: 1.3,
      autoCompound: true,
      avg30dReturn: 22.7,
      totalUsers: 67,
      riskScore: 8,
      totalValueManaged: 890000n,
      verified: true,
      createdAt: Date.now() - 86400000 * 30,
      lastUpdated: Date.now() - 86400000 * 1,
      backtestPreview: [
        { date: 'Day 1', return: 0 },
        { date: 'Day 2', return: 1.0 },
        { date: 'Day 3', return: 2.5 },
        { date: 'Day 4', return: 1.8 },
        { date: 'Day 5', return: 3.2 },
        { date: 'Day 6', return: 3.8 },
        { date: 'Day 7', return: 4.5 },
      ],
    },
    {
      id: '4',
      name: 'Diamond Hands HODL',
      creator: '0xDave...',
      walrusBlobId: '0xjkl012...',
      description: 'Ultra-conservative strategy for long-term holders. Minimal borrowing, maximum safety. Never rebalances unless critical.',
      maxLtv: 40,
      targetHealth: 3.0,
      rebalanceThreshold: 2.5,
      autoCompound: true,
      avg30dReturn: 6.8,
      totalUsers: 521,
      riskScore: 1,
      totalValueManaged: 3200000n,
      verified: true,
      createdAt: Date.now() - 86400000 * 120,
      lastUpdated: Date.now() - 86400000 * 14,
      backtestPreview: [
        { date: 'Day 1', return: 0 },
        { date: 'Day 2', return: 0.1 },
        { date: 'Day 3', return: 0.3 },
        { date: 'Day 4', return: 0.4 },
        { date: 'Day 5', return: 0.5 },
        { date: 'Day 6', return: 0.6 },
        { date: 'Day 7', return: 0.8 },
      ],
    },
    {
      id: '5',
      name: 'Smart Rebalancer',
      creator: '0xEve...',
      walrusBlobId: '0xmno345...',
      description: 'AI-optimized strategy that dynamically adjusts based on market volatility. Increases safety during dumps, leverage during pumps.',
      maxLtv: 60,
      targetHealth: 2.0,
      rebalanceThreshold: 1.6,
      autoCompound: true,
      avg30dReturn: 16.4,
      totalUsers: 234,
      riskScore: 4,
      totalValueManaged: 1670000n,
      verified: true,
      createdAt: Date.now() - 86400000 * 45,
      lastUpdated: Date.now() - 86400000 * 2,
      backtestPreview: [
        { date: 'Day 1', return: 0 },
        { date: 'Day 2', return: 0.6 },
        { date: 'Day 3', return: 1.1 },
        { date: 'Day 4', return: 1.3 },
        { date: 'Day 5', return: 1.9 },
        { date: 'Day 6', return: 2.3 },
        { date: 'Day 7', return: 3.1 },
      ],
    },
    {
      id: '6',
      name: 'Volatility Surfer',
      creator: '0xFrank...',
      walrusBlobId: '0xpqr678...',
      description: 'Takes advantage of market volatility by actively rebalancing during price swings. Not for the faint of heart!',
      maxLtv: 68,
      targetHealth: 1.5,
      rebalanceThreshold: 1.35,
      autoCompound: true,
      avg30dReturn: 19.8,
      totalUsers: 98,
      riskScore: 7,
      totalValueManaged: 1120000n,
      verified: false,
      createdAt: Date.now() - 86400000 * 20,
      lastUpdated: Date.now() - 86400000 * 1,
      backtestPreview: [
        { date: 'Day 1', return: 0 },
        { date: 'Day 2', return: 0.8 },
        { date: 'Day 3', return: 2.1 },
        { date: 'Day 4', return: 1.5 },
        { date: 'Day 5', return: 2.8 },
        { date: 'Day 6', return: 3.2 },
        { date: 'Day 7', return: 3.9 },
      ],
    },
  ];
}

/**
 * Get mock strategy templates
 */
function getMockStrategyTemplates(): StrategyTemplate[] {
  const strategies = getMockStrategies();

  return strategies.map(s => ({
    metadata: {
      name: s.name,
      description: s.description,
      creator: s.creator,
      version: '1.0.0',
      createdAt: s.createdAt,
      tags: ['ai', 'auto-rebalance', 'verified'],
    },
    parameters: {
      maxLtv: s.maxLtv,
      targetHealth: s.targetHealth,
      rebalanceThreshold: s.rebalanceThreshold,
      autoCompound: s.autoCompound,
      emergencyAction: 'add_collateral',
    },
    backtest: {
      period: '30d',
      totalReturn: s.avg30dReturn,
      maxDrawdown: s.avg30dReturn * 0.3,
      sharpeRatio: 1.5 + (s.riskScore * 0.1),
      winRate: 75 - (s.riskScore * 2),
      historicalPerformance: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString(),
        return: (Math.random() * 2 - 0.5) * s.riskScore,
        cumulativeReturn: (i / 30) * s.avg30dReturn,
      })),
      rebalanceTriggers: [
        { condition: `health < ${s.rebalanceThreshold}`, action: 'add_collateral' },
        { condition: `ltv > ${s.maxLtv}%`, action: 'repay_debt' },
      ],
    },
    performance: {
      avg30dReturn: s.avg30dReturn,
      totalUsers: s.totalUsers,
      riskScore: s.riskScore,
      totalValueManaged: Number(s.totalValueManaged),
    },
  }));
}

export default {
  uploadStrategy,
  fetchStrategy,
  listStrategies,
  verifyStrategy,
  getMockStrategies,
};
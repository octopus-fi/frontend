// Core Vault Types
interface Vault {
  id: string;
  owner: string;
  collateral: bigint;
  debt: bigint;
  health: number;
  ltv: number;
  aiManaged: boolean;
  stakingApy: number;
  createdAt: number;
  lastUpdated: number;
  strategy?: VaultStrategy;
}

interface VaultStrategy {
  id: string;
  name: string;
  walrusBlobId: string;
  maxLtv: number;
  rebalanceThreshold: number;
  targetHealth: number;
  autoCompound: boolean;
  riskScore: number;
}

export interface VaultState {
  collateral: bigint;
  debt: bigint;
  rewardReserve: bigint;
}

export interface PositionState {
  shares: bigint;
  pendingRewards: bigint;
  autoRebalanceEnabled: boolean;
  linkedVaultId?: string;
}

export interface PoolStats {
  totalShares: bigint;
  totalRewards: bigint;
  rewardRateBps: number;
  totalStaked: bigint;
}

export interface LiquidationStatus {
  isLiquidatable: boolean;
  healthFactor: number;
  currentLtvBps: number;
  debt: bigint;
  collateral: bigint;
  collateralValue: bigint;
}

export interface HealthStatus {
  level: 'safe' | 'warning' | 'danger' | 'liquidatable';
  color: string;
  label: string;
}
// Strategy Marketplace Types
interface Strategy {
  id: string;
  name: string;
  creator: string;
  walrusBlobId: string;
  description: string;

  // Parameters
  maxLtv: number;
  targetHealth: number;
  rebalanceThreshold: number;
  autoCompound: boolean;

  // Performance
  avg30dReturn: number;
  totalUsers: number;
  riskScore: number;
  totalValueManaged: bigint;

  // Metadata
  verified: boolean;
  createdAt: number;
  lastUpdated: number;

  // Optional flag for unavailable Walrus data
  walrusDataUnavailable?: boolean;

  // Backtest preview (first 7 days)
  backtestPreview: Array<{
    date: string;
    return: number;
  }>;
}

interface StrategyBacktest {
  period: string;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  historicalPerformance: Array<{
    date: string;
    return: number;
    cumulativeReturn: number;
  }>;
  rebalanceTriggers: Array<{
    condition: string;
    action: string;
  }>;
}

// Token Balance Types
interface TokenBalance {
  sui: bigint;
  octSUI: bigint;
  octUSD: bigint;
}

// Transaction Types
interface Transaction {
  id: string;
  type: 'stake' | 'unstake' | 'borrow' | 'repay' | 'liquidate';
  amount: bigint;
  status: 'pending' | 'success' | 'failed';
  hash?: string;
  timestamp: number;
  error?: string;
}

// AI Chat Types
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    intent?: string;
    suggestedTransaction?: any;
  };
}

interface AIRebalanceEvent {
  vaultId: string;
  action: 'add_collateral' | 'repay_debt' | 'compound';
  amount: bigint;
  healthBefore: number;
  healthAfter: number;
  timestamp: number;
  reasoning: string;
}

// Oracle Types
interface PriceData {
  symbol: string;
  price: number;
  confidence: number;
  timestamp: number;
}

// Liquidation Types
interface LiquidationOpportunity {
  vaultId: string;
  owner: string;
  collateral: bigint;
  debt: bigint;
  health: number;
  estimatedProfit: bigint;
  riskScore: number;
}

interface LiquidationProof {
  vaultId: string;
  timestamp: number;
  walrusBlobId: string;
  vaultCollateral: bigint;
  vaultDebt: bigint;
  oraclePrice: number;
  healthAtLiquidation: number;
  liquidator: string;
  penaltyCharged: bigint;
}

// Market Data Types
interface MarketData {
  suiPrice: number;
  octSuiExchangeRate: number;
  volatility24h: number;
  totalValueLocked: bigint;
  totalBorrowed: bigint;
  utilizationRate: number;
  averageHealthFactor: number;
}

// User Profile Types
interface UserProfile {
  address: string;
  vaults: string[];
  totalCollateral: bigint;
  totalDebt: bigint;
  averageHealthFactor: number;
  joinedAt: number;
  preferences: {
    aiAutoRebalance: boolean;
    notifications: {
      telegram?: string;
      email?: string;
    };
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  };
}

// Notification Types
interface Notification {
  id: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  vaultId?: string;
  timestamp: number;
  read: boolean;
}

// Analytics Types
interface VaultAnalytics {
  vaultId: string;
  period: '24h' | '7d' | '30d' | '90d';
  data: {
    healthHistory: Array<{ timestamp: number; health: number }>;
    collateralHistory: Array<{ timestamp: number; amount: bigint }>;
    debtHistory: Array<{ timestamp: number; amount: bigint }>;
    apyHistory: Array<{ timestamp: number; apy: number }>;
    rebalanceEvents: AIRebalanceEvent[];
  };
}

// Form Types
interface StakeFormData {
  amount: string;
}

interface BorrowFormData {
  collateralAmount: string;
  borrowAmount: string;
  enableAI: boolean;
  strategyId?: string;
}

interface RepayFormData {
  amount: string;
  withdrawCollateral: boolean;
  withdrawAmount?: string;
}

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Contract Call Types
interface ContractCall {
  target: string;
  arguments: any[];
  typeArguments?: string[];
}

// Wallet Types
interface WalletState {
  address: string | null;
  connected: boolean;
  network: 'mainnet' | 'testnet';
  balance: TokenBalance;
}

export type {
  Vault,
  VaultStrategy,
  VaultAnalytics,
  Strategy,
  StakeFormData,
  StrategyBacktest,
  WalletState,
  ChatMessage,
  ContractCall,
  PaginatedResponse,
  ApiResponse,
  AIRebalanceEvent,
  RepayFormData,
  BorrowFormData,
  TokenBalance,
  Transaction,
  UserProfile,
  LiquidationOpportunity,
  LiquidationProof,
  PriceData,
  MarketData,
  Notification
}
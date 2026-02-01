// Contract Addresses (will be updated after deployment)
export const CONTRACTS = {
  LIQUID_STAKING: process.env.NEXT_PUBLIC_LIQUID_STAKING_PACKAGE || '0x...',
  VAULT_MANAGER: process.env.NEXT_PUBLIC_VAULT_MANAGER_PACKAGE || '0x...',
  LIQUIDATION: process.env.NEXT_PUBLIC_LIQUIDATION_PACKAGE || '0x...',
  ORACLE_ADAPTER: process.env.NEXT_PUBLIC_ORACLE_ADAPTER_PACKAGE || '0x...',
  AI_ADAPTER: process.env.NEXT_PUBLIC_AI_ADAPTER_PACKAGE || '0x...',
  STRATEGY_REGISTRY: process.env.NEXT_PUBLIC_STRATEGY_REGISTRY_PACKAGE || '0x...',
  OCTSUI_TOKEN: process.env.NEXT_PUBLIC_OCTSUI_PACKAGE || '0x...',
  OCTUSD_TOKEN: process.env.NEXT_PUBLIC_OCTUSD_PACKAGE || '0x...',
} as const;

// Network Configuration
export const NETWORK = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
  DEVNET: 'devnet',
} as const;

export const RPC_URLS = {
  mainnet: 'https://fullnode.mainnet.sui.io:443',
  testnet: 'https://fullnode.testnet.sui.io:443',
  devnet: 'https://fullnode.devnet.sui.io:443',
} as const;

// Protocol Parameters
export const PROTOCOL_PARAMS = {
  MIN_COLLATERAL_RATIO: 1.3, // 130%
  LIQUIDATION_THRESHOLD: 1.1, // 110%
  MAX_LTV: 0.75, // 75%
  LIQUIDATION_PENALTY: 0.05, // 5%
  LIQUIDATOR_REWARD: 0.03, // 3%
  PROTOCOL_FEE: 0.005, // 0.5%
  AI_REBALANCE_THRESHOLD: 1.5, // Health < 1.5x triggers rebalance
  STAKING_APY: 0.07, // ~7%
} as const;

// Token Decimals
export const DECIMALS = {
  SUI: 9,
  OCTSUI: 9,
  OCTUSD: 6,
} as const;

// Health Factor Colors
export const HEALTH_COLORS = {
  SAFE: '#10B981', // green-500
  WARNING: '#F59E0B', // amber-500
  DANGER: '#EF4444', // red-500
} as const;

// Risk Levels
export const RISK_LEVELS = {
  LOW: { min: 1.5, max: Infinity, color: HEALTH_COLORS.SAFE, label: 'Low Risk' },
  MEDIUM: { min: 1.2, max: 1.5, color: HEALTH_COLORS.WARNING, label: 'Medium Risk' },
  HIGH: { min: 0, max: 1.2, color: HEALTH_COLORS.DANGER, label: 'High Risk' },
} as const;

// Strategy Risk Scores
export const STRATEGY_RISK = {
  CONSERVATIVE: { min: 1, max: 3, label: 'Conservative' },
  MODERATE: { min: 4, max: 6, label: 'Moderate' },
  AGGRESSIVE: { min: 7, max: 10, label: 'Aggressive' },
} as const;

// Time Constants
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// Polling Intervals
export const POLLING = {
  VAULT_UPDATE: 10 * TIME.SECOND,
  PRICE_UPDATE: 5 * TIME.SECOND,
  BALANCE_UPDATE: 15 * TIME.SECOND,
  STRATEGY_UPDATE: 30 * TIME.SECOND,
} as const;

// Walrus Configuration
export const WALRUS = {
  API_URL: process.env.NEXT_PUBLIC_WALRUS_API_URL || 'https://api.walrus.site',
  STORAGE_EPOCHS: 100,
  MAX_BLOB_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// Pyth Price Feed IDs
export const PYTH_FEEDS = {
  SUI_USD: process.env.NEXT_PUBLIC_PYTH_SUI_USD || '0x...',
} as const;

// API Endpoints
export const API = {
  CHAT: '/api/chat',
  VAULT_MONITOR: '/api/vault-monitor',
  WALRUS_UPLOAD: '/api/walrus/upload',
  WALRUS_FETCH: '/api/walrus/fetch',
} as const;

// Feature Flags
export const FEATURES = {
  AI_CHAT: true,
  AI_AUTO_REBALANCE: true,
  STRATEGY_MARKETPLACE: true,
  LIQUIDATION_UI: true,
  ANALYTICS: true,
  NOTIFICATIONS: true,
} as const;

// External Links
export const LINKS = {
  DOCS: 'https://docs.octopus.finance',
  GITHUB: 'https://github.com/octopus-finance',
  TWITTER: 'https://twitter.com/OctopusFinance',
  DISCORD: 'https://discord.gg/octopus',
  TELEGRAM: 'https://t.me/octopusfinance',
} as const;

// Transaction Gas Budget
export const GAS = {
  DEFAULT: 10_000_000,
  STAKE: 20_000_000,
  VAULT_CREATE: 30_000_000,
  BORROW: 20_000_000,
  REPAY: 20_000_000,
  LIQUIDATE: 50_000_000,
} as const;

// Chart Colors
export const CHART_COLORS = {
  primary: '#06b6d4',
  secondary: '#0ea5e9',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  muted: '#6B7280',
} as const;

// Animation Durations
export const ANIMATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
  VERY_SLOW: 1.0,
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  WALLET_STATE: 'octopus_wallet',
  USER_PREFERENCES: 'octopus_preferences',
  CHAT_HISTORY: 'octopus_chat',
  FAVORITE_STRATEGIES: 'octopus_strategies',
} as const;

// Error Messages
export const ERRORS = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INVALID_AMOUNT: 'Please enter a valid amount',
  TRANSACTION_FAILED: 'Transaction failed. Please try again',
  NETWORK_ERROR: 'Network error. Please check your connection',
  CONTRACT_ERROR: 'Smart contract error. Please contact support',
} as const;

// Success Messages
export const SUCCESS = {
  STAKE: 'Successfully staked SUI',
  UNSTAKE: 'Successfully unstaked octSUI',
  VAULT_CREATED: 'Vault created successfully',
  BORROW: 'Borrowed successfully',
  REPAY: 'Repaid successfully',
  STRATEGY_CLONED: 'Strategy cloned successfully',
  AI_ENABLED: 'AI management enabled',
} as const;
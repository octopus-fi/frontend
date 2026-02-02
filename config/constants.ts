/**
 * 🐙 Octopus Finance - Frontend Constants
 * 
 * Contains all deployed contract addresses and type definitions
 * Update these after each deployment
 */

// ============================================================================
// DEPLOYED CONTRACT ADDRESSES (Update after deployment)
// ============================================================================

export const PACKAGE_ID = '0x368ebff32f52eda8b904bf3a8938483b493c65e787ee43fb34c5986348db40c5';

export const SHARED_OBJECTS = {
  ORACLE_ID: '0xfde27ee67984571453853b7142d2322c5fea9640b24d4c9e21266bc42790f8ac',
  STAKING_POOL_ID: '0x3e2fcdce65c711a2a91e624fceadd913dc9e94797c464890f60ca116676dca20',
  BANK_ID: '0x84299e4f7c05f361e883f7ea1cefeac9dd4ac961d96115a0df7c3da92c7dbf92',
  VAULT_REGISTRY_OCTSUI_ID: '0xc0da5c3a58614c548adfe922678334015113e95f27016cc8dabfbc017951d33f',
  STRATEGY_REGISTRY_ID: '0x48d40f919db7299910c54c5c09af58d6a9dd4482d407982e61cf7dfe586816b4',
} as const;

export const TREASURY_CAPS = {
  MOCKSUI: '0x44cae9c83aeae7594cdc4237078a1f4663b788215d956578550a94f54a87875f',
  OCTSUI: '0xe00fc1cf88f899a02c0caef37174be2b814aa103f584c6ae09dca42de142fb8b',
  OCTUSD: '0x6f9d9825e5ae3aa8c94e04bcac41f787f6322825ecf3c1c6999214a78d9be397',
} as const;

export const ADMIN_CAPS = {
  ORACLE_ADMIN_CAP: '0x3aa98859fca7f40124d4c9f870ba95fac97bf8396aa718ee583c135654c2fd74',
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

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export const COIN_TYPES = {
  OCTSUI: `${PACKAGE_ID}::octsui::OCTSUI`,
  MOCKSUI: `${PACKAGE_ID}::mocksui::MOCKSUI`,
  OCTUSD: `${PACKAGE_ID}::octusd::OCTUSD`,
} as const;

export const MODULE_NAMES = {
  LIQUID_STAKING: 'liquid_staking',
  VAULT_MANAGER: 'vault_manager',
  ORACLE_ADAPTER: 'oracle_adapter',
  AI_ADAPTER: 'ai_adapter',
  LIQUIDATION: 'liquidation',
  MOCKSUI: 'mocksui',
  OCTSUI: 'octsui',
  OCTUSD: 'octusd',
} as const;

// ============================================================================
// PROTOCOL PARAMETERS
// ============================================================================

export const PROTOCOL_PARAMS = {
  /** Token decimal places (1e9) */
  DECIMALS: 9,
  /** Scaling factor for token amounts */
  SCALING_FACTOR: 1_000_000_000n,
  /** Maximum LTV for borrowing (70%) */
  MAX_LTV_BPS: 7000,
  /** Liquidation threshold (80%) */
  LIQUIDATION_THRESHOLD_BPS: 8000,
  /** Liquidation bonus for liquidators (5%) */
  LIQUIDATION_BONUS_BPS: 500,
  /** Warning threshold for UI (60%) */
  WARNING_LTV_BPS: 6000,
  /** Basis points denominator */
  BPS_DENOMINATOR: 10000,
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
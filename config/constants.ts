/**
 * 🐙 Octopus Finance - Frontend Constants
 * 
 * Contains all deployed contract addresses and type definitions
 * Update these after each deployment
 */

// ============================================================================
// DEPLOYED CONTRACT ADDRESSES (Update after deployment)
// ============================================================================

export const PACKAGE_ID = '0x8873216552e70b34b82aa29f2577f3ecf7793a06021a6dff83f3742a8b8a6cc6';

export const SHARED_OBJECTS = {
  ORACLE_ID: '0x71e6c5ad1420c582823bf517a1de8a70440355c86852822b0d803b310e5a3731',
  STAKING_POOL_ID: '0x1c46d89421fe9acc1ab35061d968c107492958387857998a7a9a9925c0d67320',
  BANK_ID: '0xf949b7cf4a0bf2083d5c2623efcfd1fa2796e727f6c6e7cfd64c03c1d3e7626d',
  VAULT_REGISTRY_OCTSUI_ID: '0xaf1751a51fc536229eb32a8981c42929ac5bddcd8fb66c403427561d96f484c7',
  STRATEGY_REGISTRY_ID: '0x1f867309050354fd7dbfdb03edaeb2d480355f5c5055b92345c9d52762133f21',
} as const;

export const TREASURY_CAPS = {
  MOCKSUI: '0x4bcd5e2144a4bc3200f0ebe34899e50bb32cb56f808c62daa136469f3d95c4a5',
  OCTSUI: '0x419d3d39929218fc2840bc200a0c897630798c433c92fc98595ff6ca43034d86',
  OCTUSD: '0x8638ff0749e5899bde520828a873a13e87a849ddd688f685c2afe5e2e64434fb',
} as const;

export const ADMIN_CAPS = {
  ORACLE_ADMIN_CAP: '0x5f24a2e013c0b07038cf7584895cc9c3df5e7c735625d4480200cfcaa0a90a5c',
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
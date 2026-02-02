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

// ============================================================================
// TYPE INTERFACES
// ============================================================================

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

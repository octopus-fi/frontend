/**
 * 🐙 Octopus Finance - Frontend Constants
 * 
 * Contains all deployed contract addresses and type definitions
 * Update these after each deployment
 */

// ============================================================================
// DEPLOYED CONTRACT ADDRESSES (Update after deployment)
// Network: Sui testnet | Deployed: 2026-02-05
// ============================================================================

export const PACKAGE_ID = '0x59219e7a89f333f63e7fa6ccabddfe58cc7e0f0900072b37f15d7d5374b2cc69';

export const SHARED_OBJECTS = {
  ORACLE_ID: '0x0c0320b4666df2f0831f43c6a3b982356d56763be26464650fa9d081f206a3f0',
  REGISTRY_ID: '0xb3f9f5f94d21f593464a00110b93d34ba5484f883c808197994b70edd03ca928',
  STAKING_POOL_ID: '0xddd35c717bc2c8bf9506e5a57b8cf1da2263060db52f0c9c9661abbbffa5b30e',
  BANK_ID: '0xe64e6111efc8a4ce028c6ab649a7a14dac2ed4b5f8e08aec274574e915f2783d',
  VAULT_REGISTRY_OCTSUI_ID: '0xec030da9ebdf75f3b7bb2250bf8c7bed4cd02ce7c3d4b187b4a94990a948fac0',
} as const;

export const TREASURY_CAPS = {
  MOCKSUI: '0xb3443445ab237e55f2b17b5a83aefbaaf194d78b5eb20cfdb78f103c2b48cb6b',
  OCTSUI: '0x162696c1ef8a5f3d821a13cdc3a62f3e530979a55c32ee9169984369edec502f',
  OCTUSD: '0x43bbe9585a910521c7dce94ef0226cc25f4e10453c7113f8f826f9005b206840',
} as const;

export const ADMIN_CAPS = {
  ORACLE_ADMIN_CAP: '0x5bbae857a8ce14aa5939935e3b4dc1287b883a851ec8c3c105f762647c230b5a',
  REGISTRY_ADMIN_CAP: '0xc8784133147ad7055e35a894bca8ca1f4a386ae23d0ba99816ba172f89048f50',
  UPGRADE_CAP: '0x6db8f8661713e79229e0216a3f8a04d3cb13f17c41e15312768d67e6dc506383',
} as const;

// AI Agent Configuration
export const AI_AGENT = {
  ADDRESS: '0x0d0470eaa28a8834e696732d01f5bd68f6e382c36c3c7a94e3006d1a49beb926',
  CAPABILITY_ID: '0xa9f72b4e24a0072d78532ca8f6f510872dbc98295b3f591c94b61923df981253',
} as const;

export const WALRUS = {
  PACKAGE_ID: '0xfdc88f7d7cf30afab2f82e8380d11ee8f70efb90e863d1de8616fae1bb09ea77',
} as const;

// Sample Test Objects
export const SAMPLE_OBJECTS = {
  VAULT_ID: '0xce43374105530bcd30aa232371ec3386fd2e29b6183320206ba9a13397b0fe61',
  STAKE_POSITION_ID: '0xfa4c2a8e8a5ed975bffe69dfd9ac93ac713b69bb907d09244af6a9e55008d1d9',
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
  /** Last claim timestamp in milliseconds (for reward calculation) */
  lastClaimTimeMs?: number;
}

export interface PoolStats {
  totalShares: bigint;
  totalRewards: bigint;
  rewardRateBps: number;
  /** Reward interval in milliseconds (default 5000ms) */
  rewardIntervalMs: number;
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

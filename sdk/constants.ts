/**
 * 🐙 Octopus Finance - Frontend Constants
 * 
 * Contains all deployed contract addresses and type definitions
 * Update these after each deployment
 */

// ============================================================================
// DEPLOYED CONTRACT ADDRESSES (Update after deployment)
// ============================================================================

export const PACKAGE_ID = '0xde35885f7d131441825a6fe4f33e02eca2e2c17cbcd8bdbee1acfedd3c32cf95';

export const SHARED_OBJECTS = {
  ORACLE_ID: '0x63aad38e35e6817b60579aced46411f29f9ae43c2953a728aa93de2cdf9cd98a',
  REGISTRY_ID: '0xe3e563e5061b9ee9a91006ce8021d1c2ec4331090843a3dba69a9f0722cc5b8d',
  STAKING_POOL_ID: '0x8ba7d4d2afc215f1f4dc447095cced5329cdc3051ad1d3c3c6769ec6a10dbd86',
  BANK_ID: '0x34755fe6433b61f5f2e9a69d1384e8f5eb67fd6c018d505835211da4510c80d1',
  VAULT_REGISTRY_OCTSUI_ID: '0xd6467a357d7200d27b03766cdeafcea48ae8febb37df611209b04b4b8f361dd3',
} as const;

export const TREASURY_CAPS = {
  MOCKSUI: '0x5d64e28c087edd962aaaa3c0cd00c9b908497272201585b20bee30495620fd33',
  OCTSUI: '0x9fdb77c04cad5dabc9a269c84a038a15d6eac051db9deafb34bd6eec97835193',
  OCTUSD: '0x5ea98e13ac337dfc9d5e8569b89e9a2737d223e5323fa6bd89d9af6adf871502',
} as const;

export const ADMIN_CAPS = {
  ORACLE_ADMIN_CAP: '0x8f3a26dfe451f6c163a917defe8ab6e496807956325a8d4e9cd0c74a1e54cb62',
  REGISTRY_ADMIN_CAP: '0x261cb589345936fa48096a276716d6e448df068f3c220b3fae4f9965a93177f6',
  UPGRADE_CAP: '0xabe3d78219b117378381c312f00a02d65e8c3b1ab60f316be2d946e275bec509',
} as const;

// AI Agent Configuration
export const AI_AGENT = {
  ADDRESS: '0x0d0470eaa28a8834e696732d01f5bd68f6e382c36c3c7a94e3006d1a49beb926',
  CAPABILITY_ID: '0x1b55abf3daa4c53330e3b55e681267090fd561ec7c86905decbaa88fd56215c4',
} as const;

export const WALRUS = {
  PACKAGE_ID: '0xfdc88f7d7cf30afab2f82e8380d11ee8f70efb90e863d1de8616fae1bb09ea77',
} as const;

// Sample Test Objects
export const SAMPLE_OBJECTS = {
  VAULT_ID: '0x52d3644111f0cce9f27cfda9ec70bd55b1cbeb4d81a4f53a9bf145f41b183c68',
  STAKE_POSITION_ID: '0xf01c6a994c87fccf3e1670aa85a58782ff2b5fe7f1f1df32071bcc878eeafc4e',
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

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

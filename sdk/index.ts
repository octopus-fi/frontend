/**
 * 🐙 Octopus Finance - Frontend SDK
 *
 * Complete frontend integration package for Octopus Finance protocol
 *
 * @package @mysten/sui - Sui TypeScript SDK (required)
 * @package @mysten/dapp-kit - Sui dApp Kit for React (required for hooks)
 * @package @tanstack/react-query - React Query (required for hooks)
 *
 * Installation:
 * ```bash
 * npm install @mysten/sui @mysten/dapp-kit @tanstack/react-query
 * ```
 */

// Constants & Types
export * from "./constants";

// Off-chain Calculations (for real-time UI)
export * as calculations from "./calculations";
export {
  // Core calculations
  calculateCollateralValue,
  calculateMaxBorrow,
  calculateHealthFactor,
  calculateLTV,
  calculateLTVBps,

  // UI Preview calculations
  calculateBorrowPreview,
  calculateWithdrawPreview,
  calculateRepayPreview,
  calculatePriceSensitivity,
  calculateLiquidationPreview,

  // Staking calculations
  calculateEstimatedAPY,
  calculateEstimatedAPR,
  calculatePendingRewards,
  calculatePendingRewardsFromTime,

  // Formatting utilities
  formatAmount,
  formatUSD,
  parseAmount,
  getHealthStatus,
  getLTVBarPosition,
} from "./calculations";

// Query functions (for reading on-chain state)
export * as queries from "./queries";
export {
  getUserVaultId,
  getVaultState,
  getUserVaults,
  getUserStakePositions,
  getStakePositionState,
  findUserStakePosition,
  getPoolStats,
  getOctsuiPrice,
  getOctsuiPriceUsd,
  getUserCoins,
  getUserOctsuiBalance,
  getUserOctusdBalance,
  getUserMocksuiBalance,
  isAIAuthorizedForVault,
} from "./queries";

// Transaction Builders
export {
  buildStakeTransaction,
  buildStakeWithAmountTransaction,
} from "./transactions/stake";

export {
  buildUnstakeTransaction,
  buildUnstakeWithAmountTransaction,
} from "./transactions/unstake";

export {
  buildDepositCollateralTransaction,
  buildDepositCollateralWithAmountTransaction,
} from "./transactions/deposit-collateral";

export { buildBorrowTransaction } from "./transactions/borrow";

export {
  buildRepayTransaction,
  buildRepayWithAmountTransaction,
} from "./transactions/repay";

export { buildWithdrawCollateralTransaction } from "./transactions/withdraw-collateral";

export { buildClaimRewardsTransaction } from "./transactions/claim-rewards";

export { buildCreateVaultTransaction } from "./transactions/create-vault";

export {
  buildAuthorizeAITransaction,
  buildEnableAutoRebalanceTransaction,
  buildDisableAutoRebalanceTransaction,
  buildFullAISetupTransaction,
  DEFAULT_AI_AGENT_ADDRESS,
} from "./transactions/authorize-ai";

export {
  buildDepositToReserveTransaction,
  buildDepositToReserveWithAmountTransaction,
} from "./transactions/deposit-to-reserve";

export {
  buildLiquidateTransaction,
  buildLiquidateWithAmountTransaction,
} from "./transactions/liquidate";

// React Hooks (requires @mysten/dapp-kit and @tanstack/react-query)
export {
  // Data hooks
  useVault,
  useOctsuiPrice,
  useBalances,
  useStakePosition,
  usePoolStats,
  useVaultHealth,

  // Mutation hooks
  useStake,
  useBorrow,
  useCreateVault,

  // Preview hooks
  useBorrowPreview,

  // All-in-one dashboard
  useDashboard,
} from "./hooks";

/**
 * 🐙 Octopus Finance - Off-Chain Calculations
 * 
 * These functions mirror the on-chain math for real-time UI updates
 * Use these for dynamic calculations as user types amounts
 * 
 * All amounts are in raw units (scaled by 1e9)
 * Prices are in USD scaled by 1e9 (e.g., $3.50 = 3_500_000_000)
 */

import { PROTOCOL_PARAMS } from './constants';

const { SCALING_FACTOR, MAX_LTV_BPS, LIQUIDATION_THRESHOLD_BPS, BPS_DENOMINATOR } = PROTOCOL_PARAMS;

// ============================================================================
// CORE CALCULATIONS (Mirror on-chain math.move)
// ============================================================================

/**
 * Calculate collateral value in USD
 * @param collateralAmount - Raw token amount (e.g., 100e9 for 100 tokens)
 * @param priceUsd - Price per token in USD (scaled by 1e9)
 * @returns Collateral value in USD (scaled by 1e9)
 */
export function calculateCollateralValue(
  collateralAmount: bigint,
  priceUsd: bigint
): bigint {
  return (collateralAmount * priceUsd) / SCALING_FACTOR;
}

/**
 * Calculate maximum borrowable amount based on LTV
 * @param collateralValueUsd - Collateral value in USD (scaled by 1e9)
 * @param ltvBps - LTV in basis points (default: 7000 = 70%)
 * @returns Maximum borrow amount in octUSD (scaled by 1e9)
 */
export function calculateMaxBorrow(
  collateralValueUsd: bigint,
  ltvBps: number = MAX_LTV_BPS
): bigint {
  return (collateralValueUsd * BigInt(ltvBps)) / BigInt(BPS_DENOMINATOR);
}

/**
 * Calculate health factor
 * Health < 1.0 means liquidatable
 * @param collateralValueUsd - Collateral value in USD (scaled by 1e9)
 * @param debt - Debt amount in octUSD (scaled by 1e9)
 * @returns Health factor as a number (e.g., 1.5 = 150% healthy)
 */
export function calculateHealthFactor(
  collateralValueUsd: bigint,
  debt: bigint
): number {
  if (debt === 0n) return Infinity;
  if (collateralValueUsd === 0n) return 0;

  // Health = (collateralValue * liquidationThreshold) / debt
  const weightedCollateral = (collateralValueUsd * BigInt(LIQUIDATION_THRESHOLD_BPS)) / BigInt(BPS_DENOMINATOR);
  return Number(weightedCollateral) / Number(debt);
}

/**
 * Calculate current LTV (Loan-to-Value) ratio
 * @param debt - Debt amount in octUSD (scaled by 1e9)
 * @param collateralValueUsd - Collateral value in USD (scaled by 1e9)
 * @returns LTV as percentage (0-100+)
 */
export function calculateLTV(
  debt: bigint,
  collateralValueUsd: bigint
): number {
  if (collateralValueUsd === 0n) return debt > 0n ? 100 : 0;
  return (Number(debt) / Number(collateralValueUsd)) * 100;
}

/**
 * Calculate LTV in basis points
 * @param debt - Debt amount in octUSD (scaled by 1e9)
 * @param collateralValueUsd - Collateral value in USD (scaled by 1e9)
 * @returns LTV in basis points (0-10000+)
 */
export function calculateLTVBps(
  debt: bigint,
  collateralValueUsd: bigint
): number {
  if (collateralValueUsd === 0n) return debt > 0n ? 10000 : 0;
  return Number((debt * BigInt(BPS_DENOMINATOR)) / collateralValueUsd);
}

// ============================================================================
// DYNAMIC UI CALCULATIONS (For real-time updates as user types)
// ============================================================================

/**
 * Calculate borrow position after depositing and borrowing
 * Use this for the "Easy Borrow" UI like in the image
 */
export interface BorrowPreview {
  /** Collateral value in USD (human readable) */
  collateralValueUsd: number;
  /** Borrow amount in USD (human readable) */
  borrowAmountUsd: number;
  /** LTV percentage (0-100) */
  ltvPercent: number;
  /** Health factor (>1 = safe) */
  healthFactor: number;
  /** Max borrowable at current collateral */
  maxBorrowUsd: number;
  /** Available to borrow (max - current) */
  availableToBorrowUsd: number;
  /** Health status for UI display */
  healthStatus: 'safe' | 'warning' | 'danger' | 'liquidatable';
  /** Whether this borrow is allowed */
  canBorrow: boolean;
  /** Reason if can't borrow */
  errorMessage?: string;
}

export function calculateBorrowPreview(
  depositAmount: number,
  borrowAmount: number,
  tokenPriceUsd: number,
  existingCollateralRaw: bigint = 0n,
  existingDebtRaw: bigint = 0n
): BorrowPreview {
  const scaling = Number(SCALING_FACTOR);

  // Convert to raw amounts
  const newCollateralRaw = BigInt(Math.floor(depositAmount * scaling));
  const newBorrowRaw = BigInt(Math.floor(borrowAmount * scaling));
  const priceRaw = BigInt(Math.floor(tokenPriceUsd * scaling));

  // Total amounts after operation
  const totalCollateralRaw = existingCollateralRaw + newCollateralRaw;
  const totalDebtRaw = existingDebtRaw + newBorrowRaw;

  // Calculate values
  const collateralValueRaw = calculateCollateralValue(totalCollateralRaw, priceRaw);
  const maxBorrowRaw = calculateMaxBorrow(collateralValueRaw);

  const collateralValueUsd = Number(collateralValueRaw) / scaling;
  const totalDebtUsd = Number(totalDebtRaw) / scaling;
  const maxBorrowUsd = Number(maxBorrowRaw) / scaling;

  const ltvPercent = calculateLTV(totalDebtRaw, collateralValueRaw);
  const healthFactor = calculateHealthFactor(collateralValueRaw, totalDebtRaw);
  const availableToBorrowUsd = Math.max(0, maxBorrowUsd - totalDebtUsd);

  // Determine health status
  let healthStatus: 'safe' | 'warning' | 'danger' | 'liquidatable';
  if (ltvPercent > 80) {
    healthStatus = 'liquidatable';
  } else if (ltvPercent > 70) {
    healthStatus = 'danger';
  } else if (ltvPercent > 60) {
    healthStatus = 'warning';
  } else {
    healthStatus = 'safe';
  }

  // Check if borrow is allowed
  const canBorrow = totalDebtRaw <= maxBorrowRaw;
  const errorMessage = !canBorrow ? `Exceeds max LTV of 70%. Max borrow: $${maxBorrowUsd.toFixed(2)}` : undefined;

  return {
    collateralValueUsd,
    borrowAmountUsd: totalDebtUsd,
    ltvPercent,
    healthFactor,
    maxBorrowUsd,
    availableToBorrowUsd,
    healthStatus,
    canBorrow,
    errorMessage,
  };
}

/**
 * Calculate withdraw preview
 * Used when user wants to withdraw collateral
 */
export interface WithdrawPreview {
  remainingCollateralUsd: number;
  currentDebtUsd: number;
  newLtvPercent: number;
  newHealthFactor: number;
  maxWithdrawable: number;
  canWithdraw: boolean;
  errorMessage?: string;
}

export function calculateWithdrawPreview(
  withdrawAmount: number,
  tokenPriceUsd: number,
  currentCollateralRaw: bigint,
  currentDebtRaw: bigint
): WithdrawPreview {
  const scaling = Number(SCALING_FACTOR);
  const withdrawRaw = BigInt(Math.floor(withdrawAmount * scaling));
  const priceRaw = BigInt(Math.floor(tokenPriceUsd * scaling));

  // Calculate remaining after withdrawal
  const remainingCollateralRaw = currentCollateralRaw > withdrawRaw
    ? currentCollateralRaw - withdrawRaw
    : 0n;

  const remainingValueRaw = calculateCollateralValue(remainingCollateralRaw, priceRaw);
  const currentValueRaw = calculateCollateralValue(currentCollateralRaw, priceRaw);

  // Calculate max withdrawable (keep LTV <= 70%)
  let maxWithdrawableValue = 0n;
  if (currentDebtRaw > 0n) {
    // minCollateralValue = debt / 0.7 = debt * 10000 / 7000
    const minCollateralValue = (currentDebtRaw * BigInt(BPS_DENOMINATOR)) / BigInt(MAX_LTV_BPS);
    maxWithdrawableValue = currentValueRaw > minCollateralValue
      ? currentValueRaw - minCollateralValue
      : 0n;
  } else {
    maxWithdrawableValue = currentValueRaw;
  }

  // Convert value to token amount
  const maxWithdrawableRaw = priceRaw > 0n
    ? (maxWithdrawableValue * SCALING_FACTOR) / priceRaw
    : 0n;

  const remainingCollateralUsd = Number(remainingValueRaw) / scaling;
  const currentDebtUsd = Number(currentDebtRaw) / scaling;
  const newLtvPercent = calculateLTV(currentDebtRaw, remainingValueRaw);
  const newHealthFactor = calculateHealthFactor(remainingValueRaw, currentDebtRaw);
  const maxWithdrawable = Number(maxWithdrawableRaw) / scaling;

  const canWithdraw = newLtvPercent <= 70 || currentDebtRaw === 0n;
  const errorMessage = !canWithdraw
    ? `Would exceed 70% LTV. Max withdraw: ${maxWithdrawable.toFixed(2)} tokens`
    : undefined;

  return {
    remainingCollateralUsd,
    currentDebtUsd,
    newLtvPercent,
    newHealthFactor,
    maxWithdrawable,
    canWithdraw,
    errorMessage,
  };
}

/**
 * Calculate repay preview
 */
export interface RepayPreview {
  remainingDebtUsd: number;
  newLtvPercent: number;
  newHealthFactor: number;
  newWithdrawableCollateral: number;
}

export function calculateRepayPreview(
  repayAmount: number,
  tokenPriceUsd: number,
  currentCollateralRaw: bigint,
  currentDebtRaw: bigint
): RepayPreview {
  const scaling = Number(SCALING_FACTOR);
  const repayRaw = BigInt(Math.floor(repayAmount * scaling));
  const priceRaw = BigInt(Math.floor(tokenPriceUsd * scaling));

  const remainingDebtRaw = currentDebtRaw > repayRaw ? currentDebtRaw - repayRaw : 0n;
  const collateralValueRaw = calculateCollateralValue(currentCollateralRaw, priceRaw);

  const remainingDebtUsd = Number(remainingDebtRaw) / scaling;
  const newLtvPercent = calculateLTV(remainingDebtRaw, collateralValueRaw);
  const newHealthFactor = calculateHealthFactor(collateralValueRaw, remainingDebtRaw);

  // Calculate new withdrawable after repay
  let newWithdrawableRaw = 0n;
  if (remainingDebtRaw > 0n) {
    const minCollateralValue = (remainingDebtRaw * BigInt(BPS_DENOMINATOR)) / BigInt(MAX_LTV_BPS);
    const excessValue = collateralValueRaw > minCollateralValue
      ? collateralValueRaw - minCollateralValue
      : 0n;
    newWithdrawableRaw = priceRaw > 0n ? (excessValue * SCALING_FACTOR) / priceRaw : 0n;
  } else {
    newWithdrawableRaw = currentCollateralRaw;
  }

  return {
    remainingDebtUsd,
    newLtvPercent,
    newHealthFactor,
    newWithdrawableCollateral: Number(newWithdrawableRaw) / scaling,
  };
}

// ============================================================================
// PRICE SENSITIVITY ANALYSIS
// ============================================================================

export interface PriceSensitivity {
  price: number;
  ltvPercent: number;
  healthFactor: number;
  status: 'safe' | 'warning' | 'danger' | 'liquidatable';
}

/**
 * Calculate how vault health changes at different prices
 */
export function calculatePriceSensitivity(
  collateralAmount: bigint,
  debt: bigint,
  currentPrice: number,
  priceDropPercentages: number[] = [0, 10, 20, 30, 40, 50]
): PriceSensitivity[] {
  const scaling = Number(SCALING_FACTOR);

  return priceDropPercentages.map(dropPercent => {
    const price = currentPrice * (1 - dropPercent / 100);
    const priceRaw = BigInt(Math.floor(price * scaling));
    const valueRaw = calculateCollateralValue(collateralAmount, priceRaw);

    const ltvPercent = calculateLTV(debt, valueRaw);
    const healthFactor = calculateHealthFactor(valueRaw, debt);

    let status: 'safe' | 'warning' | 'danger' | 'liquidatable';
    if (ltvPercent > 80) status = 'liquidatable';
    else if (ltvPercent > 70) status = 'danger';
    else if (ltvPercent > 60) status = 'warning';
    else status = 'safe';

    return { price, ltvPercent, healthFactor, status };
  });
}

// ============================================================================
// LIQUIDATION CALCULATIONS
// ============================================================================

export interface LiquidationPreview {
  isLiquidatable: boolean;
  collateralToSeize: number;
  liquidatorProfit: number;
  remainingCollateral: number;
  remainingDebt: number;
}

/**
 * Calculate liquidation outcome
 * @param repayAmount - Amount of octUSD to repay
 * @param vaultCollateral - Current vault collateral
 * @param vaultDebt - Current vault debt
 * @param tokenPrice - Token price in USD
 */
export function calculateLiquidationPreview(
  repayAmount: number,
  vaultCollateral: bigint,
  vaultDebt: bigint,
  tokenPrice: number
): LiquidationPreview {
  const scaling = Number(SCALING_FACTOR);
  const repayRaw = BigInt(Math.floor(repayAmount * scaling));
  const priceRaw = BigInt(Math.floor(tokenPrice * scaling));
  const valueRaw = calculateCollateralValue(vaultCollateral, priceRaw);

  const ltvBps = calculateLTVBps(vaultDebt, valueRaw);
  const isLiquidatable = ltvBps > LIQUIDATION_THRESHOLD_BPS;

  if (!isLiquidatable) {
    return {
      isLiquidatable: false,
      collateralToSeize: 0,
      liquidatorProfit: 0,
      remainingCollateral: Number(vaultCollateral) / scaling,
      remainingDebt: Number(vaultDebt) / scaling,
    };
  }

  // Collateral to seize = repay * 1.05 / price (5% bonus)
  const repayWithBonus = (repayRaw * 10500n) / 10000n;
  const collateralToSeizeRaw = (repayWithBonus * SCALING_FACTOR) / priceRaw;
  const collateralWithoutBonusRaw = (repayRaw * SCALING_FACTOR) / priceRaw;

  const profitRaw = collateralToSeizeRaw - collateralWithoutBonusRaw;
  const remainingCollateralRaw = vaultCollateral > collateralToSeizeRaw
    ? vaultCollateral - collateralToSeizeRaw
    : 0n;
  const remainingDebtRaw = vaultDebt > repayRaw ? vaultDebt - repayRaw : 0n;

  return {
    isLiquidatable: true,
    collateralToSeize: Number(collateralToSeizeRaw) / scaling,
    liquidatorProfit: Number(profitRaw) / scaling,
    remainingCollateral: Number(remainingCollateralRaw) / scaling,
    remainingDebt: Number(remainingDebtRaw) / scaling,
  };
}

// ============================================================================
// STAKING CALCULATIONS (Matches contract liquid_staking.move)
// ============================================================================

// Contract constants
const REWARD_RATE_PER_INTERVAL = 115740; // ~1 SUI per 12 hours per staked SUI (scaled by 1e9)
const REWARD_INTERVAL_MS = 5000; // 5 seconds
const MS_PER_DAY = 86400000;
const MS_PER_YEAR = MS_PER_DAY * 365;

/**
 * Calculate estimated APR from pool's reward rate
 * Based on contract: reward_rate_per_interval * intervals_per_year / 1e9 * 100
 * 
 * @param rewardRatePerInterval - Pool's reward rate per 5-second interval (default: 115740)
 * @param rewardIntervalMs - Reward interval in ms (default: 5000 = 5 seconds)
 * @returns APR as percentage (e.g., 730 = 730%)
 */
export function calculateEstimatedAPR(
  rewardRatePerInterval: number = REWARD_RATE_PER_INTERVAL,
  rewardIntervalMs: number = REWARD_INTERVAL_MS,
  totalStaked: bigint = 1_000_000_000n // Default to 1 SUI to prevent div by zero
): number {
  if (totalStaked === 0n) return 0;

  // intervals_per_day = 86400000ms / 5000ms = 17,280 intervals
  // intervals_per_year = 17,280 * 365 = 6,307,200 intervals
  const intervalsPerDay = MS_PER_DAY / rewardIntervalMs;
  const intervalsPerYear = intervalsPerDay * 365;
  const totalRewardsPerYear = BigInt(Math.floor(rewardRatePerInterval * intervalsPerYear));

  // APR = (Annual Rewards / Total Staked) * 100
  // Note: rewardRatePerInterval is likely the total emission for the pool
  return (Number(totalRewardsPerYear) / Number(totalStaked)) * 100;
}

/**
 * Calculate estimated APY from APR (with compounding)
 * @deprecated Use calculateEstimatedAPR for display, this is kept for compatibility
 */
export function calculateEstimatedAPY(
  rewardRateBps: number,
  epochsPerYear: number = 365
): number {
  // For backward compatibility, use the new APR calculation
  return calculateEstimatedAPR();
}

/**
 * Calculate pending rewards for a position based on elapsed time
 * Mirrors contract: (shares * rate * intervals) / 1e9
 * 
 * @param shares - User's staked shares (raw, scaled by 1e9)
 * @param lastClaimTimeMs - Last claim timestamp in milliseconds
 * @param currentTimeMs - Current timestamp in milliseconds (default: now)
 * @param rewardRatePerInterval - Pool reward rate (default: 115740)
 * @param rewardIntervalMs - Interval duration in ms (default: 5000)
 */
export function calculatePendingRewardsFromTime(
  shares: bigint,
  lastClaimTimeMs: number,
  currentTimeMs: number = Date.now(),
  rewardRatePerInterval: number = REWARD_RATE_PER_INTERVAL,
  rewardIntervalMs: number = REWARD_INTERVAL_MS
): bigint {
  if (shares === 0n) return 0n;

  const elapsedMs = currentTimeMs - lastClaimTimeMs;
  if (elapsedMs <= 0) return 0n;

  const intervalsElapsed = Math.floor(elapsedMs / rewardIntervalMs);

  // Use BigInt for precision: (shares * rate * intervals) / 1e9
  const reward = (shares * BigInt(rewardRatePerInterval) * BigInt(intervalsElapsed)) / 1_000_000_000n;
  return reward;
}

/**
 * Calculate pending rewards estimate (legacy, kept for compatibility)
 * @param shares - User's shares
 * @param rewardRateBps - Pool reward rate in bps per epoch
 * @param epochsElapsed - Epochs since last claim
 */
export function calculatePendingRewards(
  shares: bigint,
  rewardRateBps: number,
  epochsElapsed: number
): bigint {
  return (shares * BigInt(rewardRateBps) * BigInt(epochsElapsed)) / 10000n;
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format raw amount to human readable with decimals
 */
export function formatAmount(rawAmount: bigint, decimals: number = 2): string {
  const num = Number(rawAmount) / Number(SCALING_FACTOR);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format USD value
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Parse human input to raw amount
 */
export function parseAmount(humanAmount: string | number): bigint {
  const num = typeof humanAmount === 'string' ? parseFloat(humanAmount) : humanAmount;
  if (isNaN(num)) return 0n;
  return BigInt(Math.floor(num * Number(SCALING_FACTOR)));
}

/**
 * Get health status color and label for UI
 */
export function getHealthStatus(ltvPercent: number): {
  color: string;
  label: string;
  level: 'safe' | 'warning' | 'danger' | 'liquidatable'
} {
  if (ltvPercent > 80) {
    return { color: '#ef4444', label: 'Liquidatable', level: 'liquidatable' };
  } else if (ltvPercent > 70) {
    return { color: '#f97316', label: 'Danger', level: 'danger' };
  } else if (ltvPercent > 60) {
    return { color: '#eab308', label: 'Warning', level: 'warning' };
  } else {
    return { color: '#22c55e', label: 'Safe', level: 'safe' };
  }
}

/**
 * Get LTV bar gradient position (for UI slider like in image)
 */
export function getLTVBarPosition(ltvPercent: number): {
  position: number; // 0-100 for CSS percentage
  zone: 'conservative' | 'moderate' | 'aggressive' | 'liquidation';
} {
  const position = Math.min(100, (ltvPercent / 100) * 100);

  let zone: 'conservative' | 'moderate' | 'aggressive' | 'liquidation';
  if (ltvPercent <= 40) zone = 'conservative';
  else if (ltvPercent <= 60) zone = 'moderate';
  else if (ltvPercent <= 80) zone = 'aggressive';
  else zone = 'liquidation';

  return { position, zone };
}

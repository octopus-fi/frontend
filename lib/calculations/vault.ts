import { PROTOCOL_PARAMS, DECIMALS } from '@/config/constants';

/**
 * Calculate health factor
 * Health Factor = (Collateral Value * Liquidation Threshold) / Debt
 */
export function calculateHealthFactor(
  collateral: number | bigint,
  debt: number | bigint,
  price: number
): number {
  const collateralValue = Number(collateral) * price;
  const debtValue = Number(debt);
  
  if (debtValue === 0) return Infinity;
  
  const health = (collateralValue * PROTOCOL_PARAMS.LIQUIDATION_THRESHOLD) / debtValue;
  return Math.max(0, health);
}

/**
 * Calculate LTV (Loan-to-Value) ratio
 */
export function calculateLTV(
  collateral: number | bigint,
  debt: number | bigint,
  price: number
): number {
  const collateralValue = Number(collateral) * price;
  if (collateralValue === 0) return 0;
  
  return (Number(debt) / collateralValue) * 100;
}

/**
 * Calculate maximum borrow amount
 */
export function calculateMaxBorrow(
  collateral: number | bigint,
  price: number
): number {
  const collateralValue = Number(collateral) * price;
  return collateralValue * PROTOCOL_PARAMS.MAX_LTV;
}

/**
 * Calculate liquidation price
 * Price at which vault will be liquidated
 */
export function calculateLiquidationPrice(
  collateral: number | bigint,
  debt: number | bigint
): number {
  if (Number(collateral) === 0) return 0;
  
  return Number(debt) / (Number(collateral) * PROTOCOL_PARAMS.LIQUIDATION_THRESHOLD);
}

/**
 * Calculate minimum collateral needed for target health
 */
export function calculateMinCollateral(
  debt: number | bigint,
  price: number,
  targetHealth: number = PROTOCOL_PARAMS.AI_REBALANCE_THRESHOLD
): number {
  const debtValue = Number(debt);
  if (debtValue === 0) return 0;
  
  return (debtValue * targetHealth) / (price * PROTOCOL_PARAMS.LIQUIDATION_THRESHOLD);
}

/**
 * Calculate how much more can be borrowed
 */
export function calculateAvailableBorrow(
  collateral: number | bigint,
  debt: number | bigint,
  price: number
): number {
  const maxBorrow = calculateMaxBorrow(collateral, price);
  const available = maxBorrow - Number(debt);
  return Math.max(0, available);
}

/**
 * Calculate APY including staking rewards and leverage
 */
export function calculateNetAPY(
  collateral: number | bigint,
  debt: number | bigint,
  stakingAPY: number = PROTOCOL_PARAMS.STAKING_APY
): number {
  const collateralValue = Number(collateral);
  if (collateralValue === 0) return stakingAPY * 100;
  
  const leverage = (collateralValue + Number(debt)) / collateralValue;
  return stakingAPY * leverage * 100;
}

/**
 * Calculate risk level based on health factor
 */
export function getRiskLevel(healthFactor: number): 'low' | 'medium' | 'high' {
  if (healthFactor < 1.2) return 'high';
  if (healthFactor < 1.5) return 'medium';
  return 'low';
}

/**
 * Calculate how much to repay to reach target health
 */
export function calculateRepayAmount(
  collateral: number | bigint,
  debt: number | bigint,
  price: number,
  targetHealth: number
): number {
  const collateralValue = Number(collateral) * price;
  const currentDebt = Number(debt);
  
  if (targetHealth >= Infinity) return currentDebt;
  
  const targetDebt = (collateralValue * PROTOCOL_PARAMS.LIQUIDATION_THRESHOLD) / targetHealth;
  const repayAmount = currentDebt - targetDebt;
  
  return Math.max(0, Math.min(repayAmount, currentDebt));
}

/**
 * Calculate how much collateral to add to reach target health
 */
export function calculateAddCollateralAmount(
  collateral: number | bigint,
  debt: number | bigint,
  price: number,
  targetHealth: number
): number {
  const currentCollateral = Number(collateral);
  const debtValue = Number(debt);
  
  if (debtValue === 0) return 0;
  
  const targetCollateral = (debtValue * targetHealth) / (price * PROTOCOL_PARAMS.LIQUIDATION_THRESHOLD);
  const addAmount = targetCollateral - currentCollateral;
  
  return Math.max(0, addAmount);
}

/**
 * Estimate gas cost for transaction
 */
export function estimateGasCost(
  transactionType: 'create' | 'borrow' | 'repay' | 'liquidate'
): number {
  const gasCosts = {
    create: 30_000_000,
    borrow: 20_000_000,
    repay: 20_000_000,
    liquidate: 50_000_000,
  };
  
  return gasCosts[transactionType];
}

/**
 * Calculate projected earnings
 */
export function calculateProjectedEarnings(
  collateral: number | bigint,
  debt: number | bigint,
  days: number = 30
): {
  stakingRewards: number;
  borrowCost: number;
  netEarnings: number;
} {
  const collateralValue = Number(collateral);
  // const debtValue = Number(debt);
  
  const stakingRewards = (collateralValue * PROTOCOL_PARAMS.STAKING_APY * days) / 365;
  const borrowCost = 0; // 0% interest
  const netEarnings = stakingRewards - borrowCost;
  
  return {
    stakingRewards,
    borrowCost,
    netEarnings,
  };
}

/**
 * Validate vault parameters
 */
export function validateVaultParams(
  collateral: number,
  borrowAmount: number,
  price: number
): {
  valid: boolean;
  error?: string;
  warnings?: string[];
} {
  const warnings: string[] = [];
  
  // Check minimum collateral
  if (collateral <= 0) {
    return { valid: false, error: 'Collateral must be greater than 0' };
  }
  
  // Check if borrow amount is valid
  if (borrowAmount < 0) {
    return { valid: false, error: 'Borrow amount cannot be negative' };
  }
  
  if (borrowAmount === 0) {
    warnings.push('You are not borrowing any octUSD');
  }
  
  // Check if exceeds max LTV
  const maxBorrow = calculateMaxBorrow(collateral, price);
  if (borrowAmount > maxBorrow) {
    return { 
      valid: false, 
      error: `Maximum borrow amount is ${maxBorrow.toFixed(2)} octUSD (${PROTOCOL_PARAMS.MAX_LTV * 100}% LTV)` 
    };
  }
  
  // Calculate health factor
  if (borrowAmount > 0) {
    const health = calculateHealthFactor(collateral, borrowAmount, price);
    
    if (health < PROTOCOL_PARAMS.LIQUIDATION_THRESHOLD) {
      return { valid: false, error: 'Health factor too low. Vault would be immediately liquidated.' };
    }
    
    if (health < 1.3) {
      warnings.push('⚠️ Low health factor. Consider borrowing less or adding more collateral.');
    }
    
    if (health < 1.5) {
      warnings.push('💡 Consider enabling AI auto-rebalance for safety.');
    }
  }
  
  return { valid: true, warnings: warnings.length > 0 ? warnings : undefined };
}

/**
 * Format large numbers with K/M/B suffixes
 */
export function formatCompact(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toFixed(2);
}
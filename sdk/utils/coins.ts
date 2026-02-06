/**
 * 🐙 Octopus Finance - Coin Utilities
 * 
 * Helper functions for handling Sui coin objects
 * Includes coin merging to prevent InsufficientCoinBalance errors
 */

import { Transaction, TransactionObjectInput } from '@mysten/sui/transactions';

/**
 * Merge multiple coins of the same type into a single coin within a transaction
 * This is necessary when user's balance is split across multiple coin objects
 * 
 * @param tx - The transaction to add merge operations to
 * @param coins - Array of coin objects with id and balance
 * @returns The primary coin object (with all others merged into it)
 * 
 * @example
 * ```typescript
 * const coins = await getUserCoins(client, address, COIN_TYPES.OCTSUI);
 * const tx = new Transaction();
 * const mergedCoin = mergeCoinsInTransaction(tx, coins);
 * const [splitCoin] = tx.splitCoins(mergedCoin, [tx.pure.u64(amount)]);
 * ```
 */
export function mergeCoinsInTransaction(
    tx: Transaction,
    coins: Array<{ id: string; balance: bigint }>
): any {
    if (coins.length === 0) {
        throw new Error('No coins provided for merging');
    }

    const primaryCoin = tx.object(coins[0].id);

    if (coins.length > 1) {
        const coinsToMerge = coins.slice(1).map(c => tx.object(c.id));
        tx.mergeCoins(primaryCoin, coinsToMerge);
    }

    return primaryCoin;
}

/**
 * Merge coins and split a specific amount
 * Convenience function that combines merging and splitting
 * 
 * @param tx - The transaction to add operations to
 * @param coins - Array of coin objects
 * @param amount - Amount to split out
 * @returns The split coin with the specified amount
 */
export function mergeAndSplitCoins(
    tx: Transaction,
    coins: Array<{ id: string; balance: bigint }>,
    amount: bigint
): any {
    const mergedCoin = mergeCoinsInTransaction(tx, coins);
    const [splitCoin] = tx.splitCoins(mergedCoin, [tx.pure.u64(amount)]);
    return splitCoin;
}

/**
 * Check if total balance across coins is sufficient for an amount
 */
export function getTotalBalance(coins: Array<{ id: string; balance: bigint }>): bigint {
    return coins.reduce((sum, coin) => sum + coin.balance, 0n);
}

/**
 * Validate coins have sufficient balance for an operation
 * @throws Error if insufficient balance
 */
export function validateSufficientBalance(
    coins: Array<{ id: string; balance: bigint }>,
    requiredAmount: bigint,
    coinType: string
): void {
    const total = getTotalBalance(coins);
    if (total < requiredAmount) {
        const deficit = Number(requiredAmount - total) / 1e9;
        throw new Error(
            `Insufficient ${coinType} balance. Need ${Number(requiredAmount) / 1e9}, have ${Number(total) / 1e9}. Short by ${deficit.toFixed(4)}`
        );
    }
}

/**
 * 🐙 Octopus Finance - Stake Transaction
 * 
 * Stake MOCKSUI to receive octSUI + StakePosition
 * 
 * @package @mysten/sui - Sui TypeScript SDK
 * @package @mysten/dapp-kit - For React hooks (useSignAndExecuteTransaction)
 */

import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, SHARED_OBJECTS, COIN_TYPES, MODULE_NAMES } from '../constants';

export interface StakeParams {
  /** MOCKSUI coin object ID to stake */
  coinObjectId: string;
}

/**
 * Build stake transaction
 * 
 * @example
 * ```tsx
 * // React component example
 * import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
 * import { buildStakeTransaction } from './transactions/stake';
 * 
 * function StakeButton({ coinId }: { coinId: string }) {
 *   const { mutate: signAndExecute } = useSignAndExecuteTransaction();
 *   
 *   const handleStake = () => {
 *     const tx = buildStakeTransaction({ coinObjectId: coinId });
 *     signAndExecute({ transaction: tx }, {
 *       onSuccess: (result) => console.log('Staked!', result),
 *       onError: (error) => console.error('Failed:', error),
 *     });
 *   };
 *   
 *   return <button onClick={handleStake}>Stake MOCKSUI</button>;
 * }
 * ```
 */
export function buildStakeTransaction(params: StakeParams): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.LIQUID_STAKING}::stake`,
    typeArguments: [COIN_TYPES.MOCKSUI],
    arguments: [
      tx.object(SHARED_OBJECTS.STAKING_POOL_ID),
      tx.object(params.coinObjectId),
    ],
  });
  
  return tx;
}

/**
 * Build stake transaction with amount (splits coin first)
 * Use this when you have a coin with more balance than you want to stake
 */
export interface StakeWithAmountParams {
  /** MOCKSUI coin object ID */
  coinObjectId: string;
  /** Amount to stake in raw units (e.g., 100e9 for 100 tokens) */
  amount: bigint;
}

export function buildStakeWithAmountTransaction(params: StakeWithAmountParams): Transaction {
  const tx = new Transaction();
  
  // Split the coin to get exact amount
  const [coinToStake] = tx.splitCoins(tx.object(params.coinObjectId), [
    tx.pure.u64(params.amount),
  ]);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.LIQUID_STAKING}::stake`,
    typeArguments: [COIN_TYPES.MOCKSUI],
    arguments: [
      tx.object(SHARED_OBJECTS.STAKING_POOL_ID),
      coinToStake,
    ],
  });
  
  return tx;
}

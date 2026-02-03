/**
 * 🐙 Octopus Finance - Unstake Transaction
 * 
 * Burn octSUI to receive back MOCKSUI
 * 
 * @package @mysten/sui - Sui TypeScript SDK
 * @package @mysten/dapp-kit - For React hooks
 */

import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, SHARED_OBJECTS, COIN_TYPES, MODULE_NAMES } from '../constants';

export interface UnstakeParams {
  /** octSUI coin object ID to unstake */
  octsuiCoinId: string;
}

/**
 * Build unstake transaction
 * 
 * @example
 * ```tsx
 * import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
 * import { buildUnstakeTransaction } from './transactions/unstake';
 * 
 * function UnstakeButton({ octsuiCoinId }: { octsuiCoinId: string }) {
 *   const { mutate: signAndExecute } = useSignAndExecuteTransaction();
 *   
 *   const handleUnstake = () => {
 *     const tx = buildUnstakeTransaction({ octsuiCoinId });
 *     signAndExecute({ transaction: tx }, {
 *       onSuccess: (result) => console.log('Unstaked!', result),
 *     });
 *   };
 *   
 *   return <button onClick={handleUnstake}>Unstake octSUI</button>;
 * }
 * ```
 */
export function buildUnstakeTransaction(params: UnstakeParams): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.LIQUID_STAKING}::unstake`,
    typeArguments: [COIN_TYPES.MOCKSUI],
    arguments: [
      tx.object(SHARED_OBJECTS.STAKING_POOL_ID),
      tx.object(params.octsuiCoinId),
    ],
  });
  
  return tx;
}

/**
 * Build unstake with specific amount (splits coin first)
 */
export interface UnstakeWithAmountParams {
  octsuiCoinId: string;
  amount: bigint;
}

export function buildUnstakeWithAmountTransaction(params: UnstakeWithAmountParams): Transaction {
  const tx = new Transaction();
  
  const [coinToUnstake] = tx.splitCoins(tx.object(params.octsuiCoinId), [
    tx.pure.u64(params.amount),
  ]);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.LIQUID_STAKING}::unstake`,
    typeArguments: [COIN_TYPES.MOCKSUI],
    arguments: [
      tx.object(SHARED_OBJECTS.STAKING_POOL_ID),
      coinToUnstake,
    ],
  });
  
  return tx;
}

/**
 * 🐙 Octopus Finance - Repay Transaction
 * 
 * Repay octUSD debt to reduce LTV
 * 
 * @package @mysten/sui - Sui TypeScript SDK
 * @package @mysten/dapp-kit - For React hooks
 */

import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, SHARED_OBJECTS, COIN_TYPES, MODULE_NAMES } from '../constants';

export interface RepayParams {
  /** User's vault object ID */
  vaultId: string;
  /** octUSD coin object ID to repay with */
  octusdCoinId: string;
}

/**
 * Build repay transaction (repays entire coin)
 * 
 * @example
 * ```tsx
 * import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
 * import { buildRepayTransaction } from './transactions/repay';
 * 
 * function RepayButton({ vaultId, octusdCoinId }: Props) {
 *   const { mutate: signAndExecute } = useSignAndExecuteTransaction();
 *   
 *   const handleRepay = () => {
 *     const tx = buildRepayTransaction({ vaultId, octusdCoinId });
 *     signAndExecute({ transaction: tx }, {
 *       onSuccess: (result) => console.log('Repaid!', result),
 *     });
 *   };
 *   
 *   return <button onClick={handleRepay}>Repay Debt</button>;
 * }
 * ```
 */
export function buildRepayTransaction(params: RepayParams): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.VAULT_MANAGER}::repay`,
    typeArguments: [COIN_TYPES.OCTSUI],
    arguments: [
      tx.object(SHARED_OBJECTS.BANK_ID),
      tx.object(params.vaultId),
      tx.object(params.octusdCoinId),
    ],
  });
  
  return tx;
}

/**
 * Build repay with specific amount (splits coin first)
 */
export interface RepayWithAmountParams {
  vaultId: string;
  octusdCoinId: string;
  amount: bigint;
}

export function buildRepayWithAmountTransaction(params: RepayWithAmountParams): Transaction {
  const tx = new Transaction();
  
  const [coinToRepay] = tx.splitCoins(tx.object(params.octusdCoinId), [
    tx.pure.u64(params.amount),
  ]);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.VAULT_MANAGER}::repay`,
    typeArguments: [COIN_TYPES.OCTSUI],
    arguments: [
      tx.object(SHARED_OBJECTS.BANK_ID),
      tx.object(params.vaultId),
      coinToRepay,
    ],
  });
  
  return tx;
}

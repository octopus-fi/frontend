/**
 * 🐙 Octopus Finance - Deposit to Reserve Transaction
 * 
 * Deposit octSUI into vault's reward reserve (for AI to use)
 * 
 * @package @mysten/sui - Sui TypeScript SDK
 * @package @mysten/dapp-kit - For React hooks
 */

import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, COIN_TYPES, MODULE_NAMES } from '../constants';

export interface DepositToReserveParams {
  /** User's vault object ID */
  vaultId: string;
  /** octSUI coin object ID to deposit to reserve */
  octsuiCoinId: string;
}

/**
 * Build deposit to reserve transaction
 * 
 * The reserve is a safety buffer that AI can use to add collateral
 * when LTV gets too high. This protects against liquidation.
 * 
 * @example
 * ```tsx
 * import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
 * import { buildDepositToReserveTransaction } from './transactions/deposit-to-reserve';
 * 
 * function DepositReserveButton({ vaultId, octsuiCoinId }: Props) {
 *   const { mutate: signAndExecute } = useSignAndExecuteTransaction();
 *   
 *   const handleDeposit = () => {
 *     const tx = buildDepositToReserveTransaction({ vaultId, octsuiCoinId });
 *     signAndExecute({ transaction: tx }, {
 *       onSuccess: () => console.log('Deposited to reserve!'),
 *     });
 *   };
 *   
 *   return (
 *     <button onClick={handleDeposit}>
 *       🛡️ Add to Safety Reserve
 *     </button>
 *   );
 * }
 * ```
 */
export function buildDepositToReserveTransaction(params: DepositToReserveParams): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.VAULT_MANAGER}::deposit_to_reserve`,
    typeArguments: [COIN_TYPES.OCTSUI],
    arguments: [
      tx.object(params.vaultId),
      tx.object(params.octsuiCoinId),
    ],
  });
  
  return tx;
}

/**
 * Build deposit to reserve with specific amount
 */
export interface DepositToReserveWithAmountParams {
  vaultId: string;
  octsuiCoinId: string;
  amount: bigint;
}

export function buildDepositToReserveWithAmountTransaction(
  params: DepositToReserveWithAmountParams
): Transaction {
  const tx = new Transaction();
  
  const [coinToDeposit] = tx.splitCoins(tx.object(params.octsuiCoinId), [
    tx.pure.u64(params.amount),
  ]);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.VAULT_MANAGER}::deposit_to_reserve`,
    typeArguments: [COIN_TYPES.OCTSUI],
    arguments: [
      tx.object(params.vaultId),
      coinToDeposit,
    ],
  });
  
  return tx;
}

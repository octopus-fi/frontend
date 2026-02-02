/**
 * 🐙 Octopus Finance - Deposit Collateral Transaction
 * 
 * Deposit octSUI as collateral into a vault
 * 
 * @package @mysten/sui - Sui TypeScript SDK
 * @package @mysten/dapp-kit - For React hooks
 */

import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, COIN_TYPES, MODULE_NAMES } from '../constants';

export interface DepositCollateralParams {
  /** User's vault object ID */
  vaultId: string;
  /** octSUI coin object ID to deposit */
  octsuiCoinId: string;
}

/**
 * Build deposit collateral transaction
 * 
 * @example
 * ```tsx
 * import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
 * import { buildDepositCollateralTransaction } from './transactions/deposit-collateral';
 * 
 * function DepositButton({ vaultId, octsuiCoinId }: Props) {
 *   const { mutate: signAndExecute } = useSignAndExecuteTransaction();
 *   
 *   const handleDeposit = () => {
 *     const tx = buildDepositCollateralTransaction({ vaultId, octsuiCoinId });
 *     signAndExecute({ transaction: tx }, {
 *       onSuccess: (result) => console.log('Deposited!', result),
 *     });
 *   };
 *   
 *   return <button onClick={handleDeposit}>Deposit Collateral</button>;
 * }
 * ```
 */
export function buildDepositCollateralTransaction(params: DepositCollateralParams): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.VAULT_MANAGER}::deposit_collateral`,
    typeArguments: [COIN_TYPES.OCTSUI],
    arguments: [
      tx.object(params.vaultId),
      tx.object(params.octsuiCoinId),
    ],
  });
  
  return tx;
}

/**
 * Build deposit collateral with specific amount
 */
export interface DepositCollateralWithAmountParams {
  vaultId: string;
  octsuiCoinId: string;
  amount: bigint;
}

export function buildDepositCollateralWithAmountTransaction(
  params: DepositCollateralWithAmountParams
): Transaction {
  const tx = new Transaction();
  
  const [coinToDeposit] = tx.splitCoins(tx.object(params.octsuiCoinId), [
    tx.pure.u64(params.amount),
  ]);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.VAULT_MANAGER}::deposit_collateral`,
    typeArguments: [COIN_TYPES.OCTSUI],
    arguments: [
      tx.object(params.vaultId),
      coinToDeposit,
    ],
  });
  
  return tx;
}

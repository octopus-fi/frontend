/**
 * 🐙 Octopus Finance - Withdraw Collateral Transaction
 * 
 * Withdraw octSUI collateral from vault (must maintain healthy LTV)
 * 
 * @package @mysten/sui - Sui TypeScript SDK
 * @package @mysten/dapp-kit - For React hooks
 */

import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, SHARED_OBJECTS, COIN_TYPES, MODULE_NAMES } from '../constants';

export interface WithdrawCollateralParams {
  /** User's vault object ID */
  vaultId: string;
  /** Amount to withdraw in raw units (e.g., 10e9 for 10 tokens) */
  amount: bigint;
}

/**
 * Build withdraw collateral transaction
 * 
 * NOTE: This will fail on-chain if withdrawal would cause LTV > 70%
 * Use calculateWithdrawPreview() to check before submitting
 * 
 * @example
 * ```tsx
 * import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
 * import { buildWithdrawCollateralTransaction } from './transactions/withdraw-collateral';
 * import { calculateWithdrawPreview, parseAmount } from '../calculations';
 * 
 * function WithdrawForm({ vaultId, collateral, debt, price }: Props) {
 *   const { mutate: signAndExecute } = useSignAndExecuteTransaction();
 *   const [amount, setAmount] = useState('');
 *   
 *   // Calculate preview as user types
 *   const preview = calculateWithdrawPreview(
 *     parseFloat(amount) || 0,
 *     price,
 *     collateral,
 *     debt
 *   );
 *   
 *   const handleWithdraw = () => {
 *     if (!preview.canWithdraw) return;
 *     
 *     const tx = buildWithdrawCollateralTransaction({ 
 *       vaultId, 
 *       amount: parseAmount(amount) 
 *     });
 *     signAndExecute({ transaction: tx }, {
 *       onSuccess: (result) => console.log('Withdrawn!', result),
 *     });
 *   };
 *   
 *   return (
 *     <div>
 *       <input 
 *         value={amount} 
 *         onChange={(e) => setAmount(e.target.value)} 
 *       />
 *       <p>Max: {preview.maxWithdrawable.toFixed(2)} octSUI</p>
 *       <p>New LTV: {preview.newLtvPercent.toFixed(2)}%</p>
 *       {preview.errorMessage && <p style={{color: 'red'}}>{preview.errorMessage}</p>}
 *       <button onClick={handleWithdraw} disabled={!preview.canWithdraw}>
 *         Withdraw
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function buildWithdrawCollateralTransaction(params: WithdrawCollateralParams): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.VAULT_MANAGER}::withdraw_collateral`,
    typeArguments: [COIN_TYPES.OCTSUI],
    arguments: [
      tx.object(params.vaultId),
      tx.object(SHARED_OBJECTS.ORACLE_ID),
      tx.pure.u64(params.amount),
    ],
  });
  
  return tx;
}

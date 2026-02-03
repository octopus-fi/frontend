/**
 * 🐙 Octopus Finance - Borrow Transaction
 * 
 * Borrow octUSD against deposited collateral
 * 
 * @package @mysten/sui - Sui TypeScript SDK
 * @package @mysten/dapp-kit - For React hooks
 */

import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, SHARED_OBJECTS, COIN_TYPES, MODULE_NAMES } from '../constants';

export interface BorrowParams {
  /** User's vault object ID */
  vaultId: string;
  /** Amount to borrow in raw units (e.g., 175e9 for $175) */
  amount: bigint;
}

/**
 * Build borrow transaction
 * 
 * @example
 * ```tsx
 * import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
 * import { buildBorrowTransaction } from './transactions/borrow';
 * import { parseAmount } from '../calculations';
 * 
 * function BorrowForm({ vaultId }: { vaultId: string }) {
 *   const { mutate: signAndExecute } = useSignAndExecuteTransaction();
 *   const [amount, setAmount] = useState('');
 *   
 *   const handleBorrow = () => {
 *     const tx = buildBorrowTransaction({ 
 *       vaultId, 
 *       amount: parseAmount(amount) 
 *     });
 *     signAndExecute({ transaction: tx }, {
 *       onSuccess: (result) => console.log('Borrowed!', result),
 *     });
 *   };
 *   
 *   return (
 *     <div>
 *       <input 
 *         value={amount} 
 *         onChange={(e) => setAmount(e.target.value)} 
 *         placeholder="Amount to borrow" 
 *       />
 *       <button onClick={handleBorrow}>Borrow octUSD</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function buildBorrowTransaction(params: BorrowParams): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.VAULT_MANAGER}::borrow`,
    typeArguments: [COIN_TYPES.OCTSUI],
    arguments: [
      tx.object(SHARED_OBJECTS.BANK_ID),
      tx.object(params.vaultId),
      tx.object(SHARED_OBJECTS.ORACLE_ID),
      tx.pure.u64(params.amount),
    ],
  });
  
  return tx;
}

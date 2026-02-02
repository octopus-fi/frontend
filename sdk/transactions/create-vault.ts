/**
 * 🐙 Octopus Finance - Create Vault Transaction
 * 
 * Create a new vault for the user to deposit collateral
 * 
 * @package @mysten/sui - Sui TypeScript SDK
 * @package @mysten/dapp-kit - For React hooks
 */

import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, SHARED_OBJECTS, COIN_TYPES, MODULE_NAMES } from '../constants';

/**
 * Build create vault transaction
 * 
 * Creates an empty vault for octSUI collateral
 * User can only have ONE vault per collateral type
 * 
 * @example
 * ```tsx
 * import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
 * import { buildCreateVaultTransaction } from './transactions/create-vault';
 * 
 * function CreateVaultButton() {
 *   const { mutate: signAndExecute } = useSignAndExecuteTransaction();
 *   
 *   const handleCreate = () => {
 *     const tx = buildCreateVaultTransaction();
 *     signAndExecute({ transaction: tx }, {
 *       onSuccess: (result) => {
 *         // Extract vault ID from result.objectChanges
 *         const vaultCreated = result.objectChanges?.find(
 *           (c) => c.type === 'created' && c.objectType.includes('Vault')
 *         );
 *         console.log('Vault created!', vaultCreated?.objectId);
 *       },
 *     });
 *   };
 *   
 *   return <button onClick={handleCreate}>Create Vault</button>;
 * }
 * ```
 */
export function buildCreateVaultTransaction(): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.VAULT_MANAGER}::create_vault`,
    typeArguments: [COIN_TYPES.OCTSUI],
    arguments: [
      tx.object(SHARED_OBJECTS.VAULT_REGISTRY_OCTSUI_ID),
    ],
  });
  
  return tx;
}

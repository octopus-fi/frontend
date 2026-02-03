/**
 * 🐙 Octopus Finance - Liquidation Transaction
 * 
 * Liquidate an unhealthy vault to earn liquidation bonus
 * 
 * @package @mysten/sui - Sui TypeScript SDK
 * @package @mysten/dapp-kit - For React hooks
 */

import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, SHARED_OBJECTS, COIN_TYPES, MODULE_NAMES } from '../constants';

export interface LiquidateParams {
  /** Vault object ID to liquidate */
  vaultId: string;
  /** octUSD coin object ID to repay debt */
  octusdCoinId: string;
  /** Walrus proof ID (for audit trail) */
  walrusProofId?: string;
}

/**
 * Build liquidate transaction
 * 
 * Liquidator repays debt and receives collateral + 5% bonus
 * 
 * Requirements:
 * - Vault LTV must be > 80% (liquidatable)
 * - Vault must have enough collateral to seize
 * 
 * @example
 * ```tsx
 * import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
 * import { buildLiquidateTransaction } from './transactions/liquidate';
 * import { calculateLiquidationPreview } from '../calculations';
 * 
 * function LiquidateButton({ vaultId, octusdCoinId, vaultData, price }: Props) {
 *   const { mutate: signAndExecute } = useSignAndExecuteTransaction();
 *   
 *   // Preview the liquidation
 *   const preview = calculateLiquidationPreview(
 *     repayAmount,
 *     vaultData.collateral,
 *     vaultData.debt,
 *     price
 *   );
 *   
 *   const handleLiquidate = () => {
 *     if (!preview.isLiquidatable) return;
 *     
 *     const tx = buildLiquidateTransaction({ 
 *       vaultId, 
 *       octusdCoinId,
 *       walrusProofId: 'proof_123' // Optional audit trail
 *     });
 *     signAndExecute({ transaction: tx }, {
 *       onSuccess: (result) => console.log('Liquidated!', result),
 *     });
 *   };
 *   
 *   return (
 *     <div>
 *       <p>Collateral to receive: {preview.collateralToSeize}</p>
 *       <p>Your profit: {preview.liquidatorProfit} (5% bonus)</p>
 *       <button onClick={handleLiquidate} disabled={!preview.isLiquidatable}>
 *         ⚡ Liquidate Vault
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function buildLiquidateTransaction(params: LiquidateParams): Transaction {
  const tx = new Transaction();
  
  const proofBytes = new TextEncoder().encode(params.walrusProofId || '');
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.LIQUIDATION}::liquidate`,
    typeArguments: [COIN_TYPES.OCTSUI],
    arguments: [
      tx.object(SHARED_OBJECTS.BANK_ID),
      tx.object(params.vaultId),
      tx.object(SHARED_OBJECTS.ORACLE_ID),
      tx.object(params.octusdCoinId),
      tx.pure.vector('u8', Array.from(proofBytes)),
    ],
  });
  
  return tx;
}

/**
 * Build liquidate with specific repay amount
 */
export interface LiquidateWithAmountParams {
  vaultId: string;
  octusdCoinId: string;
  repayAmount: bigint;
  walrusProofId?: string;
}

export function buildLiquidateWithAmountTransaction(params: LiquidateWithAmountParams): Transaction {
  const tx = new Transaction();
  
  const proofBytes = new TextEncoder().encode(params.walrusProofId || '');
  
  const [coinToRepay] = tx.splitCoins(tx.object(params.octusdCoinId), [
    tx.pure.u64(params.repayAmount),
  ]);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.LIQUIDATION}::liquidate`,
    typeArguments: [COIN_TYPES.OCTSUI],
    arguments: [
      tx.object(SHARED_OBJECTS.BANK_ID),
      tx.object(params.vaultId),
      tx.object(SHARED_OBJECTS.ORACLE_ID),
      coinToRepay,
      tx.pure.vector('u8', Array.from(proofBytes)),
    ],
  });
  
  return tx;
}

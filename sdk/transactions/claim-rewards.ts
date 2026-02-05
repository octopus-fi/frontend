/**
 * 🐙 Octopus Finance - Claim Staking Rewards Transaction
 * 
 * Claim accumulated staking rewards from StakePosition
 * 
 * @package @mysten/sui - Sui TypeScript SDK
 * @package @mysten/dapp-kit - For React hooks
 */

import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, SHARED_OBJECTS, COIN_TYPES, MODULE_NAMES } from '../constants';

export interface ClaimRewardsParams {
  /** User's StakePosition object ID */
  stakePositionId: string;
}

/**
 * Build claim rewards transaction
 * 
 * This mints octSUI rewards to the user's wallet
 * 
 * @example
 * ```tsx
 * import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
 * import { buildClaimRewardsTransaction } from './transactions/claim-rewards';
 * 
 * function ClaimButton({ stakePositionId, pendingRewards }: Props) {
 *   const { mutate: signAndExecute } = useSignAndExecuteTransaction();
 *   
 *   const handleClaim = () => {
 *     const tx = buildClaimRewardsTransaction({ stakePositionId });
 *     signAndExecute({ transaction: tx }, {
 *       onSuccess: (result) => console.log('Rewards claimed!', result),
 *     });
 *   };
 *   
 *   return (
 *     <button onClick={handleClaim} disabled={pendingRewards === 0n}>
 *       Claim {formatAmount(pendingRewards)} octSUI
 *     </button>
 *   );
 * }
 * ```
 */
export function buildClaimRewardsTransaction(params: ClaimRewardsParams): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.LIQUID_STAKING}::claim_rewards`,
    typeArguments: [COIN_TYPES.MOCKSUI],
    arguments: [
      tx.object(SHARED_OBJECTS.STAKING_POOL_ID),
      tx.object(params.stakePositionId),
      tx.object('0x6'), // Clock object - required for timestamp-based rewards
    ],
  });

  return tx;
}

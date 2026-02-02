/**
 * 🐙 Octopus Finance - AI Agent Authorization Transactions
 * 
 * Enable/disable AI agent to manage vault automatically
 * 
 * @package @mysten/sui - Sui TypeScript SDK
 * @package @mysten/dapp-kit - For React hooks
 */

import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, SHARED_OBJECTS, COIN_TYPES, MODULE_NAMES } from '../constants';

// Default AI Agent address (can be overridden)
export const DEFAULT_AI_AGENT_ADDRESS = '0x0d0470eaa28a8834e696732d01f5bd68f6e382c36c3c7a94e3006d1a49beb926';

export interface AuthorizeAIParams {
  /** User's vault object ID */
  vaultId: string;
  /** AI agent address to authorize (defaults to official agent) */
  aiAgentAddress?: string;
}

/**
 * Build authorize AI transaction
 * 
 * This grants the AI agent permission to rebalance the vault
 * by moving funds from reward_reserve to collateral
 * 
 * @example
 * ```tsx
 * import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
 * import { buildAuthorizeAITransaction } from './transactions/authorize-ai';
 * 
 * function AuthorizeAIButton({ vaultId }: { vaultId: string }) {
 *   const { mutate: signAndExecute } = useSignAndExecuteTransaction();
 *   
 *   const handleAuthorize = () => {
 *     const tx = buildAuthorizeAITransaction({ vaultId });
 *     signAndExecute({ transaction: tx }, {
 *       onSuccess: (result) => console.log('AI Authorized!', result),
 *     });
 *   };
 *   
 *   return (
 *     <button onClick={handleAuthorize}>
 *       🤖 Enable AI Auto-Rebalance
 *     </button>
 *   );
 * }
 * ```
 */
export function buildAuthorizeAITransaction(params: AuthorizeAIParams): Transaction {
  const tx = new Transaction();
  const agentAddress = params.aiAgentAddress || DEFAULT_AI_AGENT_ADDRESS;
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.AI_ADAPTER}::authorize_ai`,
    typeArguments: [COIN_TYPES.OCTSUI],
    arguments: [
      tx.object(params.vaultId),
      tx.pure.address(agentAddress),
    ],
  });
  
  return tx;
}

export interface EnableAutoRebalanceParams {
  /** User's StakePosition object ID */
  stakePositionId: string;
  /** User's vault object ID to link */
  vaultId: string;
}

/**
 * Build enable auto-rebalance transaction
 * 
 * Links a StakePosition to a Vault so AI can claim rewards
 * and automatically add them as collateral when needed
 * 
 * IMPORTANT: Must call this AFTER authorizing AI
 * 
 * @example
 * ```tsx
 * import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
 * import { 
 *   buildAuthorizeAITransaction, 
 *   buildEnableAutoRebalanceTransaction 
 * } from './transactions/authorize-ai';
 * 
 * function SetupAIButton({ vaultId, stakePositionId }: Props) {
 *   const { mutate: signAndExecute } = useSignAndExecuteTransaction();
 *   
 *   const handleSetup = () => {
 *     // Build combined transaction
 *     const tx = new Transaction();
 *     
 *     // Step 1: Authorize AI
 *     tx.moveCall({
 *       target: `${PACKAGE_ID}::ai_adapter::authorize_ai`,
 *       typeArguments: [COIN_TYPES.OCTSUI],
 *       arguments: [
 *         tx.object(vaultId),
 *         tx.pure.address(DEFAULT_AI_AGENT_ADDRESS),
 *       ],
 *     });
 *     
 *     // Step 2: Enable auto-rebalance
 *     tx.moveCall({
 *       target: `${PACKAGE_ID}::liquid_staking::enable_auto_rebalance`,
 *       arguments: [
 *         tx.object(stakePositionId),
 *         tx.pure.id(vaultId), // Pass vault ID
 *       ],
 *     });
 *     
 *     signAndExecute({ transaction: tx });
 *   };
 *   
 *   return <button onClick={handleSetup}>🤖 Setup AI Agent</button>;
 * }
 * ```
 */
export function buildEnableAutoRebalanceTransaction(params: EnableAutoRebalanceParams): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.LIQUID_STAKING}::enable_auto_rebalance`,
    arguments: [
      tx.object(params.stakePositionId),
      tx.pure.id(params.vaultId),
    ],
  });
  
  return tx;
}

/**
 * Build disable auto-rebalance transaction
 */
export interface DisableAutoRebalanceParams {
  stakePositionId: string;
}

export function buildDisableAutoRebalanceTransaction(params: DisableAutoRebalanceParams): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.LIQUID_STAKING}::disable_auto_rebalance`,
    arguments: [
      tx.object(params.stakePositionId),
    ],
  });
  
  return tx;
}

/**
 * Build combined transaction: Authorize AI + Enable Auto-Rebalance
 * 
 * Use this for one-click AI setup
 */
export function buildFullAISetupTransaction(params: {
  vaultId: string;
  stakePositionId: string;
  aiAgentAddress?: string;
}): Transaction {
  const tx = new Transaction();
  const agentAddress = params.aiAgentAddress || DEFAULT_AI_AGENT_ADDRESS;
  
  // Step 1: Authorize AI for vault
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.AI_ADAPTER}::authorize_ai`,
    typeArguments: [COIN_TYPES.OCTSUI],
    arguments: [
      tx.object(params.vaultId),
      tx.pure.address(agentAddress),
    ],
  });
  
  // Step 2: Link stake position to vault
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.LIQUID_STAKING}::enable_auto_rebalance`,
    arguments: [
      tx.object(params.stakePositionId),
      tx.pure.id(params.vaultId),
    ],
  });
  
  return tx;
}

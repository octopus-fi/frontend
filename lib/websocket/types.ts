/**
 * 🐙 Octopus Finance - WebSocket Event Types
 * Shared types for agent-frontend communication
 */

// WebSocket Event Types
export enum WSEventType {
    // Agent lifecycle events
    AGENT_STATUS = 'agent:status',
    CYCLE_START = 'cycle:start',
    CYCLE_COMPLETE = 'cycle:complete',

    // Vault events
    VAULT_HEALTH = 'vault:health',
    VAULT_STATUS_UPDATE = 'vault:statusUpdate',

    // AI events
    AI_ANALYSIS = 'ai:analysis',
    AI_EXECUTION = 'ai:execution',

    // Error events
    ERROR = 'error',

    // Client events (frontend -> agent)
    CLIENT_SUBSCRIBE_VAULT = 'client:subscribeVault',
    CLIENT_UNSUBSCRIBE_VAULT = 'client:unsubscribeVault',
    CLIENT_REQUEST_STATUS = 'client:requestStatus',
    CLIENT_REQUEST_STRATEGIES = 'client:requestStrategies',

    // Agent strategies
    AGENT_STRATEGIES = 'agent:strategies',
}

// ============================================================================
// Payload Types (match agent-side definitions)
// ============================================================================

export interface AgentStatusPayload {
    isRunning: boolean;
    vaultCount: number;
    agentAddress: string;
    connectedClients: number;
    timestamp: number;
}

export interface AgentStrategiesPayload {
    strategies: any[];
    timestamp: number;
}

export interface CycleEventPayload {
    cycleNumber: number;
    vaultsToProcess: number;
    timestamp: number;
    duration?: number;
}

export interface VaultHealthPayload {
    metrics: VaultHealthMetrics;
    timestamp: number;
}

export interface AIAnalysisPayload {
    analysis: AnalysisResult;
    timestamp: number;
}

export interface AIExecutionPayload {
    result: ExecutionResult;
    timestamp: number;
}

export interface ErrorPayload {
    message: string;
    vaultId?: string;
    code?: string;
    timestamp: number;
}

// ============================================================================
// Domain Types (simplified versions for frontend)
// ============================================================================

export type HealthStatus = 'HEALTHY' | 'WARNING' | 'AT_RISK' | 'CRITICAL' | 'LIQUIDATABLE';
export type RecommendedAction = 'NONE' | 'MONITOR' | 'CLAIM_REWARDS' | 'REBALANCE' | 'URGENT_REBALANCE';

export interface VaultHealthMetrics {
    vaultId: string;
    owner: string;
    collateralValue: string; // Serialized bigint
    debtValue: string;
    ltvBps: number;
    healthStatus: HealthStatus;
    rewardReserve: string;
    pendingRewards: string;
    recommendedAction: RecommendedAction;
}

export interface AnalysisResult {
    vaultId: string;
    shouldAct: boolean;
    action: RecommendedAction;
    reasoning: string;
    confidence: number;
    estimatedRewardsNeeded: string;
    availableRewards: string;
}

export interface ExecutionResult {
    success: boolean;
    txDigest?: string;
    action: string;
    vaultId: string;
    rewardsClaimed?: string;
    collateralAdded?: string;
    newLtv?: number;
    error?: string;
}

// ============================================================================
// Connection Status
// ============================================================================

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ConnectionState {
    status: ConnectionStatus;
    error?: string;
    lastConnected?: number;
    reconnectAttempts: number;
}

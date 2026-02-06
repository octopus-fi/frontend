/**
 * 🐙 Octopus Finance - Agent Store
 * Zustand store for AI agent state and WebSocket events
 */

import { create } from 'zustand';
import {
    ConnectionStatus,
    AgentStatusPayload,
    VaultHealthMetrics,
    AnalysisResult,
    ExecutionResult,
    CycleEventPayload,
    ErrorPayload,
} from '@/lib/websocket/types';

// Maximum items to keep in history arrays
const MAX_HISTORY_ITEMS = 50;

interface AgentState {
    // Connection
    connectionStatus: ConnectionStatus;
    lastConnected: number | null;

    // Agent status
    agentStatus: AgentStatusPayload | null;
    isAgentRunning: boolean;

    // Current cycle
    currentCycle: CycleEventPayload | null;
    isCycleActive: boolean;

    // Vault health metrics (keyed by vaultId)
    vaultMetrics: Map<string, VaultHealthMetrics>;

    // Recent analyses (most recent first)
    recentAnalyses: AnalysisResult[];

    // Recent executions (most recent first)
    recentExecutions: ExecutionResult[];

    // Recent errors
    recentErrors: ErrorPayload[];

    // Actions
    setConnectionStatus: (status: ConnectionStatus) => void;
    setAgentStatus: (status: AgentStatusPayload) => void;
    setCycleStart: (cycle: CycleEventPayload) => void;
    setCycleComplete: (cycle: CycleEventPayload) => void;
    addVaultMetrics: (metrics: VaultHealthMetrics) => void;
    addAnalysis: (analysis: AnalysisResult, timestamp?: number) => void;
    addExecution: (execution: ExecutionResult, timestamp?: number) => void;
    addError: (error: ErrorPayload) => void;
    clearHistory: () => void;
    reset: () => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
    // Initial state
    connectionStatus: 'disconnected',
    lastConnected: null,
    agentStatus: null,
    isAgentRunning: false,
    currentCycle: null,
    isCycleActive: false,
    vaultMetrics: new Map(),
    recentAnalyses: [],
    recentExecutions: [],
    recentErrors: [],

    // Actions
    setConnectionStatus: (status) => {
        set({
            connectionStatus: status,
            lastConnected: status === 'connected' ? Date.now() : get().lastConnected,
        });
    },

    setAgentStatus: (status) => {
        set({
            agentStatus: status,
            isAgentRunning: status.isRunning,
        });
    },

    setCycleStart: (cycle) => {
        set({
            currentCycle: cycle,
            isCycleActive: true,
        });
    },

    setCycleComplete: (cycle) => {
        set({
            currentCycle: cycle,
            isCycleActive: false,
        });
    },

    addVaultMetrics: (metrics) => {
        set((state) => {
            const newMetrics = new Map(state.vaultMetrics);
            newMetrics.set(metrics.vaultId, metrics);
            return { vaultMetrics: newMetrics };
        });
    },

    addAnalysis: (analysis, timestamp) => {
        set((state) => {
            // Check for duplicate (within same vault, action, and a small time window)
            const isDuplicate = state.recentAnalyses.some(
                (a) =>
                    a.vaultId === analysis.vaultId &&
                    a.action === analysis.action &&
                    Math.abs((timestamp || Date.now()) - (a as any).timestamp) < 5000
            );

            if (isDuplicate) return state;

            const analysisWithTime = { ...analysis, timestamp: timestamp || Date.now() };
            return {
                recentAnalyses: [analysisWithTime as any, ...state.recentAnalyses].slice(0, MAX_HISTORY_ITEMS),
            };
        });
    },

    addExecution: (execution, timestamp) => {
        set((state) => {
            // Check for duplicate by txDigest or (vault+action+time)
            const isDuplicate = state.recentExecutions.some((e) => {
                if (execution.txDigest && e.txDigest === execution.txDigest) return true;
                return (
                    e.vaultId === execution.vaultId &&
                    e.action === execution.action &&
                    Math.abs((timestamp || Date.now()) - (e as any).timestamp) < 5000
                );
            });

            if (isDuplicate) return state;

            const executionWithTime = { ...execution, timestamp: timestamp || Date.now() };
            return {
                recentExecutions: [executionWithTime as any, ...state.recentExecutions].slice(0, MAX_HISTORY_ITEMS),
            };
        });
    },

    addError: (error) => {
        set((state) => ({
            recentErrors: [error, ...state.recentErrors].slice(0, MAX_HISTORY_ITEMS),
        }));
    },

    clearHistory: () => {
        set({
            recentAnalyses: [],
            recentExecutions: [],
            recentErrors: [],
        });
    },

    reset: () => {
        set({
            connectionStatus: 'disconnected',
            lastConnected: null,
            agentStatus: null,
            isAgentRunning: false,
            currentCycle: null,
            isCycleActive: false,
            vaultMetrics: new Map(),
            recentAnalyses: [],
            recentExecutions: [],
            recentErrors: [],
        });
    },
}));

// Selectors for computed values
export const selectVaultMetrics = (vaultId: string) => (state: AgentState) =>
    state.vaultMetrics.get(vaultId);

export const selectAllVaultMetrics = () => (state: AgentState) =>
    Array.from(state.vaultMetrics.values());

export const selectLatestAnalysis = () => (state: AgentState) =>
    state.recentAnalyses[0] ?? null;

export const selectLatestExecution = () => (state: AgentState) =>
    state.recentExecutions[0] ?? null;

export const selectIsConnected = () => (state: AgentState) =>
    state.connectionStatus === 'connected';

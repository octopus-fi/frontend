/**
 * 🐙 Octopus Finance - useAgentSocket Hook
 * React hook for WebSocket connection to AI agent
 */

'use client';

import { useEffect, useCallback } from 'react';
import { getSocketService } from '@/lib/websocket';
import { useAgentStore } from '@/store/agent-store';
import type { ConnectionStatus } from '@/lib/websocket/types';

interface UseAgentSocketOptions {
    /** Auto-connect on mount (default: true) */
    autoConnect?: boolean;
    /** Vault IDs to subscribe to for specific updates */
    subscribeVaults?: string[];
}

interface UseAgentSocketReturn {
    /** Current connection status */
    connectionStatus: ConnectionStatus;
    /** Whether currently connected */
    isConnected: boolean;
    /** Whether agent is running */
    isAgentRunning: boolean;
    /** Whether a monitoring cycle is active */
    isCycleActive: boolean;
    /** Connect to agent */
    connect: () => void;
    /** Disconnect from agent */
    disconnect: () => void;
    /** Reconnect to agent */
    reconnect: () => void;
    /** Subscribe to specific vault */
    subscribeToVault: (vaultId: string) => void;
    /** Unsubscribe from vault */
    unsubscribeFromVault: (vaultId: string) => void;
    /** Request strategies from agent */
    requestStrategies: () => void;
}

/**
 * Hook for managing WebSocket connection to the Octopus AI Agent
 */
export function useAgentSocket(options: UseAgentSocketOptions = {}): UseAgentSocketReturn {
    const { autoConnect = true, subscribeVaults = [] } = options;

    const {
        connectionStatus,
        isAgentRunning,
        isCycleActive,
        setConnectionStatus,
        setAgentStatus,
        setCycleStart,
        setCycleComplete,
        addVaultMetrics,
        addAnalysis,
        addExecution,
        addError,
        setAgentStrategies,
    } = useAgentStore();

    // Connect to socket
    const connect = useCallback(() => {
        const socket = getSocketService();
        socket.connect();
    }, []);

    // Disconnect from socket
    const disconnect = useCallback(() => {
        const socket = getSocketService();
        socket.disconnect();
    }, []);

    // Reconnect
    const reconnect = useCallback(() => {
        disconnect();
        setTimeout(connect, 100);
    }, [connect, disconnect]);

    // Subscribe to specific vault
    const subscribeToVault = useCallback((vaultId: string) => {
        const socket = getSocketService();
        socket.subscribeToVault(vaultId);
    }, []);

    // Unsubscribe from vault
    const unsubscribeFromVault = useCallback((vaultId: string) => {
        const socket = getSocketService();
        socket.unsubscribeFromVault(vaultId);
    }, []);

    // Request strategies
    const requestStrategies = useCallback(() => {
        const socket = getSocketService();
        socket.requestStrategies();
    }, []);

    // Setup socket listeners and auto-connect
    useEffect(() => {
        const socket = getSocketService();

        // Setup event handlers
        const unsubConnectionChange = socket.onConnectionChange((status) => {
            setConnectionStatus(status);
        });

        const unsubAgentStatus = socket.onAgentStatus((payload) => {
            setAgentStatus(payload);
        });

        const unsubCycleStart = socket.onCycleStart((payload) => {
            setCycleStart(payload);
        });

        const unsubCycleComplete = socket.onCycleComplete((payload) => {
            setCycleComplete(payload);
        });

        const unsubVaultHealth = socket.onVaultHealth((payload) => {
            addVaultMetrics(payload.metrics);
        });

        const unsubAIAnalysis = socket.onAIAnalysis((payload) => {
            addAnalysis(payload.analysis, payload.timestamp);
        });

        const unsubAIExecution = socket.onAIExecution((payload) => {
            addExecution(payload.result, payload.timestamp);
        });

        const unsubError = socket.onError((payload) => {
            addError(payload);
        });

        const unsubAgentStrategies = socket.onAgentStrategies((payload) => {
            setAgentStrategies(payload.strategies);
        });

        // Auto-connect if enabled
        if (autoConnect) {
            connect();
        }

        // Cleanup on unmount
        return () => {
            unsubConnectionChange();
            unsubAgentStatus();
            unsubCycleStart();
            unsubCycleComplete();
            unsubVaultHealth();
            unsubAIAnalysis();
            unsubAIExecution();
            unsubError();
            unsubAgentStrategies();
            // Note: We don't disconnect here as other components might still be using the socket
        };
    }, [
        autoConnect,
        connect,
        setConnectionStatus,
        setAgentStatus,
        setCycleStart,
        setCycleComplete,
        addVaultMetrics,
        addAnalysis,
        addExecution,
        addError,
        setAgentStrategies,
    ]);

    // Subscribe to specific vaults when they change
    useEffect(() => {
        if (connectionStatus !== 'connected') return;

        const socket = getSocketService();
        subscribeVaults.forEach((vaultId) => {
            socket.subscribeToVault(vaultId);
        });

        return () => {
            subscribeVaults.forEach((vaultId) => {
                socket.unsubscribeFromVault(vaultId);
            });
        };
    }, [connectionStatus, subscribeVaults]);

    return {
        connectionStatus,
        isConnected: connectionStatus === 'connected',
        isAgentRunning,
        isCycleActive,
        connect,
        disconnect,
        reconnect,
        subscribeToVault,
        unsubscribeFromVault,
        requestStrategies,
    };
}

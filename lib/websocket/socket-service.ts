/**
 * 🐙 Octopus Finance - Socket.io Client Service
 * Singleton service for WebSocket connection to AI agent
 */

import { io, Socket } from 'socket.io-client';
import {
    WSEventType,
    AgentStatusPayload,
    CycleEventPayload,
    VaultHealthPayload,
    AIAnalysisPayload,
    AIExecutionPayload,
    ErrorPayload,
    ConnectionStatus,
    AgentStrategiesPayload,
} from './types';

// Default WebSocket URL
const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_AGENT_WS_URL || 'http://localhost:3001';

// Event callback types
type EventCallback<T> = (payload: T) => void;

interface EventCallbacks {
    agentStatus: Set<EventCallback<AgentStatusPayload>>;
    cycleStart: Set<EventCallback<CycleEventPayload>>;
    cycleComplete: Set<EventCallback<CycleEventPayload>>;
    vaultHealth: Set<EventCallback<VaultHealthPayload>>;
    aiAnalysis: Set<EventCallback<AIAnalysisPayload>>;
    aiExecution: Set<EventCallback<AIExecutionPayload>>;
    error: Set<EventCallback<ErrorPayload>>;
    agentStrategies: Set<EventCallback<AgentStrategiesPayload>>;
    connectionChange: Set<EventCallback<ConnectionStatus>>;
}

/**
 * WebSocket Client Service - Singleton
 */
class SocketService {
    private static instance: SocketService | null = null;
    private socket: Socket | null = null;
    private url: string;
    private status: ConnectionStatus = 'disconnected';
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;

    private callbacks: EventCallbacks = {
        agentStatus: new Set(),
        cycleStart: new Set(),
        cycleComplete: new Set(),
        vaultHealth: new Set(),
        aiAnalysis: new Set(),
        aiExecution: new Set(),
        error: new Set(),
        agentStrategies: new Set(),
        connectionChange: new Set(),
    };

    private constructor(url: string = DEFAULT_WS_URL) {
        this.url = url;
    }

    /**
     * Get singleton instance
     */
    static getInstance(url?: string): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService(url);
        }
        return SocketService.instance;
    }

    /**
     * Connect to WebSocket server
     */
    connect(): void {
        if (this.socket?.connected) {
            console.log('[WS] Already connected');
            return;
        }

        this.setStatus('connecting');

        this.socket = io(this.url, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        this.setupEventListeners();
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.setStatus('disconnected');
        this.reconnectAttempts = 0;
    }

    /**
     * Get current connection status
     */
    getStatus(): ConnectionStatus {
        return this.status;
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.status === 'connected' && !!this.socket?.connected;
    }

    /**
     * Setup socket event listeners
     */
    private setupEventListeners(): void {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('[WS] Connected to agent');
            this.reconnectAttempts = 0;
            this.setStatus('connected');
            // Request current status on connect
            this.socket?.emit(WSEventType.CLIENT_REQUEST_STATUS);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('[WS] Disconnected:', reason);
            this.setStatus('disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('[WS] Connection error:', error.message);
            this.reconnectAttempts++;
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                this.setStatus('error');
            }
        });

        // Agent events
        this.socket.on(WSEventType.AGENT_STATUS, (payload: AgentStatusPayload) => {
            this.callbacks.agentStatus.forEach((cb) => cb(payload));
        });

        this.socket.on(WSEventType.CYCLE_START, (payload: CycleEventPayload) => {
            this.callbacks.cycleStart.forEach((cb) => cb(payload));
        });

        this.socket.on(WSEventType.CYCLE_COMPLETE, (payload: CycleEventPayload) => {
            this.callbacks.cycleComplete.forEach((cb) => cb(payload));
        });

        this.socket.on(WSEventType.VAULT_HEALTH, (payload: VaultHealthPayload) => {
            this.callbacks.vaultHealth.forEach((cb) => cb(payload));
        });

        this.socket.on(WSEventType.AI_ANALYSIS, (payload: AIAnalysisPayload) => {
            this.callbacks.aiAnalysis.forEach((cb) => cb(payload));
        });

        this.socket.on(WSEventType.AI_EXECUTION, (payload: AIExecutionPayload) => {
            this.callbacks.aiExecution.forEach((cb) => cb(payload));
        });

        this.socket.on(WSEventType.ERROR, (payload: ErrorPayload) => {
            this.callbacks.error.forEach((cb) => cb(payload));
        });

        this.socket.on(WSEventType.AGENT_STRATEGIES, (payload: AgentStrategiesPayload) => {
            this.callbacks.agentStrategies.forEach((cb) => cb(payload));
        });
    }

    /**
     * Set connection status and notify listeners
     */
    private setStatus(status: ConnectionStatus): void {
        this.status = status;
        this.callbacks.connectionChange.forEach((cb) => cb(status));
    }

    // =========================================================================
    // Subscription Methods
    // =========================================================================

    onAgentStatus(callback: EventCallback<AgentStatusPayload>): () => void {
        this.callbacks.agentStatus.add(callback);
        return () => this.callbacks.agentStatus.delete(callback);
    }

    onCycleStart(callback: EventCallback<CycleEventPayload>): () => void {
        this.callbacks.cycleStart.add(callback);
        return () => this.callbacks.cycleStart.delete(callback);
    }

    onCycleComplete(callback: EventCallback<CycleEventPayload>): () => void {
        this.callbacks.cycleComplete.add(callback);
        return () => this.callbacks.cycleComplete.delete(callback);
    }

    onVaultHealth(callback: EventCallback<VaultHealthPayload>): () => void {
        this.callbacks.vaultHealth.add(callback);
        return () => this.callbacks.vaultHealth.delete(callback);
    }

    onAIAnalysis(callback: EventCallback<AIAnalysisPayload>): () => void {
        this.callbacks.aiAnalysis.add(callback);
        return () => this.callbacks.aiAnalysis.delete(callback);
    }

    onAIExecution(callback: EventCallback<AIExecutionPayload>): () => void {
        this.callbacks.aiExecution.add(callback);
        return () => this.callbacks.aiExecution.delete(callback);
    }

    onError(callback: EventCallback<ErrorPayload>): () => void {
        this.callbacks.error.add(callback);
        return () => this.callbacks.error.delete(callback);
    }

    onAgentStrategies(callback: EventCallback<AgentStrategiesPayload>): () => void {
        this.callbacks.agentStrategies.add(callback);
        return () => this.callbacks.agentStrategies.delete(callback);
    }

    onConnectionChange(callback: EventCallback<ConnectionStatus>): () => void {
        this.callbacks.connectionChange.add(callback);
        return () => this.callbacks.connectionChange.delete(callback);
    }

    // =========================================================================
    // Client Actions
    // =========================================================================

    /**
     * Subscribe to specific vault updates
     */
    subscribeToVault(vaultId: string): void {
        this.socket?.emit(WSEventType.CLIENT_SUBSCRIBE_VAULT, vaultId);
    }

    /**
     * Unsubscribe from vault updates
     */
    unsubscribeFromVault(vaultId: string): void {
        this.socket?.emit(WSEventType.CLIENT_UNSUBSCRIBE_VAULT, vaultId);
    }

    /**
     * Request current agent status
     */
    requestStatus(): void {
        this.socket?.emit(WSEventType.CLIENT_REQUEST_STATUS);
    }

    /**
     * Request available strategies from the agent
     */
    requestStrategies(): void {
        this.socket?.emit(WSEventType.CLIENT_REQUEST_STRATEGIES);
    }
}

// Export singleton getter
export const getSocketService = SocketService.getInstance;
export { SocketService };

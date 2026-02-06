/**
 * 🐙 Octopus Finance - Agent Activity Panel
 * Real-time display of AI agent analysis and execution activities
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Activity,
    Brain,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Zap,
    Clock,
    TrendingUp,
    Shield,
    RefreshCw,
    Wifi,
    WifiOff,
    ExternalLink,
} from 'lucide-react';
import { useAgentStore } from '@/store/agent-store';
import { useAgentSocket } from '@/hooks/useAgentSocket';
import type { AnalysisResult, ExecutionResult } from '@/lib/websocket/types';
import { formatDistanceToNow } from 'date-fns';

// ─── Status Indicator ────────────────────────────────────────────────────────

interface AgentStatusIndicatorProps {
    className?: string;
}

export function AgentStatusIndicator({ className }: AgentStatusIndicatorProps) {
    const { connectionStatus, isAgentRunning, isCycleActive } = useAgentSocket();

    const getStatusColor = () => {
        if (connectionStatus !== 'connected') return 'bg-red-500';
        if (isCycleActive) return 'bg-amber-500 animate-pulse';
        if (isAgentRunning) return 'bg-green-500 animate-pulse';
        return 'bg-gray-500';
    };

    const getStatusText = () => {
        if (connectionStatus === 'connecting') return 'Connecting...';
        if (connectionStatus === 'disconnected') return 'Disconnected';
        if (connectionStatus === 'error') return 'Connection Error';
        if (isCycleActive) return 'Analyzing...';
        if (isAgentRunning) return 'Active';
        return 'Idle';
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {connectionStatus === 'connected' ? (
                <Wifi className="h-4 w-4 text-green-500" />
            ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
            <span className="text-xs text-muted-foreground">{getStatusText()}</span>
        </div>
    );
}

// ─── Analysis Item ───────────────────────────────────────────────────────────

interface AnalysisItemProps {
    analysis: AnalysisResult;
    index: number;
}

function AnalysisItem({ analysis, index }: AnalysisItemProps) {
    const getActionIcon = () => {
        switch (analysis.action) {
            case 'CLAIM_REWARDS':
                return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'REBALANCE':
                return <RefreshCw className="h-4 w-4 text-amber-500" />;
            case 'URGENT_REBALANCE':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            default:
                return <Activity className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-white/5 hover:border-primary/20 transition-colors"
        >
            <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                {getActionIcon()}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">
                        {analysis.action?.replace(/_/g, ' ') || 'Analysis'}
                    </span>
                    <Badge variant={analysis.shouldAct ? 'warning' : 'success'} className="text-xs">
                        {analysis.shouldAct ? 'Action Needed' : 'Safe'}
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                    {analysis.reasoning || 'AI analysis completed for vault'}
                </p>
                {analysis.shouldAct && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-amber-500">
                        <Zap className="h-3 w-3" />
                        <span>Action recommended</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ─── Execution Item ──────────────────────────────────────────────────────────

interface ExecutionItemProps {
    execution: ExecutionResult;
    index: number;
}

function ExecutionItem({ execution, index }: ExecutionItemProps) {
    const isSuccess = execution.success;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${isSuccess
                ? 'bg-green-500/5 border-green-500/20'
                : 'bg-red-500/5 border-red-500/20'
                }`}
        >
            <div
                className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}
            >
                {isSuccess ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                        {execution.action?.replace(/_/g, ' ') || 'Execution'}
                    </span>
                    <Badge variant={isSuccess ? 'success' : 'danger'} className="text-xs">
                        {isSuccess ? 'Success' : 'Failed'}
                    </Badge>
                </div>
                {execution.txDigest && (
                    <a
                        href={`https://suiscan.xyz/testnet/tx/${execution.txDigest}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground font-mono hover:text-primary transition-colors group/link mt-1"
                    >
                        <span>TX: {execution.txDigest.slice(0, 6)}...{execution.txDigest.slice(-6)}</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </a>
                )}
                {execution.error && (
                    <p className="text-xs text-red-400 mt-1">{execution.error}</p>
                )}
            </div>
        </motion.div>
    );
}

// ─── Main Panel ──────────────────────────────────────────────────────────────

interface AgentActivityPanelProps {
    vaultId?: string;
    maxItems?: number;
    showHeader?: boolean;
    className?: string;
}

export function AgentActivityPanel({
    vaultId,
    maxItems = 5,
    showHeader = true,
    className,
}: AgentActivityPanelProps) {
    const { connectionStatus, isCycleActive } = useAgentSocket({
        subscribeVaults: vaultId ? [vaultId] : [],
    });

    const { recentAnalyses, recentExecutions, currentCycle, agentStatus } =
        useAgentStore();

    // Filter by vaultId if provided
    const analyses = vaultId
        ? recentAnalyses.filter((a) => a.vaultId === vaultId).slice(0, maxItems)
        : recentAnalyses.slice(0, maxItems);

    const executions = vaultId
        ? recentExecutions.filter((e) => e.vaultId === vaultId).slice(0, maxItems)
        : recentExecutions.slice(0, maxItems);

    const isEmpty = analyses.length === 0 && executions.length === 0;

    return (
        <Card className={`glass ${className}`}>
            {showHeader && (
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-primary" />
                            <CardTitle>AI Agent Activity</CardTitle>
                        </div>
                        <AgentStatusIndicator />
                    </div>
                </CardHeader>
            )}

            <CardContent className={showHeader ? '' : 'pt-6'}>
                {/* Cycle Status */}
                {isCycleActive && currentCycle && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20"
                    >
                        <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                            <span className="text-sm font-medium">
                                Monitoring Cycle #{currentCycle.cycleNumber}
                            </span>
                            <Badge variant="outline" className="text-xs">
                                {currentCycle.vaultsToProcess || 0} vaults
                            </Badge>
                        </div>
                    </motion.div>
                )}

                {/* Connection Status Warning */}
                {connectionStatus !== 'connected' && (
                    <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-2 text-amber-500">
                            <WifiOff className="h-4 w-4" />
                            <span className="text-sm">
                                {connectionStatus === 'connecting'
                                    ? 'Connecting to AI Agent...'
                                    : 'Not connected to AI Agent'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {isEmpty && connectionStatus === 'connected' && (
                    <div className="text-center py-8 text-muted-foreground">
                        <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No recent activity</p>
                        <p className="text-xs mt-1">
                            AI agent analysis will appear here in real-time
                        </p>
                    </div>
                )}

                {/* Activity Feed */}
                {!isEmpty && (
                    <div className="space-y-4">
                        {/* Recent Analyses */}
                        {analyses.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Recent Analyses
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <AnimatePresence mode="popLayout">
                                        {analyses.map((analysis, i) => (
                                            <AnalysisItem
                                                key={`${analysis.vaultId}-${i}`}
                                                analysis={analysis}
                                                index={i}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {/* Recent Executions */}
                        {executions.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Recent Executions
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <AnimatePresence mode="popLayout">
                                        {executions.map((execution, i) => (
                                            <ExecutionItem
                                                key={`${execution.vaultId}-${i}`}
                                                execution={execution}
                                                index={i}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Agent Stats Footer */}
                {agentStatus && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                    Active Agent: {agentStatus.agentAddress.slice(0, 6)}...{agentStatus.agentAddress.slice(-4)}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                <span>Monitoring {agentStatus.vaultCount || 0} vaults</span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default AgentActivityPanel;

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn, formatTimeAgo } from '@/lib/utils';
import { TransactionPreview, type TxPreviewData } from '@/components/chat/TransactionPreview';
import { Waves } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  /** When present on an assistant message, renders a TransactionPreview card. */
  txPreview?: TxPreviewData;
}

interface ChatMessageProps {
  message: ChatMsg;
  /** Index used only to stagger the initial animation */
  index?: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ChatMessage({ message, index = 0 }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [txConfirmed, setTxConfirmed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.06, 0.3) }}
      className={cn('flex gap-3', isUser && 'flex-row-reverse')}
    >
      {/* Avatar */}
      <div className={cn(
        'shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1',
        isUser
          ? 'bg-primary/20 border border-primary/40'
          : 'bg-muted border border-white/10'
      )}>
        {isUser ? (
          /* simple initials placeholder */
          <span className="text-xs font-bold text-primary">You</span>
        ) : (
          <Waves className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* Bubble + optional tx preview */}
      <div className={cn('max-w-[75%]', isUser && 'items-end flex flex-col')}>
        {/* Bubble */}
        <div className={cn(
          'rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
          isUser
            ? 'bg-primary/15 border border-primary/30 text-foreground rounded-tr-sm'
            : 'glass text-foreground rounded-tl-sm'
        )}>
          {message.content}
        </div>

        {/* Transaction Preview (assistant only) */}
        {!isUser && message.txPreview && (
          <TransactionPreview
            preview={message.txPreview}
            confirmed={txConfirmed}
            onConfirm={() => setTxConfirmed(true)}
            onCancel={() => {/* parent could handle via callback if needed */}}
          />
        )}

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {formatTimeAgo(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}
'use client';

import { motion } from 'framer-motion';
import {
  Coins,
  TrendingUp,
  Shield,
  BarChart3,
  Zap,
  HelpCircle,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Suggestion {
  icon: React.ReactNode;
  label: string;
  prompt: string;
}

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const suggestions: Suggestion[] = [
  {
    icon: <Coins className="h-4 w-4 text-primary" />,
    label: 'Borrow octUSD',
    prompt: 'I want to borrow 500 octUSD from my vault',
  },
  {
    icon: <TrendingUp className="h-4 w-4 text-green-400" />,
    label: 'Check portfolio',
    prompt: 'Show me my portfolio performance and health factors',
  },
  {
    icon: <Shield className="h-4 w-4 text-blue-400" />,
    label: 'Add collateral',
    prompt: 'How do I add more collateral to protect my vault?',
  },
  {
    icon: <BarChart3 className="h-4 w-4 text-purple-400" />,
    label: 'Analyze risk',
    prompt: 'Analyze the risk across all my vaults and suggest improvements',
  },
  {
    icon: <Zap className="h-4 w-4 text-amber-400" />,
    label: 'Liquidation opps',
    prompt: 'Are there any profitable liquidation opportunities right now?',
  },
  {
    icon: <HelpCircle className="h-4 w-4 text-muted-foreground" />,
    label: 'How does CDP work?',
    prompt: 'Explain how collateralized debt positions work on Octopus Finance',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {suggestions.map((s, i) => (
        <motion.button
          key={s.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.07 }}
          onClick={() => onSelect(s.prompt)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/10 bg-background/60 backdrop-blur text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-primary/8 transition-all"
        >
          {s.icon}
          {s.label}
        </motion.button>
      ))}
    </div>
  );
}
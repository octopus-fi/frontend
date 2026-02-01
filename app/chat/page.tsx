"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage, type ChatMsg } from "@/components/chat/ChatMessage";
import { SuggestedPrompts } from "@/components/chat/SuggestedPrompts";
import { type TxPreviewData } from "@/components/chat/TransactionPreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Waves, Activity, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

// ─── Simulated response bank ────────────────────────────────────────────────
// Maps keyword patterns → { text, optional txPreview }.
// The FIRST matching pattern wins.

interface SimulatedReply {
  text: string;
  txPreview?: TxPreviewData;
}

function getSimulatedReply(input: string): SimulatedReply {
  const q = input.toLowerCase();

  // ── borrow ──────────────────────────────────────────────────────────────
  if (q.includes("borrow")) {
    const amountMatch = input.match(/(\d[\d,]*)/);
    const amount = amountMatch ? amountMatch[1].replace(/,/g, "") : "500";

    return {
      text: `Sure! I can help you borrow **${amount} octUSD** from your active vault.\n\nHere's what will happen:\n\n1. Your vault's collateral will be checked against the maximum LTV ratio.\n2. The minting fee (0.5%) will be deducted.\n3. octUSD will be minted directly to your wallet.\n\nYour current health factor is **2.1×** — after this borrow it will drop to approximately **1.72×**, which is still safely above the liquidation threshold of 1.0×.\n\nWant me to proceed? I've prepared the transaction below for your review.`,
      txPreview: {
        type: "borrow",
        title: `Borrow ${amount} octUSD`,
        summary: `Mint ${amount} octUSD against your collateral in Vault #1. Health will move from 2.1× → ~1.72×.`,
        steps: [
          {
            step: 1,
            description: "Validate collateral and LTV ratio",
            icon: "shield",
          },
          {
            step: 2,
            description: "Deduct 0.5% minting fee (2.50 octUSD)",
            icon: "coins",
          },
          {
            step: 3,
            description: `Mint ${amount} octUSD to your wallet`,
            icon: "trend-up",
          },
          {
            step: 4,
            description: "Update vault state on-chain",
            icon: "arrow-up",
          },
        ],
        details: {
          "Borrow Amount": `${amount} octUSD`,
          "Minting Fee (0.5%)": `${(Number(amount) * 0.005).toFixed(2)} octUSD`,
          "Net Received": `${(Number(amount) * 0.995).toFixed(2)} octUSD`,
          "Health Before": "2.10×",
          "Health After": "~1.72×",
          Vault: "Vault #1",
        },
        estimatedGas: 0.0012,
        warnings: [
          "Health factor will decrease. Ensure you can manage the additional debt.",
        ],
      },
    };
  }

  // ── repay ───────────────────────────────────────────────────────────────
  if (q.includes("repay") || q.includes("pay back") || q.includes("pay off")) {
    const amountMatch = input.match(/(\d[\d,]*)/);
    const amount = amountMatch ? amountMatch[1].replace(/,/g, "") : "1000";

    return {
      text: `I'll set up a repayment of **${amount} octUSD** for you.\n\nRepaying debt will:\n- **Increase** your health factor from 2.1× → ~2.68×\n- **Reduce** your LTV ratio\n- Make your vault safer against liquidation\n\nHere's the transaction for your review:`,
      txPreview: {
        type: "repay",
        title: `Repay ${amount} octUSD`,
        summary: `Burn ${amount} octUSD to reduce your vault debt. Health improves from 2.1× → ~2.68×.`,
        steps: [
          {
            step: 1,
            description: `Approve ${amount} octUSD from your wallet`,
            icon: "shield",
          },
          {
            step: 2,
            description: "Burn octUSD to reduce vault debt",
            icon: "coins",
          },
          {
            step: 3,
            description: "Update vault health and LTV on-chain",
            icon: "arrow-up",
          },
        ],
        details: {
          "Repay Amount": `${amount} octUSD`,
          "Remaining Debt": `${Math.max(0, 6000 - Number(amount)).toLocaleString()} octUSD`,
          "Health Before": "2.10×",
          "Health After": "~2.68×",
          Vault: "Vault #1",
        },
        estimatedGas: 0.0009,
      },
    };
  }

  // ── add collateral / deposit ────────────────────────────────────────────
  if (q.includes("add collateral") || q.includes("deposit")) {
    const amountMatch = input.match(/(\d[\d,]*)/);
    const amount = amountMatch ? amountMatch[1].replace(/,/g, "") : "2000";

    return {
      text: `Adding **${amount} octSUI** of collateral to your vault is a great move — it'll significantly strengthen your position.\n\nThis will raise your health factor from **2.1× → ~3.2×**, giving you a very comfortable safety margin.\n\nTransaction preview below:`,
      txPreview: {
        type: "add_collateral",
        title: `Deposit ${amount} octSUI`,
        summary: `Add ${amount} octSUI collateral to Vault #1. Health improves from 2.1× → ~3.2×.`,
        steps: [
          {
            step: 1,
            description: `Approve ${amount} octSUI transfer`,
            icon: "shield",
          },
          {
            step: 2,
            description: "Transfer octSUI to vault contract",
            icon: "coins",
          },
          {
            step: 3,
            description: "Recalculate health factor and LTV",
            icon: "trend-up",
          },
        ],
        details: {
          "Deposit Amount": `${amount} octSUI`,
          "New Collateral": `${(10000 + Number(amount)).toLocaleString()} octSUI`,
          "Health Before": "2.10×",
          "Health After": "~3.20×",
          Vault: "Vault #1",
        },
        estimatedGas: 0.0008,
      },
    };
  }

  // ── liquidation ─────────────────────────────────────────────────────────
  if (q.includes("liquidat")) {
    return {
      text: `Great question! I've scanned the network and found **5 liquidatable vaults** right now.\n\nHere are the highlights:\n\n• **Vault #0xabc123** — Health 1.05×, estimated profit **$420**, only ~15 minutes left\n• **Vault #0x789xyz** — Health 1.08×, estimated profit **$672**, ~45 min window\n• **Vault #0xghi012** — Health 1.095×, estimated profit **$1,008**, 2-hour window\n\nThe highest-profit opportunity is Vault #0xghi012 at **$1,008**, but the most urgent is #0xabc123 — it could be liquidated by someone else within minutes.\n\nWould you like me to prepare a flash liquidation transaction for any of these? You can also head to the **Liquidate** page for the full list and profit calculator.`,
    };
  }

  // ── portfolio / health ──────────────────────────────────────────────────
  if (
    q.includes("portfolio") ||
    q.includes("health") ||
    q.includes("status") ||
    q.includes("show me")
  ) {
    return {
      text: `Here's a snapshot of your portfolio:\n\n**Portfolio Overview**\n• Total Value: **$125,420**\n• Total Earned: **+$18,420** (17.2% ROI)\n• Current APY: **14.2%**\n\n**Vault #1 — Balanced Farmer**\n• Collateral: 10,000 octSUI (~$28,000)\n• Debt: 6,000 octUSD\n• Health Factor: **2.1×** ✅ Safe\n• LTV: 60%\n• AI Manager: Active\n\n**Vault #2 — Conservative Farmer**\n• Collateral: 5,000 octSUI (~$14,000)\n• Debt: 2,800 octUSD\n• Health Factor: **1.8×** ⚠️ Monitor\n• LTV: 64%\n\n**Vault #3 — Aggressive Maximizer**\n• Collateral: 3,000 octSUI (~$8,400)\n• Debt: 7,200 octUSD\n• Health Factor: **1.15×** 🔴 At Risk\n• LTV: 70%\n\n⚠️ **Vault #3 needs attention.** Its health is dangerously close to the 1.0× liquidation threshold. I'd recommend either adding collateral or repaying some debt. Want me to help with that?`,
    };
  }

  // ── risk / analyze ──────────────────────────────────────────────────────
  if (q.includes("risk") || q.includes("analy")) {
    return {
      text: `I've run a full risk analysis across your portfolio. Here's what I found:\n\n**Overall Risk Score: 75 / 100** — Medium\n\n📊 **Risk Breakdown:**\n• Health Factor Score: 78 / 100\n• Diversification: 60 / 100 (3 vaults)\n• Liquidity: 82 / 100\n• Stability: 65 / 100\n• Capital Efficiency: 71 / 100\n\n🔍 **Key Findings:**\n1. Vault #3 is your biggest risk — health at 1.15× with only a 15% buffer before liquidation\n2. Your average LTV of 64.7% is on the higher side; consider reducing to ~55%\n3. All three vaults use different strategies, which is good for diversification\n\n💡 **Recommendations:**\n1. **Urgent:** Add 1,500 octSUI collateral to Vault #3, or repay 1,000 octUSD of debt\n2. Repay 500 octUSD from Vault #2 to bring its health above 2.0×\n3. Consider enabling AI auto-rebalance on Vault #2\n\nWant me to prepare any of these actions?`,
    };
  }

  // ── CDP explanation ─────────────────────────────────────────────────────
  if (
    q.includes("cdp") ||
    q.includes("collateralized") ||
    q.includes("how does") ||
    q.includes("explain")
  ) {
    return {
      text: `Great question! Here's how CDPs work on Octopus Finance:\n\n**Collateralized Debt Positions (CDPs)** let you unlock value from your staked assets without selling them.\n\n**The Flow:**\n1. **Stake** SUI → receive octSUI (liquid staking token)\n2. **Deposit** octSUI as collateral into a vault\n3. **Borrow** octUSD (our stablecoin) against that collateral\n4. **Use** octUSD however you like — DeFi, trading, spending\n5. **Repay** octUSD anytime to unlock your collateral\n\n**Key Concepts:**\n• **Health Factor** — Ratio of collateral value to debt. Must stay above 1.0× or your vault gets liquidated\n• **LTV (Loan-to-Value)** — How much you've borrowed relative to collateral. Lower = safer\n• **AI Manager** — Our on-chain AI monitors your vault 24/7 and auto-rebalances to keep you safe\n• **Strategies** — Pre-built playbooks (Conservative, Balanced, Aggressive) that define how your vault behaves\n\n**Why Octopus?**\n• Your octSUI keeps earning staking rewards while locked as collateral\n• AI management means you never miss a rebalance\n• Strategies are stored on Walrus for transparency and immutability\n\nWant me to help you create a vault or optimize an existing one?`,
    };
  }

  // ── stake ───────────────────────────────────────────────────────────────
  if (q.includes("stake")) {
    const amountMatch = input.match(/(\d[\d,]*)/);
    const amount = amountMatch ? amountMatch[1].replace(/,/g, "") : "1000";

    return {
      text: `I'll help you stake **${amount} SUI** to receive octSUI.\n\nAt the current exchange rate of **0.9842 octSUI/SUI**, you'll receive approximately **${(Number(amount) * 0.9842).toFixed(2)} octSUI**.\n\nYour octSUI will immediately start earning the network staking reward of ~7.2% APY.\n\nHere's the transaction:`,
      txPreview: {
        type: "stake",
        title: `Stake ${amount} SUI`,
        summary: `Stake ${amount} SUI and receive ${(Number(amount) * 0.9842).toFixed(2)} octSUI at the current exchange rate.`,
        steps: [
          {
            step: 1,
            description: `Approve ${amount} SUI transfer`,
            icon: "shield",
          },
          {
            step: 2,
            description: "Delegate SUI to validator pool",
            icon: "coins",
          },
          {
            step: 3,
            description: `Mint ${(Number(amount) * 0.9842).toFixed(2)} octSUI to your wallet`,
            icon: "trend-up",
          },
        ],
        details: {
          Input: `${amount} SUI`,
          "Exchange Rate": "0.9842 octSUI/SUI",
          Output: `${(Number(amount) * 0.9842).toFixed(2)} octSUI`,
          "Staking APY": "~7.2%",
        },
        estimatedGas: 0.0006,
      },
    };
  }

  // ── strategy ────────────────────────────────────────────────────────────
  if (q.includes("strateg")) {
    return {
      text: `Here are the top strategies available on the marketplace:\n\n🟢 **Diamond Hands HODL** — Risk 1/10\n• Ultra-conservative, 6.8% APY, 521 users\n• Perfect for long-term holders who want maximum safety\n\n🟢 **Conservative Farmer** — Risk 2/10\n• Stable and reliable, 8.5% APY, 342 users\n• Health stays above 2.5× at all times\n\n🟡 **Smart Rebalancer** — Risk 4/10\n• AI-optimized, 16.4% APY, 234 users\n• Dynamically adjusts based on market volatility\n\n🟡 **Balanced Farmer** — Risk 5/10\n• The sweet spot, 14.2% APY, 189 users\n• Targets 1.8× health with up to 65% LTV\n\n🔴 **Volatility Surfer** — Risk 7/10\n• Aggressive rebalancing, 19.8% APY, 98 users\n\n🔴 **Aggressive Yield Maximizer** — Risk 8/10\n• Maximum yield, 22.7% APY, 67 users\n• For experienced users only\n\nBased on your current vaults, I'd recommend **Smart Rebalancer** or **Balanced Farmer** as a good fit. Want to clone one to a vault?`,
    };
  }

  // ── fallback ────────────────────────────────────────────────────────────
  return {
    text: `I can help you with a range of vault management tasks. Here are some things you can ask me:\n\n• **Borrow** octUSD from your vault\n• **Repay** debt to improve your health factor\n• **Add collateral** to protect a vault\n• **Stake** SUI to earn octSUI\n• **Check** your portfolio or vault status\n• **Analyze** risk across your positions\n• **Find** liquidation opportunities\n• **Learn** about CDPs, strategies, or how Octopus works\n\nJust tell me what you'd like to do in plain English!`,
  };
}

// ─── Typing indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 h-8 w-8 rounded-full bg-muted border border-white/10 flex items-center justify-center">
        <Waves className="h-4 w-4 text-primary" />
      </div>
      <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        <span
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const INITIAL_MESSAGES: ChatMsg[] = [
  {
    id: "system-welcome",
    role: "assistant",
    content: `Welcome to Octopus AI! 🐙\n\nI'm your on-chain vault manager. I can help you borrow, repay, stake, analyze risk, find liquidation opportunities — all through natural language.\n\nWhat would you like to do today?`,
    timestamp: Date.now() - 5000,
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isThinking]);

  // Simulate a reply after a realistic delay
  const simulateReply = useCallback((userText: string) => {
    setIsThinking(true);

    // Typing delay: 800ms base + 15ms per character in the user message (feels natural)
    const delay = 800 + Math.min(userText.length * 15, 1500);

    setTimeout(() => {
      const reply = getSimulatedReply(userText);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: reply.text,
          timestamp: Date.now(),
          txPreview: reply.txPreview,
        },
      ]);
      setIsThinking(false);
    }, delay);
  }, []);

  // Send handler shared by button click and Enter key
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isThinking) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: Date.now(),
      },
    ]);
    setInput("");
    simulateReply(text);
  }, [input, isThinking, simulateReply]);

  // Suggested prompt clicked → inject into input and immediately send
  const handleSuggestion = useCallback(
    (prompt: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: prompt,
          timestamp: Date.now(),
        },
      ]);
      simulateReply(prompt);
    },
    [simulateReply],
  );

  // Only show suggestions when there is just the welcome message
  const showSuggestions = messages.length === 1 && !isThinking;

  return (
    /*
      The dashboard layout wraps us in:
        <main class="flex-1 overflow-y-auto">
          <div class="container mx-auto p-6">  ← this child
    
      We use negative margin + h-full to expand back to fill <main>,
      then set up our own flex column inside.
    */
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-6">
            <div className="-m-6 h-[calc(100vh-4rem)] flex flex-col">
              {/* ── Top bar ──────────────────────────────────────────────────────── */}
              <div className="shrink-0 flex items-center justify-between px-6 py-3.5 border-b border-white/10 glass-dark">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <Waves className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">Octopus AI</span>
                      <Badge variant="success" className="text-xs gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                        Live
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Vault manager · powered by AI
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs gap-1">
                    <Activity className="h-3 w-3 text-primary" />3 Vaults
                    monitored
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    AI Active
                  </Badge>
                </div>
              </div>

              {/* ── Message list (scrolling) ───────────────────────────────────── */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
              >
                {messages.map((msg, i) => (
                  <ChatMessage key={msg.id} message={msg} index={i} />
                ))}

                {/* Typing indicator */}
                <AnimatePresence>
                  {isThinking && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TypingIndicator />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Suggested prompts — only when chat is at its initial state */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="pt-2"
                    >
                      <SuggestedPrompts onSelect={handleSuggestion} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Input bar ──────────────────────────────────────────────────── */}
              <div className="shrink-0 px-6 py-4 border-t border-white/10 glass-dark">
                <div className="flex items-end gap-3 bg-background/60 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-primary/40 transition-colors">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask me anything about your vaults…"
                    rows={1}
                    className={cn(
                      "flex-1 resize-none bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none",
                      "max-h-32", // cap height so it doesn't grow unbounded
                    )}
                    style={{ lineHeight: "1.6" }}
                    disabled={isThinking}
                  />
                  <Button
                    variant="electric"
                    size="icon"
                    className="shrink-0 h-9 w-9"
                    onClick={handleSend}
                    disabled={!input.trim() || isThinking}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Footer hint */}
                <p className="text-xs text-muted-foreground text-center mt-2.5">
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">
                    Enter
                  </kbd>{" "}
                  to send ·{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">
                    Shift+Enter
                  </kbd>{" "}
                  for new line · Transactions are previewed before execution
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClientShell } from "@/components/layout/ClientShell";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-geist-sans',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: "Octopus Finance - AI-Managed LST CDP Protocol on Sui",
  description: "The first AI-managed liquid staking and CDP protocol on Sui. Stake SUI, borrow octUSD, never get liquidated.",
  keywords: ["DeFi", "Sui", "Liquid Staking", "CDP", "AI", "Octopus Finance"],
  authors: [{ name: "Octopus Finance Team" }],
  openGraph: {
    title: "Octopus Finance",
    description: "AI-Managed LST CDP Protocol on Sui",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(
        inter.variable,
        jetbrainsMono.variable,
        "font-sans antialiased min-h-screen bg-background ocean-bg"
      )}>
        <ClientShell>
          <div className="relative z-10">
            {children}
          </div>
        </ClientShell>
        
        {/* Decorative tentacles */}
        <div className="fixed top-0 right-0 h-screen w-20 pointer-events-none opacity-20">
          <div className="tentacle" style={{ left: '10px' }} />
          <div className="tentacle" style={{ left: '30px' }} />
          <div className="tentacle" style={{ left: '50px' }} />
        </div>
      </body>
    </html>
  );
}
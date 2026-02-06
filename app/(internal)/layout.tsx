'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function InternalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <Header />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-background">
                    {children}
                </main>
            </div>
        </div>
    );
}

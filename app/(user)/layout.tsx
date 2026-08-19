import React from "react";

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-body">
            {/* Spacer reserved for teammate's branch navbar (approx 80px / h-20) */}
            <div className="h-20 w-full flex-shrink-0" aria-hidden="true" />

            {/* Main content area */}
            <main className="flex-grow w-full flex flex-col">
                {children}
            </main>
        </div>
    );
}

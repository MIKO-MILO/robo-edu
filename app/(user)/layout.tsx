import React from "react";
import Navbar from "../../components/user/navbar";

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-body">
            {/* Header / Navbar */}
            <header className="w-full px-4 sm:px-6 lg:px-8">
                <Navbar />
            </header>

            {/* Main content area */}
            <main className="flex-grow w-full flex flex-col">
                {children}
            </main>
        </div>
    );
}

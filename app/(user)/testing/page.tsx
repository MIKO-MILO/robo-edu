import React from "react";
import { Button } from "@/components/ui/button";

export default function TestingPage() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <div className="rounded-2xl border-2 border-border bg-card p-8 neo-shadow">
                <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl mb-4">
                    Testing Button Component
                </h1>
                <p className="font-body text-muted-foreground mb-8">
                    Halaman pengujian untuk komponen Button dengan berbagai varian tema Neo-brutalism RoboEdu.
                </p>

                <div className="space-y-8">
                    {/* Brand & Default */}
                    <div>
                        <h2 className="font-heading text-lg font-semibold text-foreground mb-3">
                            Brand & Default Variants
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="primary">Primary Button</Button>
                            <Button variant="secondary">Secondary Button</Button>
                            <Button variant="default">Default Button</Button>
                            <Button variant="card">Card Button</Button>
                            <Button variant="outline">Outline Button</Button>
                            <Button variant="ghost">Ghost Button</Button>
                        </div>
                    </div>

                    {/* Accent Pastel */}
                    <div>
                        <h2 className="font-heading text-lg font-semibold text-foreground mb-3">
                            Accent Pastel Variants
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="accent-yellow">Accent Yellow</Button>
                            <Button variant="accent-soft-blue">Accent Soft Blue</Button>
                            <Button variant="accent-green">Accent Green</Button>
                            <Button variant="accent-pink">Accent Pink</Button>
                            <Button variant="accent-purple">Accent Purple</Button>
                            <Button variant="accent-orange">Accent Orange</Button>
                        </div>
                    </div>

                    {/* Sizes */}
                    <div>
                        <h2 className="font-heading text-lg font-semibold text-foreground mb-3">
                            Sizes
                        </h2>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button size="xs">Extra Small (xs)</Button>
                            <Button size="sm">Small (sm)</Button>
                            <Button size="default">Default</Button>
                            <Button size="lg">Large (lg)</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

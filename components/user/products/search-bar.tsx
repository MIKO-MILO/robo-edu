"use client";

import React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit?: (e: React.FormEvent) => void;
    placeholder?: string;
    label?: string;
}

export function SearchBar({
    value,
    onChange,
    onSubmit,
    placeholder = "Cari kit, sparepart, atau komponen...",
    label = "What you're up for?",
}: SearchBarProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(e);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-2 border-foreground rounded-2xl p-4 bg-card shadow-[4px_4px_0px_0px_#3D2900]"
        >
            <label
                htmlFor="catalog-search"
                className="font-heading font-bold text-foreground text-lg whitespace-nowrap"
            >
                {label}
            </label>

            <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none shrink-0 z-10" />
                <Input
                    id="catalog-search"
                    type="search"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="pl-11 pr-4 h-11 border-2 border-border bg-background text-foreground placeholder:text-muted-foreground font-body text-sm rounded-full"
                />
            </div>

            <Button
                type="submit"
                variant="secondary"
                neo={false}
                className="px-6 py-2.5 rounded-full border-2 border-foreground text-background font-semibold font-body"
            >
                Search
            </Button>
        </form>
    );
}

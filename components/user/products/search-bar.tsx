"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SearchBarProps {
    value?: string;
    onChange?: (value: string) => void;
    onSubmit?: (e: React.FormEvent) => void;
    placeholder?: string;
    label?: string;
    useUrlState?: boolean;
}

export function SearchBar({
    value: controlledValue,
    onChange: controlledOnChange,
    onSubmit: controlledOnSubmit,
    placeholder = "Cari kit, sparepart, atau komponen...",
    label = "What you're up for?",
    useUrlState = true,
}: SearchBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const urlSearch = searchParams?.get("search") || "";
    const targetValue = controlledValue !== undefined ? controlledValue : urlSearch;
    const [prevTargetValue, setPrevTargetValue] = useState(targetValue);
    const [internalValue, setInternalValue] = useState(targetValue);

    if (prevTargetValue !== targetValue) {
        setPrevTargetValue(targetValue);
        setInternalValue(targetValue);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (controlledOnSubmit) {
            controlledOnSubmit(e);
        }
        if (useUrlState && controlledValue === undefined) {
            const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
            if (internalValue.trim()) {
                params.set("search", internalValue.trim());
            } else {
                params.delete("search");
            }
            params.delete("page"); // Reset ke halaman 1 saat pencarian baru
            router.push(`${pathname}?${params.toString()}`);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInternalValue(val);
        if (controlledOnChange) {
            controlledOnChange(val);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-2 border-foreground rounded-2xl p-4 bg-card"
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
                    value={internalValue}
                    onChange={handleInputChange}
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

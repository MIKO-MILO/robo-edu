"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
    value?: string;
    onChange?: (value: string) => void;
    onSubmit?: (e: React.FormEvent) => void;
    placeholder?: string;
    label?: string;
    useUrlState?: boolean;
    className?: string;
}

export function SearchBar({
    value: controlledValue,
    onChange: controlledOnChange,
    onSubmit: controlledOnSubmit,
    placeholder = "Cari produk, kategori, atau lainnya...",
    label = "What you're looking for?",
    useUrlState = true,
    className,
}: SearchBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const urlSearch = searchParams?.get("search") || "";
    const [prevProps, setPrevProps] = useState({ controlledValue, urlSearch });
    const [internalValue, setInternalValue] = useState(
        controlledValue !== undefined ? controlledValue : urlSearch
    );

    if (prevProps.controlledValue !== controlledValue || prevProps.urlSearch !== urlSearch) {
        setPrevProps({ controlledValue, urlSearch });
        setInternalValue(controlledValue !== undefined ? controlledValue : urlSearch);
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
            params.delete("page");
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
            style={{ boxShadow: "0 4px 0 0 #F1E7DB" }}
            className={cn(
                "flex items-center w-full bg-card rounded-full border-2 border-primary px-5 py-2 transition-all",
                className
            )}
        >
            <label
                htmlFor="catalog-search"
                className="font-heading font-bold text-foreground text-base sm:text-lg whitespace-nowrap pr-4 shrink-0"
            >
                {label}
            </label>

            <div className="h-6 w-[1px] bg-border/80 shrink-0 mr-4 hidden sm:block" aria-hidden="true" />

            <div className="relative flex-1 flex items-center min-w-0">
                <Search className="absolute left-0 w-5 h-5 text-muted-foreground pointer-events-none shrink-0" />
                <Input
                    id="catalog-search"
                    type="search"
                    placeholder={placeholder}
                    value={internalValue}
                    onChange={handleInputChange}
                    className="pl-8 pr-4 h-11 border-0 bg-transparent text-foreground placeholder:text-muted-foreground font-body text-sm focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                />
            </div>

            <Button
                type="submit"
                variant="default"
                neo={false}
                className="ml-2 px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold font-body text-sm shrink-0 inline-flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
                Search
                <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
            </Button>
        </form>
    );
}
"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";

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
  placeholder = "Cari produk, kategori, atau lainnya...",
  label = "What you're looking for?",
  useUrlState = true,
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams?.get("search") || "";
  const [prevProps, setPrevProps] = useState({ controlledValue, urlSearch });
  const [internalValue, setInternalValue] = useState(
    controlledValue !== undefined ? controlledValue : urlSearch,
  );

  if (prevProps.controlledValue !== controlledValue || prevProps.urlSearch !== urlSearch) {
    setPrevProps({ controlledValue, urlSearch });
    setInternalValue(controlledValue !== undefined ? controlledValue : urlSearch);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    controlledOnSubmit?.(e);
    if (useUrlState && controlledValue === undefined) {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      internalValue.trim() ? params.set("search", internalValue.trim()) : params.delete("search");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalValue(val);
    controlledOnChange?.(val);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center bg-card border-2 border-primary rounded-full px-5 py-2 gap-3 w-full"
    >

      {/* Search icon + input */}
      <div className="relative flex-1 flex items-center min-w-0">
        <Search className="absolute left-0 w-4 h-4 text-muted-foreground shrink-0" />
        <input
          id="catalog-search"
          type="search"
          placeholder={placeholder}
          value={internalValue}
          onChange={handleInputChange}
          className="w-full pl-6 bg-transparent border-none outline-none font-body text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Search button */}
      <button
        type="submit"
        className="shrink-0 inline-flex items-center gap-1.5 bg-primary text-white font-heading font-bold text-xs sm:text-sm px-5 py-2 rounded-full hover:bg-primary-600 transition-colors"
      >
        Search
        <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
      </button>
    </form>
  );
}

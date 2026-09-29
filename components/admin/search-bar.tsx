"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X, Package, Layers, Tag, ShoppingCart, Users, Award } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Navigation targets ───────────────────────────────────────────────────────
// Each entry maps a section label + icon to the admin route that accepts ?search=
const NAV_SECTIONS = [
  { label: "Produk",        icon: Package,      href: "/admin/products"      },
  { label: "Kategori",      icon: Layers,       href: "/admin/categories"    },
  { label: "Tipe Produk",   icon: Tag,          href: "/admin/product-types" },
  { label: "Pesanan",       icon: ShoppingCart, href: "/admin/orders"        },
  { label: "Pelanggan",     icon: Users,        href: "/admin/customers"     },
  { label: "Reseller",      icon: Award,        href: "/admin/resellers"     },
] as const;

export interface AdminSearchBarProps {
  className?: string;
}

/**
 * Global navigation search for the admin top bar.
 *
 * Behaviour:
 * - Click / focus → dropdown expands showing quick-nav section links
 * - Type query → shows "Cari '<query>' di <section>" items
 * - Enter on a result → pushes to that section's page with ?search=<query>
 * - Escape / blur → closes dropdown, clears value
 *
 * This is intentionally a navigation helper, not a per-page data filter.
 * Per-page filters live inside each page's own filter toolbar.
 */
export function AdminSearchBar({ className }: AdminSearchBarProps) {
  const router = useRouter();
  const [value, setValue] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Items shown in the dropdown
  const items = React.useMemo(() => {
    if (!value.trim()) {
      // No query → show plain section links
      return NAV_SECTIONS.map((s) => ({
        label: s.label,
        sublabel: "Buka halaman",
        icon: s.icon,
        href: s.href,
      }));
    }
    // Has query → show "search in section" items
    return NAV_SECTIONS.map((s) => ({
      label: `"${value.trim()}"`,
      sublabel: `Cari di ${s.label}`,
      icon: s.icon,
      href: `${s.href}?search=${encodeURIComponent(value.trim())}`,
    }));
  }, [value]);

  // Reset active index whenever items change
  React.useEffect(() => {
    setActiveIndex(-1);
  }, [items]);

  // Close on outside click
  React.useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const navigate = (href: string) => {
    router.push(href);
    setValue("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, items.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) {
          navigate(items[activeIndex].href);
        } else if (value.trim() && items[0]) {
          // Default: search in first section
          navigate(items[0].href);
        }
        break;
      case "Escape":
        setOpen(false);
        setValue("");
        inputRef.current?.blur();
        break;
    }
  };

  const showKbd = !open && !value;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input trigger */}
      <div
        className={cn(
          "flex h-9 items-center gap-2 rounded-xl border bg-background px-3 transition-all duration-150",
          open
            ? "border-primary ring-2 ring-primary/20 w-64"
            : "border-border w-44 hover:border-primary/50 cursor-pointer",
        )}
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        <Search className="size-3.5 shrink-0 text-muted-foreground" />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Cari..."
          aria-label="Global admin search"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 min-w-0 bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground outline-none"
        />

        {/* Right slot: either Kbd hint or clear button */}
        {value ? (
          <button
            type="button"
            aria-label="Hapus pencarian"
            onClick={(e) => {
              e.stopPropagation();
              setValue("");
              inputRef.current?.focus();
            }}
            className="shrink-0 rounded-md p-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        ) : showKbd ? (
          <kbd className="hidden sm:inline-flex shrink-0 h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground select-none">
            /
          </kbd>
        ) : null}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Navigasi admin"
          className="absolute left-0 top-full mt-1.5 z-50 w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
        >
          {/* Section header */}
          <div className="px-3 py-2 border-b border-border/60">
            <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {value.trim() ? "Cari di halaman" : "Navigasi cepat"}
            </span>
          </div>

          {/* Items */}
          <ul className="py-1.5">
            {items.map((item, i) => {
              const Icon = item.icon;
              const isActive = i === activeIndex;
              return (
                <li key={item.href} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      // pointerdown fires before blur, so we can navigate
                      e.preventDefault();
                      navigate(item.href);
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                      isActive ? "bg-primary/10" : "hover:bg-muted/60",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-xl transition-colors",
                        isActive
                          ? "bg-primary text-primary-100"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-body text-sm font-semibold truncate",
                          isActive ? "text-primary" : "text-foreground",
                        )}
                      >
                        {item.label}
                      </p>
                      <p className="font-body text-[11px] text-muted-foreground truncate">
                        {item.sublabel}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Footer hint */}
          <div className="flex items-center gap-3 border-t border-border/60 px-3 py-2">
            <span className="font-body text-[10px] text-muted-foreground">
              <kbd className="inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[9px]">↑↓</kbd>
              {" "}navigasi
            </span>
            <span className="font-body text-[10px] text-muted-foreground">
              <kbd className="inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[9px]">↵</kbd>
              {" "}buka
            </span>
            <span className="font-body text-[10px] text-muted-foreground">
              <kbd className="inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[9px]">Esc</kbd>
              {" "}tutup
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

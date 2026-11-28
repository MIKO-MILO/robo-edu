"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHANNEL_CATALOG, type PaymentChannelEntry } from "@/src/lib/payment/channels";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentChannel =
  | "bca_va"
  | "bni_va"
  | "bri_va"
  | "mandiri_va"
  | "permata_va"
  | "cimb_va"
  | "credit_card"
  | "qris"
  | "dana"
  | "ovo"
  | "alfamart"
  | "indomaret";

export interface PaymentMethod {
  method: string;
  channel: PaymentChannel;
  label: string;
  group: string;
  /** Emoji or short label used as icon fallback when no image available */
  icon: string;
  /** Tailwind text color class for the icon/label */
  color: string;
  /** Background color class for the icon chip */
  bg: string;
}

export interface SelectedPayment {
  method: PaymentMethod;
  /** Hanya untuk OVO: nomor HP OVO yang diinput user */
  ovoPhone?: string;
}

// ─── Display metadata ────────────────────────────────────────────────────────
// `icon` / `color` / `bg` are pure rendering concerns, kept separate from the
// canonical channel catalog (`src/lib/payment/channels.ts`) which is the
// single source of truth for *which* channels exist. This map only describes
// *how* a known channel is rendered; channels not listed here fall back to a
// neutral chip derived from the label.

const CHANNEL_DISPLAY: Record<string, { icon: string; color: string; bg: string }> = {
  // Virtual Account
  bca_va:      { icon: "BCA",     color: "text-blue-800",   bg: "bg-blue-50"   },
  bni_va:      { icon: "BNI",     color: "text-orange-700", bg: "bg-orange-50" },
  bri_va:      { icon: "BRI",     color: "text-blue-700",   bg: "bg-sky-50"     },
  mandiri_va:  { icon: "Mandiri", color: "text-yellow-700", bg: "bg-yellow-50"  },
  permata_va:  { icon: "Permata", color: "text-teal-700",   bg: "bg-teal-50"    },
  cimb_va:     { icon: "CIMB",    color: "text-red-700",    bg: "bg-red-50"     },
  // Kartu
  credit_card: { icon: "VISA",   color: "text-indigo-700", bg: "bg-indigo-50"  },
  // QRIS
  qris:        { icon: "QRIS",   color: "text-blue-700",   bg: "bg-blue-50"    },
  // E-Wallet
  dana:        { icon: "DANA",   color: "text-blue-700",   bg: "bg-sky-50"     },
  ovo:         { icon: "OVO",    color: "text-purple-700", bg: "bg-purple-50"  },
  // Gerai
  alfamart:    { icon: "Alfa",   color: "text-red-700",    bg: "bg-red-50"     },
  indomaret:   { icon: "Indo",   color: "text-red-600",    bg: "bg-red-50"     },
};

interface RawApiMethod {
  method: string;
  channel: string;
  label: string;
  group?: string;
}

/** Merge a catalog/API entry with its display metadata into a PaymentMethod. */
function toPaymentMethod(
  entry: Pick<PaymentChannelEntry, "method" | "channel" | "label" | "group">,
): PaymentMethod {
  const display = CHANNEL_DISPLAY[entry.channel];
  return {
    method: entry.method,
    channel: entry.channel as PaymentChannel,
    label: entry.label,
    group: entry.group,
    icon: display?.icon ?? entry.label.slice(0, 4).toUpperCase(),
    color: display?.color ?? "text-foreground",
    bg: display?.bg ?? "bg-muted",
  };
}

// ─── Static fallback list ─────────────────────────────────────────────────────
// Derived from the canonical catalog so it can never drift from the set of
// channels the backend considers valid. Used only when GET /payment-methods
// is unreachable (network error / 404) — otherwise the live API response wins.

export const PAYMENT_METHODS_FALLBACK: PaymentMethod[] =
  CHANNEL_CATALOG.map(toPaymentMethod);

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const res = await fetch("/api/payment-methods");
    if (!res.ok) throw new Error("not available");
    const json = await res.json();
    const data = json.data as RawApiMethod[];
    // Keep only channels the catalog recognises (defensive: drop any channel the
    // backend shouldn't be advertising), then attach display metadata.
    return CHANNEL_CATALOG.filter((c) =>
      data.some((m) => m.channel === c.channel),
    )
      .map((c) => {
        const api = data.find((m) => m.channel === c.channel)!;
        // Prefer the API label/group when present, fall back to the catalog.
        return toPaymentMethod({
          method: c.method,
          channel: c.channel,
          label: api.label || c.label,
          group: api.group ?? c.group,
        });
      });
  } catch {
    // Endpoint belum tersedia — gunakan fallback lokal
    return PAYMENT_METHODS_FALLBACK;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CheckoutPaymentMethodSelectorProps {
  value: SelectedPayment | null;
  onChange: (selected: SelectedPayment | null) => void;
  /**
   * "dropdown" (default) — trigger + floating absolute list (dipakai di checkout).
   * "expand"             — trigger + list in-flow, mendorong parent container tumbuh ke bawah (dipakai di modal).
   * "inline"             — list langsung tampil tanpa trigger.
   */
  variant?: "dropdown" | "expand" | "inline";
}

export function CheckoutPaymentMethodSelector({
  value,
  onChange,
  variant = "dropdown",
}: CheckoutPaymentMethodSelectorProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>(PAYMENT_METHODS_FALLBACK);
  const [open, setOpen] = useState(false);
  const [ovoPhone, setOvoPhone] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch daftar metode dari API; fallback ke hardcode bila gagal
  useEffect(() => {
    fetchPaymentMethods().then(setMethods);
  }, []);

  // Tutup dropdown bila klik di luar (hanya untuk variant dropdown)
  useEffect(() => {
    if (variant !== "dropdown") return;
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [variant]);

  // Sync ovoPhone ke SelectedPayment
  function handleOvoPhoneChange(phone: string) {
    setOvoPhone(phone);
    if (value?.method.channel === "ovo") {
      onChange({ method: value.method, ovoPhone: phone.trim() || undefined });
    }
  }

  function selectMethod(method: PaymentMethod) {
    setOpen(false);
    if (method.channel !== "ovo") {
      setOvoPhone("");
      onChange({ method });
    } else {
      onChange({ method, ovoPhone: ovoPhone.trim() || undefined });
    }
  }

  // Kelompokkan metode berdasarkan group
  const grouped = methods.reduce<Record<string, PaymentMethod[]>>((acc, m) => {
    if (!acc[m.group]) acc[m.group] = [];
    acc[m.group].push(m);
    return acc;
  }, {});

  const selected = value?.method ?? null;

  // ── Shared: grouped method list ──────────────────────────────────────────
  // Dipakai baik oleh dropdown maupun inline, beda wrapper saja.
  function MethodList({ className }: { className?: string }) {
    return (
      <div className={className} role="listbox" aria-label="Metode pembayaran">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            {/* Group header */}
            <div className="px-3 pt-2.5 pb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {group}
              </span>
            </div>
            {/* Group items */}
            {items.map((method) => (
              <button
                key={method.channel}
                type="button"
                role="option"
                aria-selected={selected?.channel === method.channel}
                onClick={() => selectMethod(method)}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-3 py-2.5",
                  "text-sm font-semibold text-foreground text-left",
                  "hover:bg-muted/50 transition-colors rounded-lg mx-auto",
                  selected?.channel === method.channel && "bg-accent-soft-blue/30",
                )}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span
                    className={cn(
                      "shrink-0 w-10 h-7 rounded-md flex items-center justify-center text-[10px] font-black border border-border/40",
                      method.bg,
                      method.color,
                    )}
                  >
                    {method.icon}
                  </span>
                  <span className="truncate font-body">{method.label}</span>
                </span>
                {selected?.channel === method.channel && (
                  <Check className="w-4 h-4 shrink-0 text-primary" />
                )}
              </button>
            ))}
            {/* Group divider */}
            <div className="mx-3 my-1 border-t border-border/20" />
          </div>
        ))}
      </div>
    );
  }

  // ── OVO phone input (shared) ─────────────────────────────────────────────
  const OvoInput = selected?.channel === "ovo" ? (
    <div className="mt-3">
      <label
        htmlFor="ovo-phone"
        className="block text-xs font-bold text-foreground mb-1.5"
      >
        <Phone className="inline w-3 h-3 mr-1 text-purple-600" />
        Nomor HP OVO
      </label>
      <input
        id="ovo-phone"
        type="tel"
        inputMode="numeric"
        maxLength={15}
        value={ovoPhone}
        onChange={(e) => handleOvoPhoneChange(e.target.value)}
        placeholder="Contoh: 08123456789"
        className={cn(
          "w-full rounded-xl border border-border/20 px-4 py-2.5",
          "text-sm font-semibold text-foreground placeholder:text-muted-foreground/60",
          "focus:outline-none focus:ring-2 focus:ring-ring bg-accent-butter/20 shadow-xs",
        )}
      />
      <p className="text-[11px] text-muted-foreground mt-1">
        Nomor ini akan digunakan untuk pembayaran via OVO.
      </p>
    </div>
  ) : null;

  // ── Inline variant ───────────────────────────────────────────────────────
  if (variant === "inline") {
    return (
      <div className="mt-2">
        {/* Selected summary chip — tampil setelah memilih */}
        {selected && (
          <div className="flex items-center gap-2.5 mb-3 px-3 py-2 rounded-xl bg-accent-soft-blue/30 shadow-xs">
            <span
              className={cn(
                "shrink-0 w-10 h-7 rounded-md flex items-center justify-center text-[10px] font-black",
                selected.bg,
                selected.color,
              )}
            >
              {selected.icon}
            </span>
            <span className="font-body text-sm font-semibold text-foreground truncate">
              {selected.label}
            </span>
            <Check className="w-4 h-4 shrink-0 text-primary ml-auto" />
          </div>
        )}

        {/* Label */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
            Pilih Metode
          </span>
          {!selected && (
            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
              Wajib dipilih
            </span>
          )}
        </div>

        {/* Always-visible scrollable list */}
        <div className="border border-border/15 rounded-xl overflow-hidden shadow-xs">
          <MethodList />
        </div>

        {OvoInput}
      </div>
    );
  }

  // ── Expand variant — trigger + in-flow list (mendorong modal tumbuh) ────
  if (variant === "expand") {
    return (
      <div className="mt-4">
        {/* Label */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
            Metode Pembayaran
          </span>
          {!selected && (
            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
              Wajib dipilih
            </span>
          )}
        </div>

        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "w-full flex items-center justify-between gap-2",
            "px-4 py-3 border border-border/15 bg-card",
            "font-body text-sm font-semibold text-foreground shadow-xs",
            "transition-all focus:outline-none focus:ring-2 focus:ring-ring",
            open
              ? "rounded-t-xl rounded-b-none border-b border-b-border/20 ring-2 ring-ring"
              : "rounded-xl hover:bg-muted/20",
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {selected ? (
            <span className="flex items-center gap-2.5 min-w-0">
              <span
                className={cn(
                  "shrink-0 w-10 h-7 rounded-md flex items-center justify-center text-[10px] font-black",
                  selected.bg,
                  selected.color,
                )}
              >
                {selected.icon}
              </span>
              <span className="truncate">{selected.label}</span>
            </span>
          ) : (
            <span className="text-muted-foreground font-medium">
              Pilih metode pembayaran…
            </span>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>

        {/* In-flow list — tumbuh ke bawah, bukan floating */}
        {open && (
          <MethodList
            className={cn(
              "w-full",
              "bg-card border border-t-0 border-border/15 rounded-b-xl",
              "shadow-lg",
              "py-1",
            )}
          />
        )}

        {OvoInput}
      </div>
    );
  }

  // ── Dropdown variant (default) ───────────────────────────────────────────
  return (
    <div className="mt-4">
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
          Metode Pembayaran
        </span>
        {!selected && (
          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
            Wajib dipilih
          </span>
        )}
      </div>

      {/* Trigger */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "w-full flex items-center justify-between gap-2",
            "px-4 py-3 rounded-xl border border-border/15 bg-card shadow-xs",
            "font-body text-sm font-semibold text-foreground",
            "transition-all focus:outline-none focus:ring-2 focus:ring-ring",
            open && "ring-2 ring-ring",
            "hover:bg-muted/20",
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {selected ? (
            <span className="flex items-center gap-2.5 min-w-0">
              <span
                className={cn(
                  "shrink-0 w-10 h-7 rounded-md flex items-center justify-center text-[10px] font-black",
                  selected.bg,
                  selected.color,
                )}
              >
                {selected.icon}
              </span>
              <span className="truncate">{selected.label}</span>
            </span>
          ) : (
            <span className="text-muted-foreground font-medium">
              Pilih metode pembayaran…
            </span>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {/* Dropdown list — absolute, floating */}
        {open && (
          <MethodList
            className={cn(
              "absolute z-50 w-full mt-1.5",
              "bg-card border border-border/15 rounded-xl",
              "shadow-xl",
              "max-h-[min(22rem,50svh)] overflow-y-auto",
              "py-1",
            )}
          />
        )}
      </div>

      {/* OVO phone input — muncul hanya bila OVO dipilih */}
      {OvoInput}
    </div>
  );
}

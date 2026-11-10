"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentChannel =
  | "bca_va"
  | "bni_va"
  | "bri_va"
  | "mandiri_va"
  | "permata_va"
  | "cimb_va"
  | "credit_card"
  | "gopay"
  | "shopeepay"
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

// ─── Static fallback list ─────────────────────────────────────────────────────
// Digunakan ketika GET /payment-methods belum tersedia (404 / network error).
// Menghapus blok ini dan menggantinya dengan live fetch sudah cukup untuk switch ke API.

export const PAYMENT_METHODS_FALLBACK: PaymentMethod[] = [
  // Virtual Account
  { method: "bank_transfer", channel: "bca_va",      label: "BCA Virtual Account",      group: "Virtual Account", icon: "BCA",       color: "text-blue-800",    bg: "bg-blue-50"    },
  { method: "bank_transfer", channel: "bni_va",      label: "BNI Virtual Account",      group: "Virtual Account", icon: "BNI",       color: "text-orange-700",  bg: "bg-orange-50"  },
  { method: "bank_transfer", channel: "bri_va",      label: "BRI Virtual Account",      group: "Virtual Account", icon: "BRI",       color: "text-blue-700",    bg: "bg-sky-50"     },
  { method: "bank_transfer", channel: "mandiri_va",  label: "Mandiri Virtual Account",  group: "Virtual Account", icon: "Mandiri",   color: "text-yellow-700",  bg: "bg-yellow-50"  },
  { method: "bank_transfer", channel: "permata_va",  label: "Permata Virtual Account",  group: "Virtual Account", icon: "Permata",   color: "text-teal-700",    bg: "bg-teal-50"    },
  { method: "bank_transfer", channel: "cimb_va",     label: "CIMB Virtual Account",     group: "Virtual Account", icon: "CIMB",      color: "text-red-700",     bg: "bg-red-50"     },
  // Kartu Kredit
  { method: "credit_card",   channel: "credit_card", label: "Kartu Kredit / Debit",     group: "Kartu",           icon: "VISA",      color: "text-indigo-700",  bg: "bg-indigo-50"  },
  // QRIS
  { method: "gopay",         channel: "gopay",       label: "GoPay QRIS",               group: "QRIS",            icon: "GoPay",     color: "text-emerald-700", bg: "bg-emerald-50" },
  { method: "shopeepay",     channel: "shopeepay",   label: "ShopeePay QRIS",           group: "QRIS",            icon: "SPay",      color: "text-orange-600",  bg: "bg-orange-50"  },
  { method: "qris",          channel: "qris",        label: "QRIS (semua dompet)",       group: "QRIS",            icon: "QRIS",      color: "text-blue-700",    bg: "bg-blue-50"    },
  // E-Wallet
  { method: "dana",          channel: "dana",        label: "DANA",                     group: "E-Wallet",        icon: "DANA",      color: "text-blue-700",    bg: "bg-sky-50"     },
  { method: "ovo",           channel: "ovo",         label: "OVO",                      group: "E-Wallet",        icon: "OVO",       color: "text-purple-700",  bg: "bg-purple-50"  },
  // Gerai
  { method: "cstore",        channel: "alfamart",    label: "Alfamart",                 group: "Gerai",           icon: "Alfa",      color: "text-red-700",     bg: "bg-red-50"     },
  { method: "cstore",        channel: "indomaret",   label: "Indomaret",                group: "Gerai",           icon: "Indo",      color: "text-red-600",     bg: "bg-red-50"     },
];

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const res = await fetch("/api/payment-methods");
    if (!res.ok) throw new Error("not available");
    const json = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (json.data as any[]).map((m) => ({
      method:  m.method,
      channel: m.channel as PaymentChannel,
      label:   m.label,
      group:   m.group ?? "Lainnya",
      icon:    m.icon  ?? m.label.slice(0, 4).toUpperCase(),
      color:   m.color ?? "text-foreground",
      bg:      m.bg    ?? "bg-muted",
    }));
  } catch {
    // Endpoint belum tersedia — gunakan fallback lokal
    return PAYMENT_METHODS_FALLBACK;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CheckoutPaymentMethodSelectorProps {
  value: SelectedPayment | null;
  onChange: (selected: SelectedPayment | null) => void;
}

export function CheckoutPaymentMethodSelector({
  value,
  onChange,
}: CheckoutPaymentMethodSelectorProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>(PAYMENT_METHODS_FALLBACK);
  const [open, setOpen] = useState(false);
  const [ovoPhone, setOvoPhone] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch daftar metode dari API; fallback ke hardcode bila gagal
  useEffect(() => {
    fetchPaymentMethods().then(setMethods);
  }, []);

  // Tutup dropdown bila klik di luar
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

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
            "px-4 py-3 rounded-xl border-2 border-border bg-card",
            "font-body text-sm font-semibold text-foreground",
            "transition-all focus:outline-none focus:ring-2 focus:ring-ring",
            open && "ring-2 ring-ring",
            "neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {selected ? (
            <span className="flex items-center gap-2.5 min-w-0">
              <span
                className={cn(
                  "shrink-0 w-10 h-7 rounded-md flex items-center justify-center text-[10px] font-black border border-border/40",
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

        {/* Dropdown list */}
        {open && (
          <div
            role="listbox"
            aria-label="Metode pembayaran"
            className={cn(
              "absolute z-50 w-full mt-1.5",
              "bg-card border-2 border-border rounded-xl",
              "shadow-[4px_4px_0px_0px_#3D2900]",
              "max-h-72 overflow-y-auto",
              "py-1",
            )}
          >
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                {/* Group header */}
                <div className="px-3 pt-2 pb-1">
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
                      "w-full flex items-center justify-between gap-2 px-3 py-2",
                      "text-sm font-semibold text-foreground text-left",
                      "hover:bg-muted/50 transition-colors",
                      selected?.channel === method.channel && "bg-accent-soft-blue/30",
                    )}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
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
                      <Check className="w-3.5 h-3.5 shrink-0 text-primary" />
                    )}
                  </button>
                ))}
                {/* Group divider */}
                <div className="mx-3 my-1 border-t border-border/20" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OVO phone input — muncul hanya bila OVO dipilih */}
      {selected?.channel === "ovo" && (
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
              "w-full rounded-xl border-2 border-border px-4 py-2.5",
              "text-sm font-semibold text-foreground placeholder:text-muted-foreground/60",
              "focus:outline-none focus:ring-2 focus:ring-ring bg-accent-butter/20",
            )}
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Nomor ini akan digunakan untuk pembayaran via OVO.
          </p>
        </div>
      )}
    </div>
  );
}

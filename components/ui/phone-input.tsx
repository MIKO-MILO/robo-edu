"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

export interface Country {
  code: string;   // ISO 3166-1 alpha-2, e.g. "ID"
  name: string;
  dial: string;   // e.g. "+62"
  flag: string;   // emoji flag
}

export const COUNTRIES: Country[] = [
  { code: "ID", name: "Indonesia",         dial: "+62",  flag: "🇮🇩" },
  { code: "MY", name: "Malaysia",          dial: "+60",  flag: "🇲🇾" },
  { code: "SG", name: "Singapura",         dial: "+65",  flag: "🇸🇬" },
  { code: "TH", name: "Thailand",          dial: "+66",  flag: "🇹🇭" },
  { code: "PH", name: "Filipina",          dial: "+63",  flag: "🇵🇭" },
  { code: "VN", name: "Vietnam",           dial: "+84",  flag: "🇻🇳" },
  { code: "US", name: "Amerika Serikat",   dial: "+1",   flag: "🇺🇸" },
  { code: "GB", name: "Inggris",           dial: "+44",  flag: "🇬🇧" },
  { code: "AU", name: "Australia",         dial: "+61",  flag: "🇦🇺" },
  { code: "JP", name: "Jepang",            dial: "+81",  flag: "🇯🇵" },
  { code: "KR", name: "Korea Selatan",     dial: "+82",  flag: "🇰🇷" },
  { code: "CN", name: "China",             dial: "+86",  flag: "🇨🇳" },
  { code: "IN", name: "India",             dial: "+91",  flag: "🇮🇳" },
  { code: "SA", name: "Arab Saudi",        dial: "+966", flag: "🇸🇦" },
  { code: "AE", name: "Uni Emirat Arab",   dial: "+971", flag: "🇦🇪" },
  { code: "NL", name: "Belanda",           dial: "+31",  flag: "🇳🇱" },
  { code: "DE", name: "Jerman",            dial: "+49",  flag: "🇩🇪" },
  { code: "FR", name: "Prancis",           dial: "+33",  flag: "🇫🇷" },
  { code: "BR", name: "Brasil",            dial: "+55",  flag: "🇧🇷" },
  { code: "NG", name: "Nigeria",           dial: "+234", flag: "🇳🇬" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  defaultCountryCode?: string;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  defaultCountryCode = "ID",
  placeholder = "08xx xxxx xxxx",
  className = "",
}: PhoneInputProps) {
  const [selected, setSelected] = useState<Country>(
    () => COUNTRIES.find((c) => c.code === defaultCountryCode) ?? COUNTRIES[0],
  );
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  );

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function selectCountry(country: Country) {
    setSelected(country);
    setOpen(false);
    setSearch("");
  }

  return (
    <div className={`flex ${className}`} ref={dropdownRef}>
      {/* ── Country selector ── */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 h-10 px-3 border border-r-0 border-input bg-muted rounded-l-md hover:bg-muted/80 transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://flagcdn.com/w20/${selected.code.toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/w40/${selected.code.toLowerCase()}.png 2x`}
            width={20}
            height={15}
            alt={selected.name}
            className="rounded-sm object-cover shrink-0"
          />
          <ChevronDown
            className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* ── Dropdown ── */}
        {open && (
          <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
              <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Cari negara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>

            {/* List */}
            <ul
              role="listbox"
              className="max-h-52 overflow-y-auto py-1"
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted-foreground text-center">
                  Tidak ditemukan
                </li>
              ) : (
                filtered.map((country) => (
                  <li key={country.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected.code === country.code}
                      onClick={() => selectCountry(country)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-muted transition-colors ${
                        selected.code === country.code ? "bg-primary/5 font-semibold" : ""
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                        srcSet={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png 2x`}
                        width={20}
                        height={15}
                        alt={country.name}
                        className="rounded-sm object-cover shrink-0"
                      />
                      <span className="flex-1 text-foreground truncate">{country.name}</span>
                      <span className="text-muted-foreground text-xs shrink-0">{country.dial}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {/* ── Phone number input ── */}
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 h-10 px-3 border border-input rounded-r-md bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}

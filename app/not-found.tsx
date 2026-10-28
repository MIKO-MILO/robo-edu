import Link from "next/link";
import { Home, Search, Cpu } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 – Halaman Tidak Ditemukan | Roboedu",
  description: "Halaman yang kamu cari tidak ada atau telah dipindahkan.",
};

// ── Decorative dot-grid (sama seperti register page) ─────────────────────────
function DotGrid() {
  return (
    <div
      className="absolute inset-0 z-0 opacity-10 pointer-events-none"
      style={{
        backgroundImage: "radial-gradient(#3D2900 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
      aria-hidden="true"
    />
  );
}

// ── Animated gear / robot icon ────────────────────────────────────────────────
function RobotIcon() {
  return (
    <div className="relative flex items-center justify-center w-32 h-32 mx-auto mb-8">
      {/* outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-border bg-accent-yellow neo-shadow" />
      {/* icon */}
      <Cpu
        className="relative z-10 w-14 h-14 text-foreground"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      {/* small decorative bolts */}
      <span className="absolute -top-2 -right-2 w-6 h-6 bg-card rounded-full border-2 border-border flex items-center justify-center text-[10px] leading-none neo-shadow-icon">
        ⚙
      </span>
      <span className="absolute -bottom-2 -left-2 w-6 h-6 bg-card rounded-full border-2 border-border flex items-center justify-center text-[10px] leading-none neo-shadow-icon">
        ◈
      </span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-background px-4 py-16 overflow-hidden">
      <DotGrid />

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg bg-card border-2 border-border neo-shadow p-10 flex flex-col items-center text-center">
        {/* 404 headline */}
        <p
          className="uppercase tracking-tight leading-none select-none mb-2"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(5rem, 20vw, 9rem)",
            fontWeight: 800,
            color: "var(--color-primary)",
            textShadow: "4px 4px 0px var(--color-foreground)",
          }}
          aria-hidden="true"
        >
          404
        </p>

        {/* Robot icon */}
        <RobotIcon />

        {/* Message */}
        <h1
          className="uppercase mb-3"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
            fontWeight: 700,
            color: "var(--color-foreground)",
          }}
        >
          Halaman Tidak Ditemukan
        </h1>
        <p className="font-body text-sm text-muted-foreground max-w-xs mb-8 leading-relaxed">
          Sepertinya robot kami tidak bisa menemukan halaman yang kamu cari.
          Mungkin URL-nya salah, atau halamannya sudah dipindahkan.
        </p>

        {/* Divider */}
        <div className="w-full border-t-2 border-border mb-8" />

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/"
            className="
              flex-1 flex items-center justify-center gap-2
              bg-primary text-white
              border-2 border-border
              neo-shadow
              px-5 py-3
              font-body font-bold text-sm uppercase tracking-wide
              transition-all duration-150
              hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none
              focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
            "
          >
            <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
            Kembali ke Beranda
          </Link>

          <Link
            href="/product"
            className="
              flex-1 flex items-center justify-center gap-2
              bg-card text-foreground
              border-2 border-border
              neo-shadow
              px-5 py-3
              font-body font-bold text-sm uppercase tracking-wide
              transition-all duration-150
              hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none
              focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
            "
          >
            <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
            Lihat Produk
          </Link>
        </div>
      </div>
    </main>
  );
}

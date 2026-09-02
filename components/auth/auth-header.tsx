// Auth Header Component
// Header slim ala Claude — hanya tampil di halaman login & register.
// Logo + tulisan "Roboedu" di sisi kiri, background menyesuaikan bg-background auth.

import Image from "next/image";
import Link from "next/link";

export default function AuthHeader() {
  return (
    <header
      className="w-full border-b-2 border-border shrink-0"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <div className="max-w-5xl mx-auto w-full px-4 md:px-8 h-14 flex items-center">
        <Link
          href="/home"
          className="flex items-center gap-2 md:gap-3 transition-opacity hover:opacity-80"
          aria-label="Kembali ke beranda Roboedu"
        >
          <Image
            src="/assets/svg/logo.svg"
            alt="Roboedu Logo"
            width={28}
            height={28}
            aria-hidden="true"
          />
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "20px",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            Roboedu
          </span>
        </Link>
      </div>
    </header>
  );
}

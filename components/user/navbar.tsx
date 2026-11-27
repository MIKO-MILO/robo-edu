"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/contexts/cart-context";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/product", label: "Product" },
  { href: "/membership", label: "Membership" },
  { href: "/contact", label: "Contact" },
];

/* Ukuran ikon seragam per breakpoint — berlaku untuk cart, profile, dan hamburger */
const ICON_SIZE = "w-[18px] h-[18px] sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();

  /* Tutup menu kalau klik di luar */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  /* Tutup menu kalau navigasi */
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  /* Kunci scroll body saat menu terbuka */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="relative w-full px-3 sm:px-4 md:px-6 lg:px-8" ref={menuRef}>
      <nav
        className="shadow-md flex justify-between items-center px-4 sm:px-8 md:px-10 lg:px-12 py-3 md:py-4"
        style={{
          width: "100%",
          height: "clamp(56px, 8vw, 95px)",
          backgroundColor: "var(--color-primary)",
          borderRadius: "100px",
          marginTop: "12px",
        }}
      >
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-2.5 transition-opacity hover:opacity-90 shrink-0"
        >
          <div className="relative shrink-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 flex items-center justify-center">
            <Image
              src="/assets/svg/logo2.svg"
              alt="Roboedu Logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
              priority
              aria-hidden="true"
            />
          </div>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(1.125rem, 2.8vw, 2rem)",
              lineHeight: "1.25",
              letterSpacing: "-0.02em",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            Roboedu
          </span>
        </Link>

        {/* Navigation Links (Desktop — lg ke atas) */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "20px",
                  lineHeight: "28px",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.80)",
                  borderBottom: isActive ? "2px solid #ffffff" : "none",
                  paddingBottom: isActive ? "4px" : "0",
                  transition: "opacity 200ms",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
                  (e.currentTarget as HTMLAnchorElement).style.color = isActive
                    ? "#ffffff"
                    : "rgba(255,255,255,0.80)";
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Trailing Actions — ke-3 ikon ukuran seragam per breakpoint */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 shrink-0">
          {/* Cart */}
          <Link
            href="/cart"
            aria-label={
              totalItems > 0
                ? `Keranjang belanja — ${totalItems} item`
                : "Keranjang belanja"
            }
            className="relative transition-opacity hover:opacity-80 flex items-center justify-center shrink-0"
          >
            <Image
              src="/assets/svg/cart.svg"
              alt="Cart"
              width={34}
              height={34}
              className={`${ICON_SIZE} object-contain`}
            />
            {totalItems > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-badge-red text-white border border-white/80 flex items-center justify-center font-body font-bold text-[10px] leading-none animate-badge-float"
              >
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>

          {/* Profile */}
          <Link
            href="/profile/my-profile"
            aria-label="Account Profile"
            className="transition-opacity hover:opacity-80 flex items-center justify-center shrink-0"
          >
            <Image
              src="/assets/svg/profile.svg"
              alt="Profile"
              width={36}
              height={36}
              className={`${ICON_SIZE} object-contain`}
            />
          </Link>

          {/* Hamburger Button — tampil di bawah lg, ukuran sama dengan ikon lain */}
          <button
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className={`lg:hidden flex flex-col justify-center items-center gap-1 ${ICON_SIZE} shrink-0 transition-transform`}
          >
            <span
              className="block w-3 sm:w-3.5 md:w-4 h-[2px] bg-white rounded-full transition-all duration-300 origin-center"
              style={{
                transform: menuOpen
                  ? "translateY(6px) rotate(45deg)"
                  : "none",
              }}
            />
            <span
              className="block w-3 sm:w-3.5 md:w-4 h-[2px] bg-white rounded-full transition-all duration-300"
              style={{
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-3 sm:w-3.5 md:w-4 h-[2px] bg-white rounded-full transition-all duration-300 origin-center"
              style={{
                transform: menuOpen
                  ? "translateY(-6px) rotate(-45deg)"
                  : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* ── Mobile / Tablet Menu Dropdown ─────────────────── */}
      <div
        className={`lg:hidden absolute left-3 right-3 sm:left-4 sm:right-4 md:left-6 md:right-6 z-50 overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen
            ? "max-h-[400px] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2"
        }`}
        style={{
          top: "calc(clamp(56px, 8vw, 95px) + 16px)",
          backgroundColor: "var(--color-primary)",
          borderRadius: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        <div className="flex flex-col px-6 py-5 gap-1">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className="block py-3 px-4 rounded-xl transition-colors duration-200"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "18px",
                  lineHeight: "28px",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.80)",
                  backgroundColor: isActive
                    ? "rgba(255,255,255,0.12)"
                    : "transparent",
                  textDecoration: "none",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Overlay di belakang menu */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          style={{ top: "0" }}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}

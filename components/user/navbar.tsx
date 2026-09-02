"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/product", label: "Product" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-4 z-20 shadow-md mx-auto flex justify-between items-center px-12 py-4"
      style={{
        maxWidth: "984px",
        width: "100%",
        height: "95px",
        backgroundColor: "var(--color-primary)", // #2483D0
        borderRadius: "100px",
        marginTop: "16px",
      }}
    >
      {/* Brand / Logo */}
      <Link
        href="/home"
        className="flex items-center gap-2 transition-opacity hover:opacity-90"
      >
        <Image
          src="/assets/svg/logo.svg"
          alt="Roboedu Logo"
          width={32}
          height={32}
          aria-hidden="true"
        />
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "32px",
            lineHeight: "40px",
            letterSpacing: "-0.02em",
            fontWeight: 700,
            color: "#ffffff",
          }}
        >
          Roboedu
        </span>
      </Link>

      {/* Navigation Links (Desktop) */}
      <div className="hidden md:flex items-center gap-8">
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

      {/* Trailing Actions */}
      <div className="flex items-center gap-6">
        {/* Cart */}
        <button
          aria-label="Shopping Basket"
          className="transition-opacity hover:opacity-80"
        >
          <Image
            src="/assets/svg/icon-cart.svg"
            alt="Cart"
            width={34}
            height={34}
          />
        </button>

        {/* Profile */}
        <button
          aria-label="Account Profile"
          className="transition-opacity hover:opacity-80"
        >
          <Image
            src="/assets/svg/icon-user-profile.svg"
            alt="Profile"
            width={36}
            height={36}
          />
        </button>
      </div>
    </nav>
  );
}

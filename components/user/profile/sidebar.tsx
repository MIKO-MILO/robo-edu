"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Lock, Bell, LogOut, ShoppingCart, MapPin, Loader2 } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [showConfirm, setShowConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const links = [
    { href: "/profile/my-profile", label: "Profile Settings", icon: User },
    { href: "/profile/settings", label: "Settings", icon: Lock },
    { href: "/profile/addresses", label: "Alamat Pengiriman", icon: MapPin },
    { href: "/profile/orders", label: "Orders History", icon: ShoppingCart },
    { href: "/profile/notifications", label: "Notifications", icon: Bell },
  ];

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Even if the request fails, clear client state and redirect
    }
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold font-heading text-foreground">Account settings</h1>

        <nav
          className="flex flex-col bg-white rounded-xl py-2 overflow-hidden"
          style={{ boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.05)" }}
        >
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center gap-4 px-6 py-4 text-base font-medium transition-colors border-r-[4px]",
                  isActive
                    ? "bg-primary-100/50 text-primary border-primary"
                    : "bg-transparent text-[#6B7280] hover:bg-gray-50 border-transparent hover:text-foreground",
                )}
              >
                <link.icon className={clsx("w-[22px] h-[22px]", isActive ? "text-primary" : "text-[#6B7280]")} />
                {link.label}
              </Link>
            );
          })}

          <button
            onClick={() => setShowConfirm(true)}
            className={clsx(
              "flex items-center gap-4 px-6 py-4 text-base font-medium transition-colors border-r-[4px] text-left w-full",
              "bg-transparent text-[#6B7280] hover:bg-red-50 hover:text-danger border-transparent",
            )}
          >
            <LogOut className="w-[22px] h-[22px]" />
            Sign Out
          </button>
        </nav>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => { if (!isSigningOut) setShowConfirm(false); }}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="signout-title"
            className="relative z-10 bg-popover rounded-3xl shadow-xl ring-1 ring-foreground/5 p-6 w-full max-w-sm"
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-danger-bg border border-border mx-auto mb-4">
              <LogOut className="w-5 h-5 text-danger" />
            </div>

            <h2
              id="signout-title"
              className="font-heading font-bold text-lg text-foreground text-center mb-2"
            >
              Keluar dari akun?
            </h2>
            <p className="font-body text-sm text-muted-foreground text-center mb-6">
              Kamu akan keluar dari sesi ini. Kamu bisa login kembali kapan saja.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
                disabled={isSigningOut}
              >
                Batal
              </Button>
              <Button
                variant="danger-solid"
                className="flex-1"
                onClick={() => void handleSignOut()}
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Keluar...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Ya, Keluar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

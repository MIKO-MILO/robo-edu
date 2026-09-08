"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Lock, Bell, LogOut, ShoppingCart } from "lucide-react";
import clsx from "clsx";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/profile/my-profile", label: "Profile Settings", icon: User },
    { href: "/profile/settings", label: "Settings", icon: Lock },
    { href: "/profile/orders", label: "Orders History", icon: ShoppingCart },
    { href: "/profile/notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold font-heading text-foreground">Account settings</h1>
      
      <nav className="flex flex-col bg-white rounded-xl py-2 overflow-hidden" style={{ boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.05)" }}>
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
                  : "bg-transparent text-[#6B7280] hover:bg-gray-50 border-transparent hover:text-foreground"
              )}
            >
              <link.icon className={clsx("w-[22px] h-[22px]", isActive ? "text-primary" : "text-[#6B7280]")} />
              {link.label}
            </Link>
          );
        })}
        
        <button
          onClick={() => {
            // Logic logout
            router.push("/home");
          }}
          className={clsx(
            "flex items-center gap-4 px-6 py-4 text-base font-medium transition-colors border-r-[4px] text-left w-full",
            "bg-transparent text-[#6B7280] hover:bg-gray-50 border-transparent hover:text-foreground"
          )}
        >
          <LogOut className="w-[22px] h-[22px] text-[#6B7280]" />
          Sign Out
        </button>
      </nav>
    </div>
  );
}

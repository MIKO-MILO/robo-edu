"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Bell, Bot } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { cn } from "@/lib/utils";

export interface AdminUserProps {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface AdminTopBarProps {
  user?: AdminUserProps;
  onToggleMobileSidebar?: () => void;
  className?: string;
}

export function AdminTopBar({
  user = {
    name: "Administrator",
    email: "admin@roboedu.id",
    role: "SUPERADMIN",
  },
  onToggleMobileSidebar,
  className,
}: AdminTopBarProps) {
  const roleDisplay = user?.role ? user.role.toUpperCase() : "ADMIN";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/90 px-4 md:px-6 backdrop-blur-md font-body select-none",
        className
      )}
    >
      {/* Left: Mobile Menu Toggle & Brand */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="flex lg:hidden size-10 items-center justify-center rounded-2xl border border-border bg-background text-foreground hover:bg-muted"
            aria-label="Toggle mobile menu"
          >
            <Menu className="size-5" />
          </button>
        )}

        <Link href="/admin/dashboard" className="flex lg:hidden items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-100 font-heading font-extrabold">
            <Bot className="size-5" />
          </div>
          <span className="font-heading font-bold text-sm text-foreground">
            ROBO<span className="text-primary">-EDU</span>
          </span>
        </Link>
      </div>

      {/* Right: Only Role Badge & Borderless Notification Icon */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Notification Icon - borderless */}
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-xl bg-muted/60 text-foreground hover:bg-muted transition-colors"
          aria-label="Notifikasi"
        >
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger" />
        </button>

        {/* Role Display Badge */}
        <StatusBadge status="ACTIVE" customLabel={roleDisplay} size="md" showDot={false} />
      </div>
    </header>
  );
}

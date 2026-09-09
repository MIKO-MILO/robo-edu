"use client";

import * as React from "react";
import Link from "next/link";
import { LogOut, Menu, User, Bell, Bot, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { cn } from "@/lib/utils";

export interface AdminUserProps {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface AdminTopBarProps {
  user?: AdminUserProps;
  onLogout?: () => void | Promise<void>;
  onToggleMobileSidebar?: () => void;
  className?: string;
}

export function AdminTopBar({
  user = {
    name: "Administrator",
    email: "admin@roboedu.id",
    role: "SUPERADMIN",
  },
  onLogout,
  onToggleMobileSidebar,
  className,
}: AdminTopBarProps) {
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (onLogout) {
        await onLogout();
      } else {
        // Default logout behavior: redirect to login or clear auth cookie
        window.location.href = "/login";
      }
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b-2 border-border bg-card/90 px-4 md:px-6 backdrop-blur-md font-body select-none neo-shadow",
          className
        )}
      >
        {/* Left: Mobile Menu Toggle & Brand */}
        <div className="flex items-center gap-3">
          {onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="flex lg:hidden size-10 items-center justify-center rounded-2xl border border-border bg-background text-foreground hover:bg-muted neo-shadow-icon"
              aria-label="Toggle mobile menu"
            >
              <Menu className="size-5" />
            </button>
          )}

          <Link href="/admin/dashboard" className="flex lg:hidden items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-100 font-heading font-extrabold neo-shadow-icon">
              <Bot className="size-5" />
            </div>
            <span className="font-heading font-bold text-sm text-foreground">
              ROBO<span className="text-primary">-EDU</span>
            </span>
          </Link>
        </div>

        {/* Right: Admin Profile Info & Logout */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Quick Notification Icon Placeholder */}
          <button
            type="button"
            className="hidden sm:flex relative size-9 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-muted neo-shadow-icon"
            aria-label="Notifikasi"
          >
            <Bell className="size-4" />
            <span className="absolute top-1 right-1 size-2 rounded-full bg-danger ring-2 ring-card" />
          </button>

          {/* Admin User Info Card */}
          <div className="flex items-center gap-3 p-1.5 pl-3 rounded-2xl border border-border bg-background neo-shadow-icon">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-bold text-foreground font-heading truncate max-w-[140px]">
                {user.name}
              </span>
              <span className="text-[10px] text-muted-foreground font-body truncate max-w-[140px]">
                {user.email}
              </span>
            </div>

            <div className="relative flex size-8 items-center justify-center rounded-xl bg-primary-100 text-primary border border-primary-300 font-bold text-xs shrink-0">
              {user.avatarUrl ? (
                /* eslint-disable-next-next-img-element */
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="size-full rounded-xl object-cover"
                />
              ) : (
                <User className="size-4 text-primary-900" />
              )}
            </div>

            <StatusBadge status="ACTIVE" customLabel={user.role} size="sm" showDot={false} />
          </div>

          {/* Logout Button */}
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setShowLogoutDialog(true)}
            className="font-bold gap-1.5 neo neo-shadow-hover"
            title="Keluar dari Admin"
          >
            <LogOut className="size-4" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Konfirmasi Logout"
        description="Apakah Anda yakin ingin keluar dari sesi Admin Panel Robo-Edu?"
        itemName={`Akun: ${user.name} (${user.email})`}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
        confirmText="Ya, Logout"
        cancelText="Batal"
      />
    </>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  ShoppingCart,
  Users,
  Award,
  Ticket,
  Star,
  MessageSquareWarning,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
  User,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { UserRole } from "@/types/enums";
import type { AdminUserProps } from "./top-bar";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  roles?: string[];
}

const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="size-5" />,
    roles: ["SUPERADMIN", "ADMIN", "ADMIN_SALES", "ADMIN_LAPORAN"],
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: <Package className="size-5" />,
    roles: ["SUPERADMIN", "ADMIN", "ADMIN_SALES"],
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: <Layers className="size-5" />,
    roles: ["SUPERADMIN", "ADMIN", "ADMIN_SALES"],
  },
  {
    title: "Product Types",
    href: "/admin/product-types",
    icon: <Tag className="size-5" />,
    roles: ["SUPERADMIN", "ADMIN", "ADMIN_SALES"],
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: <ShoppingCart className="size-5" />,
    roles: ["SUPERADMIN", "ADMIN", "ADMIN_SALES", "ADMIN_LAPORAN"],
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: <Users className="size-5" />,
    roles: ["SUPERADMIN", "ADMIN", "ADMIN_SALES"],
  },
  {
    title: "Resellers",
    href: "/admin/resellers",
    icon: <Award className="size-5" />,
    roles: ["SUPERADMIN", "ADMIN", "ADMIN_SALES"],
  },
  {
    title: "Vouchers",
    href: "/admin/vouchers",
    icon: <Ticket className="size-5" />,
    roles: ["SUPERADMIN", "ADMIN", "ADMIN_SALES"],
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: <Star className="size-5" />,
    roles: ["SUPERADMIN", "ADMIN", "ADMIN_SALES"],
  },
  {
    title: "Complaints",
    href: "/admin/complaints",
    icon: <MessageSquareWarning className="size-5" />,
    roles: ["SUPERADMIN", "ADMIN", "ADMIN_SALES"],
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: <FileBarChart className="size-5" />,
    roles: ["SUPERADMIN", "ADMIN", "ADMIN_LAPORAN"],
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: <Settings className="size-5" />,
    roles: ["SUPERADMIN", "ADMIN"],
  },
];

export interface AdminSidebarProps {
  userRole?: string | UserRole;
  user?: AdminUserProps;
  onLogout?: () => void | Promise<void>;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function AdminSidebar({
  userRole = "ADMIN",
  user,
  onLogout,
  collapsed = false,
  onToggleCollapse,
  className,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const currentUser: AdminUserProps = React.useMemo(() => {
    return (
      user || {
        name: "Administrator",
        email: "admin@roboedu.id",
        role: typeof userRole === "string" ? userRole : "ADMIN",
      }
    );
  }, [user, userRole]);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (onLogout) {
        await onLogout();
      } else {
        window.location.href = "/admin/login";
      }
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  // Filter items based on userRole if specified
  const navItems = React.useMemo(() => {
    if (!userRole) return adminNavItems;
    const normalizedRole = userRole.toUpperCase();
    return adminNavItems.filter((item) => {
      if (!item.roles || item.roles.length === 0) return true;
      return (
        item.roles.includes(normalizedRole) ||
        normalizedRole === "ADMIN" ||
        normalizedRole === "SUPERADMIN"
      );
    });
  }, [userRole]);

  return (
    <>
      <aside
        className={cn(
          "relative flex flex-col h-screen bg-card border-r border-border text-foreground transition-all duration-300 z-40 select-none font-body",
          collapsed ? "w-20" : "w-64",
          className
        )}
      >
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border bg-background">
          <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-100 font-heading font-extrabold shrink-0">
              <Bot className="size-6 animate-waving-hand" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-base tracking-tight text-foreground leading-tight">
                  ROBO<span className="text-primary">-EDU</span>
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Admin Panel
                </span>
              </div>
            )}
          </Link>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex size-7 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors shrink-0"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          )}
        </div>

        {/* Nav Link List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.title : undefined}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-150",
                  isActive
                    ? "bg-primary text-primary-100 font-bold border border-border"
                    : "text-foreground hover:bg-muted/70 hover:translate-x-1"
                )}
              >
                <div
                  className={cn(
                    "shrink-0 transition-transform group-hover:scale-110",
                    isActive
                      ? "text-primary-100"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {item.icon}
                </div>

                {!collapsed && (
                  <span className="flex-1 truncate font-body">{item.title}</span>
                )}

                {!collapsed && item.badge !== undefined && (
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[11px] font-bold rounded-full",
                      isActive
                        ? "bg-card text-primary-900"
                        : "bg-accent-yellow text-foreground"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer - Admin Info & Dropdown Menu */}
        <div className="p-3 border-t border-border bg-background">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-2xl bg-card border border-border hover:bg-muted/70 transition-colors text-left outline-none group cursor-pointer",
                collapsed ? "justify-center p-2" : "px-3 py-2.5"
              )}
              title={collapsed ? `${currentUser.name} (${currentUser.role})` : undefined}
            >
              <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                <div className="relative flex size-8 items-center justify-center rounded-xl bg-primary-100 text-primary border border-primary-300 font-bold text-xs shrink-0">
                  {currentUser.avatarUrl ? (
                    /* eslint-disable-next-next-img-element */
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="size-full rounded-xl object-cover"
                    />
                  ) : (
                    <User className="size-4 text-primary-900" />
                  )}
                </div>

                {!collapsed && (
                  <div className="flex flex-col overflow-hidden min-w-0">
                    <span className="text-xs font-bold text-foreground font-heading truncate leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-body truncate leading-tight">
                      {currentUser.email}
                    </span>
                  </div>
                )}
              </div>

              {!collapsed && (
                <ChevronsUpDown className="size-4 text-muted-foreground group-hover:text-foreground shrink-0 ml-1" />
              )}
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side={collapsed ? "right" : "top"}
              align={collapsed ? "end" : "center"}
              sideOffset={8}
              className="w-56 rounded-2xl p-1.5 bg-card border border-border shadow-lg font-body"
            >
              <DropdownMenuItem
                onClick={() => setShowLogoutDialog(true)}
                variant="destructive"
                className="cursor-pointer gap-2 font-semibold justify-end"
              >
                <LogOut className="size-4" />
                <span>Logout / Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Konfirmasi Logout"
        description="Apakah Anda yakin ingin keluar dari sesi Admin Panel Robo-Edu?"
        itemName={`Akun: ${currentUser.name} (${currentUser.email})`}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
        confirmText="Ya, Logout"
        cancelText="Batal"
      />
    </>
  );
}

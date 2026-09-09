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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";
import type { UserRole } from "@/types/enums";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  roles?: string[]; // Granular role restriction if any
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
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function AdminSidebar({
  userRole = "ADMIN",
  collapsed = false,
  onToggleCollapse,
  className,
}: AdminSidebarProps) {
  const pathname = usePathname();

  // Filter items based on userRole if specified
  const navItems = React.useMemo(() => {
    if (!userRole) return adminNavItems;
    const normalizedRole = userRole.toUpperCase();
    return adminNavItems.filter((item) => {
      if (!item.roles || item.roles.length === 0) return true;
      return item.roles.includes(normalizedRole) || normalizedRole === "ADMIN" || normalizedRole === "SUPERADMIN";
    });
  }, [userRole]);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-card border-r-2 border-border text-foreground transition-all duration-300 z-40 select-none font-body",
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b-2 border-border bg-background">
        <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-100 font-heading font-extrabold neo-shadow-icon shrink-0">
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
            className="hidden lg:flex size-7 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors neo-shadow-icon shrink-0"
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
            pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.title : undefined}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-100 font-bold neo-shadow border border-border"
                  : "text-foreground hover:bg-muted/70 hover:translate-x-1"
              )}
            >
              <div
                className={cn(
                  "shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-primary-100" : "text-muted-foreground group-hover:text-foreground"
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
                    isActive ? "bg-card text-primary-900" : "bg-accent-yellow text-foreground"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      {!collapsed && (
        <div className="p-4 border-t-2 border-border bg-background">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border neo-shadow">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="size-2 rounded-full bg-success animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-foreground truncate">
                Role: <span className="text-primary font-bold">{userRole}</span>
              </span>
            </div>
            <StatusBadge status="ACTIVE" size="sm" showDot={false} />
          </div>
        </div>
      )}
    </aside>
  );
}

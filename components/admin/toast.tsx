"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToast, dismissToast, type ToastVariant } from "./use-toast";
import { cn } from "@/lib/utils";

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  default: <Info className="size-5 text-primary" />,
  success: <CheckCircle2 className="size-5 text-success" />,
  error: <AlertCircle className="size-5 text-danger" />,
  warning: <AlertTriangle className="size-5 text-warning" />,
  info: <Info className="size-5 text-info" />,
};

const variantClasses: Record<ToastVariant, string> = {
  default: "bg-card border-border text-foreground",
  success: "bg-success-bg/90 border-success text-success neo-shadow",
  error: "bg-danger-bg/90 border-danger text-danger neo-shadow",
  warning: "bg-warning-bg/90 border-warning text-warning neo-shadow",
  info: "bg-info-bg/90 border-info text-info neo-shadow",
};

export function Toaster() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-100 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => {
        const variant = t.variant || "default";
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border-2 transition-all duration-200 animate-in slide-in-from-bottom-5 font-body",
              variantClasses[variant]
            )}
          >
            <div className="shrink-0 pt-0.5">{variantIcons[variant]}</div>

            <div className="flex-1 space-y-0.5">
              {t.title && (
                <h4 className="text-sm font-bold font-heading leading-snug">
                  {t.title}
                </h4>
              )}
              {t.description && (
                <p className="text-xs opacity-90 leading-relaxed font-body">
                  {t.description}
                </p>
              )}

              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action?.onClick();
                    dismissToast(t.id);
                  }}
                  className="mt-2 text-xs font-bold underline hover:opacity-80 transition-opacity"
                >
                  {t.action.label}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

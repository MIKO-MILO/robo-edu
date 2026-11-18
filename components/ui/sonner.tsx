"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      expand={false}
      visibleToasts={3}
      richColors
      closeButton
      icons={{
        success: <CheckCircle2 className="size-4 text-emerald-500" />,
        info: <Info className="size-4 text-blue-500" />,
        warning: <AlertTriangle className="size-4 text-amber-500" />,
        error: <AlertCircle className="size-4 text-rose-500" />,
        loading: <Loader2 className="size-4 animate-spin text-muted-foreground" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group font-body text-sm rounded-2xl border shadow-lg bg-card text-foreground border-border",
          title: "font-heading font-bold text-sm text-foreground",
          description: "text-xs text-muted-foreground",
          actionButton:
            "font-body font-semibold text-xs px-3 py-1 rounded-lg bg-primary text-primary-foreground",
          cancelButton:
            "font-body text-xs px-3 py-1 rounded-lg bg-muted text-muted-foreground",
          closeButton:
            "!bg-background/80 hover:!bg-background !border-border !text-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };

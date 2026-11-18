"use client";

import * as React from "react";
import { toast as sonnerToast, type ExternalToast } from "sonner";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface ToastItem {
  id?: string | number;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

type ToastInput =
  | string
  | React.ReactNode
  | ToastItem;

function normalizeOptions(
  secondArg?: string | ExternalToast,
  extra?: ExternalToast
): ExternalToast {
  if (typeof secondArg === "string") {
    return { description: secondArg, ...extra };
  }
  return { ...secondArg, ...extra };
}

/**
 * Universal toast wrapper using shadcn's Sonner under the hood.
 * Supports:
 * - toast({ title: "...", description: "...", variant: "..." })
 * - toast("Message", { description: "..." })
 * - toast.success("Title", "Description")
 * - toast.error("Title", "Description")
 */
function baseToast(first: ToastInput, second?: string | ExternalToast) {
  if (typeof first === "object" && first !== null && "title" in first) {
    const item = first as ToastItem;
    const options: ExternalToast = {
      description: item.description,
      duration: item.duration,
      action: item.action
        ? {
            label: item.action.label,
            onClick: item.action.onClick,
          }
        : undefined,
    };

    switch (item.variant) {
      case "success":
        return sonnerToast.success(item.title ?? "", options);
      case "error":
        return sonnerToast.error(item.title ?? "", options);
      case "warning":
        return sonnerToast.warning(item.title ?? "", options);
      case "info":
        return sonnerToast.info(item.title ?? "", options);
      default:
        return sonnerToast(item.title ?? "", options);
    }
  }

  const message = (first as string | React.ReactNode) ?? "";
  const opts = normalizeOptions(second);
  return sonnerToast(message, opts);
}

baseToast.success = (title: string | React.ReactNode, descriptionOrOptions?: string | ExternalToast) => {
  const opts = normalizeOptions(descriptionOrOptions);
  return sonnerToast.success(title, opts);
};

baseToast.error = (title: string | React.ReactNode, descriptionOrOptions?: string | ExternalToast) => {
  const opts = normalizeOptions(descriptionOrOptions);
  return sonnerToast.error(title, opts);
};

baseToast.warning = (title: string | React.ReactNode, descriptionOrOptions?: string | ExternalToast) => {
  const opts = normalizeOptions(descriptionOrOptions);
  return sonnerToast.warning(title, opts);
};

baseToast.info = (title: string | React.ReactNode, descriptionOrOptions?: string | ExternalToast) => {
  const opts = normalizeOptions(descriptionOrOptions);
  return sonnerToast.info(title, opts);
};

baseToast.dismiss = (id?: string | number) => sonnerToast.dismiss(id);

export const toast = baseToast;

export function dismissToast(id?: string | number) {
  sonnerToast.dismiss(id);
}

export function useToast() {
  return {
    toast: baseToast,
    dismiss: dismissToast,
  };
}

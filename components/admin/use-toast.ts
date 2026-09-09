"use client";

import * as React from "react";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
  action?: {
    label: string;
    onClick: () => void;
  };
}

type ToastListener = (toasts: ToastItem[]) => void;

let toastsMemory: ToastItem[] = [];
const listeners: Set<ToastListener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener([...toastsMemory]));
}

export function toast(options: Omit<ToastItem, "id">) {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastItem = {
    id,
    duration: 4000,
    variant: "default",
    ...options,
  };

  toastsMemory = [newToast, ...toastsMemory].slice(0, 5); // Keep max 5 toasts
  notifyListeners();

  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, newToast.duration);
  }

  return id;
}

toast.success = (title: string, description?: string) =>
  toast({ title, description, variant: "success" });

toast.error = (title: string, description?: string) =>
  toast({ title, description, variant: "error" });

toast.warning = (title: string, description?: string) =>
  toast({ title, description, variant: "warning" });

toast.info = (title: string, description?: string) =>
  toast({ title, description, variant: "info" });

export function dismissToast(id: string) {
  toastsMemory = toastsMemory.filter((t) => t.id !== id);
  notifyListeners();
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastItem[]>(toastsMemory);

  React.useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  return {
    toasts,
    toast,
    dismiss: dismissToast,
  };
}

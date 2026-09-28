"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AdminToggleSwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  id?: string;
  containerClassName?: string;
  /** Show label on the left (default) or right side */
  labelPosition?: "left" | "right";
}

export const AdminToggleSwitch = React.forwardRef<
  HTMLButtonElement,
  AdminToggleSwitchProps
>(
  (
    {
      checked = false,
      onChange,
      label,
      helperText,
      disabled = false,
      id,
      containerClassName,
      labelPosition = "left",
    },
    ref
  ) => {
    const defaultId = React.useId();
    const switchId = id || defaultId;

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        <div
          className={cn(
            "flex items-center gap-3",
            labelPosition === "left" ? "flex-row" : "flex-row-reverse justify-end"
          )}
        >
          {label && (
            <label
              htmlFor={switchId}
              className={cn(
                "text-sm font-semibold cursor-pointer select-none flex-1",
                disabled ? "text-muted-foreground opacity-50" : "text-foreground"
              )}
            >
              {label}
            </label>
          )}

          <button
            type="button"
            id={switchId}
            ref={ref}
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange?.(!checked)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
              checked ? "bg-primary" : "bg-input"
            )}
          >
            <span
              className={cn(
                "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
                checked ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
        {helperText && (
          <p className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
AdminToggleSwitch.displayName = "AdminToggleSwitch";

"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const adminSelectVariants = cva(
  "w-full appearance-none rounded-2xl border bg-card text-foreground font-body transition-all duration-150 outline-none pr-10 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border focus:border-primary",
        error: "border-danger text-danger focus:border-danger focus:ring-danger/20",
        success: "border-success text-foreground focus:border-success focus:ring-success/20",
      },
      selectSize: {
        sm: "h-9 pl-3 text-xs",
        md: "h-11 pl-4 text-sm",
        lg: "h-13 pl-5 text-base",
      },
      neo: {
        true: "neo-shadow focus:translate-x-[1px] focus:translate-y-[1px]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      selectSize: "md",
      neo: false,
    },
  }
);

export interface AdminSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface AdminSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof adminSelectVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  options: AdminSelectOption[];
  placeholder?: string;
  containerClassName?: string;
}

export const AdminSelect = React.forwardRef<HTMLSelectElement, AdminSelectProps>(
  (
    {
      className,
      containerClassName,
      label,
      helperText,
      error,
      variant,
      selectSize,
      options,
      placeholder = "Pilih opsi...",
      neo,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const computedVariant = error ? "error" : variant;

    return (
      <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-foreground font-body flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              adminSelectVariants({
                variant: computedVariant,
                selectSize,
                neo,
                className,
              })
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3.5 pointer-events-none text-muted-foreground">
            <ChevronDown className="size-4 stroke-[2.5]" />
          </div>
        </div>

        {error ? (
          <p className="text-xs font-medium text-danger font-body flex items-center gap-1">
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground font-body">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

AdminSelect.displayName = "AdminSelect";

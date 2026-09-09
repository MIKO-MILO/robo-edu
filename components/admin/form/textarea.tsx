"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const adminTextareaVariants = cva(
  "w-full rounded-2xl border bg-card text-foreground font-body transition-all duration-150 outline-none p-4 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]",
  {
    variants: {
      variant: {
        default: "border-border focus:border-primary",
        error: "border-danger text-danger focus:border-danger focus:ring-danger/20",
        success: "border-success text-foreground focus:border-success focus:ring-success/20",
      },
      neo: {
        true: "neo-shadow focus:translate-x-[1px] focus:translate-y-[1px]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      neo: false,
    },
  }
);

export interface AdminTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof adminTextareaVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  maxChars?: number;
  containerClassName?: string;
}

export const AdminTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AdminTextareaProps
>(
  (
    {
      className,
      containerClassName,
      label,
      helperText,
      error,
      variant,
      maxChars,
      neo,
      id,
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const computedVariant = error ? "error" : variant;
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-semibold text-foreground font-body flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxChars}
          className={cn(
            adminTextareaVariants({
              variant: computedVariant,
              neo,
              className,
            })
          )}
          {...props}
        />

        <div className="flex items-center justify-between text-xs font-body">
          {error ? (
            <p className="font-medium text-danger">{error}</p>
          ) : helperText ? (
            <p className="text-muted-foreground">{helperText}</p>
          ) : (
            <span />
          )}

          {maxChars && (
            <span
              className={cn(
                "text-muted-foreground font-mono text-[11px]",
                charCount >= maxChars && "text-danger font-bold"
              )}
            >
              {charCount}/{maxChars}
            </span>
          )}
        </div>
      </div>
    );
  }
);

AdminTextarea.displayName = "AdminTextarea";

"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const adminInputVariants = cva(
  "w-full rounded-2xl border bg-card text-foreground font-body transition-all duration-150 outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border focus:border-primary",
        error: "border-danger text-danger focus:border-danger focus:ring-danger/20",
        success: "border-success text-foreground focus:border-success focus:ring-success/20",
      },
      inputSize: {
        sm: "h-9 px-3 text-xs",
        md: "h-11 px-4 text-sm",
        lg: "h-13 px-5 text-base",
      },
      hasLeftIcon: {
        true: "",
      },
      hasRightIcon: {
        true: "",
      },
      neo: {
        true: "shadow-sm",
        false: "",
      },
    },
    compoundVariants: [
      { inputSize: "sm", hasLeftIcon: true, className: "pl-9" },
      { inputSize: "md", hasLeftIcon: true, className: "pl-11" },
      { inputSize: "lg", hasLeftIcon: true, className: "pl-12" },
      { inputSize: "sm", hasRightIcon: true, className: "pr-9" },
      { inputSize: "md", hasRightIcon: true, className: "pr-11" },
      { inputSize: "lg", hasRightIcon: true, className: "pr-12" },
    ],
    defaultVariants: {
      variant: "default",
      inputSize: "md",
      neo: false,
    },
  }
);

export interface AdminInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof adminInputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
  (
    {
      className,
      containerClassName,
      label,
      helperText,
      error,
      variant,
      inputSize,
      leftIcon,
      rightIcon,
      neo,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const computedVariant = error ? "error" : variant;

    return (
      <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-foreground font-body flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-muted-foreground pointer-events-none [&_svg]:size-4">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              adminInputVariants({
                variant: computedVariant,
                inputSize,
                hasLeftIcon: !!leftIcon,
                hasRightIcon: !!rightIcon,
                neo,
                className,
              })
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 flex items-center justify-center text-muted-foreground [&_svg]:size-4">
              {rightIcon}
            </div>
          )}
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

AdminInput.displayName = "AdminInput";

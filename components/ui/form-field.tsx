import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  required,
  hint,
  error,
  children,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      {label && (
        <label className="text-sm font-semibold text-foreground flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      {hint && (
        <p className="text-xs text-muted-foreground -mt-0.5">{hint}</p>
      )}
      {children}
      {error && (
        <p className="text-xs text-danger font-medium mt-0.5">{error}</p>
      )}
    </div>
  );
}

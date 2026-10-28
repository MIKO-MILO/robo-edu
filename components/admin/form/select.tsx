"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export interface AdminSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface AdminSelectProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: { target: { name?: string; value: string } }) => void;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  options: AdminSelectOption[];
  placeholder?: string;
  containerClassName?: string;
  className?: string;
  selectSize?: "sm" | "md" | "lg";
  required?: boolean;
  id?: string;
}

export const AdminSelect = React.forwardRef<HTMLButtonElement, AdminSelectProps>(
  (
    {
      name,
      value,
      defaultValue,
      onChange,
      onValueChange,
      disabled,
      label,
      helperText,
      error,
      options,
      placeholder = "Pilih opsi...",
      containerClassName,
      className,
      selectSize = "md",
      required,
      id,
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    const handleValueChange = (newVal: string | null) => {
      const val = newVal ?? "";
      onValueChange?.(val);
      if (onChange) {
        onChange({
          target: {
            name,
            value: val,
          },
        });
      }
    };

    const selectedOption = React.useMemo(() => {
      if (value === undefined || value === null) return null;
      return options.find((opt) => opt.value === value) || null;
    }, [options, value]);

    return (
      <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-foreground font-body flex items-center justify-between"
          >
            <span>{label}</span>
            {required && <span className="text-danger ml-1">*</span>}
          </label>
        )}

        <Select
          value={value ?? ""}
          defaultValue={defaultValue}
          onValueChange={handleValueChange}
          disabled={disabled}
          name={name}
        >
          <SelectTrigger
            id={selectId}
            ref={ref}
            size={selectSize === "sm" ? "sm" : "default"}
            className={cn(
              "w-full rounded-2xl border bg-card text-foreground font-body transition-all duration-150 outline-none flex items-center justify-between cursor-pointer",
              selectSize === "sm" && "h-10 text-sm px-3.5",
              selectSize === "md" && "h-11 text-sm px-4",
              selectSize === "lg" && "h-13 text-base px-5",
              error
                ? "border-danger text-danger focus:border-danger focus:ring-danger/20"
                : "border-border hover:border-primary/60 focus:border-primary",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
          >
            <SelectValue placeholder={placeholder}>
              {selectedOption ? selectedOption.label : undefined}
            </SelectValue>
          </SelectTrigger>

          <SelectContent className="w-(--anchor-width) min-w-[160px] rounded-2xl p-1.5 bg-popover border border-border shadow-lg font-body z-50">
            {options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="cursor-pointer rounded-xl px-3 py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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

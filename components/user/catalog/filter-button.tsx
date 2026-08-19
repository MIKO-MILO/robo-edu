import React from "react";

export interface FilterButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isActive?: boolean;
}

export function FilterButton({
  children,
  isActive = false,
  className = "",
  ...props
}: FilterButtonProps) {
  return (
    <button
      type="button"
      className={`
        px-6 py-2.5 rounded-full font-body font-semibold text-sm transition-all duration-100 ease-in-out active:scale-95 cursor-pointer whitespace-nowrap
        ${
          isActive
            ? "bg-foreground text-background border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            : "bg-card text-foreground border-2 border-foreground neo-shadow neo-shadow-hover"
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
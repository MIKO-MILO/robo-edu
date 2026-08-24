import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-body font-semibold transition-all duration-100 ease-in-out active:scale-95 cursor-pointer disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        // Default & Surface
        default: "bg-background text-foreground",
        card: "bg-card text-foreground",

        // Brand variants
        primary: "bg-primary text-primary-100",
        secondary: "bg-secondary text-secondary-100",

        // Accent Pastel variants (dari globals.css)
        "accent-yellow": "bg-accent-yellow text-foreground",
        "accent-purple": "bg-accent-purple text-foreground",
        "accent-soft-blue": "bg-accent-soft-blue text-foreground",
        "accent-blue": "bg-accent-blue text-foreground",
        "accent-green": "bg-accent-green text-foreground",
        "accent-pink": "bg-accent-pink text-foreground",
        "accent-orange": "bg-accent-orange text-foreground",
        "accent-peach": "bg-accent-peach text-foreground",
        "accent-butter": "bg-accent-butter text-foreground",

        // Semantic / State variants (dari globals.css)
        success: "bg-success-bg text-success",
        warning: "bg-warning-bg text-warning",
        danger: "bg-danger-bg text-danger",
        info: "bg-info-bg text-info",

        // Solid Semantic variants
        "success-solid": "bg-success text-white",
        "warning-solid": "bg-warning text-white",
        "danger-solid": "bg-danger text-white",
        "info-solid": "bg-info text-white",

        // Utility variants
        outline: "bg-transparent text-foreground",
        ghost: "bg-transparent text-foreground hover:bg-muted/60",
        link: "bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-5 py-2 text-sm",
        xs: "h-7 px-3 text-xs",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "size-10 p-0 rounded-full",
        "icon-xs": "size-7 p-0 rounded-full",
        "icon-sm": "size-8 p-0 rounded-full",
        "icon-lg": "size-11 p-0 rounded-full",
      },
      neo: {
        true: "border border-border neo-shadow neo-shadow-hover",
        false: "border border-transparent shadow-none hover:opacity-90",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      neo: true,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, neo, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, neo, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

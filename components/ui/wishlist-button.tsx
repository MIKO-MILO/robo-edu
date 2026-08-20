"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface WishlistButtonProps extends Omit<ButtonProps, "onClick"> {
  /** Status wishlist awal jika mode uncontrolled (default: false) */
  defaultWishlisted?: boolean;
  /** Status wishlist jika mode controlled dari parent/state */
  isWishlisted?: boolean;
  /** Callback yang dipanggil saat status wishlist di-toggle */
  onWishlistChange?: (
    isWishlisted: boolean,
    e: React.MouseEvent<HTMLButtonElement>
  ) => void;
  /** Custom onClick event handler */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** ClassName opsional untuk ikon Heart */
  iconClassName?: string;
}

export function WishlistButton({
  defaultWishlisted = false,
  isWishlisted: controlledIsWishlisted,
  onWishlistChange,
  onClick,
  variant = "card",
  size = "icon-sm",
  className,
  iconClassName,
  "aria-label": ariaLabel = "Tambah ke wishlist",
  ...props
}: WishlistButtonProps) {
  const [internalWishlisted, setInternalWishlisted] =
    useState<boolean>(defaultWishlisted);

  const activeWishlisted =
    controlledIsWishlisted !== undefined
      ? controlledIsWishlisted
      : internalWishlisted;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextState = !activeWishlisted;
    if (controlledIsWishlisted === undefined) {
      setInternalWishlisted(nextState);
    }
    if (onWishlistChange) {
      onWishlistChange(nextState, e);
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-pressed={activeWishlisted}
      className={cn("transition-colors cursor-pointer", className)}
      {...props}
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-all duration-200 ease-in-out",
          activeWishlisted
            ? "fill-heart text-heart scale-110"
            : "fill-transparent text-foreground hover:text-heart",
          iconClassName
        )}
      />
    </Button>
  );
}

"use client";

import { useCallback, useState } from "react";
import { useWishlist, type WishlistProductInput } from "@/contexts/wishlist-context";
import { useCart } from "@/contexts/cart-context";
import { ProductCard, type ProductCardProps } from "@/components/ui/product-card";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface WishlistAwareProductCardProps extends ProductCardProps {
  /**
   * Slug produk — dibutuhkan agar card clickable ke halaman detail.
   */
  slug?: string;
  /**
   * Harga mentah (number, satuan Rupiah) — dipakai untuk wishlist item detail.
   */
  priceRaw?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Integration point di atas ProductCard.
 * Menyambungkan wishlist context & cart context ke dumb ProductCard.
 *
 * Separation of concerns:
 * - ProductCard (components/ui) — dumb, tidak tahu context
 * - WishlistAwareProductCard (components/user) — smart wrapper, context-aware
 *
 * Cart UX (Opsi A):
 * - User atur quantity di stepper, lalu tekan tombol 🛒
 * - ProductCard me-reset qty ke 1 setelah onAddToCart dipanggil
 * - isAddingToCart=true selama request berjalan untuk disable interaksi
 */
export function WishlistAwareProductCard({
  id,
  slug,
  name,
  price,
  imageUrl,
  priceRaw = 0,
  ...rest
}: WishlistAwareProductCardProps) {
  const { isWishlisted, toggleItem } = useWishlist();
  const { addToCart } = useCart();

  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // ── Wishlist ───────────────────────────────────────────────────────────────
  const wishlisted = id ? isWishlisted(id) : false;

  const handleWishlistClick = useCallback(() => {
    if (!id) return;

    const input: WishlistProductInput = {
      product_id: id,
      product_name: name,
      product_slug: slug ?? "",
      image_url: imageUrl ?? null,
      base_price: priceRaw,
      in_stock: true, // TODO(backend): ambil dari ProductListItem.in_stock
    };

    toggleItem(input);
  }, [id, name, slug, imageUrl, priceRaw, toggleItem]);

  // ── Add to Cart ────────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(
    async (quantity: number) => {
      if (!id) return;
      setIsAddingToCart(true);
      try {
        await addToCart({ productId: id, quantity });
      } finally {
        setIsAddingToCart(false);
      }
    },
    [id, addToCart],
  );

  return (
    <ProductCard
      id={id}
      slug={slug}
      name={name}
      price={price}
      imageUrl={imageUrl}
      isWishlisted={wishlisted}
      isAddingToCart={isAddingToCart}
      onWishlistClick={handleWishlistClick}
      onAddToCart={handleAddToCart}
      {...rest}
    />
  );
}

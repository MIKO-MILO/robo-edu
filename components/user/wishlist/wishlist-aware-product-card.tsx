"use client";

import { useCallback } from "react";
import { useWishlist, type WishlistProductInput } from "@/contexts/wishlist-context";
import { ProductCard, type ProductCardProps } from "@/components/ui/product-card";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface WishlistAwareProductCardProps extends ProductCardProps {
  /**
   * Slug produk — dibutuhkan agar WishlistItemCard bisa link ke halaman detail.
   * Saat backend terhubung, selalu tersedia dari ProductListItem.slug.
   */
  slug?: string;
  /**
   * Harga mentah (number, satuan Rupiah) — dipakai untuk wishlist item detail.
   * Jika tidak ada (dummy data belum punya), item akan tampil dengan harga "—".
   */
  priceRaw?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Thin wrapper di atas ProductCard yang menghubungkan props isWishlisted
 * dan onWishlistClick ke WishlistContext.
 *
 * Mengikuti prinsip Separation of Concerns:
 * - ProductCard (components/ui) tetap "dumb" & reusable tanpa tahu context
 * - WishlistAwareProductCard (components/user) adalah integration point
 *
 * Saat backend terhubung: tidak ada perubahan di sini, hanya di WishlistContext
 * service layer.
 */
export function WishlistAwareProductCard({
  id,
  slug,
  name,
  price,
  imageUrl,
  priceRaw = 0,
  onDetailClick,
  ...rest
}: WishlistAwareProductCardProps) {
  const { isWishlisted, toggleItem } = useWishlist();

  const wishlisted = id ? isWishlisted(id) : false;

  const handleWishlistClick = useCallback(() => {
    if (!id) return;

    const input: WishlistProductInput = {
      product_id: id,
      product_name: name,
      product_slug: slug ?? "",
      image_url: imageUrl ?? null,
      base_price: priceRaw,
      // TODO(backend): ambil dari ProductListItem.in_stock saat API terhubung
      in_stock: true,
    };

    toggleItem(input);
  }, [id, name, slug, imageUrl, priceRaw, toggleItem]);

  return (
    <ProductCard
      id={id}
      name={name}
      price={price}
      imageUrl={imageUrl}
      isWishlisted={wishlisted}
      onWishlistClick={handleWishlistClick}
      onDetailClick={onDetailClick}
      {...rest}
    />
  );
}

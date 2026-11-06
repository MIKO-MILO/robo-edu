import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import {
  categories,
  productImages,
  productVideos,
  products,
  productTypes,
  productVariants,
  reviews,
  users,
} from "@/src/db/schema";
import { getUserIdFromRequest } from "@/src/lib/auth/session";
import { isActiveMember } from "@/src/lib/auth/membership";

const PALETTE = [
  "bg-accent-pink",
  "bg-accent-soft-blue",
  "bg-accent-mint",
  "bg-accent-yellow",
];
const PLACEHOLDER_IMAGE = "/images/placeholder-product.jpg";

/**
 * GET /api/product/[slug]
 *
 * Public product detail. For logged-in MEMBERs each variant also includes
 * `member_price` (the `reseller_price` value, or null when no member discount
 * exists for that variant). Guests and non-members always get null.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  const [product] = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      description: products.description,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .innerJoin(productTypes, eq(products.productTypeId, productTypes.id))
    .where(
      and(
        eq(products.slug, slug),
        eq(products.status, "active"),
        eq(categories.isActive, true),
        eq(productTypes.isActive, true),
      ),
    )
    .limit(1);

  if (!product) {
    return NextResponse.json(
      { success: false, message: "Produk tidak ditemukan" },
      { status: 404 },
    );
  }

  // Determine whether the caller is an active member so we know whether to
  // expose member pricing.
  const userId = getUserIdFromRequest(request);
  const memberPriceVisible = userId ? await isActiveMember(userId) : false;

  const [variantRows, images, videoRows, reviewRows] = await Promise.all([
    db
      .select({
        id: productVariants.id,
        name: productVariants.variantName,
        price: productVariants.price,
        resellerPrice: productVariants.resellerPrice,
        stock: productVariants.stock,
      })
      .from(productVariants)
      .where(
        and(
          eq(productVariants.productId, product.id),
          eq(productVariants.status, "active"),
        ),
      )
      .orderBy(asc(productVariants.price)),

    db
      .select({
        id: productImages.id,
        variantId: productImages.variantId,
        url: productImages.imageUrl,
        alt: productImages.altText,
        isPrimary: productImages.isPrimary,
      })
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.sortOrder)),

    db
      .select({
        id: productVideos.id,
        url: productVideos.videoUrl,
        title: productVideos.title,
        sortOrder: productVideos.sortOrder,
      })
      .from(productVideos)
      .where(eq(productVideos.productId, product.id))
      .orderBy(asc(productVideos.sortOrder)),

    db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        author: users.name,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(
        and(eq(reviews.productId, product.id), eq(reviews.status, "PUBLISHED")),
      )
      .orderBy(asc(reviews.createdAt)),
  ]);

  const primaryImage = images.find((img) => img.isPrimary) ?? images[0];
  const basePrice = Number(variantRows[0]?.price ?? 0);
  const totalStock = variantRows.reduce(
    (total, variant) => total + variant.stock,
    0,
  );
  const average = reviewRows.length
    ? reviewRows.reduce((total, r) => total + r.rating, 0) / reviewRows.length
    : 0;

  const imageForVariant = (variantId: string) =>
    images.find((img) => img.variantId === variantId)?.url ??
    primaryImage?.url ??
    PLACEHOLDER_IMAGE;

  // Build the public variants array. `member_price` is exposed as the
  // `reseller_price` value when the caller is an active MEMBER; otherwise null.
  const variants = variantRows.map((v) => ({
    id: v.id,
    name: v.name,
    price: Number(v.price),
    // Expose as member_price; null means no discount for this variant or the
    // caller is not a member.
    member_price:
      memberPriceVisible && v.resellerPrice !== null
        ? Number(v.resellerPrice)
        : null,
    stock: v.stock,
    image: imageForVariant(v.id),
  }));

  return NextResponse.json({
    success: true,
    data: {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description ?? "Belum ada deskripsi produk.",
      longDescription: [product.description ?? "Belum ada deskripsi produk."],
      highlights: [],
      // Full structured variants list (new, for programmatic use)
      variants,
      // Legacy shape kept for the existing frontend components
      components: variantRows.map((variant, index) => ({
        name: variant.name,
        description: `Varian ${variant.name} • stok ${variant.stock}`,
        imageSrc: imageForVariant(variant.id),
        imageAlt: `${product.name} ${variant.name}`,
        bgClass: PALETTE[index % PALETTE.length],
      })),
      price: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(basePrice),
      basePrice,
      defaultVariantId: variantRows[0]?.id ?? null,
      inStock: totalStock > 0,
      resellerNote: "",
      rating: average,
      reviewCount: reviewRows.length,
      images: images.length
        ? images.map((img) => ({ src: img.url, alt: img.alt ?? product.name }))
        : [{ src: PLACEHOLDER_IMAGE, alt: product.name }],
      mainImage: {
        src: primaryImage?.url ?? PLACEHOLDER_IMAGE,
        alt: primaryImage?.alt ?? product.name,
      },
      videos: videoRows.map((v) => ({
        id: v.id,
        url: v.url,
        title: v.title ?? null,
        sort_order: v.sortOrder,
      })),
      reviews: reviewRows.map((r) => ({
        id: r.id,
        rating: r.rating,
        text: r.comment ?? "",
        author: r.author,
        verified: true,
      })),
      reviewSummary: { average, total: reviewRows.length },
      relatedProducts: [],
    },
  });
}

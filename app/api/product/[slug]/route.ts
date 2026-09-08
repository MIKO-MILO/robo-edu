import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { categories, productImages, products, productTypes, productVariants, reviews, users } from "@/src/db/schema";

const PALETTE = ["bg-accent-pink", "bg-accent-soft-blue", "bg-accent-mint", "bg-accent-yellow"];
const PLACEHOLDER_IMAGE = "/images/placeholder-product.jfif";

/** Public product detail data. Price, stock, images, and reviews are all read from the database. */
export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const [product] = await db.select({ id: products.id, slug: products.slug, name: products.name, description: products.description })
    .from(products).innerJoin(categories, eq(products.categoryId, categories.id)).innerJoin(productTypes, eq(products.productTypeId, productTypes.id))
    .where(and(eq(products.slug, slug), eq(products.status, "active"), eq(categories.isActive, true), eq(productTypes.isActive, true))).limit(1);

  if (!product) return NextResponse.json({ success: false, message: "Produk tidak ditemukan" }, { status: 404 });

  const [variants, images, reviewRows] = await Promise.all([
    db.select({ id: productVariants.id, name: productVariants.variantName, price: productVariants.price, stock: productVariants.stock }).from(productVariants)
      .where(and(eq(productVariants.productId, product.id), eq(productVariants.status, "active"))).orderBy(asc(productVariants.price)),
    db.select({ id: productImages.id, variantId: productImages.variantId, url: productImages.imageUrl, alt: productImages.altText, isPrimary: productImages.isPrimary }).from(productImages)
      .where(eq(productImages.productId, product.id)).orderBy(asc(productImages.sortOrder)),
    db.select({ id: reviews.id, rating: reviews.rating, comment: reviews.comment, author: users.name }).from(reviews).innerJoin(users, eq(reviews.userId, users.id))
      .where(and(eq(reviews.productId, product.id), eq(reviews.status, "PUBLISHED"))).orderBy(asc(reviews.createdAt)),
  ]);

  const primaryImage = images.find((image) => image.isPrimary) ?? images[0];
  const basePrice = Number(variants[0]?.price ?? 0);
  const totalStock = variants.reduce((total, variant) => total + variant.stock, 0);
  const average = reviewRows.length ? reviewRows.reduce((total, review) => total + review.rating, 0) / reviewRows.length : 0;
  const imageForVariant = (variantId: string) => images.find((image) => image.variantId === variantId)?.url ?? primaryImage?.url ?? PLACEHOLDER_IMAGE;

  return NextResponse.json({ success: true, data: {
    id: product.id, slug: product.slug, name: product.name,
    description: product.description ?? "Belum ada deskripsi produk.", longDescription: [product.description ?? "Belum ada deskripsi produk."], highlights: [],
    components: variants.map((variant, index) => ({ name: variant.name, description: `Varian ${variant.name} • stok ${variant.stock}`, imageSrc: imageForVariant(variant.id), imageAlt: `${product.name} ${variant.name}`, bgClass: PALETTE[index % PALETTE.length] })),
    price: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(basePrice), basePrice,
    defaultVariantId: variants[0]?.id ?? null, inStock: totalStock > 0, resellerNote: "", rating: average, reviewCount: reviewRows.length,
    images: images.length ? images.map((image) => ({ src: image.url, alt: image.alt ?? product.name })) : [{ src: PLACEHOLDER_IMAGE, alt: product.name }],
    mainImage: { src: primaryImage?.url ?? PLACEHOLDER_IMAGE, alt: primaryImage?.alt ?? product.name },
    reviews: reviewRows.map((review) => ({ id: review.id, rating: review.rating, text: review.comment ?? "", author: review.author, verified: true })),
    reviewSummary: { average, total: reviewRows.length }, relatedProducts: [],
  }});
}

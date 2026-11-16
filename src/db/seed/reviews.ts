/**
 * Seed script — buat data user biasa, order, order_items, dan reviews
 * untuk keperluan testing rating & review count di halaman listing produk.
 *
 * Idempotent: semua insert pakai onDuplicateKeyUpdate({ set: { id: sql`id` } })
 * sehingga aman dijalankan berulang kali.
 *
 * Dependency:
 *   - products.ts harus sudah dijalankan lebih dulu (produk & variant harus ada)
 *
 * Jalankan langsung:
 *   npm run db:seed:reviews
 *
 * Atau via master runner:
 *   npm run db:seed
 */

import "dotenv/config";
import crypto from "node:crypto";
import { promisify } from "node:util";
import { db } from "..";
import { users } from "../schema/user";
import { userAddresses } from "../schema/user-address";
import { orders } from "../schema/order";
import { orderItems } from "../schema/order-item";
import { reviews } from "../schema/review";
import { sql } from "drizzle-orm";

const scrypt = promisify(crypto.scrypt);

async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = Buffer.from(
    (await scrypt(password, salt, 64)) as Uint8Array,
  ).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

// ─── Seed users ────────────────────────────────────────────────────────────────
// Tiga user fiktif sebagai reviewer.
const SEED_USERS = [
  {
    id: "seed-user-budi",
    name: "Budi Santoso",
    email: "budi.reviewer@seed.test",
    phone: "08111000001",
  },
  {
    id: "seed-user-siti",
    name: "Siti Rahayu",
    email: "siti.reviewer@seed.test",
    phone: "08111000002",
  },
  {
    id: "seed-user-andi",
    name: "Andi Wijaya",
    email: "andi.reviewer@seed.test",
    phone: "08111000003",
  },
];

// ─── Seed address (FK dari orders) ────────────────────────────────────────────
const SEED_ADDRESSES = [
  {
    id: "seed-addr-budi",
    userId: "seed-user-budi",
    label: "Rumah",
    recipientName: "Budi Santoso",
    phone: "08111000001",
    province: "Jawa Tengah",
    city: "Semarang",
    district: "Banyumanik",
    village: "Ngesrep",
    postalCode: "50263",
    address: "Jl. Ngesrep Timur V No. 5, Semarang",
    isPrimary: true,
  },
  {
    id: "seed-addr-siti",
    userId: "seed-user-siti",
    label: "Rumah",
    recipientName: "Siti Rahayu",
    phone: "08111000002",
    province: "DKI Jakarta",
    city: "Jakarta Selatan",
    district: "Mampang Prapatan",
    village: "Mampang",
    postalCode: "12790",
    address: "Jl. Mampang Prapatan XII No. 3, Jakarta Selatan",
    isPrimary: true,
  },
  {
    id: "seed-addr-andi",
    userId: "seed-user-andi",
    label: "Rumah",
    recipientName: "Andi Wijaya",
    phone: "08111000003",
    province: "Jawa Timur",
    city: "Surabaya",
    district: "Sukolilo",
    village: "Keputih",
    postalCode: "60111",
    address: "Jl. Keputih Tegal No. 12, Surabaya",
    isPrimary: true,
  },
];

// ─── Seed orders ──────────────────────────────────────────────────────────────
// Setiap user punya 1 order berstatus "completed" agar review bisa dibuat.
const SEED_ORDERS = [
  {
    id: "seed-order-budi-1",
    orderNumber: "SEED-ORD-0001",
    userId: "seed-user-budi",
    addressId: "seed-addr-budi",
    subtotal: "100000",
    total: "100000",
    recipientName: "Budi Santoso",
    recipientPhone: "08111000001",
    shippingAddress: "Jl. Ngesrep Timur V No. 5, Semarang",
    shippingProvince: "Jawa Tengah",
    shippingCity: "Semarang",
    shippingDistrict: "Banyumanik",
    shippingVillage: "Ngesrep",
    shippingPostalCode: "50263",
    status: "completed",
  },
  {
    id: "seed-order-siti-1",
    orderNumber: "SEED-ORD-0002",
    userId: "seed-user-siti",
    addressId: "seed-addr-siti",
    subtotal: "320000",
    total: "320000",
    recipientName: "Siti Rahayu",
    recipientPhone: "08111000002",
    shippingAddress: "Jl. Mampang Prapatan XII No. 3, Jakarta Selatan",
    shippingProvince: "DKI Jakarta",
    shippingCity: "Jakarta Selatan",
    shippingDistrict: "Mampang Prapatan",
    shippingVillage: "Mampang",
    shippingPostalCode: "12790",
    status: "completed",
  },
  {
    id: "seed-order-andi-1",
    orderNumber: "SEED-ORD-0003",
    userId: "seed-user-andi",
    addressId: "seed-addr-andi",
    subtotal: "699000",
    total: "699000",
    recipientName: "Andi Wijaya",
    recipientPhone: "08111000003",
    shippingAddress: "Jl. Keputih Tegal No. 12, Surabaya",
    shippingProvince: "Jawa Timur",
    shippingCity: "Surabaya",
    shippingDistrict: "Sukolilo",
    shippingVillage: "Keputih",
    shippingPostalCode: "60111",
    status: "completed",
  },
];

// ─── Seed order items ──────────────────────────────────────────────────────────
// reviews.orderItemId harus unik (uniqueIndex) — 1 review per order item.
const SEED_ORDER_ITEMS = [
  // Budi beli Sensor Pack Pro (Basic)
  {
    id: "seed-oi-budi-sensor",
    orderId: "seed-order-budi-1",
    productId: "prod-sensor-pack-pro",
    variantId: "var-sensor-pro-basic",
    productNameSnapshot: "Sensor Pack Pro",
    variantNameSnapshot: "Basic",
    skuSnapshot: "SENSOR-PRO-BASIC",
    priceSnapshot: "100000",
    quantity: 1,
    subtotal: "100000",
  },
  // Siti beli Line Follower Kit (Unassembled)
  {
    id: "seed-oi-siti-line",
    orderId: "seed-order-siti-1",
    productId: "prod-line-follower-kit",
    variantId: "var-line-v2-unassembled",
    productNameSnapshot: "Line Follower Robot Kit V2",
    variantNameSnapshot: "Unassembled (Rakit Sendiri)",
    skuSnapshot: "ROBOT-LINE-V2-KIT",
    priceSnapshot: "320000",
    quantity: 1,
    subtotal: "320000",
  },
  // Andi beli Robotic Arm (Full Kit)
  {
    id: "seed-oi-andi-arm",
    orderId: "seed-order-andi-1",
    productId: "prod-ulir-servo-lengan",
    variantId: "var-arm-kit",
    productNameSnapshot: "Robotic Arm 4-DOF with MG996R",
    variantNameSnapshot: "Full Kit (Dengan 4 servo)",
    skuSnapshot: "ROBOT-ARM-KIT",
    priceSnapshot: "699000",
    quantity: 1,
    subtotal: "699000",
  },
  // Budi juga beli Robotic Arm (agar produk ini punya 2 review)
  {
    id: "seed-oi-budi-arm",
    orderId: "seed-order-budi-1",
    productId: "prod-ulir-servo-lengan",
    variantId: "var-arm-structure",
    productNameSnapshot: "Robotic Arm 4-DOF with MG996R",
    variantNameSnapshot: "Struktur Saja (Tanpa Servo)",
    skuSnapshot: "ROBOT-ARM-FRAME",
    priceSnapshot: "255000",
    quantity: 1,
    subtotal: "255000",
  },
];

// ─── Seed reviews ──────────────────────────────────────────────────────────────
// Status "published" = muncul di aggregasi rating.
// Sensor Pack Pro → 5 bintang (1 review)  → avg 5.0
// Line Follower   → 4 bintang (1 review)  → avg 4.0
// Robotic Arm     → 5 + 3 bintang (2 review) → avg 4.0
// ESP32 Starter, Komponen Hemat, Learning Hub → tidak ada review (tampil "Belum ada ulasan")
const SEED_REVIEWS = [
  {
    id: "seed-review-budi-sensor",
    orderItemId: "seed-oi-budi-sensor",
    userId: "seed-user-budi",
    productId: "prod-sensor-pack-pro",
    rating: 5,
    comment:
      "Sensor pack sangat lengkap! DHT11 dan HC-SR04 langsung jalan tanpa masalah. Cocok untuk proyek sekolah.",
    status: "published",
  },
  {
    id: "seed-review-siti-line",
    orderItemId: "seed-oi-siti-line",
    userId: "seed-user-siti",
    productId: "prod-line-follower-kit",
    rating: 4,
    comment:
      "Kualitas komponen bagus. Rakit sekitar 2 jam. Sedikit kurang petunjuk kalibrasi sensor, tapi overall puas.",
    status: "published",
  },
  {
    id: "seed-review-andi-arm",
    orderItemId: "seed-oi-andi-arm",
    userId: "seed-user-andi",
    productId: "prod-ulir-servo-lengan",
    rating: 5,
    comment:
      "MG996R torsi-nya kenceng banget. PCA9685 mudah dikontrol dari Arduino. Sangat rekomendasikan!",
    status: "published",
  },
  {
    id: "seed-review-budi-arm",
    orderItemId: "seed-oi-budi-arm",
    userId: "seed-user-budi",
    productId: "prod-ulir-servo-lengan",
    rating: 3,
    comment:
      "Struktur acrylic-nya sudah oke, tapi baut bawaan agak mudah longgar. Perlu lem atau baut pengganti.",
    status: "published",
  },
];

// ─── Runner ───────────────────────────────────────────────────────────────────

export async function seedReviews() {
  console.log("[seed:reviews] Starting reviews seeder...");

  // 1. Users
  const passwordHash = await hashPassword("ReviewSeed@123");
  for (const u of SEED_USERS) {
    await db
      .insert(users)
      .values({ ...u, password: passwordHash })
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
  }
  console.log(`[seed:reviews] ✔ Users (${SEED_USERS.length})`);

  // 2. Addresses
  for (const a of SEED_ADDRESSES) {
    await db
      .insert(userAddresses)
      .values(a)
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
  }
  console.log(`[seed:reviews] ✔ Addresses (${SEED_ADDRESSES.length})`);

  // 3. Orders
  for (const o of SEED_ORDERS) {
    await db
      .insert(orders)
      .values({
        ...o,
        discountAmount: "0",
        taxAmount: "0",
        shippingCost: "0",
      })
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
  }
  console.log(`[seed:reviews] ✔ Orders (${SEED_ORDERS.length})`);

  // 4. Order items
  for (const oi of SEED_ORDER_ITEMS) {
    await db
      .insert(orderItems)
      .values(oi)
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
  }
  console.log(`[seed:reviews] ✔ Order items (${SEED_ORDER_ITEMS.length})`);

  // 5. Reviews
  for (const r of SEED_REVIEWS) {
    await db
      .insert(reviews)
      .values(r)
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
  }
  console.log(`[seed:reviews] ✔ Reviews (${SEED_REVIEWS.length})`);

  console.log("[seed:reviews] Done.");
}

// Standalone entry point (npm run db:seed:reviews)
if (process.argv[1] === import.meta.filename) {
  seedReviews()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[seed:reviews] FAILED:", err);
      process.exit(1);
    });
}

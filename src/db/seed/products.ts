/**
 * Seeder: products_v1
 * ─────────────────────────────────────────────────────────────────────────────
 * Menyemai:
 *   - 3 categories
 *   - 3 product_types
 *   - 10 products (masing-masing 1–2 variants + 1 primary image)
 *
 * Guard: Jika row dengan id="products_v1" sudah ada di tabel seed_logs,
 * script langsung exit tanpa melakukan apapun.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq } from "drizzle-orm";

import { categories }     from "../schema/category";
import { productTypes }   from "../schema/product-type";
import { products }       from "../schema/product";
import { productVariants } from "../schema/product-variant";
import { productImages }  from "../schema/product-image";
import { seedLogs }       from "./seed-log";

const SEEDER_ID = "products_v1";

// ── helpers ───────────────────────────────────────────────────────────────────
const uuid = () => crypto.randomUUID();
const now  = new Date();

function slug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// ── data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "Robotika Edukasi",  desc: "Kit robotika untuk pembelajaran STEM" },
  { name: "Elektronika",       desc: "Komponen dan modul elektronika" },
  { name: "Sensor & Aktuator", desc: "Sensor, motor, dan aktuator" },
];

const PRODUCT_TYPES = [
  { name: "Kit Lengkap", desc: "Paket lengkap siap rakit" },
  { name: "Komponen",    desc: "Komponen satuan" },
  { name: "Bundle",      desc: "Paket hemat multi-item" },
];

interface ProductSeed {
  name: string;
  description: string;
  categoryIdx: number;   // index ke CATEGORIES
  typeIdx: number;        // index ke PRODUCT_TYPES
  image: string;
  variants: Array<{ name: string; sku: string; price: number; resellerPrice: number; stock: number }>;
}

const PRODUCTS: ProductSeed[] = [
  {
    name: "Robo Kit Car",
    description: "Kit mobil robotik pemula dengan mikrokontroler, sensor ultrasonik, dan panduan lengkap.",
    categoryIdx: 0, typeIdx: 0,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80",
    variants: [
      { name: "Standard", sku: "RKC-STD-001", price: 450000, resellerPrice: 380000, stock: 50 },
      { name: "Pro Bundle", sku: "RKC-PRO-001", price: 620000, resellerPrice: 530000, stock: 30 },
    ],
  },
  {
    name: "Sensor Pack Pro",
    description: "Paket 10 sensor populer: ultrasonik, IR, suhu, kelembaban, cahaya, dan lainnya.",
    categoryIdx: 2, typeIdx: 2,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
    variants: [
      { name: "10 Sensor", sku: "SPP-10S-001", price: 100000, resellerPrice: 80000, stock: 100 },
    ],
  },
  {
    name: "Arduino Uno R3 Compatible",
    description: "Board mikrokontroler kompatibel Arduino Uno R3, cocok untuk proyek STEM dan robotika.",
    categoryIdx: 1, typeIdx: 1,
    image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=400&q=80",
    variants: [
      { name: "Standard", sku: "ARD-UNO-001", price: 85000, resellerPrice: 65000, stock: 200 },
    ],
  },
  {
    name: "Robo Kit Windmill",
    description: "Kit kincir angin edukatif dengan generator mini, pelajari konsep energi terbarukan.",
    categoryIdx: 0, typeIdx: 0,
    image: "https://images.unsplash.com/photo-1467533003447-e295ff1b0435?w=400&q=80",
    variants: [
      { name: "Standard", sku: "RKW-STD-001", price: 320000, resellerPrice: 270000, stock: 40 },
    ],
  },
  {
    name: "Servo Motor SG90",
    description: "Servo micro 9g, torsi tinggi, ideal untuk robot kecil dan mekanisme gerak presisi.",
    categoryIdx: 2, typeIdx: 1,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    variants: [
      { name: "1 Pcs", sku: "SRV-SG90-1",  price: 25000, resellerPrice: 18000, stock: 500 },
      { name: "5 Pcs", sku: "SRV-SG90-5",  price: 110000, resellerPrice: 85000, stock: 150 },
    ],
  },
  {
    name: "Robotic Arm Pro 4-DOF",
    description: "Lengan robot 4 derajat kebebasan dengan gripper mekanik, kontrol via Arduino.",
    categoryIdx: 0, typeIdx: 0,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80",
    variants: [
      { name: "Kit Acrylic", sku: "RAP-ACR-001", price: 850000, resellerPrice: 720000, stock: 20 },
    ],
  },
  {
    name: "ESP32 Development Board",
    description: "Board ESP32 dual-core 240MHz, WiFi + Bluetooth, cocok untuk proyek IoT dan robotika.",
    categoryIdx: 1, typeIdx: 1,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
    variants: [
      { name: "Standard", sku: "ESP32-STD-001", price: 95000, resellerPrice: 75000, stock: 150 },
    ],
  },
  {
    name: "Smart Home Starter Kit",
    description: "Paket starter IoT rumah pintar: ESP8266, relay, sensor gerak, dan panduan proyek.",
    categoryIdx: 0, typeIdx: 2,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    variants: [
      { name: "Starter", sku: "SHS-STR-001", price: 550000, resellerPrice: 460000, stock: 35 },
      { name: "Advanced", sku: "SHS-ADV-001", price: 780000, resellerPrice: 650000, stock: 20 },
    ],
  },
  {
    name: "Jumper Wire Set 120pcs",
    description: "Set kabel jumper Dupont 120 pcs (M-M, M-F, F-F) panjang 20cm.",
    categoryIdx: 1, typeIdx: 1,
    image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=400&q=80",
    variants: [
      { name: "120 Pcs", sku: "JMP-120-001", price: 35000, resellerPrice: 25000, stock: 300 },
    ],
  },
  {
    name: "Robo Explorer Hexapod",
    description: "Robot hexapod 6 kaki dengan servo dan kontrol Bluetooth, tantangan merakit tingkat lanjut.",
    categoryIdx: 0, typeIdx: 0,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80",
    variants: [
      { name: "Full Kit", sku: "REX-HEX-001", price: 680000, resellerPrice: 570000, stock: 25 },
    ],
  },
];

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  const connection = await mysql.createConnection(
    process.env.DATABASE_URL!.replace("mysql://", "mysql2://"),
  );
  const db = drizzle(connection);

  // ── Pastikan tabel seed_logs ada ────────────────────────────────────────
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS seed_logs (
      id VARCHAR(100) PRIMARY KEY,
      run_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Guard: skip jika sudah pernah jalan ─────────────────────────────────
  const [existing] = await db
    .select({ id: seedLogs.id })
    .from(seedLogs)
    .where(eq(seedLogs.id, SEEDER_ID))
    .limit(1);

  if (existing) {
    console.log(`[seed] "${SEEDER_ID}" sudah pernah dijalankan — skip.`);
    await connection.end();
    return;
  }

  console.log(`[seed] Menjalankan "${SEEDER_ID}"...`);

  // ── 1. Categories ────────────────────────────────────────────────────────
  const categoryIds: string[] = [];
  for (const cat of CATEGORIES) {
    const id = uuid();
    categoryIds.push(id);
    await db.insert(categories).ignore().values({
      id,
      name: cat.name,
      slug: slug(cat.name),
      description: cat.desc,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  // ── 2. Product Types ─────────────────────────────────────────────────────
  const typeIds: string[] = [];
  for (const pt of PRODUCT_TYPES) {
    const id = uuid();
    typeIds.push(id);
    await db.insert(productTypes).ignore().values({
      id,
      name: pt.name,
      slug: slug(pt.name),
      description: pt.desc,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  // ── 3. Products + Variants + Images ─────────────────────────────────────
  for (const p of PRODUCTS) {
    const productId = uuid();
    const productSlug = slug(p.name);

    await db.insert(products).ignore().values({
      id: productId,
      categoryId: categoryIds[p.categoryIdx],
      productTypeId: typeIds[p.typeIdx],
      name: p.name,
      slug: productSlug,
      sku: `PRD-${productSlug.slice(0, 10).toUpperCase().replace(/-/g, "")}`,
      description: p.description,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // Variants
    for (const v of p.variants) {
      const variantId = uuid();
      await db.insert(productVariants).ignore().values({
        id: variantId,
        productId,
        variantName: v.name,
        sku: v.sku,
        price: String(v.price),
        resellerPrice: String(v.resellerPrice),
        stock: v.stock,
        weight: 200,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });

      // Primary image untuk variant pertama
      if (v === p.variants[0]) {
        await db.insert(productImages).ignore().values({
          id: uuid(),
          productId,
          variantId,
          imageUrl: p.image,
          altText: p.name,
          sortOrder: 0,
          isPrimary: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  // ── 4. Tandai sebagai sudah dijalankan ───────────────────────────────────
  await db.insert(seedLogs).values({ id: SEEDER_ID, runAt: now });

  console.log(`[seed] "${SEEDER_ID}" selesai — ${PRODUCTS.length} produk berhasil diseed.`);
  await connection.end();
}

main().catch((err) => {
  console.error("[seed] Error:", err);
  process.exit(1);
});

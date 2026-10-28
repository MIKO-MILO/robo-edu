import "dotenv/config";
import { db } from "..";
import { categories } from "../schema/category";
import { productTypes } from "../schema/product-type";
import { products } from "../schema/product";
import { productVariants } from "../schema/product-variant";
import { productImages } from "../schema/product-image";
import { sql } from "drizzle-orm";

const CATEGORIES_SEED = [
  {
    id: "cat-sensor-pack",
    name: "Sensor Pack",
    slug: "sensor-pack",
    description:
      "Paket modul sensor lengkap untuk belajar elektronika dan robotika dasar.",
    imageUrl: "",
    isActive: true,
  },
  {
    id: "cat-robot-kit",
    name: "Robot Kit",
    slug: "robot-kit",
    description:
      "Rakit robot impianmu: dari line follower, obstacle avoider, sampai lengan manipulator.",
    imageUrl: "",
    isActive: true,
  },
  {
    id: "cat-iot-starter",
    name: "IoT Starter",
    slug: "iot-starter",
    description:
      "Perangkat keras untuk memulai proyek Internet of Things: monitoring suhu, kontrol relay via web.",
    imageUrl: "",
    isActive: true,
  },
  {
    id: "cat-komponen-elektronika",
    name: "Komponen Elektronika",
    slug: "komponen-elektronika",
    description:
      "Resistor, kapasitor, kabel jumper, breadboard, dan komponen dasar lainnya dalam paket hemat.",
    imageUrl: "",
    isActive: true,
  },
] as const;

const PRODUCT_TYPES_SEED = [
  {
    id: "pt-physical",
    name: "Barang Fisik",
    slug: "physical-goods",
    description: "Produk berupa barang fisik yang dikirim via kurir.",
    isActive: true,
  },
  {
    id: "pt-bundle",
    name: "Paket Bundling",
    slug: "bundle",
    description: "Kombinasi beberapa produk menjadi satu paket dengan harga khusus.",
    isActive: true,
  },
  {
    id: "pt-digital",
    name: "Akses Digital",
    slug: "digital-access",
    description: "Akses materi, video tutorial, atau learning module secara digital.",
    isActive: true,
  },
] as const;

type ProductSeedRow = {
  id: string;
  categoryId: string;
  productTypeId: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  status: "active" | "inactive";
  variants: Array<{
    id: string;
    variantName: string;
    sku: string;
    price: number;
    resellerPrice: number;
    stock: number;
    weight: number;
    status: "active" | "inactive";
  }>;
  images: Array<{
    id: string;
    variantId: string | null;
    imageUrl: string;
    altText: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;
};

const PRODUCTS_SEED: ProductSeedRow[] = [
  {
    id: "prod-sensor-pack-pro",
    categoryId: "cat-sensor-pack",
    productTypeId: "pt-bundle",
    name: "Sensor Pack Pro",
    slug: "sensor-pack-pro",
    sku: "SENSOR-PRO",
    description:
      "Paket sensor premium 10-in-1: ultrasonic HC-SR04, infrared, DHT11 suhu+kelembaban, LDR cahaya, gas MQ-2, potentiometer, push button, buzzer aktif/pasif, LED RGB, relay 1-channel. Dilengkapi kabel jumper male-to-female dan tutorial 20+ proyek.",
    status: "active",
    variants: [
      {
        id: "var-sensor-pro-basic",
        variantName: "Basic",
        sku: "SENSOR-PRO-BASIC",
        price: 100000,
        resellerPrice: 85000,
        stock: 250,
        weight: 350,
        status: "active",
      },
      {
        id: "var-sensor-pro-advanced",
        variantName: "Advanced (with Arduino UNO)",
        sku: "SENSOR-PRO-ADVANCED",
        price: 275000,
        resellerPrice: 240000,
        stock: 120,
        weight: 650,
        status: "active",
      },
    ],
    images: [
      {
        id: "img-sensor-pro-1",
        variantId: null,
        imageUrl:
          "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Professional%20photography%20of%20a%20premium%20electronics%20sensor%20bundle%20kit%20with%20HC-SR04%20ultrasonic%20DHT11%20LDR%20MQ-2%20on%20white%20background%20studio%20lighting%20e-commerce%20photo&image_size=square_hd",
        altText: "Sensor Pack Pro - paket 10 modul sensor utama",
        sortOrder: 1,
        isPrimary: true,
      },
      {
        id: "img-sensor-pro-2",
        variantId: null,
        imageUrl:
          "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Close-up%20photography%20of%20jumper%20wires%20breadboard%20and%20Arduino%20components%20laid%20out%20neatly%20on%20wooden%20table&image_size=square_hd",
        altText: "Isi dalam kemasan Sensor Pack Pro: kabel jumper & komponen",
        sortOrder: 2,
        isPrimary: false,
      },
    ],
  },
  {
    id: "prod-line-follower-kit",
    categoryId: "cat-robot-kit",
    productTypeId: "pt-physical",
    name: "Line Follower Robot Kit V2",
    slug: "line-follower-robot-kit-v2",
    sku: "ROBOT-LINE-V2",
    description:
      "Rakit sendiri robot pemandu garis 2WD dengan 5 sensor IR array, motor DC 6V, speed encoder, dan mainboard berbasis ATmega328. Mendukung upgrade ke Bluetooth HC-05 untuk remote control via HP.",
    status: "active",
    variants: [
      {
        id: "var-line-v2-unassembled",
        variantName: "Unassembled (Rakit Sendiri)",
        sku: "ROBOT-LINE-V2-KIT",
        price: 320000,
        resellerPrice: 280000,
        stock: 80,
        weight: 800,
        status: "active",
      },
      {
        id: "var-line-v2-assembled",
        variantName: "Pre-assembled (Siap Pakai)",
        sku: "ROBOT-LINE-V2-READY",
        price: 450000,
        resellerPrice: 395000,
        stock: 35,
        weight: 850,
        status: "active",
      },
    ],
    images: [
      {
        id: "img-line-v2-1",
        variantId: null,
        imageUrl:
          "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=White%20background%20studio%20photo%20of%20a%20two%20wheel%20line%20follower%20robot%20car%20with%20IR%20sensor%20array%20on%20front%2C%20clean%20e-commerce%20product%20shot&image_size=square_hd",
        altText: "Line Follower Robot Kit V2 tampak depan",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
  },
  {
    id: "prod-esp32-iot-starter",
    categoryId: "cat-iot-starter",
    productTypeId: "pt-bundle",
    name: "ESP32 IoT Starter Pack",
    slug: "esp32-iot-starter-pack",
    sku: "IOT-ESP32-STARTER",
    description:
      "Mulai belajar IoT dengan ESP32 DevKit V1, sensor BME280 (suhu, kelembaban, tekanan), OLED 0.96 inch, modul relay 5V, dan step-down. Termasuk akses 30+ tutorial gratis: dashboard monitoring suhu, kontrol lampu via web, dan Telegram bot.",
    status: "active",
    variants: [
      {
        id: "var-esp32-starter",
        variantName: "Standard Pack",
        sku: "IOT-ESP32-STD",
        price: 389000,
        resellerPrice: 340000,
        stock: 100,
        weight: 420,
        status: "active",
      },
    ],
    images: [
      {
        id: "img-esp32-1",
        variantId: null,
        imageUrl:
          "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=ESP32%20devkit%20and%20BME280%20sensor%20OLED%20display%20relay%20module%20arranged%20on%20white%20background%20top%20down%20ecommerce%20photo&image_size=square_hd",
        altText: "ESP32 IoT Starter Pack isi lengkap",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
  },
  {
    id: "prod-komponen-paket-hemat",
    categoryId: "cat-komponen-elektronika",
    productTypeId: "pt-bundle",
    name: "Paket Komponen Hemat 600+ pcs",
    slug: "paket-komponen-hemat-600",
    sku: "COMP-BASIC-600",
    description:
      "Paket starter untuk mahasiswa & pemula: resistor 30 nilai (300 pcs), kapasitor keramik & elektrolit (120 pcs), LED 5 warna (100 pcs), kabel jumper M-M, M-F, F-F (70 pcs), push button tactile, buzzer, potentiometer, breadboard 400/830 point. Semua dalam organizer box.",
    status: "active",
    variants: [
      {
        id: "var-comp-basic",
        variantName: "Basic (tanpa breadboard)",
        sku: "COMP-BASIC-NO-BB",
        price: 85000,
        resellerPrice: 72000,
        stock: 500,
        weight: 480,
        status: "active",
      },
      {
        id: "var-comp-plus",
        variantName: "Plus (dengan breadboard 830)",
        sku: "COMP-BASIC-PLUS",
        price: 125000,
        resellerPrice: 108000,
        stock: 300,
        weight: 650,
        status: "active",
      },
    ],
    images: [
      {
        id: "img-comp-1",
        variantId: null,
        imageUrl:
          "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Electronics%20component%20starter%20kit%20with%20colorful%20resistors%20capacitors%20LEDs%20jumper%20wires%20in%20a%20plastic%20organizer%20box%20white%20background%20studio%20photo&image_size=square_hd",
        altText: "Paket Komponen Hemat 600+ pcs dengan organizer box",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
  },
  {
    id: "prod-ulir-servo-lengan",
    categoryId: "cat-robot-kit",
    productTypeId: "pt-physical",
    name: "Robotic Arm 4-DOF with MG996R",
    slug: "robotic-arm-4dof-mg996r",
    sku: "ROBOT-ARM-4DOF",
    description:
      "Lengan robot 4 derajat kebebasan dengan 4 servo MG996R metal gear, bracket acrylic premium, controller board PCA9685 16-channel 12-bit PWM. Mendukung kontrol via joystick maupun Bluetooth.",
    status: "active",
    variants: [
      {
        id: "var-arm-kit",
        variantName: "Full Kit (Dengan 4 servo)",
        sku: "ROBOT-ARM-KIT",
        price: 699000,
        resellerPrice: 610000,
        stock: 40,
        weight: 1800,
        status: "active",
      },
      {
        id: "var-arm-structure",
        variantName: "Struktur Saja (Tanpa Servo)",
        sku: "ROBOT-ARM-FRAME",
        price: 255000,
        resellerPrice: 225000,
        stock: 70,
        weight: 900,
        status: "active",
      },
    ],
    images: [
      {
        id: "img-arm-1",
        variantId: null,
        imageUrl:
          "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=4%20DOF%20robotic%20arm%20with%20MG996R%20servos%20and%20acrylic%20bracket%20assembly%20on%20white%20background%20professional%20product%20photography&image_size=square_hd",
        altText: "Robotic Arm 4-DOF dengan MG996R metal gear",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
  },
  {
    id: "prod-video-tutorial-premium",
    categoryId: "cat-iot-starter",
    productTypeId: "pt-digital",
    name: "Akses Premium Learning Hub (1 Tahun)",
    slug: "premium-learning-hub-1year",
    sku: "DIGI-LEARN-1Y",
    description:
      "Akses 1 tahun ke 200+ video tutorial step-by-step, 50+ project blueprint, e-book PDF, dan kode sumber. Materi meliputi: dasar elektronika, Arduino, ESP32 IoT, machine learning edge, PCB design dengan KiCad, dan robotika kompetisi.",
    status: "active",
    variants: [
      {
        id: "var-learn-1y",
        variantName: "Personal License (1 Akun)",
        sku: "DIGI-LEARN-1Y-PERSONAL",
        price: 249000,
        resellerPrice: 200000,
        stock: 9999,
        weight: 0,
        status: "active",
      },
      {
        id: "var-learn-school",
        variantName: "Sekolah/Organisasi (10 Akun)",
        sku: "DIGI-LEARN-1Y-SCHOOL",
        price: 1750000,
        resellerPrice: 1500000,
        stock: 9999,
        weight: 0,
        status: "active",
      },
    ],
    images: [
      {
        id: "img-learn-1",
        variantId: null,
        imageUrl:
          "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Digital%20learning%20platform%20concept%3A%20laptop%20showing%20educational%20video%20tutorial%20about%20robotics%20and%20electronics%20on%20clean%20desk%20with%20a%20cup%20of%20coffee&image_size=landscape_16_9",
        altText: "Akses Premium Learning Hub Robo-Edu",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
  },
];

async function seed() {
  console.log("[seed:products] Starting product seeder...");

  for (const row of CATEGORIES_SEED) {
    await db
      .insert(categories)
      .values(row)
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
  }
  console.log(
    `[seed:products] ✔ Categories seeded (${CATEGORIES_SEED.length} rows, skipped if existed)`,
  );

  for (const row of PRODUCT_TYPES_SEED) {
    await db
      .insert(productTypes)
      .values(row)
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
  }
  console.log(
    `[seed:products] ✔ Product types seeded (${PRODUCT_TYPES_SEED.length} rows, skipped if existed)`,
  );

  let productCount = 0;
  let variantCount = 0;
  let imageCount = 0;

  for (const row of PRODUCTS_SEED) {
    const { variants, images, ...productRow } = row;

    await db
      .insert(products)
      .values(productRow)
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
    productCount++;

    for (const v of variants) {
      await db
        .insert(productVariants)
        .values({
          id: v.id,
          productId: row.id,
          variantName: v.variantName,
          sku: v.sku,
          price: String(v.price),
          resellerPrice: String(v.resellerPrice),
          stock: v.stock,
          weight: v.weight,
          status: v.status,
        })
        .onDuplicateKeyUpdate({ set: { id: sql`id` } });
      variantCount++;
    }

    for (const img of images) {
      await db
        .insert(productImages)
        .values({
          id: img.id,
          productId: row.id,
          variantId: img.variantId,
          imageUrl: img.imageUrl,
          altText: img.altText,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
        })
        .onDuplicateKeyUpdate({ set: { id: sql`id` } });
      imageCount++;
    }
  }

  console.log(
    `[seed:products] ✔ Products: ${productCount}, Variants: ${variantCount}, Images: ${imageCount} (all skipped if existed)`,
  );
  console.log("[seed:products] Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed:products] FAILED:", err);
  process.exit(1);
});

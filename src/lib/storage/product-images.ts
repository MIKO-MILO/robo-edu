import "server-only";

import crypto from "node:crypto";
import { Client } from "minio";

const bucket = process.env.MINIO_BUCKET || "roboedu-public";

function minioClient() {
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  if (!accessKey || !secretKey)
    throw new Error("MinIO credentials are not configured");

  return new Client({
    endPoint: process.env.MINIO_ENDPOINT || "minio",
    port: Number(process.env.MINIO_PORT || 9000),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey,
    secretKey,
  });
}

async function ensureBucket(client: Client) {
  if (!(await client.bucketExists(bucket)))
    await client.makeBucket(bucket, "us-east-1");
}

/** Upload file ke MinIO, return path relatif yang bisa diakses via /api/images/... */
export async function saveProductImage(
  productId: string,
  file: File,
): Promise<{ key: string; url: string }> {
  const client = minioClient();
  await ensureBucket(client);

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/gif"
          ? "gif"
          : "jpg";

  const key = `product-images/${productId}/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await client.putObject(bucket, key, buffer, buffer.length, {
    "Content-Type": file.type,
  });

  // Simpan sebagai URL relatif — bekerja di semua environment
  // (Docker, ngrok, production) tanpa perlu tahu hostname eksternal
  const url = `/api/images/${key}`;

  return { key, url };
}

/** Hapus object dari MinIO berdasarkan key, URL publik, atau path relatif */
export async function removeProductImage(keyOrUrl: string): Promise<void> {
  const client = minioClient();

  let key = keyOrUrl;

  if (keyOrUrl.startsWith("/api/images/")) {
    // Path relatif: /api/images/product-images/prod-xxx/uuid.png
    key = keyOrUrl.replace("/api/images/", "");
  } else if (keyOrUrl.startsWith("http")) {
    // URL absolut lama: http://host:port/bucket/key
    const parts = new URL(keyOrUrl).pathname.split("/");
    key = parts.slice(2).join("/");
  }

  try {
    await client.removeObject(bucket, key);
  } catch {
    // Jika object tidak ditemukan di MinIO, abaikan — tetap hapus dari DB
  }
}

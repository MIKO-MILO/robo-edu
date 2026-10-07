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

/** Upload video ke MinIO, return key dan URL relatif /api/videos/... */
export async function saveProductVideo(
  productId: string,
  file: File,
): Promise<{ key: string; url: string }> {
  const client = minioClient();
  await ensureBucket(client);

  const ext =
    file.type === "video/mp4"  ? "mp4"  :
    file.type === "video/webm" ? "webm" :
    file.type === "video/ogg"  ? "ogv"  : "mp4";

  const key = `product-videos/${productId}/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await client.putObject(bucket, key, buffer, buffer.length, {
    "Content-Type": file.type,
  });

  const url = `/api/videos/${key}`;
  return { key, url };
}

/** Hapus video dari MinIO berdasarkan key atau URL relatif. */
export async function removeProductVideo(keyOrUrl: string): Promise<void> {
  const client = minioClient();

  let key = keyOrUrl;
  if (keyOrUrl.startsWith("/api/videos/")) {
    key = keyOrUrl.replace("/api/videos/", "");
  } else if (keyOrUrl.startsWith("http")) {
    const parts = new URL(keyOrUrl).pathname.split("/");
    key = parts.slice(2).join("/");
  }

  try {
    await client.removeObject(bucket, key);
  } catch {
    // Abaikan jika objek tidak ditemukan
  }
}

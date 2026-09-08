import "server-only";

import crypto from "node:crypto";
import { Client } from "minio";

const bucket = process.env.MINIO_BUCKET || "roboedu-public";

function minioClient() {
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  if (!accessKey || !secretKey) throw new Error("MinIO credentials are not configured");

  return new Client({
    endPoint: process.env.MINIO_ENDPOINT || "minio",
    port: Number(process.env.MINIO_PORT || 9000),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey,
    secretKey,
  });
}

async function ensureBucket(client: Client) {
  if (!(await client.bucketExists(bucket))) await client.makeBucket(bucket, "us-east-1");
}

export async function saveProfileAvatar(userId: string, file: File) {
  const client = minioClient();
  await ensureBucket(client);

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const key = `profile-avatars/${userId}/${crypto.randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await client.putObject(bucket, key, buffer, buffer.length, { "Content-Type": file.type });
  return key;
}

export async function removeProfileAvatar(key: string) {
  await minioClient().removeObject(bucket, key);
}

export async function readProfileAvatar(key: string) {
  const client = minioClient();
  const [stream, stat] = await Promise.all([client.getObject(bucket, key), client.statObject(bucket, key)]);
  return { stream, contentType: stat.metaData["content-type"] || "image/jpeg" };
}

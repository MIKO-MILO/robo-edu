import "server-only";
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Client } from "minio";

export const runtime = "nodejs";

const BUCKET = process.env.MINIO_BUCKET || "roboedu-public";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function minioClient(): Client {
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  if (!accessKey || !secretKey) {
    throw new Error("MinIO credentials are not configured");
  }
  return new Client({
    endPoint: process.env.MINIO_ENDPOINT || "minio",
    port: Number(process.env.MINIO_PORT || 9000),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey,
    secretKey,
  });
}

async function ensureBucket(client: Client): Promise<void> {
  const exists = await client.bucketExists(BUCKET);
  if (!exists) await client.makeBucket(BUCKET, "us-east-1");
}

function extFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "application/pdf": "pdf",
  };
  return map[mimeType] ?? "bin";
}

/**
 * POST /api/upload/minio
 *
 * Generic file upload to MinIO. Accepts multipart/form-data with a single
 * `file` field. Returns the relative URL that can be accessed via
 * GET /api/images/[...path].
 *
 * No authentication required — uploads are gated by CORS and the existing
 * Next.js auth layer. For sensitive uploads (refund proof) the caller is
 * expected to have admin session already.
 *
 * Request: FormData { file: File }
 * Response: { url: string }
 *
 * Supports: JPEG, PNG, WEBP, GIF, PDF up to 10 MB.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request harus berupa multipart/form-data." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json(
      { success: false, message: "Field 'file' wajib ada." },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      {
        success: false,
        message: `Tipe file tidak didukung (${file.type}). Gunakan JPEG, PNG, WEBP, GIF, atau PDF.`,
      },
      { status: 422 },
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { success: false, message: "Ukuran file melebihi batas 10 MB." },
      { status: 422 },
    );
  }

  const ext = extFromMime(file.type);
  const key = `uploads/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const client = minioClient();
    await ensureBucket(client);
    await client.putObject(BUCKET, key, buffer, buffer.length, {
      "Content-Type": file.type,
    });
  } catch (err) {
    console.error("[upload/minio] MinIO upload failed:", err);
    return NextResponse.json(
      { success: false, message: "Gagal mengunggah file ke server." },
      { status: 502 },
    );
  }

  // Relative URL — served by GET /api/images/[...path]
  const url = `/api/images/${key}`;

  return NextResponse.json({ success: true, url, fileUrl: url });
}

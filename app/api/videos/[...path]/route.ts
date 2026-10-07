import { NextRequest, NextResponse } from "next/server";
import { Client } from "minio";

export const runtime = "nodejs";

const bucket = process.env.MINIO_BUCKET || "roboedu-public";

function minioClient() {
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  if (!accessKey || !secretKey)
    throw new Error("MinIO credentials not configured");

  return new Client({
    endPoint: process.env.MINIO_ENDPOINT || "minio",
    port: Number(process.env.MINIO_PORT || 9000),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey,
    secretKey,
  });
}

/**
 * GET /api/videos/[...path]
 * Proxy video dari MinIO ke browser dengan dukungan Range request
 * agar video bisa di-seek tanpa harus download penuh.
 *
 * Path: /api/videos/product-videos/prod-xxx/uuid.mp4
 *        → MinIO key: product-videos/prod-xxx/uuid.mp4
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const objectKey = path.join("/");

  if (!objectKey) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const client = minioClient();
    const stat = await client.statObject(bucket, objectKey);
    const fileSize = stat.size;
    const contentType =
      (stat.metaData?.["content-type"] as string) ||
      guessContentType(objectKey);

    const rangeHeader = req.headers.get("range");

    // ── Partial content (Range request) ──────────────────────────────────
    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
      if (!match) {
        return new NextResponse("Invalid Range", { status: 416 });
      }

      const start = match[1] ? parseInt(match[1], 10) : 0;
      const end   = match[2] ? parseInt(match[2], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const stream = await client.getPartialObject(bucket, objectKey, start, chunkSize);

      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", resolve);
        stream.on("error", reject);
      });

      return new NextResponse(Buffer.concat(chunks), {
        status: 206,
        headers: {
          "Content-Type": contentType,
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunkSize),
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // ── Full content ──────────────────────────────────────────────────────
    const stream = await client.getObject(bucket, objectKey);
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    return new NextResponse(Buffer.concat(chunks), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileSize),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "NoSuchKey" || code === "NotFound") {
      return new NextResponse("Not Found", { status: 404 });
    }
    console.error("[api/videos] MinIO error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function guessContentType(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "mp4":  return "video/mp4";
    case "webm": return "video/webm";
    case "ogv":
    case "ogg":  return "video/ogg";
    case "mov":  return "video/quicktime";
    default:     return "video/mp4";
  }
}

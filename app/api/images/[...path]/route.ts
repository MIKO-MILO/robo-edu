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
 * GET /api/images/[...path]
 * Proxy gambar dari MinIO ke browser.
 * Path: /api/images/product-images/prod-xxx/uuid.png
 *        → MinIO key: product-images/prod-xxx/uuid.png
 */
export async function GET(
  _req: NextRequest,
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
    const stream = await client.getObject(bucket, objectKey);

    const contentType =
      (stat.metaData?.["content-type"] as string) ||
      guessContentType(objectKey);

    // Kumpulkan stream ke buffer
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.length),
        // Cache 7 hari di browser, 1 hari di CDN/proxy
        "Cache-Control": "public, max-age=604800, s-maxage=86400",
      },
    });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "NoSuchKey" || code === "NotFound") {
      return new NextResponse("Not Found", { status: 404 });
    }
    console.error("[api/images] MinIO error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function guessContentType(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":  return "image/png";
    case "webp": return "image/webp";
    case "gif":  return "image/gif";
    case "svg":  return "image/svg+xml";
    default:     return "image/jpeg";
  }
}

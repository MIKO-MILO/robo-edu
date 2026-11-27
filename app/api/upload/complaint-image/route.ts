import "server-only";

import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/src/lib/auth/session";
import { saveComplaintImage } from "@/src/lib/storage/complaint-images";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * POST /api/upload/complaint-image
 *
 * Upload satu foto atau dokumen untuk lampiran komplain. Memerlukan sesi
 * user yang valid. Menyimpan ke MinIO dengan key `complaints/{uuid}.ext`
 * via `saveComplaintImage()`.
 *
 * Request : multipart/form-data { file: File }
 * Response: { success: true, url: string }   — URL relatif /api/images/complaints/...
 *
 * Tipe yang didukung : JPEG, PNG, WEBP, GIF, PDF (maks 10 MB)
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Auth ──────────────────────────────────────────────────────────────
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  // ── Parse multipart ───────────────────────────────────────────────────
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

  // ── Validate type ─────────────────────────────────────────────────────
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      {
        success: false,
        message: `Tipe file tidak didukung (${file.type}). Gunakan JPEG, PNG, WEBP, GIF, atau PDF.`,
      },
      { status: 422 },
    );
  }

  // ── Validate size ─────────────────────────────────────────────────────
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { success: false, message: "Ukuran file melebihi batas 10 MB." },
      { status: 422 },
    );
  }

  // ── Upload ────────────────────────────────────────────────────────────
  // Upload terjadi sebelum complaint ID tersedia — gunakan UUID baru sebagai
  // placeholder folder agar key-nya tetap `complaints/{uuid}/{uuid}.ext`.
  try {
    const placeholderId = crypto.randomUUID();
    const { url } = await saveComplaintImage(placeholderId, file);
    return NextResponse.json({ success: true, url });
  } catch (err) {
    console.error("[upload/complaint-image] Upload failed:", err);
    return NextResponse.json(
      { success: false, message: "Gagal mengunggah file ke server." },
      { status: 502 },
    );
  }
}

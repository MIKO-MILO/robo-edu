import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { getAllSettings } from "@/src/lib/services/settings-service";

export const runtime = "nodejs";

/**
 * GET /api/admin/settings
 *
 * Mengembalikan seluruh pengaturan aplikasi sebagai flat object.
 * Dilindungi guard `requireAdmin` (hanya admin/superadmin yang boleh mengakses).
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const data = await getAllSettings();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil pengaturan sistem." },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/admin/settings
 *
 * Menerima partial object dan memperbarui hanya keys yang dikirim.
 * Mengembalikan state pengaturan yang telah diperbarui.
 * Dilindungi guard `requireAdmin`.
 */
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Format request body tidak valid." },
      { status: 400 },
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).length === 0
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Request body harus berupa object dan tidak boleh kosong.",
      },
      { status: 400 },
    );
  }

  try {
    const { updateSettings } = await import("@/src/lib/services/settings-service");
    const updated = await updateSettings(body as Record<string, unknown>);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui pengaturan.";
    return NextResponse.json(
      { success: false, message },
      { status: 400 },
    );
  }
}

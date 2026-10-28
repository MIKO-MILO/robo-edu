import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createMockSession } from "@/lib/auth/session";

// TODO(auth): Endpoint ini mock. Ganti dengan integrasi backend asli POST /auth/login (lihat api.md §2).

export async function POST(request: Request) {
  try {
    let body: any = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else if (
      contentType.includes("form-data") ||
      contentType.includes("url-encoded")
    ) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    }

    // Role default untuk admin login adalah ADMIN
    const mockToken = createMockSession("ADMIN");

    const cookieStore = await cookies();
    cookieStore.set("roboedu_session", mockToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({
      success: true,
      message: "Mock login berhasil",
      redirectUrl: "/admin/dashboard",
      user: {
        email: body.email || "admin@roboedu.id",
        role: "ADMIN",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal memproses mock login",
          trace_id: `req-${Date.now()}`,
        },
      },
      { status: 500 }
    );
  }
}

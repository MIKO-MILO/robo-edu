import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import type { User } from "@/types";

export const runtime = "nodejs";

const ADMIN_ROLES = new Set([
  "superadmin",
  "admin_sales",
  "admin_laporan",
  "admin_gudang",
  "admin",
]);

type UserDbRow = typeof users.$inferSelect;

function dbUserToResponse(user: UserDbRow): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    gender: (user.gender as User["gender"]) ?? null,
    tax_id: user.taxIdentificationNumber ?? null,
    tax_country: user.taxIdentificationCountry ?? null,
    avatar_url: user.avatarKey ? `/api/profile/avatar?id=${user.id}` : null,
    role: user.role as User["role"],
    reseller_status: user.resellerStatus as User["reseller_status"],
    reseller_approved_at: user.resellerApprovedAt
      ? new Date(user.resellerApprovedAt).toISOString()
      : null,
    is_active: !!user.isActive,
    last_login_at: user.lastLoginAt
      ? new Date(user.lastLoginAt).toISOString()
      : null,
    created_at: new Date(user.createdAt).toISOString(),
    updated_at: new Date(user.updatedAt).toISOString(),
  };
}

async function assertAdminOr403(): Promise<NextResponse | null> {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }
  const [currentUser] = await db
    .select({ role: users.role, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!currentUser || !currentUser.isActive) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }
  if (!ADMIN_ROLES.has(currentUser.role.toLowerCase())) {
    return NextResponse.json(
      {
        success: false,
        message: "Anda tidak memiliki izin akses admin.",
      },
      { status: 403 },
    );
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const forbidden = await assertAdminOr403();
    if (forbidden) return forbidden;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role")?.trim() || "";
    const resellerStatus = searchParams.get("reseller_status")?.trim() || "";
    const isActiveParam = searchParams.get("is_active");

    const sort = searchParams.get("sort") || "-created_at";
    const page = Math.max(
      Number.parseInt(searchParams.get("page") || "1", 10),
      1,
    );
    const limit = Math.min(
      Math.max(Number.parseInt(searchParams.get("limit") || "50", 10), 1),
      200,
    );
    const offset = (page - 1) * limit;

    const filters = [];
    if (search) {
      const q = `%${search}%`;
      filters.push(
        or(like(users.name, q), like(users.email, q), like(users.phone, q))!,
      );
    }
    if (role) filters.push(eq(users.role, role));
    if (resellerStatus) {
      if (resellerStatus === "NOT_RESELLER") {
        filters.push(
          or(
            eq(users.resellerStatus, "none"),
            eq(users.resellerStatus, "NOT_RESELLER"),
            eq(users.resellerStatus, "not"),
          )!,
        );
      } else {
        filters.push(eq(users.resellerStatus, resellerStatus.toLowerCase()));
      }
    }
    if (isActiveParam !== null) {
      filters.push(eq(users.isActive, isActiveParam === "true"));
    }

    const orderBy = sort.startsWith("-")
      ? desc(
          sort === "-created_at"
            ? users.createdAt
            : sort === "-last_login"
              ? users.lastLoginAt
              : sort === "-name"
                ? users.name
                : users.createdAt,
        )
      : asc(
          sort === "created_at"
            ? users.createdAt
            : sort === "last_login"
              ? users.lastLoginAt
              : sort === "name"
                ? users.name
                : users.createdAt,
        );

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const [totalResult] = await db
      .select({ count: sql<number>`COUNT(${users.id})` })
      .from(users)
      .where(whereClause);

    const total = Number(totalResult?.count || 0);
    const total_pages = Math.max(1, Math.ceil(total / limit));

    const rows = await db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: rows.map(dbUserToResponse),
      meta: {
        current_page: page,
        per_page: limit,
        total_pages,
        total_count: total,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat daftar pengguna.",
      },
      { status: 500 },
    );
  }
}

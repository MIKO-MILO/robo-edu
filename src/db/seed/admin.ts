/**
 * Seed script — buat akun admin default jika belum ada.
 *
 * Jalankan dari dalam container:
 *   docker compose exec app npm run db:seed:admin
 *
 * Atau dari host (jika Next.js dijalankan native):
 *   npm run db:seed:admin
 */

import "dotenv/config";
import crypto from "node:crypto";
import { promisify } from "node:util";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq } from "drizzle-orm";
import { users } from "../schema";

const scrypt = promisify(crypto.scrypt);

async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = Buffer.from((await scrypt(password, salt, 64)) as Uint8Array).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

const ADMIN_EMAIL    = "admin@roboedu.id";
const ADMIN_PASSWORD = "Admin@12345";
const ADMIN_NAME     = "Admin RoboEdu";

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1);

  if (existing) {
    console.log(`✅ Admin sudah ada (id: ${existing.id}) — tidak ada yang diubah.`);
    await connection.end();
    return;
  }

  const id = crypto.randomUUID();
  await db.insert(users).values({
    id,
    name:     ADMIN_NAME,
    email:    ADMIN_EMAIL,
    password: await hashPassword(ADMIN_PASSWORD),
    role:     "ADMIN",
    phone:    null,
  });

  console.log("✅ Admin berhasil dibuat:");
  console.log(`   Email    : ${ADMIN_EMAIL}`);
  console.log(`   Password : ${ADMIN_PASSWORD}`);
  console.log(`   ID       : ${id}`);

  await connection.end();
}

main().catch((err) => {
  console.error("❌ Seed admin gagal:", err);
  process.exit(1);
});

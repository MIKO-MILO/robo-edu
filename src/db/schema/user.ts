import { sql } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  boolean,
  datetime,
  text,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 30 }),
    gender: varchar("gender", { length: 20 }),
    taxIdentificationNumber: varchar("tax_identification_number", { length: 100 }),
    taxIdentificationCountry: varchar("tax_identification_country", { length: 100 }),
    residentialAddress: text("residential_address"),
    /** Object key di MinIO. URL publik tidak disimpan agar akses tetap melalui aplikasi. */
    avatarKey: varchar("avatar_key", { length: 500 }),
    role: varchar("role", { length: 30 }).notNull().default("CUSTOMER"),
    membershipStatus: varchar("membership_status", { length: 30 })
      .notNull()
      .default("NOT_MEMBER"),
    membershipExpiresAt: datetime("membership_expires_at"),
    isActive: boolean("is_active").notNull().default(true),
    emailVerifiedAt: datetime("email_verified_at"),
    verificationToken: varchar("verification_token", { length: 255 }),
    /** Hashed token for password reset. Null when no reset is pending. */
    passwordResetToken: varchar("password_reset_token", { length: 255 }),
    /** Expiry timestamp for the password reset token. */
    passwordResetExpiresAt: datetime("password_reset_expires_at"),
    lastLoginAt: datetime("last_login_at"),
    createdAt: datetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
    phoneIdx: index("users_phone_idx").on(table.phone),
    verificationTokenIdx: index("users_verification_token_idx").on(
      table.verificationToken,
    ),
    passwordResetTokenIdx: index("users_password_reset_token_idx").on(
      table.passwordResetToken,
    ),
  }),
);

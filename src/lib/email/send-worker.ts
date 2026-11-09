/**
 * send-worker.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Worker-safe version of sendEmail — identical logic to send.ts but WITHOUT
 * the `import "server-only"` guard so it can be imported by the BullMQ
 * worker process (src/workers/index.ts) which runs outside Next.js.
 *
 * Do NOT import "server-only" here.
 * Do NOT import this from Next.js app/route code — use send.ts there.
 */

import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "@/src/db/schema";

// ── Lazy DB pool (worker-private, avoids app server's singleton) ──────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _workerDb: any = null;

function getWorkerDb() {
  if (!_workerDb) {
    const pool = mysql.createPool({
      uri: process.env.DATABASE_URL!,
      connectionLimit: 3,
    });
    _workerDb = drizzle(pool, { schema, mode: "default" });
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return _workerDb;
}

// ── Resend helpers ────────────────────────────────────────────────────────────

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}

function getEmailFrom(): string {
  const name = process.env.EMAIL_FROM_NAME ?? "RoboEdu";
  const address = process.env.EMAIL_FROM ?? "no-reply@roboedu.id";
  return `${name} <${address}>`;
}

// ── sendEmail (worker) ────────────────────────────────────────────────────────

export interface WorkerSendEmailOptions {
  to: string;
  subject: string;
  html: string;
  type: string;
  userId?: string | null;
  orderId?: string | null;
}

/**
 * Send a transactional email via Resend and write a row to `email_logs`.
 * Never throws — worker job failures should come from Resend, not from this.
 */
export async function sendEmailWorker(
  options: WorkerSendEmailOptions,
): Promise<{ success: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const db = getWorkerDb();
  const logId = crypto.randomUUID();
  const now = new Date();

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await db.insert(schema.emailLogs).values({
      id: logId,
      userId: options.userId ?? null,
      orderId: options.orderId ?? null,
      email: options.to,
      type: options.type,
      subject: options.subject,
      status: "PENDING",
    });
  } catch (err) {
    console.error("[worker:sendEmail] Failed to write PENDING log:", err);
  }

  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: getEmailFrom(),
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) throw new Error(error.message);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await db
      .update(schema.emailLogs)
      .set({ status: "SENT", sentAt: now })
      .where(eq(schema.emailLogs.id, logId));

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(
      `[worker:sendEmail] Failed to send "${options.subject}" to ${options.to}:`,
      msg,
    );

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await db
        .update(schema.emailLogs)
        .set({ status: "FAILED" })
        .where(eq(schema.emailLogs.id, logId));
    } catch {
      // ignore secondary failure
    }

    return { success: false, error: msg };
  }
}

import "server-only";

import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { emailLogs } from "@/src/db/schema";
import { getResendClient, getEmailFrom } from "./resend";
import type { EmailType } from "@/types";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  type: EmailType | string;
  /** Associate this email with a user row (for log queries). */
  userId?: string | null;
  /** Associate this email with an order row (for log queries). */
  orderId?: string | null;
}

export interface SendEmailResult {
  success: boolean;
  /** Resend message ID on success. */
  messageId?: string;
  error?: string;
}

/**
 * Sends a transactional email via Resend and writes a row to `email_logs`.
 *
 * Failures are logged but never throw — callers (register, webhook, etc.)
 * must not crash because an email couldn't be delivered.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const logId = crypto.randomUUID();
  const now = new Date();

  // Write a PENDING log entry first so we have a record even if the send
  // call throws unexpectedly (e.g. network timeout).
  try {
    await db.insert(emailLogs).values({
      id: logId,
      userId: options.userId ?? null,
      orderId: options.orderId ?? null,
      email: options.to,
      type: options.type,
      subject: options.subject,
      status: "PENDING",
    });
  } catch (logError) {
    // Log insert failure is non-fatal — still attempt the send.
    console.error("[sendEmail] Failed to insert PENDING email log:", logError);
  }

  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: getEmailFrom(),
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      throw new Error(error.message);
    }

    await db
      .update(emailLogs)
      .set({ status: "SENT", sentAt: now })
      .where(eq(emailLogs.id, logId));

    return { success: true, messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[sendEmail] Failed to send "${options.subject}" to ${options.to}:`, message);

    try {
      await db
        .update(emailLogs)
        .set({ status: "FAILED" })
        .where(eq(emailLogs.id, logId));
    } catch {
      // ignore secondary log failure
    }

    return { success: false, error: message };
  }
}

import "server-only";

import crypto from "node:crypto";
import { db } from "@/src/db";
import { auditLogs } from "@/src/db/schema";

export interface AuditEntry {
  /** ID of the admin who performed the action. Null for mock-session actors. */
  actorId: string | null;
  /** Dot-namespaced action key, e.g. `order.status_updated`. Max 100 chars. */
  action: string;
  /** Table / resource name, e.g. `order`, `review`, `user`. */
  targetType?: string;
  /** Row UUID of the affected record. */
  targetId?: string;
  /** Human-readable summary shown in the admin UI. */
  description?: string;
  /** Arbitrary structured data (before/after values, etc.). */
  metadata?: Record<string, unknown>;
}

/**
 * Append a row to `audit_logs`.
 *
 * This function is **fire-and-forget** — it never throws. Write failures are
 * logged to the console but do not affect the calling request. This keeps the
 * audit path non-blocking: if the DB is temporarily unavailable the admin
 * action still succeeds; the log row is simply missing.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      id:          crypto.randomUUID(),
      actorId:     entry.actorId ?? null,
      action:      entry.action,
      targetType:  entry.targetType ?? null,
      targetId:    entry.targetId  ?? null,
      description: entry.description ?? null,
      metadata:    entry.metadata   ?? null,
    });
  } catch (err) {
    // Non-fatal: log the failure but do not propagate it.
    console.error("[writeAuditLog] Failed to write audit row:", err);
  }
}

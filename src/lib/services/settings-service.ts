import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/src/db";
import { settings } from "@/src/db/schema";

/**
 * Single read/write seam for the app-level `settings` key-value table.
 *
 * The table stores every value as TEXT (see `src/db/schema/settings.ts`); the
 * caller owns parsing/validation. Keeping all access through this module means
 * a setting changed via the admin UI is immediately visible to every consumer
 * that reads it here — most importantly `membership_plus_price`, which the
 * membership checkout reads at request time so a price change takes effect
 * without a redeploy (ticket 11, criterion 3).
 */

/** All settings as a flat `{ key: value }` object (values are raw strings). */
export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db
    .select({ key: settings.key, value: settings.value })
    .from(settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

/**
 * Read a single setting by key. Returns `null` when the key is absent — callers
 * decide whether that is an error (e.g. the checkout treats a missing
 * `membership_plus_price` as a misconfiguration).
 */
export async function getSetting(key: string): Promise<string | null> {
  const [row] = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);
  return row?.value ?? null;
}

/**
 * Upsert exactly the supplied keys, atomically.
 *
 * All keys are written inside a single `db.transaction`, so a failure on any
 * row rolls back the whole batch — the PATCH endpoint's "returns the updated
 * state" contract relies on this all-or-nothing behaviour (a partial multi-key
 * write would leave the settings table inconsistent). Each key is still its own
 * statement (only a handful of settings, so clarity beats batching, and this
 * sidesteps the deprecated MySQL `VALUES()` function a single multi-row upsert
 * would otherwise need).
 */
export async function upsertSettings(
  entries: Record<string, string>,
): Promise<void> {
  const rows = Object.entries(entries);
  if (rows.length === 0) return;

  await db.transaction(async (tx) => {
    for (const [key, value] of rows) {
      await tx
        .insert(settings)
        .values({ key, value })
        .onDuplicateKeyUpdate({ set: { value } });
    }
  });
}

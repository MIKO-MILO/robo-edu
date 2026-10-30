import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";

/**
 * Returns true when the user identified by `userId` has an active MEMBER
 * status that hasn't expired yet.
 *
 * "Active" means:
 *   - `membership_status = 'MEMBER'`
 *   - `membership_expires_at` is in the future (or null, which means
 *     indefinite — e.g. manually granted memberships)
 *
 * Returns false for any non-existent / inactive user.
 */
export async function isActiveMember(userId: string): Promise<boolean> {
  const [user] = await db
    .select({
      membershipStatus: users.membershipStatus,
      membershipExpiresAt: users.membershipExpiresAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return false;
  if (user.membershipStatus !== "MEMBER") return false;

  // null expiry = indefinite membership
  if (user.membershipExpiresAt === null) return true;

  return user.membershipExpiresAt > new Date();
}

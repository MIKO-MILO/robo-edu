import { MembershipInfoCard } from "./membership-info-card";
import { MembershipPurchaseTable } from "./membership-purchase-table";
import type { MembershipStatusData } from "@/types";

/**
 * MembershipMemberActive
 * ----------------------
 * Orchestrator: merender tampilan lengkap untuk user berstatus MEMBER.
 *
 * Terdiri dari dua bagian (PRD Bab 6.8):
 *   1. MembershipInfoCard — badge, tanggal, sisa hari, benefit, CTA
 *   2. MembershipPurchaseTable — tabel riwayat pembelian 7 kolom
 *
 * Tidak ada logika bisnis di sini — hanya komposisi komponen.
 * PRD Bab 6.8 | US-011, US-012
 */

interface MembershipMemberActiveProps {
  data: MembershipStatusData & { membership_status: "MEMBER" };
}

export function MembershipMemberActive({ data }: MembershipMemberActiveProps) {
  return (
    <div className="space-y-5">
      <MembershipInfoCard
        membershipExpiresAt={data.membership_expires_at!}
        purchases={data.purchases}
      />
      <MembershipPurchaseTable purchases={data.purchases} />
    </div>
  );
}

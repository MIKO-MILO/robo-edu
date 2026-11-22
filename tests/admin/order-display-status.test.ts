/**
 * Ticket 28b — Admin orders: merged status column.
 *
 * Unit tests for `deriveOrderDisplayStatus` — a pure function that maps the
 * combination of `order.status` + `payment.status` to a single display label
 * and color theme.
 *
 * No DB, no network, no Next.js stubs required — the function has no
 * side-effects and no external dependencies.
 */
import { describe, expect, it } from "vitest";
import { deriveOrderDisplayStatus } from "@/components/admin/orders/order-display-status";

describe("deriveOrderDisplayStatus", () => {
  // ── PENDING order ──────────────────────────────────────────────────────────

  it("PENDING + PENDING → Menunggu Dibayar (warning)", () => {
    expect(deriveOrderDisplayStatus("PENDING", "PENDING")).toEqual({
      label: "Menunggu Dibayar",
      theme: "warning",
    });
  });

  it("PENDING + EXPIRED → Kedaluwarsa (muted) [edge case]", () => {
    expect(deriveOrderDisplayStatus("PENDING", "EXPIRED")).toEqual({
      label: "Kedaluwarsa",
      theme: "muted",
    });
  });

  it("PENDING + FAILED → Pembayaran Gagal (danger) [edge case]", () => {
    expect(deriveOrderDisplayStatus("PENDING", "FAILED")).toEqual({
      label: "Pembayaran Gagal",
      theme: "danger",
    });
  });

  // ── Post-payment fulfillment states ───────────────────────────────────────

  it("PAID + PAID → Menunggu Diproses (info)", () => {
    expect(deriveOrderDisplayStatus("PAID", "PAID")).toEqual({
      label: "Menunggu Diproses",
      theme: "info",
    });
  });

  it("PROCESSING + PAID → Sedang Diproses (purple)", () => {
    expect(deriveOrderDisplayStatus("PROCESSING", "PAID")).toEqual({
      label: "Sedang Diproses",
      theme: "purple",
    });
  });

  it("SHIPPED + PAID → Dikirim (info)", () => {
    expect(deriveOrderDisplayStatus("SHIPPED", "PAID")).toEqual({
      label: "Dikirim",
      theme: "info",
    });
  });

  it("DELIVERED + PAID → Terkirim (softBlue)", () => {
    expect(deriveOrderDisplayStatus("DELIVERED", "PAID")).toEqual({
      label: "Terkirim",
      theme: "softBlue",
    });
  });

  it("COMPLETED + PAID → Selesai (success)", () => {
    expect(deriveOrderDisplayStatus("COMPLETED", "PAID")).toEqual({
      label: "Selesai",
      theme: "success",
    });
  });

  // ── Terminal states ───────────────────────────────────────────────────────

  it("CANCELLED + PENDING → Dibatalkan (danger)", () => {
    expect(deriveOrderDisplayStatus("CANCELLED", "PENDING")).toEqual({
      label: "Dibatalkan",
      theme: "danger",
    });
  });

  it("CANCELLED + EXPIRED → Dibatalkan (danger)", () => {
    expect(deriveOrderDisplayStatus("CANCELLED", "EXPIRED")).toEqual({
      label: "Dibatalkan",
      theme: "danger",
    });
  });

  it("CANCELLED + FAILED → Dibatalkan (danger)", () => {
    expect(deriveOrderDisplayStatus("CANCELLED", "FAILED")).toEqual({
      label: "Dibatalkan",
      theme: "danger",
    });
  });

  it("CANCELLED + PAID → Dibatalkan · Perlu Refund (danger) [edge case]", () => {
    // Payment arrived after order was cancelled — manual refund required.
    expect(deriveOrderDisplayStatus("CANCELLED", "PAID")).toEqual({
      label: "Dibatalkan · Perlu Refund",
      theme: "danger",
    });
  });

  it("REFUNDED + REFUNDED → Di-Refund (orange)", () => {
    expect(deriveOrderDisplayStatus("REFUNDED", "REFUNDED")).toEqual({
      label: "Di-Refund",
      theme: "orange",
    });
  });

  // ── Visual distinction: SHIPPED vs DELIVERED vs COMPLETED ─────────────────

  it("SHIPPED and DELIVERED have different themes", () => {
    const shipped = deriveOrderDisplayStatus("SHIPPED", "PAID");
    const delivered = deriveOrderDisplayStatus("DELIVERED", "PAID");
    expect(shipped.theme).not.toBe(delivered.theme);
  });

  it("DELIVERED and COMPLETED have different themes", () => {
    const delivered = deriveOrderDisplayStatus("DELIVERED", "PAID");
    const completed = deriveOrderDisplayStatus("COMPLETED", "PAID");
    expect(delivered.theme).not.toBe(completed.theme);
  });
});

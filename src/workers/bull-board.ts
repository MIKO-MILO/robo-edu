/**
 * bull-board.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Standalone Express server yang menampilkan Bull Board UI untuk monitoring
 * BullMQ queues (email + order).
 *
 * Server ini HANYA membaca dari Redis — dia tidak memproses job apapun.
 * Job diproses oleh src/workers/index.ts (npm run worker).
 *
 * Run dengan:
 *   npm run bull-board
 *
 * Buka di browser: http://localhost:3001
 *
 * Untuk produksi, tambahkan autentikasi (basic auth / session) sebelum
 * expose ke internet — lihat komentar di bawah.
 */

import "dotenv/config";

import express from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { getEmailQueue } from "@/src/lib/queue/email-queue";
import { getOrderQueue } from "@/src/lib/queue/order-queue";

// ── Express + Bull Board adapter ──────────────────────────────────────────────

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/");

createBullBoard({
  queues: [
    new BullMQAdapter(getEmailQueue()),
    new BullMQAdapter(getOrderQueue()),
  ],
  serverAdapter,
});

// ── Express app ───────────────────────────────────────────────────────────────

const app = express();

// (Optional) Basic auth untuk proteksi — uncomment jika perlu:
// import basicAuth from "express-basic-auth";
// app.use(basicAuth({
//   users: { admin: process.env.BULL_BOARD_PASSWORD ?? "rahasia" },
//   challenge: true,
// }));

app.use("/", serverAdapter.getRouter());

// ── Start server ──────────────────────────────────────────────────────────────

const PORT = Number(process.env.BULL_BOARD_PORT ?? 3001);

app.listen(PORT, () => {
  console.log(`[bull-board] 🎛️  Bull Board running at http://localhost:${PORT}`);
  console.log(`[bull-board] Monitoring queues: email, order`);
  console.log(`[bull-board] Redis: ${process.env.REDIS_URL ?? "(REDIS_URL not set)"}`);
});

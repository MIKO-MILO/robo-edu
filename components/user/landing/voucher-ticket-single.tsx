"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Copy, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoucherBadge } from "./voucher-badge";
import { type VoucherPromoItem } from "@/types/voucher";

interface VoucherTicketSingleProps {
  item: VoucherPromoItem;
  className?: string;
  onUseDiscount?: () => void;
}

interface StripeSpec {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
}

const TICKET_VIEWBOX = {
  width: 1000,
  height: 400,
  tearX: 760,
  tearOffset: 5,
  radius: 32,
  tearArcX: 44,
  tearArcY: 50,
};

const LEFT_STRIPES: StripeSpec[] = [
  { id: "stripe-1", x1: 65, y1: 420, x2: 390, y2: -20, width: 104 },
  { id: "stripe-2", x1: 255, y1: 420, x2: 580, y2: -20, width: 104 },
  { id: "stripe-3", x1: 445, y1: 420, x2: 770, y2: -20, width: 104 },
  { id: "stripe-4", x1: 635, y1: 420, x2: 960, y2: -20, width: 104 },
];

function buildMobileFullBodyPath(): string {
  const { width, height, radius } = TICKET_VIEWBOX;
  const inset = 12;
  const left = inset;
  const top = inset;
  const right = width - inset;
  const bottom = height - inset;

  return [
    `M ${left + radius} ${top}`,
    `L ${right - radius} ${top}`,
    `Q ${right} ${top} ${right} ${top + radius}`,
    `L ${right} ${bottom - radius}`,
    `Q ${right} ${bottom} ${right - radius} ${bottom}`,
    `L ${left + radius} ${bottom}`,
    `Q ${left} ${bottom} ${left} ${bottom - radius}`,
    `L ${left} ${top + radius}`,
    `Q ${left} ${top} ${left + radius} ${top}`,
    "Z",
  ].join(" ");
}

function buildMobileInnerBorderPath(): string {
  const { width, height } = TICKET_VIEWBOX;
  const inset = 34;
  const radius = 18;
  const left = inset;
  const top = inset;
  const right = width - inset;
  const bottom = height - inset;

  return [
    `M ${left + radius} ${top}`,
    `L ${right - radius} ${top}`,
    `Q ${right} ${top} ${right} ${top + radius}`,
    `L ${right} ${bottom - radius}`,
    `Q ${right} ${bottom} ${right - radius} ${bottom}`,
    `L ${left + radius} ${bottom}`,
    `Q ${left} ${bottom} ${left} ${bottom - radius}`,
    `L ${left} ${top + radius}`,
    `Q ${left} ${top} ${left + radius} ${top}`,
    "Z",
  ].join(" ");
}

function buildMainBodyPath(): string {
  const { height, tearX, tearOffset, radius, tearArcX, tearArcY } =
    TICKET_VIEWBOX;
  const inset = 12;
  const left = inset;
  const top = inset;
  const bottom = height - inset;
  const rightEdge = tearX - tearOffset;

  return [
    `M ${left + radius} ${top}`,
    `L ${rightEdge - tearArcX} ${top}`,
    `Q ${rightEdge + 8} ${top + 3} ${rightEdge} ${top + tearArcY}`,
    `L ${rightEdge} ${bottom - tearArcY}`,
    `Q ${rightEdge + 8} ${bottom - 3} ${rightEdge - tearArcX} ${bottom}`,
    `L ${left + radius} ${bottom}`,
    `Q ${left} ${bottom} ${left} ${bottom - radius}`,
    `L ${left} ${top + radius}`,
    `Q ${left} ${top} ${left + radius} ${top}`,
    "Z",
  ].join(" ");
}

function buildRightStubPath(): string {
  const { width, height, tearX, tearOffset, radius, tearArcX, tearArcY } =
    TICKET_VIEWBOX;
  const inset = 12;
  const top = inset;
  const bottom = height - inset;
  const right = width - inset;
  const leftEdge = tearX + tearOffset;
  const midY = height / 2;

  return [
    `M ${leftEdge + tearArcX} ${top}`,
    `L ${right - radius} ${top}`,
    `Q ${right} ${top} ${right} ${top + radius}`,
    `L ${right} ${midY - 50}`,
    `Q ${right - 22} ${midY - 42} ${right - 22} ${midY}`,
    `Q ${right - 22} ${midY + 42} ${right} ${midY + 50}`,
    `L ${right} ${bottom - radius}`,
    `Q ${right} ${bottom} ${right - radius} ${bottom}`,
    `L ${leftEdge + tearArcX} ${bottom}`,
    `Q ${leftEdge - 8} ${bottom - 3} ${leftEdge} ${bottom - tearArcY}`,
    `L ${leftEdge} ${top + tearArcY}`,
    `Q ${leftEdge - 8} ${top + 3} ${leftEdge + tearArcX} ${top}`,
    "Z",
  ].join(" ");
}

function buildInnerMainBorderPath(): string {
  const { height, tearX, tearOffset, tearArcX, tearArcY } = TICKET_VIEWBOX;
  const inset = 34;
  const radius = 18;
  const left = inset;
  const top = inset;
  const bottom = height - inset;
  const rightEdge = tearX - tearOffset - 16;

  return [
    `M ${left + radius} ${top}`,
    `L ${rightEdge - tearArcX + 10} ${top}`,
    `Q ${rightEdge + 3} ${top + 2} ${rightEdge} ${top + tearArcY - 8}`,
    `L ${rightEdge} ${bottom - tearArcY + 8}`,
    `Q ${rightEdge + 3} ${bottom - 2} ${rightEdge - tearArcX + 10} ${bottom}`,
    `L ${left + radius} ${bottom}`,
    `Q ${left} ${bottom} ${left} ${bottom - radius}`,
    `L ${left} ${top + radius}`,
    `Q ${left} ${top} ${left + radius} ${top}`,
    "Z",
  ].join(" ");
}

function buildInnerStubBorderPath(): string {
  const { width, height, tearX, tearOffset, tearArcX, tearArcY } =
    TICKET_VIEWBOX;
  const inset = 34;
  const radius = 18;
  const top = inset;
  const bottom = height - inset;
  const right = width - inset;
  const leftEdge = tearX + tearOffset + 16;
  const midY = height / 2;

  return [
    `M ${leftEdge + tearArcX - 10} ${top}`,
    `L ${right - radius} ${top}`,
    `Q ${right} ${top} ${right} ${top + radius}`,
    `L ${right} ${midY - 56}`,
    `Q ${right - 16} ${midY - 48} ${right - 16} ${midY}`,
    `Q ${right - 16} ${midY + 48} ${right} ${midY + 56}`,
    `L ${right} ${bottom - radius}`,
    `Q ${right} ${bottom} ${right - radius} ${bottom}`,
    `L ${leftEdge + tearArcX - 10} ${bottom}`,
    `Q ${leftEdge - 3} ${bottom - 2} ${leftEdge} ${bottom - tearArcY + 8}`,
    `L ${leftEdge} ${top + tearArcY - 8}`,
    `Q ${leftEdge - 3} ${top + 2} ${leftEdge + tearArcX - 10} ${top}`,
    "Z",
  ].join(" ");
}

export function VoucherTicketSingle({
  item,
  className,
  onUseDiscount,
}: VoucherTicketSingleProps) {
  const [copied, setCopied] = useState(false);

  const safeId = String(item.id ?? "single").replace(/[^a-zA-Z0-9_-]/g, "");
  const mobileFillId = `customVoucherMobileFill-${safeId}`;
  const mobileClipId = `customVoucherMobileClip-${safeId}`;
  const mainFillId = `customVoucherMainFill-${safeId}`;
  const stubFillId = `customVoucherStubFill-${safeId}`;
  const mainClipId = `customVoucherMainClip-${safeId}`;
  const stubClipId = `customVoucherStubClip-${safeId}`;

  const mobileFullBodyPath = buildMobileFullBodyPath();
  const mobileInnerBorderPath = buildMobileInnerBorderPath();
  const mainBodyPath = buildMainBodyPath();
  const rightStubPath = buildRightStubPath();
  const innerMainBorderPath = buildInnerMainBorderPath();
  const innerStubBorderPath = buildInnerStubBorderPath();

  const imageSrc = item.imgUrl
    ? item.imgUrl.startsWith("/")
      ? item.imgUrl
      : `/${item.imgUrl}`
    : "/images/product.webp";

  const handleAction = () => {
    if (!item.kode) {
      onUseDiscount?.();
      return;
    }

    navigator.clipboard?.writeText(item.kode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "relative w-full max-w-6xl mx-auto min-h-[245px] sm:aspect-[1000/400] sm:min-h-[340px] md:min-h-[400px] lg:min-h-[420px] xl:min-h-[440px] flex items-center select-none",
        className
      )}
    >
      {/* ======================================================== */}
      {/* 1A. BENTUK TIKET MOBILE (< sm): HANYA KARTU UTAMA KIRI    */}
      {/* ======================================================== */}
      <svg
        viewBox={`0 0 ${TICKET_VIEWBOX.width} ${TICKET_VIEWBOX.height}`}
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="sm:hidden absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={mobileFillId}
            x1="0"
            y1="0"
            x2={TICKET_VIEWBOX.width}
            y2={TICKET_VIEWBOX.height}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="var(--color-voucher-blue, #80A4E8)" />
            <stop offset="100%" stopColor="var(--color-voucher-blue-end, #6D95DF)" />
          </linearGradient>

          <clipPath id={mobileClipId}>
            <path d={mobileFullBodyPath} />
          </clipPath>
        </defs>

        <path d={mobileFullBodyPath} fill={`url(#${mobileFillId})`} stroke="none" />

        <g clipPath={`url(#${mobileClipId})`}>
          <g opacity="0.11">
            {LEFT_STRIPES.map((stripe) => (
              <line
                key={stripe.id}
                x1={stripe.x1}
                y1={stripe.y1}
                x2={stripe.x2}
                y2={stripe.y2}
                stroke="#FFFFFF"
                strokeWidth={stripe.width}
              />
            ))}
          </g>
        </g>

        <g clipPath={`url(#${mobileClipId})`}>
          <path
            d={mobileInnerBorderPath}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeDasharray="10 9"
            strokeOpacity="0.55"
          />
        </g>

        <path
          d={mobileFullBodyPath}
          fill="none"
          stroke="var(--color-voucher-blue-stroke, #5C86D9)"
          strokeWidth="16"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      {/* ======================================================== */}
      {/* 1B. BENTUK TIKET TABLET & DESKTOP (>= sm)                 */}
      {/* ======================================================== */}
      <svg
        viewBox={`0 0 ${TICKET_VIEWBOX.width} ${TICKET_VIEWBOX.height}`}
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hidden sm:block absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={mainFillId}
            x1="0"
            y1="0"
            x2={TICKET_VIEWBOX.tearX}
            y2={TICKET_VIEWBOX.height}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="var(--color-voucher-blue, #80A4E8)" />
            <stop offset="100%" stopColor="var(--color-voucher-blue-end, #6D95DF)" />
          </linearGradient>

          <linearGradient
            id={stubFillId}
            x1={TICKET_VIEWBOX.tearX}
            y1="0"
            x2={TICKET_VIEWBOX.width}
            y2={TICKET_VIEWBOX.height}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="var(--color-voucher-blue, #80A4E8)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-voucher-blue-end, #6D95DF)" stopOpacity="0.38" />
          </linearGradient>

          <clipPath id={mainClipId}>
            <path d={mainBodyPath} />
          </clipPath>

          <clipPath id={stubClipId}>
            <path d={rightStubPath} />
          </clipPath>
        </defs>

        <path d={mainBodyPath} fill={`url(#${mainFillId})`} stroke="none" />

        <g clipPath={`url(#${mainClipId})`}>
          <g opacity="0.11">
            {LEFT_STRIPES.map((stripe) => (
              <line
                key={stripe.id}
                x1={stripe.x1}
                y1={stripe.y1}
                x2={stripe.x2}
                y2={stripe.y2}
                stroke="#FFFFFF"
                strokeWidth={stripe.width}
              />
            ))}
          </g>
        </g>

        <g clipPath={`url(#${mainClipId})`}>
          <path
            d={innerMainBorderPath}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeDasharray="10 9"
            strokeOpacity="0.55"
          />
        </g>

        <path
          d={mainBodyPath}
          fill="none"
          stroke="var(--color-voucher-blue-stroke, #5C86D9)"
          strokeWidth="16"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <path d={rightStubPath} fill={`url(#${stubFillId})`} stroke="none" />

        <g clipPath={`url(#${stubClipId})`}>
          <path
            d={innerStubBorderPath}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeDasharray="10 9"
            strokeOpacity="0.55"
          />
        </g>

        <path
          d={rightStubPath}
          fill="none"
          stroke="var(--color-voucher-blue-stroke, #5C86D9)"
          strokeWidth="16"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <line
          x1={TICKET_VIEWBOX.tearX}
          y1="68"
          x2={TICKET_VIEWBOX.tearX}
          y2={TICKET_VIEWBOX.height - 68}
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeDasharray="14 12"
          strokeOpacity="0.65"
          strokeLinecap="round"
        />
      </svg>

      {/* ======================================================== */}
      {/* 2. KONTEN UTAMA                                          */}
      {/* ======================================================== */}
      <div className="relative z-10 h-full w-full flex items-center">
        {/* Bagian Kiri-Tengah — flex-1 min-w-0 agar tidak overflow mendorong stub kanan */}
        <div className="flex-1 min-w-0 h-full px-6 sm:pl-9 md:pl-12 lg:pl-14 xl:pl-16 sm:pr-6 md:pr-8 lg:pr-4 py-5 flex items-center justify-center sm:justify-start lg:justify-center gap-0 lg:gap-6 xl:gap-10">
          {/* Gambar produk hanya tampil di desktop (>= lg) */}
          <div className="hidden lg:flex relative w-72 xl:w-80 h-full lg:pl-2 xl:pl-0 pr-2 xl:pr-4 items-center justify-center shrink-0">
            <Image
              src={imageSrc}
              alt={item.nama}
              width={340}
              height={240}
              className="h-full max-h-full w-auto object-contain lg:translate-x-2 xl:translate-x-0 lg:scale-120 xl:scale-110 transition-transform duration-300 hover:scale-125"
              priority
            />
          </div>

          {/* Blok Teks: rata tengah di mobile & tablet, rata kiri di desktop */}
          <div className="w-full sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-xl min-w-0 lg:pl-5 xl:pl-0 flex flex-col justify-center items-center lg:items-start text-center lg:text-left gap-2 sm:gap-2.5 md:gap-4">
            <div className="w-full flex flex-col items-center lg:items-start">
              <span className="text-white/95 text-[11px] sm:text-sm md:text-base lg:text-base xl:text-lg font-extrabold uppercase tracking-[0.12em] sm:tracking-[0.14em] mb-1 sm:mb-2">
                {item.tipeDiskon}
              </span>

              <h3 className="w-full text-lg sm:text-2xl md:text-4xl lg:text-3xl xl:text-[42px] font-black text-white leading-[1.15] sm:leading-[1.1] tracking-tight mt-0.5 drop-shadow-[0_1.5px_0_rgba(37,71,138,0.25)] line-clamp-2">
                {item.nama}
              </h3>
            </div>

            <VoucherBadge
              nilaiDiskon={item.nilaiDiskon}
              bgClass="bg-white"
              textClass="text-voucher-blue-text"
              className="border-2 border-white px-3.5 sm:px-6 py-1 sm:py-1.5 text-xs sm:text-base md:text-lg font-black tracking-tight"
            />

            <div className="w-full flex flex-col items-center lg:items-start gap-0.5 text-[11px] sm:text-sm md:text-base text-white leading-snug">
              {(item.minPembelian || item.maxDiskon) && (
                <p className="font-bold text-white/95">
                  {item.minPembelian}
                  {item.minPembelian && item.maxDiskon && " • "}
                  {item.maxDiskon}
                </p>
              )}

              {item.tanggalBerakhir && (
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-white/85">
                  Berlaku s/d {item.tanggalBerakhir}
                </p>
              )}
            </div>

            {/* Tombol Kode Voucher di Mobile (< sm): ada jarak gap (mt-3) dari bagian atas */}
            <button
              type="button"
              onClick={handleAction}
              aria-label={
                item.kode
                  ? copied
                    ? "Kode berhasil disalin"
                    : `Salin kode ${item.kode}`
                  : "Gunakan diskon"
              }
              className={cn(
                "sm:hidden mt-3 group inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-voucher-blue-stroke hover:bg-voucher-blue-stroke/90 text-white transition-all duration-150 active:scale-95 cursor-pointer select-none shadow-xs"
              )}
            >
              {item.kode ? (
                copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    <span className="font-body font-extrabold text-xs tracking-wider uppercase text-white">
                      Tersalin!
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-white shrink-0" />
                    <span className="font-body font-extrabold text-xs tracking-wider uppercase whitespace-nowrap text-white">
                      Kode: {item.kode}
                    </span>
                  </>
                )
              ) : (
                <>
                  <span className="font-body font-extrabold text-xs tracking-wider uppercase whitespace-nowrap text-white">
                    Gunakan Diskon
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-white shrink-0" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. BAGIAN KANAN (>= sm)                                  */}
        {/* ======================================================== */}
        <div className="hidden sm:flex relative shrink-0 h-full pl-2 sm:pr-6 md:pr-9 lg:pr-11 xl:pr-15 py-4 items-center justify-center">
          <button
            type="button"
            onClick={handleAction}
            aria-label={
              item.kode
                ? copied
                  ? "Kode berhasil disalin"
                  : `Salin kode ${item.kode}`
                : "Gunakan diskon"
            }
            className={cn(
              "relative z-10 group sm:translate-x-1 md:-translate-x-2 lg:-translate-x-5 xl:-translate-x-7 flex flex-col items-center justify-center gap-1.5 lg:gap-2.5 px-2.5 lg:px-3.5 py-3.5 lg:py-5 rounded-xl lg:rounded-2xl bg-voucher-blue hover:bg-voucher-blue-end text-white transition-all duration-150 hover:scale-[1.03] active:scale-95 cursor-pointer h-[78%] lg:h-[86%] max-h-[320px] min-h-[160px] lg:min-h-[190px] w-13 md:w-14 lg:w-16 xl:w-18 select-none shadow-xs"
            )}
          >
            {item.kode ? (
              copied ? (
                <>
                  <Check className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-white shrink-0" />
                  <span className="font-body font-extrabold text-xs md:text-sm lg:text-base xl:text-lg tracking-wider uppercase [writing-mode:vertical-rl] rotate-180 text-white">
                    Tersalin!
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 shrink-0 opacity-95 group-hover:opacity-100 text-white" />
                  <span className="font-body font-extrabold text-xs md:text-sm lg:text-base xl:text-lg tracking-wider uppercase [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white">
                    Kode: {item.kode}
                  </span>
                </>
              )
            ) : (
              <>
                <span className="font-body font-extrabold text-xs md:text-sm lg:text-base xl:text-lg tracking-wider uppercase [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white">
                  Gunakan Diskon
                </span>
                <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 shrink-0 text-white" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
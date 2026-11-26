"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Copy, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoucherBadge } from "./voucher-badge";
import {
  type VoucherPromoItem,
  getMultiVoucherTheme,
} from "@/types/voucher";

interface VoucherCardMultiProps {
  item: VoucherPromoItem;
  index?: number;
  className?: string;
  onUseDiscount?: () => void;
}

const MULTI_VIEWBOX = {
  width: 617,
  height: 323,
  inset: 10,
  radius: 26,
  notchHalfH: 36,
  notchDepth: 24,
};

const MULTI_STRIPES = [
  { id: "ms-1", x1: 40, y1: 340, x2: 240, y2: -20, width: 58 },
  { id: "ms-2", x1: 185, y1: 340, x2: 385, y2: -20, width: 58 },
  { id: "ms-3", x1: 330, y1: 340, x2: 530, y2: -20, width: 58 },
  { id: "ms-4", x1: 475, y1: 340, x2: 675, y2: -20, width: 58 },
];

/**
 * Membangun path luar card tiket multi secara manual:
 * - 4 sudut atas-bawah tumpul (radius: 26)
 * - Lekukan cekung ke dalam di sisi kiri & kanan tengah
 */
function buildMultiTicketPath(): string {
  const { width, height, inset, radius, notchHalfH, notchDepth } =
    MULTI_VIEWBOX;
  const left = inset;
  const top = inset;
  const right = width - inset;
  const bottom = height - inset;
  const midY = height / 2;

  return [
    `M ${left + radius} ${top}`,
    `L ${right - radius} ${top}`,
    `Q ${right} ${top} ${right} ${top + radius}`,
    `L ${right} ${midY - notchHalfH}`,
    `Q ${right - notchDepth} ${midY - notchHalfH + 6} ${right - notchDepth} ${midY}`,
    `Q ${right - notchDepth} ${midY + notchHalfH - 6} ${right} ${midY + notchHalfH}`,
    `L ${right} ${bottom - radius}`,
    `Q ${right} ${bottom} ${right - radius} ${bottom}`,
    `L ${left + radius} ${bottom}`,
    `Q ${left} ${bottom} ${left} ${bottom - radius}`,
    `L ${left} ${midY + notchHalfH}`,
    `Q ${left + notchDepth} ${midY + notchHalfH - 6} ${left + notchDepth} ${midY}`,
    `Q ${left + notchDepth} ${midY - notchHalfH + 6} ${left} ${midY - notchHalfH}`,
    `L ${left} ${top + radius}`,
    `Q ${left} ${top} ${left + radius} ${top}`,
    "Z",
  ].join(" ");
}

/**
 * Bingkai garis putus-putus di bagian dalam card tiket multi
 */
function buildMultiInnerBorderPath(): string {
  const { width, height, notchHalfH } = MULTI_VIEWBOX;
  const inset = 24;
  const radius = 16;
  const notchDepth = 16;
  const left = inset;
  const top = inset;
  const right = width - inset;
  const bottom = height - inset;
  const midY = height / 2;

  return [
    `M ${left + radius} ${top}`,
    `L ${right - radius} ${top}`,
    `Q ${right} ${top} ${right} ${top + radius}`,
    `L ${right} ${midY - notchHalfH - 4}`,
    `Q ${right - notchDepth} ${midY - notchHalfH + 2} ${right - notchDepth} ${midY}`,
    `Q ${right - notchDepth} ${midY + notchHalfH - 2} ${right} ${midY + notchHalfH + 4}`,
    `L ${right} ${bottom - radius}`,
    `Q ${right} ${bottom} ${right - radius} ${bottom}`,
    `L ${left + radius} ${bottom}`,
    `Q ${left} ${bottom} ${left} ${bottom - radius}`,
    `L ${left} ${midY + notchHalfH + 4}`,
    `Q ${left + notchDepth} ${midY + notchHalfH - 2} ${left + notchDepth} ${midY}`,
    `Q ${left + notchDepth} ${midY - notchHalfH + 2} ${left} ${midY - notchHalfH - 4}`,
    `L ${left} ${top + radius}`,
    `Q ${left} ${top} ${left + radius} ${top}`,
    "Z",
  ].join(" ");
}

export function VoucherCardMulti({
  item,
  index = 0,
  className,
  onUseDiscount,
}: VoucherCardMultiProps) {
  const [copied, setCopied] = useState(false);

  // Mengambil tema warna dari types/voucher berdasarkan urutan (index % themes.length)
  // serta mendukung override themeKey dari backend jika tersedia
  const theme = getMultiVoucherTheme(index, item.themeKey);

  // Pastikan ID unik per card agar tidak terjadi tabrakan ID pada SVG defs
  const safeId = String(item.id ?? "card").replace(/[^a-zA-Z0-9_-]/g, "");
  const gradId = `multiVoucherGrad-${safeId}-${Math.abs(index)}`;
  const clipId = `multiVoucherClip-${safeId}-${Math.abs(index)}`;

  const ticketPath = buildMultiTicketPath();
  const innerBorderPath = buildMultiInnerBorderPath();

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
        "relative w-full min-w-full sm:min-w-0 min-h-[225px] sm:min-h-[260px] md:min-h-[280px] lg:min-h-[330px] xl:min-h-[290px] xl:aspect-[617/323] flex items-center select-none",
        className
      )}
    >
      {/* Bentuk Card Tiket Manual SVG */}
      <svg
        viewBox={`0 0 ${MULTI_VIEWBOX.width} ${MULTI_VIEWBOX.height}`}
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={gradId}
            x1="0"
            y1="0"
            x2={MULTI_VIEWBOX.width}
            y2={MULTI_VIEWBOX.height}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={theme.fillStart} />
            <stop offset="100%" stopColor={theme.fillEnd} />
          </linearGradient>

          <clipPath id={clipId}>
            <path d={ticketPath} />
          </clipPath>
        </defs>

        {/* Fill latar belakang tiket */}
        <path d={ticketPath} fill={`url(#${gradId})`} stroke="none" />

        {/* Garis diagonal pudar di latar belakang */}
        <g clipPath={`url(#${clipId})`}>
          <g opacity="0.12">
            {MULTI_STRIPES.map((s) => (
              <line
                key={s.id}
                x1={s.x1}
                y1={s.y1}
                x2={s.x2}
                y2={s.y2}
                stroke="#FFFFFF"
                strokeWidth={s.width}
              />
            ))}
          </g>
        </g>

        {/* Garis putus-putus di bagian dalam tiket */}
        <g clipPath={`url(#${clipId})`}>
          <path
            d={innerBorderPath}
            fill="none"
            stroke={theme.innerDash}
            strokeWidth="3.5"
            strokeDasharray="12 10"
            strokeLinecap="round"
            strokeOpacity={theme.innerDashOpacity}
          />
        </g>

        {/* Outline luar tiket */}
        <path
          d={ticketPath}
          fill="none"
          stroke={theme.stroke}
          strokeWidth="12"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      {/* Konten Card */}
      <div className="relative z-10 h-full w-full px-6 sm:px-8 md:px-7 lg:px-8 py-5 sm:py-6 lg:py-7 flex items-center justify-center lg:justify-start gap-0 lg:gap-4 xl:gap-5">
        {/* Gambar Produk: disembunyikan di mobile & tablet (< lg), tampil mulai laptop 1024px */}
        <div className="hidden lg:flex relative w-32 xl:w-40 h-full items-center justify-center shrink-0">
          <Image
            src={imageSrc}
            alt={item.nama}
            width={180}
            height={160}
            className="max-h-full w-auto object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Info Promo & Tombol Kode: rata tengah di mobile & tablet, rata kiri di laptop */}
        <div className="w-full lg:flex-1 min-w-0 flex flex-col justify-center items-center lg:items-start text-center lg:text-left gap-2 sm:gap-2.5">
          <span
            className={cn(
              "text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.14em]",
              theme.eyebrowClass
            )}
          >
            {item.tipeDiskon}
          </span>

          <h3
            className={cn(
              "w-full text-base sm:text-xl lg:text-xl xl:text-2xl font-black leading-tight line-clamp-2",
              theme.titleClass
            )}
          >
            {item.nama}
          </h3>

          <VoucherBadge
            nilaiDiskon={item.nilaiDiskon}
            bgClass={theme.badgeBg}
            textClass={theme.badgeText}
            className={cn(
              "border-2 px-3 sm:px-4 py-0.5 sm:py-1 text-xs sm:text-sm font-black tracking-tight",
              theme.badgeBorder
            )}
          />

          <div className="w-full flex flex-col items-center lg:items-start gap-0.5 text-[11px] sm:text-xs leading-snug">
            {(item.minPembelian || item.maxDiskon) && (
              <p className={cn("font-bold line-clamp-1", theme.metaPrimaryClass)}>
                {item.minPembelian}
                {item.minPembelian && item.maxDiskon && " • "}
                {item.maxDiskon}
              </p>
            )}
            {item.tanggalBerakhir && (
              <p
                className={cn(
                  "text-[10px] sm:text-xs font-semibold",
                  theme.metaSecondaryClass
                )}
              >
                Berlaku s/d {item.tanggalBerakhir}
              </p>
            )}
          </div>

          {/* Tombol Kode Voucher / Gunakan Diskon */}
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
              "mt-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-3.5 py-1.5 rounded-xl border-2 text-[11px] sm:text-xs md:text-sm font-extrabold uppercase tracking-wider transition-all duration-150 active:scale-95 cursor-pointer shadow-xs",
              theme.btnBg,
              theme.btnHover,
              theme.btnText,
              theme.btnBorder
            )}
          >
            {item.kode ? (
              copied ? (
                <>
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>Kode: {item.kode}</span>
                </>
              )
            ) : (
              <>
                <span>Gunakan Diskon</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
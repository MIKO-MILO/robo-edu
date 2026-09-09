import { Unbounded, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-unbounded",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

const MIDTRANS_SNAP_URL =
  process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={cn(unbounded.variable, outfit.variable)}
      suppressHydrationWarning
    >
      <body className="font-body bg-background text-foreground" suppressHydrationWarning>
        {children}
        {/* Midtrans Snap.js — loaded once, available as window.snap globally */}
        <Script
          src={MIDTRANS_SNAP_URL}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
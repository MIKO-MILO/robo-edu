import { Unbounded, Outfit } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${unbounded.variable} ${outfit.variable}`}>
      <body className="font-body bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
import Navbar from "@/components/user/navbar";
import Footer from "@/components/user/footer";
import { WishlistProvider } from "@/contexts/wishlist-context";
import { WishlistFab } from "@/components/user/wishlist/wishlist-fab";
import { WishlistSidebar } from "@/components/user/wishlist/wishlist-sidebar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WishlistProvider>
      {/* ── Sticky Navbar ───────────────────────────────────
          Lives at the layout level — direct child of <body> via
          Next.js layout nesting. No trapping ancestor with overflow
          or position that could break position:sticky.
      ─────────────────────────────────────────────────────── */}
      <header className="sticky top-4 z-50 w-full flex justify-center px-4">
        <Navbar />
      </header>

      {/* ── Page Content ──────────────────────────────────── */}
      {children}

      {/* ── Footer ───────────────────────────────────────── */}
      <Footer />

      {/* ── Wishlist FAB (z-40) + Sidebar (z-50) ─────────────
          Diletakkan di luar content flow agar tidak terpengaruh
          oleh overflow atau stacking context dari page children.
          FAB z-40 < Sidebar z-50 < Navbar z-50 (sticky, separate stacking context).
      ─────────────────────────────────────────────────────── */}
      <WishlistFab />
      <WishlistSidebar />
    </WishlistProvider>
  );
}

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
      {/* ── Fixed Navbar ────────────────────────────────────
          position:fixed → keluar dari normal flow, tidak mendorong
          konten ke bawah. Navbar pill mengapung di atas semua layer.
      ─────────────────────────────────────────────────────── */}
      <header className="fixed top-8 left-0 right-0 z-50 w-full flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full" style={{ maxWidth: "984px" }}>
          <Navbar />
        </div>
      </header>

      {/* ── Page Content ──────────────────────────────────── */}
      {/* Navbar sudah fixed (out-of-flow), konten mulai dari top:0.
          Hero section di setiap halaman mengelola padding internalnya sendiri
          agar konten tidak tertutup navbar (pt-12/pt-20 di hero = ~48-80px,
          navbar height = 95px + 16px marginTop = 111px total floating area). */}
      <div>
        {children}
      </div>

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

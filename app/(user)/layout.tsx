import Navbar from "@/components/user/navbar";
import Footer from "@/components/user/footer";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
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
    </>
  );
}

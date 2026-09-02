/**
 * (auth)/layout.tsx
 *
 * Layout khusus halaman autentikasi (Login, Register, Forgot Password, dsb).
 * Sengaja TIDAK mengandung Navbar maupun Footer karena halaman auth adalah
 * "transactional screen" — bebas distraksi, fokus satu aksi.
 *
 * Struktur:
 *   ┌─────────────────────────────┐
 *   │  AuthHeader (slim top bar)  │  ← brand / logo
 *   ├─────────────────────────────┤
 *   │  flex-1 centering wrapper   │  ← halaman (login/register) dirender di sini
 *   └─────────────────────────────┘
 */
import AuthHeader from "@/components/auth/auth-header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AuthHeader />
      {/* Centering area — halaman auth tidak perlu lagi wrap min-h-screen sendiri */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        {children}
      </div>
    </div>
  );
}

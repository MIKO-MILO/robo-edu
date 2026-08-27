/**
 * (auth)/layout.tsx
 *
 * Layout khusus halaman autentikasi (Login, Register, Forgot Password, dsb).
 * Sengaja TIDAK mengandung Navbar maupun Footer karena halaman auth adalah
 * "transactional screen" — bebas distraksi, fokus satu aksi.
 *
 * Halaman-halaman di dalam route group ini bertanggung jawab penuh atas
 * tampilan full-viewport mereka sendiri (biasanya min-h-screen).
 */
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

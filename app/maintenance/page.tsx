import { Wrench } from "lucide-react";

/**
 * Standalone maintenance page — no user/admin layout.
 * Renders when maintenance_mode = "true" and visitor is not an admin.
 */
export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center justify-center size-20 rounded-3xl bg-accent-yellow border-2 border-secondary neo-shadow">
            <Wrench className="size-10 stroke-[2] text-secondary" />
          </span>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
            Sedang dalam Pemeliharaan
          </h1>
          <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
            Website RoboEdu sedang menjalani pemeliharaan rutin untuk memberikan pengalaman
            belanja yang lebih baik. Kami akan segera kembali.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Footer note */}
        <p className="font-body text-xs text-muted-foreground">
          Jika Anda adalah admin,{" "}
          <a
            href="/admin/login"
            className="font-semibold text-primary underline underline-offset-2 hover:no-underline"
          >
            login di sini
          </a>
          .
        </p>
      </div>
    </div>
  );
}

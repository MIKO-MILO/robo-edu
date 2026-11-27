"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";

const POLL_INTERVAL_MS = 5000;

/**
 * Standalone maintenance page — no user/admin layout.
 * Renders when maintenance_mode = "true" and visitor is not an admin.
 *
 * Polls GET /api/maintenance-status every 5 s.
 * When maintenance ends ({ active: false }), auto-redirects to homepage.
 */
export default function MaintenancePage() {
  const router = useRouter();

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch("/api/maintenance-status");
        if (!res.ok) return;
        const data = await res.json();
        if (data.active === false) {
          router.push("/");
        }
      } catch {
        // network error — silently ignore, will retry next interval
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [router]);

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
      </div>
    </div>
  );
}

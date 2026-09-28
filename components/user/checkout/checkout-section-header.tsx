import { cn } from "@/lib/utils";

interface CheckoutSectionHeaderProps {
  step: number;
  title: string;
  subtitle: string;
  iconBg: string;
  icon: React.ReactNode;
  rightElement?: React.ReactNode;
}

/**
 * CheckoutSectionHeader
 * Atomic header component untuk setiap section card di checkout.
 * Menampilkan nomor langkah, icon aksen, judul, subtitle, dan slot aksi opsional di kanan.
 */
export function CheckoutSectionHeader({
  step,
  title,
  subtitle,
  iconBg,
  icon,
  rightElement,
}: CheckoutSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-4 border-b-2 border-border/15 mb-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "w-8 h-8 rounded-xl border-2 border-border neo-shadow-icon flex items-center justify-center text-sm font-black shrink-0",
            iconBg
          )}
        >
          {icon}
        </span>
        <div>
          <h2 className="font-heading font-extrabold text-lg text-foreground">
            {step}. {title}
          </h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
}

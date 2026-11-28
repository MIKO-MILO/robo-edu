import { cn } from "@/lib/utils";

interface CheckoutSectionHeaderProps {
  step?: number;
  title: string;
  subtitle: string;
  iconBg?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

/**
 * CheckoutSectionHeader
 * Atomic header component untuk setiap section card di checkout.
 * Menampilkan judul section, subtitle, dan slot aksi opsional di kanan tanpa nomor langkah / icon bulat.
 */
export function CheckoutSectionHeader({
  title,
  subtitle,
  rightElement,
}: CheckoutSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-border/15 mb-4">
      <div>
        <h2 className="font-heading font-extrabold text-lg text-foreground">
          {title}
        </h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
}

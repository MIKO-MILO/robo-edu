import { Skeleton } from "@/components/ui/skeleton";

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton placeholder yang mirror layout OrderCard saat data loading.
// ─────────────────────────────────────────────────────────────────────────────
export function OrderCardSkeleton() {
  return (
    <div className="bg-card border-2 border-foreground neo-shadow rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
      {/* Header: nomor order + badge status */}
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>

      {/* Divider */}
      <div className="h-px bg-muted" />

      {/* Body: thumbnail + nama produk + extra count */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-16 sm:size-20 rounded-xl shrink-0" />
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <Skeleton className="h-4 w-3/4 rounded-full" />
          <Skeleton className="h-3 w-1/2 rounded-full" />
        </div>
      </div>

      {/* Footer: total + tombol aksi */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Kumpulan beberapa skeleton sekaligus (default n=3)
// ─────────────────────────────────────────────────────────────────────────────
interface OrderListSkeletonProps {
  count?: number;
}

export function OrderListSkeleton({ count = 3 }: OrderListSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  );
}

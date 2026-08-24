import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <section className="w-full min-h-[50vh] bg-card border-b-2 border-foreground p-8 md:p-16 flex flex-col justify-center">
        <div className="max-w-screen-xl mx-auto w-full flex flex-col gap-4">
          <Skeleton className="h-6 w-36 bg-accent-soft-blue/50" />
          <Skeleton className="h-12 w-3/4 max-w-lg bg-muted" />
          <Skeleton className="h-6 w-1/2 max-w-md bg-muted" />
        </div>
      </section>

      {/* Catalog Section Skeleton */}
      <section className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8">
        {/* Search Bar Skeleton */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-2 border-foreground rounded-2xl p-4 bg-card shadow-[4px_4px_0px_0px_#3D2900]">
          <Skeleton className="h-8 w-44 bg-muted shrink-0" />
          <Skeleton className="h-11 flex-1 rounded-full bg-background border-2 border-border" />
          <Skeleton className="h-11 w-28 rounded-full bg-secondary/20 shrink-0" />
        </div>

        {/* Filter Pills Skeleton */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-10 w-28 rounded-full border-2 border-foreground shrink-0 bg-card neo-shadow"
            />
          ))}
        </div>

        {/* Result Count Skeleton */}
        <Skeleton className="h-5 w-48 bg-muted" />

        {/* Product Cards Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="rounded-3xl p-4 flex flex-col gap-4 border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_#3D2900]"
            >
              {/* Product Image Skeleton */}
              <Skeleton className="w-full aspect-square rounded-2xl bg-muted/60 border border-foreground/20" />

              {/* Product Info Skeleton */}
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-4/5 bg-muted" />
                <Skeleton className="h-4 w-3/5 bg-muted" />
                <div className="flex justify-between items-center pt-1">
                  <Skeleton className="h-4 w-16 bg-muted" />
                  <Skeleton className="h-5 w-20 bg-muted" />
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex justify-between items-center mt-auto pt-2">
                <Skeleton className="h-8 w-28 rounded-full bg-muted" />
                <Skeleton className="size-8 rounded-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

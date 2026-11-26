"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Category {
  id: string;
  label: string;
}

export interface CategoryFilterListProps {
  categories: Category[];
  activeCategory: string;
  className?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
}

export function CategoryFilterList({
  categories,
  activeCategory,
  className,
  orientation = "responsive",
}: CategoryFilterListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === "all") {
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  const isAlwaysVertical = orientation === "vertical";
  const isAlwaysHorizontal = orientation === "horizontal";

  return (
    <div
      role="group"
      aria-label="Filter kategori"
      className={cn(
        isAlwaysVertical
          ? "flex flex-col gap-2.5 w-full"
          : isAlwaysHorizontal
          ? "flex items-center gap-2.5 overflow-x-auto py-2 -mx-1 px-1 no-scrollbar w-full"
          : "flex flex-row md:flex-col gap-2 md:gap-2.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 no-scrollbar w-full",
        className
      )}
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;

        return (
          <Button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryClick(cat.id)}
            aria-pressed={isActive}
            neo={false}
            className={cn(
              "rounded-full px-5 py-2.5 font-body text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95 h-auto",
              isAlwaysVertical || orientation === "responsive"
                ? "md:w-full md:text-left md:whitespace-normal md:flex md:items-center md:justify-between"
                : "",
              isActive
                ? "bg-primary-100 text-primary-900 border-2 border-primary font-bold shadow-xs hover:bg-primary-100"
                : "bg-card text-primary-900 border-2 border-primary-300 hover:border-primary/70 hover:bg-primary-100/30"
            )}
          >
            <span>{cat.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
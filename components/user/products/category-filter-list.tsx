"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FilterButton } from "@/components/ui/filter-button";
import { cn } from "@/lib/utils";

export interface Category {
  id: string;
  label: string;
}

export interface CategoryFilterListProps {
  categories: Category[];
  activeCategory: string;
  className?: string;
}

export function CategoryFilterList({
  categories,
  activeCategory,
  className,
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

  return (
    <div
      role="group"
      aria-label="Filter kategori"
      className={cn(
        "flex items-center gap-3 overflow-x-auto py-3 -mx-1 px-1 no-scrollbar",
        className
      )}
    >
      {categories.map((cat, index) => {
        const isActive = activeCategory === cat.id;

        return (
          <FilterButton
            key={cat.id}
            index={index}
            isActive={isActive}
            onClick={() => handleCategoryClick(cat.id)}
            aria-pressed={isActive}
            className={cn(
              "rounded-full px-6 py-2 font-body text-sm font-semibold whitespace-nowrap transition-all cursor-pointer category-shadow",
              isActive
                ? "bg-primary-100 text-primary-900 border-2 border-primary"
                : "bg-card text-primary-900 border-2 border-primary-300 hover:border-primary/70"
            )}
          >
            {cat.label}
          </FilterButton>
        );
      })}
    </div>
  );
}
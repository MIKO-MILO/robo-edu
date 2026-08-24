"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FilterButton } from "@/components/ui/filter-button";

export interface Category {
  id: string;
  label: string;
}

export interface CategoryFilterListProps {
  categories: Category[];
  activeCategory: string;
}

export function CategoryFilterList({
  categories,
  activeCategory,
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
    // Reset ke halaman 1 saat ganti kategori
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div
      role="group"
      aria-label="Filter kategori"
      className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1"
    >
      {categories.map((cat, index) => (
        <FilterButton
          key={cat.id}
          index={index}
          isActive={activeCategory === cat.id}
          onClick={() => handleCategoryClick(cat.id)}
          aria-pressed={activeCategory === cat.id}
        >
          {cat.label}
        </FilterButton>
      ))}
    </div>
  );
}

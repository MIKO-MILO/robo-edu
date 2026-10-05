"use client";

import React from "react";
import { Calendar, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput } from "@/components/admin/form/input";
import { AdminSelect } from "@/components/admin/form/select";
import type { SalesReportQueryParams } from "@/lib/api/services/admin.service";

export interface ReportsFiltersProps {
  filters: SalesReportQueryParams;
  onChange: (newFilters: SalesReportQueryParams) => void;
  onReset: () => void;
}

export function ReportsFilters({
  filters,
  onChange,
  onReset,
}: ReportsFiltersProps) {
  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, date_from: e.target.value || undefined });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, date_to: e.target.value || undefined });
  };

  const handleGroupByChange = (value: string) => {
    onChange({
      ...filters,
      group_by: (value as "day" | "week" | "month") || "day",
    });
  };

  const handlePreset = (preset: "today" | "7d" | "30d" | "month" | "year") => {
    const today = new Date();
    let fromDate = new Date();

    if (preset === "today") {
      fromDate = today;
    } else if (preset === "7d") {
      fromDate.setDate(today.getDate() - 7);
    } else if (preset === "30d") {
      fromDate.setDate(today.getDate() - 30);
    } else if (preset === "month") {
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (preset === "year") {
      fromDate = new Date(today.getFullYear(), 0, 1);
    }

    const formatDateStr = (d: Date) => d.toISOString().split("T")[0];

    onChange({
      ...filters,
      date_from: formatDateStr(fromDate),
      date_to: formatDateStr(today),
    });
  };

  return (
    <div className="flex flex-col space-y-4 p-4 md:p-5 rounded-3xl border-2 border-border bg-card neo-shadow">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-border/15">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-100 font-bold neo-shadow-icon">
            <Filter className="size-4" />
          </div>
          <span className="font-heading font-extrabold text-sm text-foreground uppercase tracking-wider">
            Filter Periode & Rentang Laporan
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={onReset}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <RotateCcw className="size-3" />
          <span>Reset Filter</span>
        </Button>
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-muted-foreground mr-1">
          Preset:
        </span>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => handlePreset("today")}
          className="text-xs font-semibold"
        >
          Hari Ini
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => handlePreset("7d")}
          className="text-xs font-semibold"
        >
          7 Hari Terakhir
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => handlePreset("30d")}
          className="text-xs font-semibold bg-accent-yellow/40"
        >
          30 Hari Terakhir
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => handlePreset("month")}
          className="text-xs font-semibold"
        >
          Bulan Ini
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => handlePreset("year")}
          className="text-xs font-semibold"
        >
          Tahun Ini
        </Button>
      </div>

      {/* Filter Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Date From */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1">
            Dari Tanggal
          </label>
          <div className="relative">
            <AdminInput
              type="date"
              value={filters.date_from || ""}
              onChange={handleDateFromChange}
              className="w-full text-xs font-semibold"
            />
          </div>
        </div>

        {/* Date To */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1">
            Sampai Tanggal
          </label>
          <div className="relative">
            <AdminInput
              type="date"
              value={filters.date_to || ""}
              onChange={handleDateToChange}
              className="w-full text-xs font-semibold"
            />
          </div>
        </div>

        {/* Group By */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1">
            Kelompokkan Berdasarkan
          </label>
          <AdminSelect
            value={filters.group_by || "day"}
            onValueChange={handleGroupByChange}
            options={[
              { label: "Per Harian (Day)", value: "day" },
              { label: "Per Mingguan (Week)", value: "week" },
              { label: "Per Bulanan (Month)", value: "month" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

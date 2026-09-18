import * as React from "react";
import { FileText } from "lucide-react";

export interface ComplaintDescriptionCardProps {
  description: string;
}

/**
 * Molecule — kartu kronologi/deskripsi lengkap klaim dari customer.
 * Area baca panjang dengan line-height longgar supaya nyaman dibaca.
 */
export function ComplaintDescriptionCard({ description }: ComplaintDescriptionCardProps) {
  return (
    <div className="bg-card rounded-2xl border-2 border-border p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b-2 border-border pb-3">
        <FileText className="size-4 text-primary" />
        <h3 className="font-heading font-bold text-base text-foreground">
          Kronologi Klaim
        </h3>
      </div>

      {/* Scrollable long-text area — comfortable reading width */}
      <div className="bg-muted/30 rounded-xl border border-border p-4 max-h-72 overflow-y-auto custom-scrollbar">
        <p className="font-body text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {description}
        </p>
      </div>
    </div>
  );
}

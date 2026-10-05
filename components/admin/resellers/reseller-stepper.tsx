import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { ResellerStatus } from "@/types/enums";

interface Step {
  number: number;
  label: string;
  sublabel: string;
  /** Step index that marks this as "current" */
  activeAt: number;
  /** Step indices where this step is done */
  doneBelow: number;
}

const STEPS: Step[] = [
  { number: 1, label: "Akun Terdaftar", sublabel: "Langkah 1", activeAt: 2, doneBelow: 2 },
  { number: 2, label: "KTP & NPWP Diunggah", sublabel: "Langkah 2", activeAt: 2, doneBelow: 2 },
  { number: 3, label: "Review & Verifikasi", sublabel: "Tahap Saat Ini", activeAt: 2, doneBelow: 3 },
  { number: 4, label: "Hak reseller_price", sublabel: "Keluaran PRD", activeAt: 4, doneBelow: 5 },
];

/** Map ResellerStatus to step progress index */
function statusToStep(status: ResellerStatus): number {
  if (status === "APPROVED") return 5; // all steps done
  if (status === "REJECTED") return 3;  // stopped at step 3
  return 3; // PENDING — currently at step 3
}

export interface ResellerStepperProps {
  resellerStatus: ResellerStatus;
}

/**
 * Atom — Horizontal stepper bar for reseller verification flow.
 * Visual progress indicator matching stitch design:
 *   Step 1: Account registered (done)
 *   Step 2: KTP & NPWP uploaded (done)
 *   Step 3: Review & Verification (current for PENDING/REJECTED)
 *   Step 4: reseller_price access (done for APPROVED only)
 */
export function ResellerStepper({ resellerStatus }: ResellerStepperProps) {
  const currentStep = statusToStep(resellerStatus);
  const isRejected = resellerStatus === "REJECTED";

  return (
    <div className="border border-border rounded-2xl bg-card p-4 overflow-x-auto">
      <div className="min-w-[680px] grid grid-cols-4 gap-2">
        {STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone = stepNum < currentStep;
          const isCurrent = stepNum === 3 && (resellerStatus === "PENDING" || isRejected);
          const isPending = stepNum > 3 && resellerStatus !== "APPROVED";

          let bgColor = "bg-muted opacity-80";
          let numberBg = "bg-card text-muted-foreground border-2 border-border";
          let sublabelColor = "text-muted-foreground";
          let shadowClass = "";

          if (isDone) {
            bgColor = "bg-success-bg";
            numberBg = "bg-card border-2 border-border text-success";
            sublabelColor = "text-muted-foreground";
          } else if (isCurrent && isRejected) {
            bgColor = "bg-danger-bg";
            numberBg = "bg-foreground border-2 border-border text-white";
            sublabelColor = "text-danger";
            shadowClass = "neo-shadow-icon";
          } else if (isCurrent) {
            bgColor = "bg-warning-bg";
            numberBg = "bg-foreground border-2 border-border text-white";
            sublabelColor = "text-warning";
            shadowClass = "neo-shadow-icon";
          }

          return (
            <div
              key={step.number}
              className={cn(
                "p-3 border border-border rounded-xl flex items-center gap-2.5 transition-colors",
                bgColor,
                shadowClass
              )}
            >
              {/* Step number / checkmark */}
              <div
                className={cn(
                  "size-7 flex items-center justify-center shrink-0 font-heading text-xs font-bold",
                  numberBg
                )}
              >
                {isDone ? <Check className="size-4" /> : step.number}
              </div>

              {/* Labels */}
              <div>
                <div className={cn("text-[10px] uppercase tracking-wider font-bold", sublabelColor)}>
                  {isCurrent ? "Tahap Saat Ini" : isPending ? "Keluaran PRD" : step.sublabel}
                </div>
                <div className="text-xs font-heading font-bold text-foreground">{step.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

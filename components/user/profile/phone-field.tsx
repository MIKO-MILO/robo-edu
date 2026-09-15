import { Input } from "@/components/ui/input";

interface PhoneFieldProps {
  label: string;
  required?: boolean;
  placeholder?: string;
}

/** Atomic: input nomor telepon dengan prefix flag + dropdown country code */
export function PhoneField({
  label,
  required,
  placeholder = "0806 123 7890",
}: PhoneFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <div className="flex">
        <div className="flex items-center gap-2 px-3 border border-r-0 border-primary-300 bg-primary-100/30 rounded-l-md text-sm shrink-0">
          <span className="w-5 h-3 bg-green-600 inline-block rounded-sm" />
          <span className="text-xs">▼</span>
        </div>
        <Input placeholder={placeholder} className="rounded-l-none bg-primary-100/30 border-primary-300 focus-visible:ring-primary" />
      </div>
    </div>
  );
}

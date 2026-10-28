interface SelectFieldProps {
  label: string;
  options: string[];
}

/** Atomic: label + styled native <select> dengan flag Nigeria dan chevron kustom */
export function SelectField({ label, options }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-3 bg-green-600 rounded-sm z-10" />
        <select className="w-full h-10 pl-10 pr-8 border border-primary-300 rounded-md bg-primary-100/30 appearance-none text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
          {options.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs">
          ▼
        </div>
      </div>
    </div>
  );
}

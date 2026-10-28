interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

/** Atomic: label + textarea untuk input teks panjang (mis. alamat) */
export function TextareaField({ label, className, ...props }: TextareaFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <textarea
        className={`w-full min-h-[100px] p-3 border border-primary-300 rounded-md bg-primary-100/30 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-y ${className ?? ""}`}
        {...props}
      />
    </div>
  );
}

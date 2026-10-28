import { Input } from "@/components/ui/input";

interface ProfileFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
}

/** Atomic: label + input text field untuk form profil */
export function ProfileField({
  label,
  required,
  className,
  ...props
}: ProfileFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <Input
        className={`bg-primary-100/30 border-primary-300 focus-visible:ring-primary ${className ?? ""}`}
        {...props}
      />
    </div>
  );
}

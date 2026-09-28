interface GenderFieldProps {
  label?: string;
}

/** Atomic: radio group Male / Female untuk field Gender */
export function GenderField({ label = "Gender" }: GenderFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <div className="flex gap-4">
        {(["Male", "Female"] as const).map((option) => (
          <label
            key={option}
            className="flex flex-1 items-center gap-2 border border-primary-300 bg-primary-100/30 rounded-md px-4 py-2 cursor-pointer hover:bg-primary-100/50 transition-colors"
          >
            <input
              type="radio"
              name="gender"
              value={option.toLowerCase()}
              className="accent-primary"
            />
            <span className="text-sm">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

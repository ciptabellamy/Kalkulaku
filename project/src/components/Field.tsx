import { type ReactNode } from "react";

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
  suffix?: ReactNode;
}

export default function Field({ label, hint, children, suffix }: FieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      <div className="relative">
        {children}
        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
            <span className="text-sm font-semibold text-slate-400">{suffix}</span>
          </div>
        )}
      </div>
    </div>
  );
}

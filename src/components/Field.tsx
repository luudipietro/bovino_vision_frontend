import { ChevronDown, Search } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

/** Bordered 40 px control used by inputs and selects. */
export const inputStyles =
  "h-10 w-full rounded-[10px] border border-neutral-600 bg-white px-4 text-sm text-neutral-800 placeholder:text-neutral-400 transition-shadow focus:border-green-600 focus:outline-none focus:ring-3 focus:ring-green-500/30 disabled:cursor-not-allowed disabled:opacity-45";

interface FieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

/** Label above the control, as in the reference filter bar. */
export default function Field({ label, children, className = "" }: FieldProps) {
  return (
    <label className={`flex flex-col gap-2 text-xs font-medium text-neutral-700 ${className}`}>
      {label}
      {children}
    </label>
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputStyles} ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={`relative block ${className}`}>
      <select className={`${inputStyles} appearance-none pr-10`} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-800" />
    </span>
  );
}

export function SearchInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <span className={`relative block ${className}`}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-800" />
      <input type="search" className={`${inputStyles} pl-12`} {...props} />
    </span>
  );
}

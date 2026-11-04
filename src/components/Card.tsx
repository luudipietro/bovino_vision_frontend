import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface CardProps {
  children: ReactNode;
  className?: string;
}

/** White surface with hairline border; cards float over the cream page. */
export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-[14px] border border-neutral-200 bg-white p-6 shadow-xs md:p-8 ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function CardHeader({ title, subtitle, actions }: CardHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-neutral-800">{title}</h2>
        {subtitle && <p className="mt-1 text-[11px] text-neutral-500">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

/** Full-width gray strip that links to a detail view ("Ver detalle de ventas >" in the reference). */
export function LinkStrip({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="flex h-10 items-center justify-between rounded-[10px] bg-neutral-100 px-6 text-sm font-medium text-neutral-800 transition-colors hover:bg-green-50"
    >
      {children}
      <ChevronRight className="h-4 w-4" />
    </Link>
  );
}

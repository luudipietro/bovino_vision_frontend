import { ArrowRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface StatCardProps {
  icon?: LucideIcon;
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  /** Optional footer link, shown as the gray strip of the reference cards. */
  action?: { to: string; label: string };
  tone?: "brand" | "neutral" | "danger";
}

const ICON_TONES = { brand: "text-green-500", neutral: "text-neutral-500", danger: "text-danger-500" };

/** White summary card: icon and label, large value, caption and an optional footer link. */
export default function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  action,
  tone = "brand",
}: StatCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[14px] border border-neutral-200 bg-white shadow-xs">
      <div className="flex-1 px-7 py-6">
        <p className="flex items-center gap-2 text-[15px] font-medium text-neutral-800">
          {Icon && (
            <Icon className={`h-6 w-6 ${ICON_TONES[tone]}`} />
          )}
          {label}
        </p>
        <p className="mt-4 text-xl font-bold tabular-nums text-neutral-800">{value}</p>
        {detail && <p className="mt-1 text-[11px] font-medium text-neutral-500">{detail}</p>}
      </div>
      {action && (
        <Link
          to={action.to}
          className="flex h-[60px] items-center justify-between bg-neutral-100 px-7 text-sm font-semibold text-neutral-800 transition-colors hover:bg-green-50"
        >
          {action.label}
          <ArrowRight className="h-5 w-5" />
        </Link>
      )}
    </div>
  );
}

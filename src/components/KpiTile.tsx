import type { ReactNode } from "react";

interface KpiTileProps {
  label: string;
  value: ReactNode;
  /** Small line above the value, as in "$30.000 / 2 DE SEP". */
  detail?: ReactNode;
  tone?: "default" | "danger";
}

const toneStyles = {
  default: "bg-green-800",
  danger: "bg-danger-text",
};

/** Dark summary tile: large figure with an uppercase label below. */
export default function KpiTile({ label, value, detail, tone = "default" }: KpiTileProps) {
  return (
    <div
      className={`flex min-h-[95px] flex-col justify-center rounded-[10px] px-6 py-4 text-white shadow-sm ${toneStyles[tone]}`}
    >
      {detail && <p className="text-[10px] font-medium text-white/80">{detail}</p>}
      <p className="text-[22px] font-bold leading-tight tabular-nums">{value}</p>
      <p className="mt-1.5 text-[11px] font-semibold uppercase leading-4">{label}</p>
    </div>
  );
}

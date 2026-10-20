import type { ReactNode } from "react";

interface ProgressBarProps {
  /** Share between 0 and 1; values outside the range are clamped. */
  value: number;
  label: ReactNode;
  valueLabel?: ReactNode;
  tone?: "brand" | "earth";
}

/** Thick rounded bar with its caption below, as in the reference composition chart. */
export default function ProgressBar({ value, label, valueLabel, tone = "brand" }: ProgressBarProps) {
  const percent = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-[19px] overflow-hidden rounded-full bg-neutral-100"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-standard ${tone === "brand" ? "bg-green-500" : "bg-brown-400"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-3 text-xs font-medium text-neutral-800">
        <span>{label}</span>
        {valueLabel && <span className="font-semibold tabular-nums">{valueLabel}</span>}
      </div>
    </div>
  );
}

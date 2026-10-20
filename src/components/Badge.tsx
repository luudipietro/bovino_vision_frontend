import type { ReactNode } from "react";

export type BadgeTone = "brand" | "neutral" | "danger" | "warning";

const toneStyles: Record<BadgeTone, string> = {
  brand: "bg-lime-300 text-green-900",
  neutral: "bg-stone-100 text-stone-600",
  danger: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-800",
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

export default function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${toneStyles[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

import type { ReactNode } from "react";

export type BadgeTone = "brand" | "neutral" | "danger" | "warning" | "info" | "earth";

const toneStyles: Record<BadgeTone, string> = {
  brand: "bg-green-100 text-green-600",
  neutral: "bg-neutral-100 text-neutral-600",
  danger: "bg-danger-bg text-danger-text",
  warning: "bg-warning-bg text-warning-text",
  info: "bg-info-bg text-info-text",
  earth: "bg-brown-100 text-brown-600",
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

export default function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-0.5 text-xs font-medium ${toneStyles[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

import { CircleAlert, CircleCheck, Info, LoaderCircle, type LucideIcon, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

export type NoticeTone = "neutral" | "success" | "warning" | "danger";

const noticeStyles: Record<NoticeTone, { box: string; icon: LucideIcon }> = {
  neutral: { box: "bg-neutral-100 text-neutral-600", icon: Info },
  success: { box: "bg-success-bg text-success-text", icon: CircleCheck },
  warning: { box: "bg-warning-bg text-warning-text", icon: TriangleAlert },
  danger: { box: "bg-danger-bg text-danger-text", icon: CircleAlert },
};

interface NoticeProps {
  tone?: NoticeTone;
  children: ReactNode;
  /** Optional action rendered under the message. */
  action?: ReactNode;
  className?: string;
}

/** Soft inline message with a leading icon. */
export function Notice({ tone = "neutral", children, action, className = "" }: NoticeProps) {
  const { box, icon: Icon } = noticeStyles[tone];
  return (
    <div role={tone === "danger" ? "alert" : undefined} className={`flex gap-3 rounded-[10px] px-4 py-3 text-xs leading-5 ${box} ${className}`}>
      <Icon className="mt-px h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        {children}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}

export function Loading({ children = "Cargando…" }: { children?: ReactNode }) {
  return (
    <p className="flex items-center gap-2 py-6 text-sm text-neutral-500">
      <LoaderCircle className="h-5 w-5 animate-spin text-green-600" />
      {children}
    </p>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, children, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-[14px] border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-[11px] bg-green-100 text-green-600">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-3 text-sm font-semibold text-neutral-800">{title}</p>
      {children && <p className="mt-1 max-w-sm text-xs text-neutral-500">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

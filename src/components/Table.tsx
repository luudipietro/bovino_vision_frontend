import type { ReactNode } from "react";

/*
 * Tables in the reference are a rounded gray header followed by rows drawn as separate
 * bordered cards. `columns` is a Tailwind grid-template class shared by header and rows
 * (for example "md:grid-cols-[2fr_1fr_1fr_auto]"); on small screens rows stack.
 */

interface TableHeaderProps {
  columns: string;
  labels: ReactNode[];
}

export function TableHeader({ columns, labels }: TableHeaderProps) {
  return (
    <div
      className={`hidden min-h-11 items-center gap-4 rounded-[10px] bg-neutral-100 px-6 text-xs font-medium uppercase text-neutral-700 shadow-xs md:grid ${columns}`}
    >
      {labels.map((label, index) => (
        // oxlint-disable-next-line react/no-array-index-key -- header labels are static and positional
        <span key={index}>{label}</span>
      ))}
    </div>
  );
}

interface TableRowProps {
  columns: string;
  children: ReactNode;
  className?: string;
}

export function TableRow({ columns, children, className = "" }: TableRowProps) {
  return (
    <div
      className={`grid gap-2 rounded-[10px] border border-neutral-200 bg-white px-6 py-5 text-sm md:min-h-[90px] md:items-center md:gap-4 ${columns} ${className}`}
    >
      {children}
    </div>
  );
}

/** Secondary cell text: muted on desktop, prefixed by its column name on mobile. */
export function Cell({ label, children, muted = false }: { label: string; children: ReactNode; muted?: boolean }) {
  return (
    <span className={`min-w-0 ${muted ? "text-neutral-500" : "text-neutral-800"}`}>
      <span className="mr-1 text-[11px] font-medium uppercase text-neutral-400 md:hidden">{label}</span>
      {children}
    </span>
  );
}

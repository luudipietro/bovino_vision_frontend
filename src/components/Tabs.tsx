export interface TabItem<T extends string> {
  id: T;
  label: string;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  label: string;
}

/** Underlined uppercase tabs. */
export default function Tabs<T extends string>({ items, active, onChange, label }: TabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-neutral-200">
      {items.map((item) => {
        const selected = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.id)}
            className={`-mb-px whitespace-nowrap border-b-2 px-6 py-2 text-[13px] uppercase transition-colors ${
              selected
                ? "border-green-700 font-semibold text-neutral-800"
                : "border-transparent font-medium text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

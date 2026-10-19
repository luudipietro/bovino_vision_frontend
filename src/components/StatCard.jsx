const toneStyles = {
  neutral: "bg-green-50 text-green-800",
  danger: "bg-red-50 text-red-600",
  accent: "bg-lime-100 text-green-800",
};

export default function StatCard({ icon: Icon, label, value, tone = "neutral" }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      {Icon && (
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${toneStyles[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase leading-tight tracking-wide text-stone-400">
          {label}
        </p>
        <p className="text-xl font-bold text-stone-900">{value}</p>
      </div>
    </div>
  );
}

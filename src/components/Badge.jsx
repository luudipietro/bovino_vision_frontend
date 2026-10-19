const toneStyles = {
  brand: "bg-lime-300 text-green-900",
  neutral: "bg-stone-100 text-stone-600",
  danger: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-800",
};

export default function Badge({ children, tone = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${toneStyles[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

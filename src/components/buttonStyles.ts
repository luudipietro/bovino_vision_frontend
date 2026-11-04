// Shared by buttons and router links that look like buttons.
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-green-800 text-white shadow-sm hover:bg-green-900",
  secondary: "border border-neutral-300 bg-white text-neutral-800 hover:bg-green-50",
  ghost: "text-neutral-800 hover:bg-neutral-100",
  danger: "bg-danger-500 text-white shadow-sm hover:bg-danger-text",
};

const sizeStyles: Record<ButtonSize, string> = {
  md: "h-10 px-4 text-[13px]",
  lg: "h-12 px-5 text-sm",
};

export function buttonStyles(variant: ButtonVariant = "primary", size: ButtonSize = "md"): string {
  return `inline-flex shrink-0 items-center justify-center gap-2 rounded-[10px] font-semibold transition-colors duration-150 ease-standard active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 ${variantStyles[variant]} ${sizeStyles[size]}`;
}

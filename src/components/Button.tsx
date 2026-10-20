import type { LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { type ButtonSize, type ButtonVariant, buttonStyles } from "./buttonStyles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
}

export default function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={`${buttonStyles(variant, size)} ${className}`} {...props}>
      {Icon && <Icon className="h-[18px] w-[18px]" />}
      {children}
      {IconRight && <IconRight className="h-[18px] w-[18px]" />}
    </button>
  );
}

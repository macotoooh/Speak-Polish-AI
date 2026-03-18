"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export const BUTTON_VARIANTS = {
  primary: "primary",
  secondary: "secondary",
  accent: "accent",
  ghost: "ghost",
} as const;

export const BUTTON_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
} as const;

type ButtonVariant = (typeof BUTTON_VARIANTS)[keyof typeof BUTTON_VARIANTS];
type ButtonSize = (typeof BUTTON_SIZES)[keyof typeof BUTTON_SIZES];

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "ui-btn-primary",
  secondary: "ui-btn-secondary",
  accent: "ui-btn-accent",
  ghost: "bg-transparent text-foreground hover:bg-surface-2",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "rounded-md px-3 py-1 text-sm",
  md: "rounded-md px-3 py-2 text-sm",
  lg: "rounded-lg px-4 py-2",
};

function cx(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export default function Button({
  children,
  className,
  variant = BUTTON_VARIANTS.primary,
  size = BUTTON_SIZES.md,
  fullWidth = false,
  leadingIcon,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-60",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {leadingIcon}
      {children}
    </button>
  );
}

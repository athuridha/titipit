import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-semibold whitespace-nowrap transition-[transform,background-color,border-color,color] duration-200 ease-[var(--ease-out-expo)] active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-55";

const variants: Record<Variant, string> = {
  // Brand blue fill with white ink: 5.5:1 contrast, passes WCAG AA.
  // Single restrained glow echoes the neon mark; nowhere else glows.
  primary:
    "bg-accent text-accent-ink shadow-[0_0_28px_-10px_var(--accent)] hover:brightness-[1.12]",
  secondary:
    "border border-line-strong bg-surface text-ink hover:border-accent-hairline hover:bg-surface-2",
  ghost: "text-ink-soft hover:bg-surface-2 hover:text-ink",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

function classes(variant: Variant, size: Size, extra?: string) {
  return [base, variants[variant], sizes[size], extra].filter(Boolean).join(" ");
}

type LinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: LinkProps) {
  return <Link {...props} className={classes(variant, size, className)} />;
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return <button type={type} {...props} className={classes(variant, size, className)} />;
}

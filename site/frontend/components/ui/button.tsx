import * as React from "react";
import { cn } from "@/shared/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "dark" | "light" | "outline" | "gold";
  /** Renderiza o estilo do botao no unico filho (ex.: um <Link>) em vez de um <button>. */
  asChild?: boolean;
};

const STYLES = {
  dark: "bg-ink text-ivory hover:bg-[#1c2925]",
  light: "bg-ivory text-ink hover:bg-white",
  outline: "border border-current/20 bg-transparent hover:bg-current/5",
  gold: "bg-gold text-ink hover:bg-[#e3d4b6]"
} as const;

const BASE_CLASS =
  "subtitle inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition";

export function Button({ className, variant = "dark", asChild = false, children, ...props }: ButtonProps) {
  const merged = cn(BASE_CLASS, STYLES[variant], className);

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    return React.cloneElement(child, { className: cn(merged, child.props.className) });
  }

  return (
    <button className={merged} {...props}>
      {children}
    </button>
  );
}

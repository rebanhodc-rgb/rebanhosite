import * as React from "react";
import { cn } from "@/shared/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "dark" | "light" | "outline" | "gold";
};

export function Button({ className, variant = "dark", ...props }: ButtonProps) {
  const styles = {
    dark: "bg-ink text-ivory hover:bg-[#1c2925]",
    light: "bg-ivory text-ink hover:bg-white",
    outline: "border border-current/20 bg-transparent hover:bg-current/5",
    gold: "bg-gold text-ink hover:bg-[#e3d4b6]"
  };

  return (
    <button
      className={cn("subtitle inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition", styles[variant], className)}
      {...props}
    />
  );
}

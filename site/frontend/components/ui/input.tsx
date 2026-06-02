import * as React from "react";
import { cn } from "@/shared/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "min-h-11 w-full rounded-full border border-current/15 bg-white/55 px-4 py-2 text-sm outline-none transition placeholder:text-current/40 focus:border-gold",
        props.className
      )}
    />
  );
}

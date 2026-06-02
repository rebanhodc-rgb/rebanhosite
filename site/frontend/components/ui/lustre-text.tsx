import { cn } from "@/shared/utils";

export function LustreText({ text, disabled = false, className }: { text: string; disabled?: boolean; className?: string }) {
  return <span className={cn(disabled ? "text-gold" : "lustre-text lustre-dark", className)}>{text}</span>;
}

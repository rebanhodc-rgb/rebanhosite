"use client";

import { motion } from "framer-motion";
import { cn } from "@/shared/utils";

interface ImagesBadgeProps {
  category: string;
  limited?: boolean;
  className?: string;
}

export function ImagesBadge({ category, limited = false, className }: ImagesBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className={cn(
        "absolute bottom-3 left-3 z-10 flex items-center gap-2",
        className
      )}
    >
      <span className="rounded-full bg-ink/80 px-3 py-1 font-subtitle text-xs uppercase tracking-widest text-gold backdrop-blur-sm">
        {category}
      </span>
      {limited && (
        <span className="rounded-full bg-copper/90 px-3 py-1 font-subtitle text-xs uppercase tracking-widest text-ivory backdrop-blur-sm">
          Edição Limitada
        </span>
      )}
    </motion.div>
  );
}

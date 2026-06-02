"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/utils";

interface BookPage {
  title: string;
  content: string;
}

interface InteractiveBookProps {
  pages: BookPage[];
  className?: string;
}

export function InteractiveBook({ pages, className }: InteractiveBookProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = (index: number) => {
    setDirection(index > currentPage ? 1 : -1);
    setCurrentPage(index);
  };

  const prev = () => {
    if (currentPage > 0) goTo(currentPage - 1);
  };
  const next = () => {
    if (currentPage < pages.length - 1) goTo(currentPage + 1);
  };

  return (
    <div className={cn("relative max-w-2xl mx-auto", className)}>
      <div
        className="relative overflow-hidden border border-gold/40 bg-ivory shadow-2xl"
        style={{ minHeight: "320px", perspective: "1200px" }}
      >
        <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-ink/20 to-transparent pointer-events-none z-10" />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                rotateY: dir > 0 ? 90 : -90,
                opacity: 0,
                transformOrigin: dir > 0 ? "left center" : "right center",
              }),
              center: {
                rotateY: 0,
                opacity: 1,
              },
              exit: (dir: number) => ({
                rotateY: dir > 0 ? -90 : 90,
                opacity: 0,
                transformOrigin: dir > 0 ? "right center" : "left center",
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="p-10"
          >
            <p className="font-subtitle text-xs uppercase tracking-widest text-gold mb-6">
              {String(currentPage + 1).padStart(2, "0")} /{" "}
              {String(pages.length).padStart(2, "0")}
            </p>
            <h3 className="font-display text-2xl text-ink mb-4">
              {pages[currentPage].title}
            </h3>
            <p className="font-body text-base leading-relaxed text-ink/80">
              {pages[currentPage].content}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={prev}
          disabled={currentPage === 0}
          className="font-subtitle text-xs uppercase tracking-widest text-ink/60 hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Anterior
        </button>
        <div className="flex gap-2">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Página ${i + 1}`}
              aria-current={i === currentPage ? "true" : undefined}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                i === currentPage ? "bg-gold" : "bg-ink/20 hover:bg-ink/40"
              )}
            />
          ))}
        </div>
        <button
          onClick={next}
          disabled={currentPage === pages.length - 1}
          className="font-subtitle text-xs uppercase tracking-widest text-ink/60 hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Próximo →
        </button>
      </div>
    </div>
  );
}

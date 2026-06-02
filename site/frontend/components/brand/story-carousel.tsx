"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/utils";

const STORIES = [
  {
    id: "sinal",
    title: "O Sinal",
    content:
      "Nascemos de uma inquietação: a fé que transforma precisa de uma linguagem que alcance o cotidiano. Cada peça é um sinal discreto — uma conversa silenciosa entre quem veste e quem vê.",
  },
  {
    id: "espera",
    title: "A Espera",
    content:
      "Há uma beleza singular na espera ativa. Não a estagnação, mas o cultivo paciente de algo maior. REBANHO nasceu nesse espaço — entre o que é e o que pode ser.",
  },
  {
    id: "veste",
    title: "A Veste",
    content:
      "Cada peça carrega um significado que vai além do tecido. É uma declaração silenciosa, uma escolha intencional de como você se apresenta ao mundo — com fé, com propósito, com beleza.",
  },
  {
    id: "gesto",
    title: "O Gesto",
    content:
      "Vestir é um gesto de identidade. Quando você escolhe REBANHO, você escolhe pertencer a algo maior — uma comunidade que acredita que a beleza e a fé caminham juntas.",
  },
];

export function StoryCarousel() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-16 px-4 bg-ivory">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2 mb-8 justify-center flex-wrap">
          {STORIES.map((story, i) => (
            <button
              key={story.id}
              onClick={() => setActive(i)}
              className={cn(
                "px-4 py-2 font-subtitle text-xs uppercase tracking-widest transition-colors border",
                active === i
                  ? "border-gold bg-ink text-gold"
                  : "border-gold/30 text-ink hover:border-gold"
              )}
            >
              {story.title}
            </button>
          ))}
        </div>
        <div className="relative overflow-hidden border border-gold/30 bg-ivory p-6 md:p-10 min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
            >
              <h3 className="font-display text-2xl text-ink mb-4">
                {STORIES[active].title}
              </h3>
              <p className="font-body text-base leading-relaxed text-ink/80">
                {STORIES[active].content}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

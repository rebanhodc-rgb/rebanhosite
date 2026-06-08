"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/utils";

const STORIES = [
  {
    id: "sinal",
    title: "O Sinal",
    content:
      "Nascemos de uma inquietação: evangelizar não com palavras vazias, mas com gestos que ficam. Cada peça é um sinal discreto — uma conversa silenciosa entre quem veste e quem vê.",
  },
  {
    id: "espera",
    title: "A Espera",
    content:
      "Há uma beleza singular em esperar de braços abertos. REBANHO nasceu nesse espaço: ir ao encontro sem ruído, acolher sem excesso, dizer com presença que ainda há lugar.",
  },
  {
    id: "veste",
    title: "A Veste",
    content:
      "Cada camiseta é um aceno. Uma forma silenciosa de dizer: você não está sozinho. Fé, propósito e beleza aparecem como camada profunda — nunca como rótulo.",
  },
  {
    id: "gesto",
    title: "O Gesto",
    content:
      "Vestir também é doar. Quando você escolhe REBANHO, parte do lucro vira cuidado concreto — porque beleza e fé caminham juntas quando alcançam alguém.",
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

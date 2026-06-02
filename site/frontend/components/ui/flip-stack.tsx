"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type FlipStackCard = {
  id: number;
  title: string;
  caption: string;
  image: string;
};

export function FlipStack({ cards }: { cards: FlipStackCard[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % cards.length), 3200);
    return () => window.clearInterval(timer);
  }, [cards.length]);

  const ordered = cards.map((_, index) => cards[(active + index) % cards.length]).reverse();

  return (
    <div className="relative mx-auto aspect-[0.86] w-[min(100%,390px)] sm:w-[min(100%,440px)] lg:w-[min(100%,470px)] 2xl:w-[min(100%,500px)]">
      {ordered.map((card, index) => {
        const depth = ordered.length - 1 - index;
        const isTop = depth === 0;
        return (
          <motion.button
            key={card.id}
            type="button"
            onClick={() => setActive((current) => (current + 1) % cards.length)}
            className="absolute inset-0 overflow-hidden rounded-[10px] border border-gold/25 bg-ink text-left shadow-2xl shadow-black/40"
            animate={{
              x: depth * 12,
              y: depth * 12,
              rotate: depth === 0 ? -1 : depth * 3,
              scale: 1 - depth * 0.045,
              opacity: 1 - depth * 0.12
            }}
            transition={{ type: "spring", stiffness: 160, damping: 22 }}
            style={{ zIndex: index }}
            aria-label={isTop ? "Avancar foto" : undefined}
          >
            <img src={card.image} alt={card.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/18 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="serif text-3xl uppercase tracking-[0.08em] text-gold">{card.title}</p>
              <p className="subtitle mt-2 text-sm uppercase tracking-[0.18em] text-ivory/72">{card.caption}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

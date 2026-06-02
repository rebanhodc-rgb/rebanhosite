"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { products } from "@/shared/catalog";

const NAV_CARDS = [
  { label: "Loja", href: "/loja", image: products[0]?.images[0] ?? "" },
  { label: "Propósito", href: "/marca", image: products[1]?.images[0] ?? "" },
  {
    label: "Experiência",
    href: `/produto/${products[2]?.slug ?? ""}`,
    image: products[2]?.images[0] ?? "",
  },
  { label: "Sobre", href: "/sobre", image: products[3]?.images[0] ?? "" },
];

interface CardNavProps {
  dark?: boolean;
}

export function CardNav({ dark = false }: CardNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        className={`hidden md:flex items-center font-subtitle text-xs uppercase tracking-widest transition-colors ${
          dark ? "text-ivory hover:text-gold" : "text-ink hover:text-gold"
        }`}
      >
        Menu
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-ink"
            onClick={() => setOpen(false)}
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-6 right-6 font-subtitle text-xs uppercase tracking-widest text-ivory/60 hover:text-ivory transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            >
              Fechar
            </motion.button>

            <div
              className="grid grid-cols-4 gap-4 max-w-5xl px-8 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {NAV_CARDS.map((card, i) => (
                <motion.div
                  key={card.href + card.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <Link
                    href={card.href}
                    className="group relative block overflow-hidden aspect-[3/4] border border-gold/20"
                    onClick={() => setOpen(false)}
                  >
                    {card.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={card.image}
                        alt={card.label}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-ink/60 group-hover:bg-ink/40 transition-colors" />
                    <div className="absolute bottom-4 left-4">
                      <span className="font-display text-xl text-ivory">
                        {card.label}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

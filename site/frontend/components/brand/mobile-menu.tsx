"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

const LINKS = [
  { label: "Loja", href: "/loja" },
  { label: "Propósito", href: "/marca" },
  { label: "Experiência", href: "/produto/cordis" },
  { label: "Conta", href: "/minha-conta" },
];

interface MobileMenuProps {
  dark?: boolean;
}

export function MobileMenu({ dark = false }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        className={`flex flex-col gap-1.5 p-2 md:hidden ${
          dark ? "text-gold" : "text-ink"
        }`}
      >
        <motion.span
          animate={open ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
          className="block h-px w-6 bg-current origin-center"
        />
        <motion.span
          animate={open ? { opacity: 0 } : { opacity: 1 }}
          className="block h-px w-6 bg-current"
        />
        <motion.span
          animate={open ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
          className="block h-px w-6 bg-current origin-center"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-ink"
            onClick={() => setOpen(false)}
          >
            {LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
              >
                <Link
                  href={link.href}
                  className="block py-4 font-subtitle text-2xl uppercase tracking-widest text-ivory hover:text-gold transition-colors"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

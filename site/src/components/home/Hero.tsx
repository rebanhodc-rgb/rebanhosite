"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative flex h-[100svh] items-center justify-center overflow-hidden">
      <Image
        src="/hero.svg"
        alt="Coleção Manifesto REBANHO"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/10 to-ink/50" />

      <div className="relative z-10 px-6 text-center text-bone">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs tracking-brand"
        >
          COLEÇÃO MANIFESTO
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl leading-[1.05] md:text-7xl lg:text-8xl"
        >
          Peças para ir<br />ao encontro.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mx-auto mt-5 max-w-md text-xs tracking-[0.15em] text-bone/80"
        >
          EVANGELIZAR PELA BELEZA, PELA PRESENÇA E POR GESTOS QUE FICAM.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/loja"
            className="group inline-flex items-center gap-2 bg-bone px-8 py-4 text-xs tracking-brand text-ink transition-colors hover:bg-bone/90"
          >
            VESTIR O ACENO
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/provador"
            className="inline-flex items-center gap-2 border border-bone/60 px-8 py-4 text-xs tracking-brand text-bone hover:bg-bone/10"
          >
            PROVADOR VIRTUAL
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-bone/70">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-[10px] tracking-brand"
        >
          ROLE
        </motion.div>
      </div>
    </section>
  );
}

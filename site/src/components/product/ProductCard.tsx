"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "200px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/produto/${product.slug}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden bg-line">
          <Image
            src={product.images[0].src}
            alt={product.images[0].alt}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {product.images[1] && (
            <Image
              src={product.images[1].src}
              alt={product.images[1].alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
        </div>
        <div className="mt-3 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm tracking-wide">{product.name}</h3>
            <p className="mt-0.5 text-xs text-stone">{product.tagline}</p>
          </div>
          <p className="text-sm">{formatPrice(product.priceCents)}</p>
        </div>
      </Link>
    </motion.div>
  );
}

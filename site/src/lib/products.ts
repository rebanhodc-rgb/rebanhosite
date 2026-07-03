import type { Product } from "./types";

// DADOS MOCK — substituir por CMS/DB em produção (ver PLANO.md).
// Imagens: placeholders SVG locais em /public/products. Trocar por fotos reais.

const SIZES = ["PP", "P", "M", "G", "GG"] as const;
const COLORS = [
  { name: "Off-white", hex: "#f6f3ee" },
  { name: "Preto", hex: "#1a1a18" },
];

export const products: Product[] = [
  {
    id: "cordis",
    slug: "camiseta-cordis",
    name: "Camiseta Cordis",
    tagline: "FÉ QUE TRANSFORMA",
    description:
      "Cordis nasce do coração — um sinal discreto de uma fé que transforma o cotidiano. Algodão premium, caimento reto, bordado sutil no peito.",
    priceCents: 14900,
    images: [
      { src: "/products/cordis-1.svg", alt: "Camiseta Cordis frente" },
      { src: "/products/cordis-2.svg", alt: "Camiseta Cordis detalhe" },
    ],
    colors: COLORS,
    sizes: [...SIZES],
    category: "camisetas",
    featured: true,
  },
  {
    id: "agnus",
    slug: "camiseta-agnus",
    name: "Camiseta Agnus",
    tagline: "O CORDEIRO DE DEUS",
    description:
      "Agnus celebra o Cordeiro — mansidão e força em uma peça atemporal. Algodão premium, toque macio, estampa minimalista.",
    priceCents: 14900,
    images: [
      { src: "/products/agnus-1.svg", alt: "Camiseta Agnus frente" },
      { src: "/products/agnus-2.svg", alt: "Camiseta Agnus detalhe" },
    ],
    colors: COLORS,
    sizes: [...SIZES],
    category: "camisetas",
    featured: true,
  },
  {
    id: "fides",
    slug: "camiseta-fides",
    name: "Camiseta Fides",
    tagline: "FÉ QUE MOVE MONTANHAS",
    description:
      "Fides é a fé que move montanhas — vestir uma convicção. Algodão premium, gola reforçada, acabamento impecável.",
    priceCents: 14900,
    images: [
      { src: "/products/fides-1.svg", alt: "Camiseta Fides frente" },
      { src: "/products/fides-2.svg", alt: "Camiseta Fides detalhe" },
    ],
    colors: COLORS,
    sizes: [...SIZES],
    category: "camisetas",
    featured: true,
  },
  {
    id: "veritas",
    slug: "camiseta-veritas",
    name: "Camiseta Veritas",
    tagline: "A VERDADE LIBERTA",
    description:
      "Veritas carrega a verdade que liberta — um lembrete diário. Algodão premium, modelagem confortável, tipografia exclusiva.",
    priceCents: 14900,
    images: [
      { src: "/products/veritas-1.svg", alt: "Camiseta Veritas frente" },
      { src: "/products/veritas-2.svg", alt: "Camiseta Veritas detalhe" },
    ],
    colors: COLORS,
    sizes: [...SIZES],
    category: "camisetas",
    featured: true,
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeatured(): Product[] {
  return products.filter((p) => p.featured);
}

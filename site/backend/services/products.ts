import { prisma } from "@/backend/db/prisma";
import { Product, products as fallbackProducts, getProduct as getFallbackProduct } from "@/shared/catalog";

export type ShopProduct = Product & {
  stockBySize: Record<string, number>;
  soldOut: boolean;
};

const SIZE_ORDER = ["PP", "P", "M", "G", "GG", "XGG"];

function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a);
    const ib = SIZE_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

type DbProductWithVariants = {
  id: string;
  name: string;
  slug: string;
  description: string;
  symbolicMeaning: string;
  price: unknown;
  images: string[];
  category: string;
  variants: { size: string; color: string; stock: number }[];
};

function toShopProduct(db: DbProductWithVariants, fallback?: Product): ShopProduct {
  const stockBySize: Record<string, number> = {};
  for (const variant of db.variants) {
    stockBySize[variant.size] = (stockBySize[variant.size] ?? 0) + variant.stock;
  }
  const sizes = sortSizes(Object.keys(stockBySize));
  const totalStock = Object.values(stockBySize).reduce((sum, stock) => sum + stock, 0);

  return {
    id: db.id,
    name: db.name,
    slug: db.slug,
    price: Number(db.price),
    category: db.category,
    line: fallback?.line ?? db.category,
    description: db.description,
    symbolicMeaning: db.symbolicMeaning,
    images: db.images.length > 0 ? db.images : fallback?.images ?? [],
    sizes: sizes.length > 0 ? sizes : fallback?.sizes ?? [],
    colors: fallback?.colors ?? [],
    stockBySize,
    soldOut: db.variants.length > 0 && totalStock <= 0
  };
}

function fallbackAsShopProduct(product: Product): ShopProduct {
  return { ...product, stockBySize: {}, soldOut: false };
}

/** Produtos ativos para a loja: banco como fonte, catálogo estático como fallback. */
export async function listShopProducts(): Promise<ShopProduct[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { active: true },
      include: { variants: true },
      orderBy: { createdAt: "asc" }
    });
    if (dbProducts.length === 0) return fallbackProducts.map(fallbackAsShopProduct);

    return dbProducts.map((db) => toShopProduct(db, getFallbackProduct(db.slug)));
  } catch {
    return fallbackProducts.map(fallbackAsShopProduct);
  }
}

/** Produto individual por slug, com estoque por tamanho. */
export async function getShopProduct(slug: string): Promise<ShopProduct | null> {
  try {
    const db = await prisma.product.findUnique({
      where: { slug },
      include: { variants: true }
    });
    if (db && db.active) return toShopProduct(db, getFallbackProduct(db.slug));
    if (db && !db.active) return null;
  } catch {
    // banco indisponível — usa catálogo estático
  }

  const fallback = getFallbackProduct(slug);
  return fallback ? fallbackAsShopProduct(fallback) : null;
}

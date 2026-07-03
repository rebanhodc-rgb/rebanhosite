export type Size = "PP" | "P" | "M" | "G" | "GG";

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;          // ex: "FÉ QUE TRANSFORMA"
  description: string;
  priceCents: number;       // preço em centavos
  images: ProductImage[];
  colors: { name: string; hex: string }[];
  sizes: Size[];
  category: "camisetas" | "moletons" | "acessorios";
  featured?: boolean;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  image: string;
  size: Size;
  color: string;
  qty: number;
}

import { Product } from "@/shared/catalog";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  variantId: string;
};

const cartKey = "rebanho-cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(cartKey);
  return raw ? JSON.parse(raw) : [];
}

export function saveCart(items: CartItem[]) {
  window.localStorage.setItem(cartKey, JSON.stringify(items));
  window.dispatchEvent(new Event("storage"));
}

export function addProductToCart(product: Product, size: string) {
  const current = readCart();
  const variantId = `${product.id}-${size}`;
  const found = current.find((item) => item.variantId === variantId);
  const next = found
    ? current.map((item) => (item.variantId === variantId ? { ...item, quantity: item.quantity + 1 } : item))
    : [
        ...current,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images[0],
          quantity: 1,
          size,
          variantId
        }
      ];

  saveCart(next);
  return next;
}

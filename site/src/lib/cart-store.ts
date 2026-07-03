"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  add: (item: CartItem) => void;
  remove: (productId: string, size: string, color: string) => void;
  setQty: (productId: string, size: string, color: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  count: () => number;
  totalCents: () => number;
}

const sameLine = (a: CartItem, productId: string, size: string, color: string) =>
  a.productId === productId && a.size === size && a.color === color;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) =>
            sameLine(i, item.productId, item.size, item.color)
          );
          if (existing) {
            return {
              items: s.items.map((i) =>
                sameLine(i, item.productId, item.size, item.color)
                  ? { ...i, qty: i.qty + item.qty }
                  : i
              ),
              isOpen: true,
            };
          }
          return { items: [...s.items, item], isOpen: true };
        }),
      remove: (productId, size, color) =>
        set((s) => ({
          items: s.items.filter((i) => !sameLine(i, productId, size, color)),
        })),
      setQty: (productId, size, color, qty) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              sameLine(i, productId, size, color) ? { ...i, qty } : i
            )
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      totalCents: () => get().items.reduce((n, i) => n + i.priceCents * i.qty, 0),
    }),
    { name: "rebanho-cart" }
  )
);

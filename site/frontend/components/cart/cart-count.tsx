"use client";

import { useEffect, useState } from "react";
import { readCart } from "@/frontend/lib/cart";

export function CartCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function update() {
      const items = readCart();
      setCount(items.reduce((sum, item) => sum + item.quantity, 0));
    }
    update();
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, []);

  if (count === 0) return null;

  return (
    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-copper text-[9px] font-bold text-ivory">
      {count > 9 ? "9+" : count}
    </span>
  );
}

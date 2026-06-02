"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ImagesBadge } from "@/frontend/components/product/images-badge";
import { cn } from "@/shared/utils";

interface ProductGalleryProps {
  images: string[];
  name: string;
  category: string;
}

export function ProductGallery({ images, name, category }: ProductGalleryProps) {
  if (!images.length) return null;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const active = images[selectedIndex];

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div>
      {/* Mobile: Embla swipe carousel */}
      <div className="md:hidden">
        <div className="overflow-hidden rounded-md bg-ink/10 aspect-[4/5]" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((image, i) => (
              <div key={image} className="relative flex-none w-full h-full">
                <img
                  src={image}
                  alt={`${name} — imagem ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                {i === 0 && <ImagesBadge category={category} />}
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-3">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`${name} — imagem ${i + 1}`}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                i === selectedIndex ? "bg-ink" : "bg-ink/25"
              )}
            />
          ))}
        </div>
      </div>

      {/* Desktop: thumbnail grid + main image */}
      <div className="hidden md:grid gap-3 md:grid-cols-[88px_1fr]">
        <div className="order-2 flex gap-3 md:order-1 md:flex-col">
          {images.map((image, i) => (
            <button
              key={image}
              type="button"
              aria-label={`${name} — imagem ${i + 1}`}
              onClick={() => setSelectedIndex(i)}
              className="aspect-square w-20 overflow-hidden rounded-md border border-ink/10"
            >
              <img src={image} alt="" aria-hidden="true" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
        <div className="relative order-1 aspect-[4/5] overflow-hidden rounded-md bg-ink/10 md:order-2">
          <img src={active} alt={name} className="h-full w-full object-cover" />
          <ImagesBadge category={category} />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/shared/utils";

gsap.registerPlugin(ScrollTrigger);

interface GalleryItem {
  image: string;
  title: string;
}

interface CircularGalleryProps {
  items: GalleryItem[];
  className?: string;
}

const RADIUS_RATIO = 0.42;
const CARD_WIDTH_RATIO = 0.28;

export function CircularGallery({ items, className }: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!trackRef.current || !containerRef.current) return;

    const cards = trackRef.current.querySelectorAll<HTMLDivElement>(".gallery-card");
    const total = cards.length;
    if (total === 0) return;

    const angleStep = 360 / total;

    function layout() {
      if (!trackRef.current || !containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const radius = Math.max(120, containerWidth * RADIUS_RATIO);
      const cardW = Math.max(120, Math.min(192, containerWidth * CARD_WIDTH_RATIO));
      const cardH = cardW * (4 / 3);
      cards.forEach((card, i) => {
        const angle = angleStep * i;
        const rad = (angle * Math.PI) / 180;
        gsap.set(card, {
          x: Math.sin(rad) * radius,
          z: Math.cos(rad) * radius,
          rotateY: -angle,
          width: cardW,
          height: cardH,
        });
      });
    }

    layout();

    const ro = new ResizeObserver(layout);
    ro.observe(containerRef.current);

    gsap.to(trackRef.current, {
      rotateY: 360,
      duration: 20,
      ease: "none",
      repeat: -1,
    });

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top center",
      end: "bottom center",
      onUpdate: (self) => {
        gsap.to(trackRef.current, {
          rotateY: `+=${self.getVelocity() * 0.02}`,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto",
        });
      },
    });

    return () => ro.disconnect();
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className={cn("relative h-[420px] overflow-hidden flex items-center justify-center", className)}
      style={{ perspective: "1200px" }}
    >
      <div
        ref={trackRef}
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="gallery-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 overflow-hidden"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="w-full h-full border border-gold/30 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

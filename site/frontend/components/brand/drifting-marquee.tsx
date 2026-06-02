"use client";

import {
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  motion,
} from "motion/react";
import { useRef } from "react";
import { cn } from "@/shared/utils";

function wrap(min: number, max: number, v: number) {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
}

interface DriftingMarqueeProps {
  text?: string;
  baseVelocity?: number;
  className?: string;
}

export function DriftingMarquee({
  text = "Sutil · Premium · Missionária · Fé · Missão · Comunidade ·",
  baseVelocity = 3,
  className,
}: DriftingMarqueeProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);
  const directionFactor = useRef(1);

  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className={cn("overflow-hidden py-4", className)}>
      <motion.div
        style={{ x }}
        className="flex whitespace-nowrap gap-8"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="font-subtitle text-sm uppercase tracking-widest text-gold opacity-80"
          >
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

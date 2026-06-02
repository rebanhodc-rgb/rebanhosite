"use client";

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type {
  GlobalOptions as ConfettiGlobalOptions,
  CreateTypes as ConfettiCreateTypes,
  Options as ConfettiOptions,
} from "canvas-confetti";
import confetti from "canvas-confetti";

export interface ConfettiRef {
  fire: (options?: ConfettiOptions) => void;
}

const ConfettiContext = createContext<ConfettiCreateTypes | null>(null);

const Confetti = forwardRef<
  ConfettiRef,
  React.ComponentPropsWithoutRef<"canvas"> & { options?: ConfettiGlobalOptions }
>(({ options, ...props }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [confettiInstance, setConfettiInstance] = useState<ConfettiCreateTypes | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const instance = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
        ...options,
      });
      setConfettiInstance(instance);
      return () => {
        instance.reset();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fire = useCallback((opts?: ConfettiOptions) => {
    confettiInstance?.({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ["#D7C6A3", "#F7F3EB", "#8B3E2F", "#6E8D81"],
      ...opts,
    });
  }, [confettiInstance]);

  useImperativeHandle(ref, () => ({ fire }), [fire]);

  return (
    <ConfettiContext.Provider value={confettiInstance}>
      <canvas ref={canvasRef} {...props} />
    </ConfettiContext.Provider>
  );
});

Confetti.displayName = "Confetti";

export { Confetti };
export function useConfetti() {
  return useContext(ConfettiContext);
}

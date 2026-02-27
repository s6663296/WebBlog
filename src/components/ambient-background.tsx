"use client";

import { useEffect, useRef } from "react";

type AmbientBackgroundProps = {
  children: React.ReactNode;
};

export function AmbientBackground({ children }: AmbientBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      element.style.setProperty("--spotlight-x", `${x}%`);
      element.style.setProperty("--spotlight-y", `${y}%`);
    };

    element.addEventListener("pointermove", onPointerMove);
    return () => element.removeEventListener("pointermove", onPointerMove);
  }, []);

  return (
    <div ref={containerRef} className="ambient-wrap">
      <div aria-hidden className="ambient-orb ambient-orb-1" />
      <div aria-hidden className="ambient-orb ambient-orb-2" />
      <div aria-hidden className="ambient-noise" />
      <div aria-hidden className="ambient-spotlight" />
      {children}
    </div>
  );
}

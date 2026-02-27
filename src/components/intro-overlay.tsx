"use client";

import { useEffect, useState } from "react";

const INTRO_LEAVE_MS = 820;
const INTRO_HIDE_MS = 1500;

export function IntroOverlay() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);

    mediaQuery.addEventListener("change", onChange);

    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const leaveTimer = window.setTimeout(() => {
      setIsLeaving(true);
    }, INTRO_LEAVE_MS);

    const hideTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, INTRO_HIDE_MS);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion || !isVisible) {
    return null;
  }

  return (
    <div className={`intro-layer${isLeaving ? " is-leaving" : ""}`} aria-hidden="true">
      <div className="intro-grid" />
      <div className="intro-halo intro-halo-1" />
      <div className="intro-halo intro-halo-2" />

      <div className="intro-center">
        <span className="intro-kicker">WELCOME</span>
        <span className="intro-title">Loading the experience</span>
        <span className="intro-line" />
      </div>
    </div>
  );
}

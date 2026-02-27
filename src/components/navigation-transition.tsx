"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const MIN_VISIBLE_MS = 260;

function shouldStartTransition(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) {
    return false;
  }

  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }

  const target = event.target;
  if (!(target instanceof Element)) {
    return false;
  }

  const anchor = target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) {
    return false;
  }

  if (anchor.target && anchor.target !== "_self") {
    return false;
  }

  if (anchor.hasAttribute("download")) {
    return false;
  }

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) {
    return false;
  }

  const destination = new URL(anchor.href, window.location.href);
  const current = new URL(window.location.href);

  if (destination.origin !== current.origin) {
    return false;
  }

  return destination.pathname !== current.pathname || destination.search !== current.search;
}

export function NavigationTransition() {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!shouldStartTransition(event)) {
        return;
      }

      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }

      startedAtRef.current = Date.now();
      setIsActive(true);
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const elapsed = startedAtRef.current ? Date.now() - startedAtRef.current : MIN_VISIBLE_MS;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

    hideTimerRef.current = window.setTimeout(() => {
      setIsActive(false);
      startedAtRef.current = null;
      hideTimerRef.current = null;
    }, remaining);

    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [pathname, isActive]);

  return (
    <div className={`route-transition-layer${isActive ? " is-active" : ""}`} aria-hidden="true">
      <div className="route-transition-bar" />
      <div className="route-transition-glow" />
    </div>
  );
}

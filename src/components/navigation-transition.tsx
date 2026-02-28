"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const MIN_VISIBLE_MS = 420;
const FAILSAFE_HIDE_MS = 7000;

function resolveTransitionDestination(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) {
    return null;
  }

  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return null;
  }

  const target = event.target;
  if (!(target instanceof Element)) {
    return null;
  }

  const anchor = target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) {
    return null;
  }

  if (anchor.target && anchor.target !== "_self") {
    return null;
  }

  if (anchor.hasAttribute("download")) {
    return null;
  }

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) {
    return null;
  }

  const destination = new URL(anchor.href, window.location.href);
  const current = new URL(window.location.href);

  if (destination.origin !== current.origin) {
    return null;
  }

  if (destination.pathname === current.pathname && destination.search === current.search) {
    return null;
  }

  return `${destination.pathname}${destination.search}`;
}

export function NavigationTransition() {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const fromPathRef = useRef<string | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const failsafeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const destinationRoute = resolveTransitionDestination(event);
      if (!destinationRoute) {
        return;
      }

      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      if (failsafeTimerRef.current) {
        window.clearTimeout(failsafeTimerRef.current);
        failsafeTimerRef.current = null;
      }

      startedAtRef.current = Date.now();
      fromPathRef.current = pathname;
      setIsActive(true);

      failsafeTimerRef.current = window.setTimeout(() => {
        setIsActive(false);
        startedAtRef.current = null;
        fromPathRef.current = null;
        failsafeTimerRef.current = null;
      }, FAILSAFE_HIDE_MS);
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const fromPath = fromPathRef.current;
    const hasNavigated = Boolean(fromPath && pathname !== fromPath);

    if (!hasNavigated) {
      return;
    }

    const elapsed = startedAtRef.current ? Date.now() - startedAtRef.current : MIN_VISIBLE_MS;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

    hideTimerRef.current = window.setTimeout(() => {
      setIsActive(false);
      startedAtRef.current = null;
      fromPathRef.current = null;
      hideTimerRef.current = null;
      if (failsafeTimerRef.current) {
        window.clearTimeout(failsafeTimerRef.current);
        failsafeTimerRef.current = null;
      }
    }, remaining);

    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [pathname, isActive]);

  useEffect(
    () => () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }

      if (failsafeTimerRef.current) {
        window.clearTimeout(failsafeTimerRef.current);
      }
    },
    [],
  );

  return (
    <div className={`route-transition-layer${isActive ? " is-active" : ""}`} aria-hidden="true">
      <div className="route-transition-curtain" />
      <div className="route-transition-bar" />
      <div className="route-transition-glow" />
      <div className="route-transition-center">
        <span className="route-transition-dot" />
        <span className="route-transition-label">載入中</span>
      </div>
    </div>
  );
}

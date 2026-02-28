"use client";

import { isValidElement, useCallback, useEffect, useMemo, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { normalizePostContent } from "@/lib/post-content";

type PostMarkdownProps = {
  content: string;
};

type ActiveImage = {
  src: string;
  alt: string;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

export function PostMarkdown({ content }: PostMarkdownProps) {
  const [activeImage, setActiveImage] = useState<ActiveImage | null>(null);
  const [zoom, setZoom] = useState(1);
  const renderedContent = useMemo(() => normalizePostContent(content), [content]);

  const closeLightbox = useCallback(() => {
    setActiveImage(null);
    setZoom(1);
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((current) => clampZoom(current + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((current) => clampZoom(current - ZOOM_STEP));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  useEffect(() => {
    if (!activeImage) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      }
      if (event.key === "+" || event.key === "=") {
        zoomIn();
      }
      if (event.key === "-") {
        zoomOut();
      }
      if (event.key === "0") {
        resetZoom();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeImage, closeLightbox, resetZoom, zoomIn, zoomOut]);

  const components = useMemo<Components>(
    () => ({
      p: ({ node, children }) => {
        const hasImageChild =
          node &&
          "children" in node &&
          Array.isArray(node.children) &&
          node.children.some((child) => "tagName" in child && child.tagName === "img");

        if (hasImageChild) {
          return <>{children}</>;
        }

        const compactChildren = Array.isArray(children)
          ? children.filter((child) => !(typeof child === "string" && child.trim() === ""))
          : [children];

        if (
          compactChildren.length === 1 &&
          isValidElement(compactChildren[0]) &&
          compactChildren[0].type === "figure"
        ) {
          return <>{compactChildren[0]}</>;
        }

        return <p>{children}</p>;
      },
      img: ({ src, alt }) => {
        if (typeof src !== "string" || !src.trim()) {
          return null;
        }

        const text = alt?.trim() || "文章圖片";

        return (
          <figure className="my-8">
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setActiveImage({ src, alt: text });
              }}
              className="group block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-white/15 bg-slate-950/55 p-2 text-left"
            >
              <img src={src} alt={text} loading="lazy" className="h-auto w-full rounded-xl object-contain" />
            </button>
            <figcaption className="mt-2 text-xs text-slate-400">{text} · 點擊可放大</figcaption>
          </figure>
        );
      },
    }),
    [],
  );

  return (
    <>
      <ReactMarkdown components={components}>{renderedContent}</ReactMarkdown>

      {activeImage ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="圖片放大檢視"
          onClick={closeLightbox}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 px-4 py-6"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-6xl rounded-2xl border border-white/15 bg-slate-900/75 p-3 backdrop-blur"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="truncate text-xs text-slate-200">{activeImage.alt}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={zoomOut}
                  className="rounded-lg border border-white/20 px-3 py-1 text-sm text-slate-100 transition hover:border-cyan-200 hover:text-cyan-100"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={zoomIn}
                  className="rounded-lg border border-white/20 px-3 py-1 text-sm text-slate-100 transition hover:border-cyan-200 hover:text-cyan-100"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  className="rounded-lg border border-white/20 px-3 py-1 text-sm text-slate-100 transition hover:border-cyan-200 hover:text-cyan-100"
                >
                  100%
                </button>
                <button
                  type="button"
                  onClick={closeLightbox}
                  className="rounded-lg border border-rose-200/30 px-3 py-1 text-sm text-rose-100 transition hover:border-rose-200/50"
                >
                  關閉
                </button>
              </div>
            </div>

            <div className="max-h-[75vh] overflow-auto rounded-xl border border-white/10 bg-slate-950/50 p-3">
              <img
                src={activeImage.src}
                alt={activeImage.alt}
                className="mx-auto h-auto max-w-full origin-center object-contain transition-transform duration-150"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

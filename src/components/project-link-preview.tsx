import type { CSSProperties } from "react";

type ProjectLinkPreviewProps = {
  url: string;
};

function getPreviewData(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const origin = `${parsed.protocol}//${parsed.hostname}`;

    return {
      host,
      faviconUrl: `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(origin)}`,
      thumbnailUrl: `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=800`,
    };
  } catch {
    return null;
  }
}

export function ProjectLinkPreview({ url }: ProjectLinkPreviewProps) {
  const preview = getPreviewData(url);

  if (!preview) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex cursor-pointer text-sm text-cyan-200 transition-colors duration-200 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
      >
        查看專案
      </a>
    );
  }

  const thumbStyle: CSSProperties = {
    backgroundImage: `linear-gradient(180deg, rgba(7, 12, 24, 0.08), rgba(7, 12, 24, 0.72)), url("${preview.thumbnailUrl}")`,
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group mt-4 block rounded-xl border border-white/12 bg-slate-950/35 p-2 transition-all duration-200 hover:border-cyan-200/35 hover:bg-slate-900/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
    >
      <div
        aria-hidden
        className="h-28 rounded-lg border border-white/10 bg-slate-900/50 bg-cover bg-top transition-transform duration-300 group-hover:scale-[1.02]"
        style={thumbStyle}
      />

      <div className="mt-2 flex items-center gap-2 px-1">
        <span
          aria-hidden
          className="h-[18px] w-[18px] rounded-full bg-cover bg-center"
          style={{ backgroundImage: `url("${preview.faviconUrl}")` }}
        />
        <span className="truncate text-xs text-slate-300">{preview.host}</span>
        <span className="ml-auto text-xs text-cyan-200 transition-colors duration-200 group-hover:text-cyan-100">前往</span>
      </div>
    </a>
  );
}

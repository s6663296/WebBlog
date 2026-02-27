import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mx-auto mt-20 w-[min(1120px,calc(100%-2rem))] border-t border-white/10 py-8 text-sm text-slate-400">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p>Copyright © {year} 本站保留所有權利。</p>
        <Link
          href="/admin"
          className="text-xs text-slate-500 transition-colors duration-200 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
        >
          管理入口
        </Link>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { getSiteTitle } from "@/lib/site-title";

const links = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
];

export async function SiteHeader() {
  const siteTitle = await getSiteTitle();

  return (
    <header className="sticky top-4 z-30 mx-auto w-[min(1120px,calc(100%-2rem))] rounded-full border border-white/15 bg-black/55 px-3 py-2 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="group inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_24px_rgba(56,189,248,0.8)]" />
          {siteTitle}
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="cursor-pointer rounded-full px-4 py-2 text-sm text-slate-300 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

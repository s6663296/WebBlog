import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-[min(560px,calc(100%-2rem))] items-center justify-center">
      <section className="glass-panel rounded-3xl p-8 text-center">
        <h1 className="text-3xl text-white">找不到內容</h1>
        <p className="mt-3 text-slate-300">這個頁面可能已被刪除，或是連結有誤。</p>
        <Link
          href="/"
          className="mt-6 inline-flex cursor-pointer rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-cyan-200"
        >
          回到首頁
        </Link>
      </section>
    </main>
  );
}

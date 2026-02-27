export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen w-[min(1120px,calc(100%-2rem))] items-center justify-center">
      <div className="glass-panel rounded-2xl px-6 py-4 text-sm text-cyan-100">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-300" />
          頁面切換中...
        </span>
      </div>
    </main>
  );
}

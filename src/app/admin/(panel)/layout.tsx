import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { AmbientBackground } from "@/components/ambient-background";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { requireAdminSession } from "@/lib/auth";

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminSession();

  return (
    <AmbientBackground>
      <SiteHeader />

      <main className="mx-auto w-[min(1120px,calc(100%-2rem))] pb-16 pt-20">
        <section className="glass-panel rounded-2xl p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-wide text-cyan-200">ADMIN WORKSPACE</p>
              <p className="mt-1 text-sm text-slate-300">登入帳號：{session.email}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                href="/admin"
                className="cursor-pointer rounded-lg border border-white/15 px-3 py-2 text-slate-200 transition-colors hover:bg-white/10"
              >
                可視化編輯
              </Link>
              <Link
                href="/"
                className="cursor-pointer rounded-lg border border-white/15 px-3 py-2 text-slate-200 transition-colors hover:bg-white/10"
              >
                查看前台
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-rose-100 transition-colors hover:bg-rose-400/20"
                >
                  登出
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="mt-6">{children}</section>
      </main>

      <SiteFooter />
    </AmbientBackground>
  );
}

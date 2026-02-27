import Link from "next/link";
import { AdminSubmitButton } from "@/components/admin-submit-button";
import { AmbientBackground } from "@/components/ambient-background";
import { loginAction } from "@/app/admin/login/actions";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const errorMap: Record<string, string> = {
  config: "系統尚未完成 AUTH_SECRET 設定。",
  no_admin: "尚未建立管理員帳號，請先執行資料庫初始化或 admin:upsert。",
  invalid: "請確認帳號與密碼格式。",
  credentials: "帳號或密碼錯誤。",
};

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }

  const params = await searchParams;
  const errorKey = typeof params.error === "string" ? params.error : "";
  const errorMessage = errorMap[errorKey];

  return (
    <AmbientBackground>
      <main className="mx-auto flex min-h-screen w-[min(480px,calc(100%-2rem))] items-center justify-center py-12">
        <section className="glass-panel w-full rounded-3xl p-7 md:p-8">
          <p className="text-xs tracking-wide text-cyan-200">ADMIN PANEL</p>
          <h1 className="mt-2 text-3xl text-white">登入後台</h1>
          <p className="mt-2 text-sm text-slate-300">管理文章、編輯個人資訊與更新內容。</p>

          {errorMessage ? (
            <p className="mt-4 rounded-xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {errorMessage}
            </p>
          ) : null}

          <form action={loginAction} className="mt-5 space-y-4">
            <label className="block text-sm text-slate-200" htmlFor="email">
              帳號
              <input
                id="email"
                name="email"
                type="text"
                required
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-base text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                autoComplete="username"
              />
            </label>

            <label className="block text-sm text-slate-200" htmlFor="password">
              密碼
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-base text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                autoComplete="current-password"
              />
            </label>

            <AdminSubmitButton idleLabel="登入" loadingLabel="登入中..." className="w-full py-3 text-base" />
          </form>

          <Link href="/" className="mt-4 inline-flex text-sm text-cyan-200 hover:text-cyan-100">
            回到首頁
          </Link>
        </section>
      </main>
    </AmbientBackground>
  );
}

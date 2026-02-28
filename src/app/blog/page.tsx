import Link from "next/link";
import { AmbientBackground } from "@/components/ambient-background";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { recordPostImpressions } from "@/lib/analytics";
import { getPostPreviewImage } from "@/lib/post-content";
import { getAllPublishedPosts } from "@/lib/site-data";

export const dynamic = "force-dynamic";

function getTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((tag): tag is string => typeof tag === "string");
}

function toBackgroundImage(url: string) {
  const escapedUrl = url.replace(/["\\]/g, "\\$&");
  return { backgroundImage: `url("${escapedUrl}")` };
}

export default async function BlogPage() {
  const posts = await getAllPublishedPosts();
  await recordPostImpressions(posts.map((post: (typeof posts)[number]) => post.id));

  return (
    <AmbientBackground>
      <SiteHeader />
      <main className="mx-auto w-[min(960px,calc(100%-2rem))] pb-16 pt-20">
        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h1 className="text-3xl text-white md:text-4xl">Blog</h1>
          <p className="mt-3 text-slate-300">分享開發筆記、專案拆解與 UI/UX 實作觀察。</p>
        </section>

        <section className="mt-8 space-y-4">
          {posts.length > 0 ? (
            posts.map((post: (typeof posts)[number]) => {
              const previewImage = getPostPreviewImage(post.content, post.coverImage);

              return (
                <Link
                  key={post.id}
                  href={`/blog/go/${post.slug}`}
                  prefetch={false}
                  className="group glass-panel block cursor-pointer rounded-2xl p-6 transition-all duration-200 hover:border-cyan-200/30 hover:shadow-[0_20px_50px_rgba(34,211,238,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" }).format(post.createdAt)}
                  </p>
                  <h2 className="mt-2 text-2xl text-white transition-colors duration-200 group-hover:text-cyan-100">
                    {post.title}
                  </h2>
                  {previewImage ? (
                    <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-slate-950/60">
                      <div
                        className="aspect-[16/9] bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.03]"
                        style={toBackgroundImage(previewImage)}
                      />
                    </div>
                  ) : null}
                  <p className="mt-2 max-w-2xl text-slate-300">{post.excerpt}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getTags(post.tags).map((tag) => (
                      <span key={tag} className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="glass-panel rounded-2xl p-6 text-sm text-slate-400">目前沒有可顯示的文章。</div>
          )}
        </section>
      </main>
      <SiteFooter />
    </AmbientBackground>
  );
}

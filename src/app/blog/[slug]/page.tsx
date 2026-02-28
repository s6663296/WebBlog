import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AmbientBackground } from "@/components/ambient-background";
import { PostMarkdown } from "@/components/post-markdown";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { recordPostViewBySlug } from "@/lib/analytics";
import { getPublishedPostBySlug } from "@/lib/site-data";
import { getSiteTitle } from "@/lib/site-title";

export const dynamic = "force-dynamic";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [post, siteTitle] = await Promise.all([getPublishedPostBySlug(slug), getSiteTitle()]);

  if (!post) {
    return {
      title: `文章不存在 | ${siteTitle}`,
    };
  }

  return {
    title: `${post.title} | ${siteTitle}`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  await recordPostViewBySlug(slug);

  return (
    <AmbientBackground>
      <SiteHeader />
      <main className="mx-auto w-[min(880px,calc(100%-2rem))] pb-16 pt-20">
        <article className="glass-panel rounded-3xl p-6 md:p-10">
          <Link href="/blog" className="text-sm text-cyan-200 hover:text-cyan-100">
            ← 回到文章列表
          </Link>
          <h1 className="mt-4 text-3xl text-white md:text-4xl">{post.title}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {new Intl.DateTimeFormat("zh-TW", { dateStyle: "full" }).format(post.createdAt)}
          </p>
          <div className="prose-dark mt-8 max-w-none text-base leading-7">
            <PostMarkdown content={post.content} />
          </div>
        </article>
      </main>
      <SiteFooter />
    </AmbientBackground>
  );
}

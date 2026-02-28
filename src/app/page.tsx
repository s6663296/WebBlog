import Link from "next/link";
import { AmbientBackground } from "@/components/ambient-background";
import { ProjectLinkPreview } from "@/components/project-link-preview";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { recordPostImpressions } from "@/lib/analytics";
import { getHomeData } from "@/lib/site-data";

export const dynamic = "force-dynamic";

function getTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((tag): tag is string => typeof tag === "string");
}

function getSchoolList(value?: string): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function Home() {
  const { profile, posts } = await getHomeData();
  await recordPostImpressions(posts.map((post: (typeof posts)[number]) => post.id));
  const texts = profile.homepageTexts;
  const schools = getSchoolList(profile.school);
  const featuredProjects = profile.projects.slice(0, 4);
  const moreProjects = profile.projects.slice(4);
  const featuredPosts = posts.slice(0, 4);
  const morePosts = posts.slice(4);

  return (
    <AmbientBackground>
      <SiteHeader />

      <main className="mx-auto w-[min(1120px,calc(100%-2rem))] pb-16 pt-20">
        <Reveal>
          <section className="glass-panel relative overflow-hidden rounded-3xl px-6 py-10 md:px-12 md:py-14">
            <p className="inline-flex rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs tracking-wide text-cyan-200">
              {texts.heroBadge}
            </p>
            <div className="absolute right-4 top-5 sm:right-6 sm:top-6 md:right-10 md:top-10">
              <ProfileAvatar name={profile.name} avatarUrl={profile.avatarUrl} size="lg" />
            </div>

            <div className="mt-5">
              <h1 className="max-w-3xl pr-36 text-3xl leading-tight text-white md:pr-52 md:text-5xl">
                {profile.name}
                <span className="block text-cyan-200">{profile.role}</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base text-slate-300 md:text-lg">{profile.bio}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/blog"
                  className="cursor-pointer rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
                >
                  {texts.primaryCtaLabel}
                </Link>
              </div>
            </div>
          </section>
        </Reveal>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <Reveal delay={0.05} className="glass-panel rounded-2xl p-5">
            <h2 className="text-lg text-white">學歷</h2>
            {schools.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                {schools.map((school, index) => (
                  <li key={`${school}-${index}`}>{school}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-300">尚未填寫</p>
            )}
          </Reveal>
          <Reveal delay={0.1} className="glass-panel rounded-2xl p-5">
            <h2 className="text-lg text-white">所在地</h2>
            <p className="mt-2 text-sm text-slate-300">{profile.location ?? "尚未填寫"}</p>
          </Reveal>
          <Reveal delay={0.15} className="glass-panel rounded-2xl p-5">
            <h2 className="text-lg text-white">聯絡方式</h2>
            <p className="mt-2 text-sm text-slate-300">{profile.email ?? "尚未填寫"}</p>
          </Reveal>
        </section>

        <Reveal delay={0.2}>
          <section className="mt-10 glass-panel rounded-3xl p-6 md:p-8">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl text-white">{texts.skillsTitle}</h2>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {profile.skills.length > 0 ? (
                profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400">尚未新增技能資料</p>
              )}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.25}>
          <section className="mt-10">
            <div className="mb-4 flex items-end justify-between">
                <h2 className="text-2xl text-white">{texts.projectsTitle}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {featuredProjects.length > 0 ? (
                featuredProjects.map((project) => (
                  <article
                    key={project.name}
                    className="glass-panel rounded-2xl p-5 transition-all duration-200 hover:border-cyan-200/30 hover:shadow-[0_20px_50px_rgba(34,211,238,0.12)]"
                  >
                    <h3 className="text-lg text-white">{project.name}</h3>
                    <p className="mt-2 text-sm text-slate-300">{project.description}</p>
                    {project.url ? <ProjectLinkPreview url={project.url} /> : null}
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-400">尚未新增專案資料</p>
              )}
            </div>

            {moreProjects.length > 0 ? (
              <details className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                <summary className="cursor-pointer text-sm text-cyan-200">展開更多專案（{moreProjects.length}）</summary>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {moreProjects.map((project, index) => (
                    <article
                      key={`more-${project.name}-${index}`}
                      className="glass-panel rounded-2xl p-5 transition-all duration-200 hover:border-cyan-200/30 hover:shadow-[0_20px_50px_rgba(34,211,238,0.12)]"
                    >
                      <h3 className="text-lg text-white">{project.name}</h3>
                      <p className="mt-2 text-sm text-slate-300">{project.description}</p>
                      {project.url ? <ProjectLinkPreview url={project.url} /> : null}
                    </article>
                  ))}
                </div>
              </details>
            ) : null}
          </section>
        </Reveal>

        <Reveal delay={0.3}>
          <section className="mt-12">
            <div className="mb-4 flex items-end justify-between">
                <h2 className="text-2xl text-white">{texts.postsTitle}</h2>
                <Link href="/blog" className="text-sm text-cyan-200 hover:text-cyan-100">
                  {texts.viewAllPostsLabel}
                </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {featuredPosts.length > 0 ? (
                featuredPosts.map((post: (typeof posts)[number]) => (
                  <Link
                    key={post.id}
                    href={`/blog/go/${post.slug}`}
                    prefetch={false}
                    className="group glass-panel cursor-pointer rounded-2xl p-5 transition-all duration-200 hover:border-cyan-200/30 hover:shadow-[0_20px_50px_rgba(34,211,238,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      {new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium" }).format(post.createdAt)}
                    </p>
                    <h3 className="mt-2 text-xl text-white transition-colors duration-200 group-hover:text-cyan-100">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">{post.excerpt}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {getTags(post.tags).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-400">目前尚無已發佈文章。</p>
              )}
            </div>

            {morePosts.length > 0 ? (
              <details className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                <summary className="cursor-pointer text-sm text-cyan-200">展開更多文章（{morePosts.length}）</summary>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {morePosts.map((post: (typeof posts)[number]) => (
                    <Link
                      key={`more-${post.id}`}
                      href={`/blog/go/${post.slug}`}
                      prefetch={false}
                      className="group glass-panel cursor-pointer rounded-2xl p-5 transition-all duration-200 hover:border-cyan-200/30 hover:shadow-[0_20px_50px_rgba(34,211,238,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
                    >
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium" }).format(post.createdAt)}
                      </p>
                      <h3 className="mt-2 text-xl text-white transition-colors duration-200 group-hover:text-cyan-100">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-300">{post.excerpt}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {getTags(post.tags).map((tag) => (
                          <span
                            key={`${post.id}-${tag}`}
                            className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </details>
            ) : null}
          </section>
        </Reveal>
      </main>

      <SiteFooter />
    </AmbientBackground>
  );
}

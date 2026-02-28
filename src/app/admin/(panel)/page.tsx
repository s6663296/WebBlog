import {
  addProjectAction,
  addSkillAction,
  createPostAction,
  deletePostAction,
  deleteProjectAction,
  deleteSkillAction,
  updateAvatarAction,
  updateHeroSectionAction,
  updateMetaSectionAction,
  updatePostAction,
  updatePostsSectionTextAction,
  updateProjectAction,
  updateProjectsSectionTextAction,
  updateSkillsSectionTextAction,
} from "@/app/admin/actions";
import { AdminSubmitButton } from "@/components/admin-submit-button";
import { AdminPostDraftGuard } from "@/components/admin-post-draft-guard";
import { MarkdownImageUploader } from "@/components/markdown-image-uploader";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ProjectLinkPreview } from "@/components/project-link-preview";
import { prisma } from "@/lib/prisma";
import { toProfileView } from "@/lib/types";

const postDraftFieldNames = ["title", "slug", "excerpt", "tags", "coverImage", "content"];

function getTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((tag): tag is string => typeof tag === "string");
}

function toTagsInput(value: unknown) {
  return getTags(value).join(", ");
}

function getSchoolList(value?: string): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const messageMap: Record<string, string> = {
  "saved=hero": "首頁主視覺已更新。",
  "saved=avatar": "個人照片已更新。",
  "saved=meta": "基本資訊已更新。",
  "saved=skills_text": "技能區塊文案已更新。",
  "saved=projects_text": "專案區塊標題已更新。",
  "saved=posts_text": "文章區塊文案已更新。",
  "saved=skill": "技能已新增。",
  "deleted=skill": "技能已刪除。",
  "saved=project": "專案已新增。",
  "updated=project": "專案已更新。",
  "deleted=project": "專案已刪除。",
  "saved=post": "文章已建立。",
  "updated=post": "文章已更新。",
  "deleted=post": "文章已刪除。",
};

const errorMap: Record<string, string> = {
  validation: "欄位格式有誤，請檢查後再儲存。",
  slug: "標題無法生成有效 slug，請調整後再試。",
  slug_exists: "slug 已存在，請修改標題或 slug。",
  image_unavailable: "偵測到尚未上傳完成的圖片，請重新上傳後再儲存。",
  publish_failed: "發布失敗，資料未寫入資料庫，請稍後再試。",
  missing_post: "找不到指定文章。",
  avatar_missing: "請選擇要上傳的照片檔案。",
  avatar_size: "照片太大，請上傳 25MB 以下的檔案。",
  avatar_type: "僅支援 JPG、PNG、WebP 格式。",
  avatar_write: "照片上傳失敗，請稍後再試。",
};

type AdminDashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const params = await searchParams;

  const key =
    typeof params.saved === "string"
      ? `saved=${params.saved}`
      : typeof params.updated === "string"
        ? `updated=${params.updated}`
        : typeof params.deleted === "string"
          ? `deleted=${params.deleted}`
          : "";

  const notice = messageMap[key];
  const errorKey = typeof params.error === "string" ? params.error : "";
  const errorMessage = errorMap[errorKey];

  const [profileRaw, posts] = await Promise.all([
    prisma.profile.findUnique({ where: { id: "main" } }),
    prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImage: true,
        tags: true,
        published: true,
        createdAt: true,
      },
    }),
  ]);

  const profile = toProfileView(profileRaw);
  const texts = profile.homepageTexts;
  const schools = getSchoolList(profile.school);

  return (
    <section className="space-y-6">
      {notice ? (
        <p className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {notice}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </p>
      ) : null}

      <section className="glass-panel relative overflow-hidden rounded-3xl px-6 py-10 md:px-12 md:py-14">
        <details className="peer mb-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <summary className="cursor-pointer text-sm text-cyan-200">編輯主視覺元件</summary>
          <form action={updateHeroSectionAction} className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-200" htmlFor="hero-site-title">
                網站標題
                <input
                  id="hero-site-title"
                  name="siteTitle"
                  required
                  defaultValue={texts.siteTitle}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                />
              </label>
              <label className="block text-sm text-slate-200" htmlFor="hero-name">
                大標題姓名
                <input
                  id="hero-name"
                  name="name"
                  required
                  defaultValue={profile.name}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                />
              </label>
              <label className="block text-sm text-slate-200" htmlFor="hero-role">
                職稱副標
                <input
                  id="hero-role"
                  name="role"
                  required
                  defaultValue={profile.role}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                />
              </label>
              <label className="block text-sm text-slate-200" htmlFor="hero-badge">
                小標籤
                <input
                  id="hero-badge"
                  name="homepageBadge"
                  required
                  defaultValue={texts.heroBadge}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                />
              </label>
              <label className="block text-sm text-slate-200" htmlFor="hero-primary-cta">
                主按鈕文字
                <input
                  id="hero-primary-cta"
                  name="primaryCtaLabel"
                  required
                  defaultValue={texts.primaryCtaLabel}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                />
              </label>
            </div>

            <label className="block text-sm text-slate-200" htmlFor="hero-bio">
              大標題說明文字
              <textarea
                id="hero-bio"
                name="bio"
                required
                rows={4}
                defaultValue={profile.bio}
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
              />
            </label>

            <input type="hidden" name="secondaryCtaLabel" value={texts.secondaryCtaLabel} />

            <AdminSubmitButton idleLabel="儲存主視覺" loadingLabel="儲存中..." />
          </form>
        </details>

        <p className="inline-flex rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs tracking-wide text-cyan-200">
          {texts.heroBadge}
        </p>
        <div className="absolute right-4 top-5 transition-opacity duration-200 peer-open:pointer-events-none peer-open:opacity-0 sm:right-6 sm:top-6 md:right-10 md:top-10">
          <ProfileAvatar name={profile.name} avatarUrl={profile.avatarUrl} size="lg" />
        </div>

        <div className="mt-5">
          <h1 className="max-w-3xl pr-36 text-3xl leading-tight text-white md:pr-52 md:text-5xl">
            {profile.name}
            <span className="block text-cyan-200">{profile.role}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-slate-300 md:text-lg">{profile.bio}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950">
              {texts.primaryCtaLabel}
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <details className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <summary className="cursor-pointer text-sm text-cyan-200">編輯基本資料元件</summary>

          <form action={updateAvatarAction} className="mt-4 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <ProfileAvatar name={profile.name} avatarUrl={profile.avatarUrl} size="md" />
                <p className="text-xs text-slate-400">個人照片建議使用 1:1，檔案上限 25MB。</p>
              </div>

              <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[21rem]">
                <input
                  type="file"
                  name="avatar"
                  accept="image/png,image/jpeg,image/webp"
                  required
                  className="w-full rounded-xl border border-white/15 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-cyan-300 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-900 hover:file:bg-cyan-200"
                />
                <AdminSubmitButton idleLabel="上傳個人照片" loadingLabel="上傳中..." />
              </div>
            </div>
          </form>

          <form action={updateMetaSectionAction} className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="block text-sm text-slate-200" htmlFor="meta-school">
              學歷（可多筆，每行一筆）
              <textarea
                id="meta-school"
                name="school"
                rows={3}
                defaultValue={profile.school ?? ""}
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
              />
            </label>
            <label className="block text-sm text-slate-200" htmlFor="meta-location">
              所在地
              <input
                id="meta-location"
                name="location"
                defaultValue={profile.location ?? ""}
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
              />
            </label>
            <label className="block text-sm text-slate-200" htmlFor="meta-email">
              聯絡 Email
              <input
                id="meta-email"
                name="email"
                type="email"
                defaultValue={profile.email ?? ""}
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
              />
            </label>

            <div className="md:col-span-3">
              <AdminSubmitButton idleLabel="儲存基本資料" loadingLabel="儲存中..." />
            </div>
          </form>
        </details>

        <div className="grid gap-6 md:grid-cols-3">
          <article className="glass-panel rounded-2xl p-5">
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
          </article>
          <article className="glass-panel rounded-2xl p-5">
            <h2 className="text-lg text-white">所在地</h2>
            <p className="mt-2 text-sm text-slate-300">{profile.location ?? "尚未填寫"}</p>
          </article>
          <article className="glass-panel rounded-2xl p-5">
            <h2 className="text-lg text-white">聯絡方式</h2>
            <p className="mt-2 text-sm text-slate-300">{profile.email ?? "尚未填寫"}</p>
          </article>
        </div>
      </section>

      <section className="glass-panel rounded-3xl p-6 md:p-8">
        <details className="mb-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <summary className="cursor-pointer text-sm text-cyan-200">編輯技能元件</summary>

          <form action={updateSkillsSectionTextAction} className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-200" htmlFor="skills-title">
              技能區塊標題
              <input
                id="skills-title"
                name="skillsTitle"
                required
                defaultValue={texts.skillsTitle}
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
              />
            </label>

            <div className="md:col-span-2">
              <AdminSubmitButton idleLabel="儲存技能區塊文案" loadingLabel="儲存中..." />
            </div>
          </form>

          <form action={addSkillAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block flex-1 text-sm text-slate-200" htmlFor="new-skill">
              新增技能
              <input
                id="new-skill"
                name="skill"
                required
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
              />
            </label>
            <AdminSubmitButton idleLabel="新增技能" loadingLabel="新增中..." />
          </form>
        </details>

        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl text-white">{texts.skillsTitle}</h2>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {profile.skills.length > 0 ? (
            profile.skills.map((skill, index) => (
              <div
                key={`${skill}-${index}`}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100"
              >
                <span>{skill}</span>
                <form action={deleteSkillAction}>
                  <input type="hidden" name="index" value={index} />
                  <button
                    type="submit"
                    className="cursor-pointer rounded-full bg-rose-400/20 px-2 py-0.5 text-xs text-rose-100 transition-colors hover:bg-rose-400/30"
                  >
                    刪除
                  </button>
                </form>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">尚未新增技能資料</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="mb-2 flex items-end justify-between">
          <h2 className="text-2xl text-white">{texts.projectsTitle}</h2>
        </div>

        <details className="glass-panel rounded-2xl p-4 md:p-5">
          <summary className="cursor-pointer text-sm text-cyan-200">編輯專案區塊與新增專案元件</summary>

          <form action={updateProjectsSectionTextAction} className="mt-4">
            <label className="block text-sm text-slate-200" htmlFor="projects-title">
              專案區塊標題
              <input
                id="projects-title"
                name="projectsTitle"
                required
                defaultValue={texts.projectsTitle}
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
              />
            </label>
            <div className="mt-3">
              <AdminSubmitButton idleLabel="儲存專案區塊標題" loadingLabel="儲存中..." />
            </div>
          </form>

          <form action={addProjectAction} className="mt-5 space-y-4 border-t border-white/10 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-200" htmlFor="new-project-name">
                專案名稱
                <input
                  id="new-project-name"
                  name="name"
                  required
                  className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                />
              </label>
              <label className="block text-sm text-slate-200" htmlFor="new-project-url">
                專案連結（可留空）
                <input
                  id="new-project-url"
                  name="url"
                  className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                />
              </label>
            </div>

            <label className="block text-sm text-slate-200" htmlFor="new-project-description">
              專案描述
              <textarea
                id="new-project-description"
                name="description"
                required
                rows={3}
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
              />
            </label>

            <AdminSubmitButton idleLabel="新增專案" loadingLabel="新增中..." />
          </form>
        </details>

        <div className="grid gap-4 md:grid-cols-2">
          {profile.projects.length > 0 ? (
            profile.projects.map((project, index) => (
              <article key={`${project.name}-${index}`} className="glass-panel rounded-2xl p-5">
                <details className="mb-4 rounded-xl border border-white/10 bg-slate-950/45 p-3">
                  <summary className="cursor-pointer text-sm text-cyan-200">編輯此專案元件</summary>
                  <form action={updateProjectAction} className="mt-3 space-y-3">
                    <input type="hidden" name="index" value={index} />
                    <label className="block text-sm text-slate-200" htmlFor={`project-name-${index}`}>
                      名稱
                      <input
                        id={`project-name-${index}`}
                        name="name"
                        required
                        defaultValue={project.name}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                      />
                    </label>
                    <label className="block text-sm text-slate-200" htmlFor={`project-description-${index}`}>
                      描述
                      <textarea
                        id={`project-description-${index}`}
                        name="description"
                        required
                        rows={3}
                        defaultValue={project.description}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                      />
                    </label>
                    <label className="block text-sm text-slate-200" htmlFor={`project-url-${index}`}>
                      連結（可留空）
                      <input
                        id={`project-url-${index}`}
                        name="url"
                        defaultValue={project.url ?? ""}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <AdminSubmitButton idleLabel="儲存專案" loadingLabel="儲存中..." />
                    </div>
                  </form>

                  <form action={deleteProjectAction} className="mt-2">
                    <input type="hidden" name="index" value={index} />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-lg border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-100 transition-colors hover:bg-rose-400/20"
                    >
                      刪除此專案
                    </button>
                  </form>
                </details>

                <h3 className="text-lg text-white">{project.name}</h3>
                <p className="mt-2 text-sm text-slate-300">{project.description}</p>
                {project.url ? <ProjectLinkPreview url={project.url} /> : null}
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-400">尚未新增專案資料</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-2xl text-white">{texts.postsTitle}</h2>
          <span className="text-sm text-cyan-200">{texts.viewAllPostsLabel}</span>
        </div>

        <details className="glass-panel rounded-2xl p-4 md:p-5">
          <summary className="cursor-pointer text-sm text-cyan-200">編輯文章區塊與新增文章元件</summary>

          <form action={updatePostsSectionTextAction} className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-200" htmlFor="posts-title">
                文章區塊標題
                <input
                  id="posts-title"
                  name="postsTitle"
                  required
                  defaultValue={texts.postsTitle}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                />
              </label>
              <label className="block text-sm text-slate-200" htmlFor="posts-view-all">
                查看全部文字
                <input
                  id="posts-view-all"
                  name="viewAllPostsLabel"
                  required
                  defaultValue={texts.viewAllPostsLabel}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                />
              </label>
            </div>
            <AdminSubmitButton idleLabel="儲存文章區塊文案" loadingLabel="儲存中..." />
          </form>

          <form id="new-post-form" action={createPostAction} className="mt-5 space-y-4 border-t border-white/10 pt-4">
            <AdminPostDraftGuard formId="new-post-form" storageKey="new" fieldNames={postDraftFieldNames} />
            <input type="hidden" name="returnTo" value="/admin" />
            <label className="block text-sm text-slate-200" htmlFor="new-post-title">
              標題
              <input
                id="new-post-title"
                name="title"
                required
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
              />
            </label>
            <label className="block text-sm text-slate-200" htmlFor="new-post-slug">
              Slug（可留空，自動從標題產生）
              <input
                id="new-post-slug"
                name="slug"
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
              />
            </label>
            <label className="block text-sm text-slate-200" htmlFor="new-post-excerpt">
              摘要
              <textarea
                id="new-post-excerpt"
                name="excerpt"
                required
                rows={3}
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
              />
            </label>
            <label className="block text-sm text-slate-200" htmlFor="new-post-tags">
              標籤（逗號分隔，可留空）
              <input
                id="new-post-tags"
                name="tags"
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
              />
            </label>
            <label className="block text-sm text-slate-200" htmlFor="new-post-cover-image">
              封面圖 URL（可留空）
              <input
                id="new-post-cover-image"
                name="coverImage"
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
              />
            </label>
            <label className="block text-sm text-slate-200" htmlFor="new-post-content">
              內容（可純文字，支援 Markdown）
              <textarea
                id="new-post-content"
                name="content"
                required
                rows={8}
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
              />
            </label>
            <MarkdownImageUploader textareaId="new-post-content" />
            <AdminSubmitButton idleLabel="新增文章" loadingLabel="新增中..." />
          </form>
        </details>

        <div className="grid gap-4 md:grid-cols-2">
          {posts.length > 0 ? (
            posts.map((post) => (
              <article key={post.id} className="glass-panel rounded-2xl p-5">
                <details className="mb-4 rounded-xl border border-white/10 bg-slate-950/45 p-3">
                  <summary className="cursor-pointer text-sm text-cyan-200">編輯此文章元件</summary>
                  <form id={`post-edit-form-${post.id}`} action={updatePostAction} className="mt-3 space-y-3">
                    <AdminPostDraftGuard
                      formId={`post-edit-form-${post.id}`}
                      storageKey={post.id}
                      fieldNames={postDraftFieldNames}
                    />
                    <input type="hidden" name="id" value={post.id} />
                    <input type="hidden" name="returnTo" value="/admin" />
                    <label className="block text-sm text-slate-200" htmlFor={`post-title-${post.id}`}>
                      標題
                      <input
                        id={`post-title-${post.id}`}
                        name="title"
                        required
                        defaultValue={post.title}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                      />
                    </label>
                    <label className="block text-sm text-slate-200" htmlFor={`post-slug-${post.id}`}>
                      Slug（可留空）
                      <input
                        id={`post-slug-${post.id}`}
                        name="slug"
                        defaultValue={post.slug}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                      />
                    </label>
                    <label className="block text-sm text-slate-200" htmlFor={`post-excerpt-${post.id}`}>
                      摘要
                      <textarea
                        id={`post-excerpt-${post.id}`}
                        name="excerpt"
                        required
                        rows={3}
                        defaultValue={post.excerpt}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                      />
                    </label>
                    <label className="block text-sm text-slate-200" htmlFor={`post-tags-${post.id}`}>
                      標籤（逗號分隔）
                      <input
                        id={`post-tags-${post.id}`}
                        name="tags"
                        defaultValue={toTagsInput(post.tags)}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                      />
                    </label>
                    <label className="block text-sm text-slate-200" htmlFor={`post-cover-image-${post.id}`}>
                      封面圖 URL（可留空）
                      <input
                        id={`post-cover-image-${post.id}`}
                        name="coverImage"
                        defaultValue={post.coverImage ?? ""}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                      />
                    </label>
                    <label className="block text-sm text-slate-200" htmlFor={`post-content-${post.id}`}>
                      內容（可純文字，支援 Markdown）
                      <textarea
                        id={`post-content-${post.id}`}
                        name="content"
                        required
                        rows={8}
                        defaultValue={post.content}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
                      />
                    </label>
                    <MarkdownImageUploader textareaId={`post-content-${post.id}`} />

                    <div className="flex flex-wrap gap-2">
                      <AdminSubmitButton idleLabel="儲存文章" loadingLabel="儲存中..." />
                    </div>
                  </form>

                  <form action={deletePostAction} className="mt-2">
                    <input type="hidden" name="id" value={post.id} />
                    <input type="hidden" name="returnTo" value="/admin" />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-lg border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-100 transition-colors hover:bg-rose-400/20"
                    >
                      刪除此文章
                    </button>
                  </form>
                </details>

                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {post.published ? "已發佈" : "草稿"} · {new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium" }).format(post.createdAt)}
                </p>
                <h3 className="mt-2 text-xl text-white">{post.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{post.excerpt}</p>
                <p className="mt-3 line-clamp-3 text-sm text-slate-400">{post.content}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {getTags(post.tags).map((tag) => (
                    <span key={`${post.id}-${tag}`} className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-400">目前尚無文章。</p>
          )}
        </div>
      </section>
    </section>
  );
}

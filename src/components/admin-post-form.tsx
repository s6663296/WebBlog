import { AdminSubmitButton } from "@/components/admin-submit-button";

type AdminPostFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  loadingLabel: string;
  errorMessage?: string;
  initialValues?: {
    id?: string;
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    tags?: string;
  };
};

export function AdminPostForm({
  action,
  submitLabel,
  loadingLabel,
  errorMessage,
  initialValues,
}: AdminPostFormProps) {
  return (
    <form action={action} className="space-y-4">
      {initialValues?.id ? <input type="hidden" name="id" value={initialValues.id} /> : null}

      {errorMessage ? (
        <p className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </p>
      ) : null}

      <label htmlFor="title" className="block text-sm text-slate-200">
        標題
        <input
          id="title"
          name="title"
          required
          defaultValue={initialValues?.title ?? ""}
          className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-base text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
        />
      </label>

      <label htmlFor="slug" className="block text-sm text-slate-200">
        Slug（可留空，自動由標題生成）
        <input
          id="slug"
          name="slug"
          defaultValue={initialValues?.slug ?? ""}
          className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-base text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
        />
      </label>

      <label htmlFor="excerpt" className="block text-sm text-slate-200">
        摘要
        <textarea
          id="excerpt"
          name="excerpt"
          required
          rows={3}
          defaultValue={initialValues?.excerpt ?? ""}
          className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-base text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
        />
      </label>

      <label htmlFor="coverImage" className="block text-sm text-slate-200">
        封面圖 URL（可選）
        <input
          id="coverImage"
          name="coverImage"
          defaultValue={initialValues?.coverImage ?? ""}
          className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-base text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
        />
      </label>

      <label htmlFor="tags" className="block text-sm text-slate-200">
        標籤（逗號分隔）
        <input
          id="tags"
          name="tags"
          defaultValue={initialValues?.tags ?? ""}
          placeholder="nextjs, uiux, engineering"
          className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-base text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
        />
      </label>

      <label htmlFor="content" className="block text-sm text-slate-200">
        內容（支援 Markdown）
        <textarea
          id="content"
          name="content"
          required
          rows={14}
          defaultValue={initialValues?.content ?? ""}
          className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-base leading-7 text-slate-100 outline-none ring-cyan-300 transition focus-visible:ring-2"
        />
      </label>

      <AdminSubmitButton idleLabel={submitLabel} loadingLabel={loadingLabel} />
    </form>
  );
}

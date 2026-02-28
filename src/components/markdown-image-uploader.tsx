"use client";

import { useId, useState } from "react";

type MarkdownImageUploaderProps = {
  textareaId: string;
};

type UploadResponse = {
  url?: string;
  message?: string;
  storage?: "file" | "inline";
};

function toAltText(fileName: string) {
  const nameWithoutExt = fileName.replace(/\.[^.]+$/, "").trim();
  if (!nameWithoutExt) {
    return "文章圖片";
  }

  return nameWithoutExt.replace(/[-_]+/g, " ");
}

function insertImageMarkdown(textarea: HTMLTextAreaElement, markdown: string) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const previous = textarea.value;
  const nextValue = `${previous.slice(0, start)}${markdown}${previous.slice(end)}`;

  textarea.value = nextValue;
  const caret = start + markdown.length;
  textarea.selectionStart = caret;
  textarea.selectionEnd = caret;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.focus();
}

export function MarkdownImageUploader({ textareaId }: MarkdownImageUploaderProps) {
  const inputId = useId();
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const onUploadClick = async () => {
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!file) {
      setStatusMessage("請先選擇圖片後再上傳。");
      return;
    }

    setIsUploading(true);
    setStatusMessage("圖片上傳中...");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/admin/post-images", {
        method: "POST",
        body: formData,
      });

      let payload: UploadResponse = {};
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        payload = (await response.json()) as UploadResponse;
      }

      if (!response.ok || typeof payload.url !== "string") {
        if (payload.message) {
          setStatusMessage(payload.message);
          return;
        }

        if (response.status === 413) {
          setStatusMessage("圖片太大，請改用較小檔案後再試。");
          return;
        }

        setStatusMessage("圖片上傳失敗，請稍後再試。");
        return;
      }

      const textarea = document.getElementById(textareaId) as HTMLTextAreaElement | null;
      if (!textarea) {
        setStatusMessage("找不到文章內容欄位，請重新整理後再試。");
        return;
      }

      const altText = toAltText(file.name);
      const markdown = `\n![${altText}](${payload.url})\n`;
      insertImageMarkdown(textarea, markdown);
      if (input) {
        input.value = "";
      }

      setStatusMessage(payload.message ?? "圖片已插入內容，可直接預覽與儲存。");
    } catch {
      setStatusMessage("圖片上傳失敗，請稍後再試。");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
      <p className="text-xs text-slate-300">文章圖片上傳（支援 JPG、PNG、WebP、GIF，單檔 8MB 內）</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="w-full rounded-xl border border-white/15 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-cyan-300 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-900 hover:file:bg-cyan-200"
        />
        <button
          type="button"
          onClick={onUploadClick}
          disabled={isUploading}
          className="cursor-pointer rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isUploading ? "上傳中..." : "上傳並插入"}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-400">{statusMessage || "上傳成功後會自動插入圖片，不需要手動寫 Markdown。"}</p>
    </div>
  );
}

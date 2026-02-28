const IMAGE_URL_LINE_PATTERN = /^(?:https?:\/\/\S+|\/\S+)\.(?:png|jpe?g|webp|gif|avif|svg)(?:\?\S*)?$/i;

export function normalizePostContent(content: string) {
  const repairedMarkdown = content
    .replace(/\r\n/g, "\n")
    .replace(/(^|\n)\s*['’]\s*(?=!\[[^\]]*\]\s*\n?\s*\()/g, "$1")
    .replace(/(!\[[^\]]*\])\s*\n+\s*\(((?:https?:\/\/|\/)[^\s)]+)\)/g, "$1($2)")
    .replace(/(!\[[^\]]*\])\s+\(((?:https?:\/\/|\/)[^\s)]+)\)/g, "$1($2)");

  return repairedMarkdown
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("![")) {
        return line;
      }

      if (!IMAGE_URL_LINE_PATTERN.test(trimmed)) {
        return line;
      }

      return `![文章圖片](${trimmed})`;
    })
    .join("\n")
    .trim();
}

export function extractMarkdownImageUrls(content: string) {
  const normalized = normalizePostContent(content);
  const matches = normalized.matchAll(/!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g);
  return Array.from(new Set(Array.from(matches, (match) => match[1]).filter(Boolean)));
}

export function getPostPreviewImage(content: string, coverImage?: string | null) {
  if (coverImage?.trim()) {
    return coverImage.trim();
  }

  const firstImage = extractMarkdownImageUrls(content)[0];
  return firstImage?.trim() || null;
}

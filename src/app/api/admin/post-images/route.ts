import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_POST_IMAGE_FILE_SIZE = 8 * 1024 * 1024;
const POST_IMAGE_MIME_MAP: Record<string, { mimeType: string; extension: string }> = {
  "image/jpeg": { mimeType: "image/jpeg", extension: "jpg" },
  "image/png": { mimeType: "image/png", extension: "png" },
  "image/webp": { mimeType: "image/webp", extension: "webp" },
  "image/gif": { mimeType: "image/gif", extension: "gif" },
};

function toError(status: number, message: string) {
  return NextResponse.json({ message }, { status });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return toError(401, "請先登入後台再上傳圖片。");
  }

  const formData = await request.formData();
  const file = formData.get("image");

  if (!(file instanceof File) || file.size === 0) {
    return toError(400, "請選擇要上傳的圖片檔案。");
  }

  if (file.size > MAX_POST_IMAGE_FILE_SIZE) {
    return toError(400, "檔案太大，請上傳 8MB 以下圖片。");
  }

  const imageType = POST_IMAGE_MIME_MAP[file.type];
  if (!imageType) {
    return toError(400, "僅支援 JPG、PNG、WebP、GIF 格式。");
  }

  const data = Buffer.from(await file.arrayBuffer());

  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "posts");
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}-${randomUUID()}.${imageType.extension}`;
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, data);

    const url = `/uploads/posts/${fileName}`;

    return NextResponse.json({
      url,
      fileName,
      mimeType: imageType.mimeType,
      storage: "file",
    });
  } catch {
    try {
      const url = `data:${imageType.mimeType};base64,${data.toString("base64")}`;

      return NextResponse.json({
        url,
        fileName: file.name,
        mimeType: imageType.mimeType,
        storage: "inline",
        message: "目前環境無法寫入檔案，已改用內嵌圖片方式。",
      });
    } catch {
      return toError(500, "圖片處理失敗，請稍後再試。");
    }
  }
}

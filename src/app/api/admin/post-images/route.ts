import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getAdminSession } from "@/lib/auth";
import { getSupabaseStorageConfig } from "@/lib/supabase-admin";

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

  const storageConfig = getSupabaseStorageConfig();
  if (!storageConfig) {
    return toError(500, "尚未設定 Supabase Storage，請先完成環境變數設定。");
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
  const fileName = `${Date.now()}-${randomUUID()}.${imageType.extension}`;
  const objectPath = `posts/${fileName}`;

  try {
    const { error } = await storageConfig.client.storage.from(storageConfig.bucket).upload(objectPath, data, {
      contentType: imageType.mimeType,
      upsert: false,
    });

    if (error) {
      return toError(500, "圖片上傳失敗，請稍後再試。");
    }

    const { data: publicUrlData } = storageConfig.client.storage
      .from(storageConfig.bucket)
      .getPublicUrl(objectPath);

    if (!publicUrlData.publicUrl) {
      return toError(500, "圖片上傳成功，但無法取得公開網址。");
    }

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      fileName: objectPath,
      mimeType: imageType.mimeType,
      storage: "supabase",
    });
  } catch {
    return toError(500, "圖片處理失敗，請稍後再試。");
  }
}

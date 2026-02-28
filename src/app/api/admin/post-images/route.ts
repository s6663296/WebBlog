import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_POST_IMAGE_FILE_SIZE = 8 * 1024 * 1024;
const POST_IMAGE_MIME_MAP: Record<string, string> = {
  "image/jpeg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
  "image/gif": "image/gif",
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

  const mimeType = POST_IMAGE_MIME_MAP[file.type];
  if (!mimeType) {
    return toError(400, "僅支援 JPG、PNG、WebP、GIF 格式。");
  }

  try {
    const data = await file.arrayBuffer();
    const url = `data:${mimeType};base64,${Buffer.from(data).toString("base64")}`;

    return NextResponse.json({
      url,
      fileName: file.name,
      mimeType,
    });
  } catch {
    return toError(500, "圖片處理失敗，請稍後再試。");
  }
}

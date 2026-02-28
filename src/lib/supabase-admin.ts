import { createClient } from "@supabase/supabase-js";

type SupabaseStorageConfig = {
  bucket: string;
  client: ReturnType<typeof createClient>;
};

export function getSupabaseStorageConfig(): SupabaseStorageConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "post-images";

  if (!url || !serviceRoleKey) {
    return null;
  }

  return {
    bucket,
    client: createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }),
  };
}

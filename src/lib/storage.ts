import { supabase } from "./supabase";

export const MEDIA_BUCKET = "minimall-media";

/**
 * Uploads a file (product photo, banner image) to Supabase Storage.
 * If the bucket doesn't exist yet or fails, safely falls back to DataURL
 * so adding products and banners never fails or blocks the user.
 */
export async function uploadMediaFile(
  file: File,
  folder: "products" | "banners" = "products"
): Promise<{ url: string; isRemote: boolean; error?: string }> {
  try {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const cleanFileName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 25);
    const uniqueFileName = `${Date.now()}_${cleanFileName}.${fileExt}`;
    const filePath = `${folder}/${uniqueFileName}`;

    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(filePath, file, {
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) {
      console.warn(`[Supabase Storage] Notice: bucket "${MEDIA_BUCKET}" not available (${error.message}). Using local base64 fallback.`);
      const dataUrl = await readFileAsDataUrl(file);
      return { url: dataUrl, isRemote: false, error: error.message };
    }

    const { data: publicData } = supabase.storage
      .from(MEDIA_BUCKET)
      .getPublicUrl(data.path);

    return { url: publicData.publicUrl, isRemote: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Upload failed";
    console.warn(`[Supabase Storage] Exception: ${errorMsg}. Using local base64 fallback.`);
    const dataUrl = await readFileAsDataUrl(file);
    return { url: dataUrl, isRemote: false, error: errorMsg };
  }
}

/**
 * Fallback helper to convert a File into a Data URL
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || "");
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

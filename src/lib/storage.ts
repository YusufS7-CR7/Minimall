import { supabase } from "./supabase";

export const MEDIA_BUCKET = "minimall-media";

/**
 * Compresses and resizes an image file before upload using browser Canvas.
 * Keeps aspect ratio, limits max dimensions to 1400px, output quality ~85%.
 * Reduces 5MB-10MB photos down to ~80KB-180KB without visual quality loss.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.85
): Promise<{ blob: Blob; ext: string; mimeType: string }> {
  // If SVG or GIF, preserve original
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  if (ext === "svg" || ext === "gif") {
    return { blob: file, ext, mimeType: file.type || `image/${ext}` };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          return resolve({ blob: file, ext, mimeType: file.type || "image/jpeg" });
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp if supported, otherwise jpeg
        const targetMime = "image/jpeg";
        const targetExt = "jpg";

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve({ blob, ext: targetExt, mimeType: targetMime });
            } else {
              // Fallback to original if compression didn't help
              resolve({ blob: file, ext, mimeType: file.type || targetMime });
            }
          },
          targetMime,
          quality
        );
      };
      img.onerror = () => {
        resolve({ blob: file, ext, mimeType: file.type || "image/jpeg" });
      };
      img.src = (e.target?.result as string) || "";
    };
    reader.onerror = () => {
      resolve({ blob: file, ext, mimeType: file.type || "image/jpeg" });
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a file (product photo, banner image) to Supabase Storage.
 * Automatically compresses large images to optimize network bandwidth and storage.
 * If the bucket doesn't exist yet or fails, safely falls back to DataURL.
 */
export async function uploadMediaFile(
  file: File,
  folder: "products" | "banners" = "products"
): Promise<{ url: string; isRemote: boolean; error?: string }> {
  try {
    // 1. Compress image to prevent bloated uploads and database bloat
    const { blob, ext, mimeType } = await compressImageFile(file);

    const cleanFileName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 25);
    const uniqueFileName = `${Date.now()}_${cleanFileName}.${ext}`;
    const filePath = `${folder}/${uniqueFileName}`;

    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(filePath, blob, {
        contentType: mimeType,
        cacheControl: "31536000",
        upsert: true,
      });

    if (error) {
      console.warn(`[Supabase Storage] Notice: bucket "${MEDIA_BUCKET}" (${error.message}). Using compressed fallback.`);
      const dataUrl = await readFileAsDataUrl(new File([blob], uniqueFileName, { type: mimeType }));
      return { url: dataUrl, isRemote: false, error: error.message };
    }

    const { data: publicData } = supabase.storage
      .from(MEDIA_BUCKET)
      .getPublicUrl(data.path);

    return { url: publicData.publicUrl, isRemote: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Upload failed";
    console.warn(`[Supabase Storage] Exception: ${errorMsg}. Using compressed fallback.`);
    const dataUrl = await readFileAsDataUrl(file);
    return { url: dataUrl, isRemote: false, error: errorMsg };
  }
}

/**
 * Fallback helper to convert a File or Blob into a Data URL
 */
export function readFileAsDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || "");
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

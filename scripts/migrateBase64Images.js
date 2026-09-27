import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pptastuhmpzdyjeyhfts.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdGFzdHVobXB6ZHlqZXloZnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MTc4ODUsImV4cCI6MjEwNDI5Mzg4NX0.tZazXTeRiAs8CaiGzr139JyBCPI7_0JQlpieMOOOxO8";

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const BUCKET = "minimall-media";

function parseBase64(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
  if (!match) return null;
  const rawExt = match[1].toLowerCase();
  const ext = rawExt === "jpeg" ? "jpg" : rawExt;
  const buffer = Buffer.from(match[2], "base64");
  return {
    buffer,
    ext,
    mimeType: `image/${rawExt}`,
  };
}

async function uploadToStorage(buffer, fileName, mimeType) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(`products/${fileName}`, buffer, {
      contentType: mimeType,
      cacheControl: "31536000",
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return publicData.publicUrl;
}

async function run() {
  console.log("Fetching all products from Supabase...");
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, image, images");

  if (error) {
    console.error("Failed to fetch products:", error);
    return;
  }

  console.log(`Loaded ${products.length} products. Scanning for base64 images...`);

  let totalMigrated = 0;
  let totalBytesSaved = 0;

  for (const product of products) {
    let changed = false;
    let newImage = product.image;
    let newImages = Array.isArray(product.images) ? [...product.images] : [];

    // Check main image
    if (newImage && newImage.startsWith("data:image/")) {
      const parsed = parseBase64(newImage);
      if (parsed) {
        const fileName = `img_${product.id}_main_${Date.now()}.${parsed.ext}`;
        try {
          const publicUrl = await uploadToStorage(parsed.buffer, fileName, parsed.mimeType);
          totalBytesSaved += newImage.length - publicUrl.length;
          newImage = publicUrl;
          changed = true;
          console.log(`Product #${product.id} ("${product.name.slice(0, 25)}"): uploaded main image -> ${publicUrl}`);
        } catch (e) {
          console.error(`Failed to upload main image for product #${product.id}:`, e.message);
        }
      }
    }

    // Check gallery images
    for (let i = 0; i < newImages.length; i++) {
      const img = newImages[i];
      if (img && typeof img === "string" && img.startsWith("data:image/")) {
        const parsed = parseBase64(img);
        if (parsed) {
          const fileName = `img_${product.id}_gal_${i}_${Date.now()}.${parsed.ext}`;
          try {
            const publicUrl = await uploadToStorage(parsed.buffer, fileName, parsed.mimeType);
            totalBytesSaved += img.length - publicUrl.length;
            newImages[i] = publicUrl;
            changed = true;
            console.log(`Product #${product.id} ("${product.name.slice(0, 25)}"): uploaded gallery image [${i}] -> ${publicUrl}`);
          } catch (e) {
            console.error(`Failed to upload gallery image [${i}] for product #${product.id}:`, e.message);
          }
        }
      }
    }

    if (changed) {
      const { error: updateError } = await supabase
        .from("products")
        .update({
          image: newImage,
          images: newImages,
        })
        .eq("id", product.id);

      if (updateError) {
        console.error(`Failed to update product #${product.id} in DB:`, updateError.message);
      } else {
        totalMigrated++;
        console.log(`Successfully updated product #${product.id} in database.`);
      }
    }
  }

  console.log("\n==========================================");
  console.log(`Migration Complete!`);
  console.log(`Products updated: ${totalMigrated}`);
  console.log(`Estimated database payload reduced by: ${(totalBytesSaved / (1024 * 1024)).toFixed(2)} MB`);
  console.log("==========================================");
}

run().catch(console.error);

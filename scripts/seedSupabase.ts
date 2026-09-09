import { createClient } from "@supabase/supabase-js";
import { CATEGORIES } from "../src/data/categories";
import { PRODUCTS } from "../src/data/products";
import { INITIAL_BANNER_SLIDES } from "../src/data/bannerTypes";

const supabaseUrl = "https://pptastuhmpzdyjeyhfts.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdGFzdHVobXB6ZHlqZXloZnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MTc4ODUsImV4cCI6MjEwNDI5Mzg4NX0.tZazXTeRiAs8CaiGzr139JyBCPI7_0JQlpieMOOOxO8";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log("Seeding Supabase database...");

  // 1. Categories
  console.log(`Inserting ${CATEGORIES.length} categories...`);
  const categoriesData = CATEGORIES.map((c) => ({
    key: c.key,
    slug: c.slug,
    label_ru: c.labelRu,
    label_uz: c.labelUz,
    icon: c.icon,
    image: c.image,
  }));
  const { error: catErr } = await supabase.from("categories").upsert(categoriesData, { onConflict: "key" });
  if (catErr) console.error("Categories error:", catErr);
  else console.log("✓ Categories seeded successfully");

  // 2. Products
  console.log(`Inserting ${PRODUCTS.length} products...`);
  const productsData = PRODUCTS.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    name_uz: p.nameUz,
    brand: p.brand,
    category: p.category,
    price: p.price,
    old_price: p.oldPrice || null,
    image: p.image,
    images: p.images || [p.image],
    voltage: p.voltage || null,
    power: p.power || null,
    type: p.type || "corded",
    desc_ru: p.descRu,
    desc_uz: p.descUz,
    specs: p.specs || {},
    badge: p.badge || null,
    in_stock: p.inStock,
    rating: p.rating || 5.0,
  }));
  const { error: prodErr } = await supabase.from("products").upsert(productsData, { onConflict: "id" });
  if (prodErr) console.error("Products error:", prodErr);
  else console.log("✓ Products seeded successfully");

  // 3. Banners
  console.log(`Inserting ${INITIAL_BANNER_SLIDES.length} banners...`);
  const bannersData = INITIAL_BANNER_SLIDES.map((b) => ({
    id: b.id,
    title_ru: b.titleRu,
    title_uz: b.titleUz,
    desc_ru: b.descRu,
    desc_uz: b.descUz,
    image: b.image,
    link: b.link || null,
    is_active: b.isActive,
    badge1: b.badge1 || null,
    badge2: b.badge2 || null,
    badge3: b.badge3 || null,
  }));
  const { error: banErr } = await supabase.from("banners").upsert(bannersData, { onConflict: "id" });
  if (banErr) console.error("Banners error:", banErr);
  else console.log("✓ Banners seeded successfully");

  console.log("Seeding completed!");
}

seed();

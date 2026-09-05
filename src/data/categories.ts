import type { CategoryDef } from "./types";

export const CATEGORIES: CategoryDef[] = [
  {
    key: "drills",
    slug: "elektroinstumenty",
    icon: "🔌",
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200&h=200&fit=crop&auto=format",
    labelRu: "Электроинструменты",
    labelUz: "Elektr asboblar",
  },
  {
    key: "grinders",
    slug: "sad-i-ogorod",
    icon: "🌿",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop&auto=format",
    labelRu: "Всё для сада",
    labelUz: "Bog' uchun",
  },
  {
    key: "saws",
    slug: "bytovaya-tehnika",
    icon: "🏠",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop&auto=format",
    labelRu: "Бытовая техника",
    labelUz: "Maishiy texnika",
  },
  {
    key: "measuring",
    slug: "vodyanye-nasosy",
    icon: "💧",
    image:
      "https://ikarvon.uz/storage/products/July2024/UH6gQ8ecoKFAGJfrSFFJ.png",
    labelRu: "Водяные насосы",
    labelUz: "Suv nasoslari",
  },
  {
    key: "welding",
    slug: "ruchnye-instrumenty",
    icon: "🔧",
    image:
      "https://tekman.com.ua/wp-content/uploads/2018/04/instrument-slide1-760x700-1.jpg",
    labelRu: "Ручные инструменты",
    labelUz: "Qo'l asboblari",
  },
  {
    key: "compressors",
    slug: "elektrika-i-svet",
    icon: "💡",
    image:
      "https://lu.ru/images/articles/lampochki-dlya-doma-5.jpg",
    labelRu: "Электрика и свет",
    labelUz: "Elektrika va yorug'lik",
  },
  {
    key: "generators",
    slug: "nizkovoltnoye-oborudovanie",
    icon: "⚡",
    image:
      "https://www.ec74.ru/images/catalogue/avtomat_vikl_1.jpg",
    labelRu: "Низковольтное оборудование",
    labelUz: "Past kuchlanish uskunalari",
  },
  {
    key: "handtools",
    slug: "santehnika",
    icon: "🔩",
    image:
      "https://iccvortex.uz/wp-content/uploads/2023/11/f9262981_5b14_11e7_80e9_00265586-1.png",
    labelRu: "Сантехника",
    labelUz: "Santexnika",
  },
];

/** Look up a CategoryDef by its URL slug */
export function getCategoryBySlug(slug: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** Look up a CategoryDef by its key */
export function getCategoryByKey(key: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.key === key);
}

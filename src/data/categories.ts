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
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&h=200&fit=crop&auto=format",
    labelRu: "Водяные насосы",
    labelUz: "Suv nasoslari",
  },
  {
    key: "welding",
    slug: "ruchnye-instrumenty",
    icon: "🔧",
    image:
      "https://images.unsplash.com/photo-1530124566582-a45a7e3e29f0?w=200&h=200&fit=crop&auto=format",
    labelRu: "Ручные инструменты",
    labelUz: "Qo'l asboblari",
  },
  {
    key: "compressors",
    slug: "elektrika-i-svet",
    icon: "💡",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop&auto=format",
    labelRu: "Электрика и свет",
    labelUz: "Elektrika va yorug'lik",
  },
  {
    key: "generators",
    slug: "nizkovoltnoye-oborudovanie",
    icon: "⚡",
    image:
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=200&h=200&fit=crop&auto=format",
    labelRu: "Низковольтное оборудование",
    labelUz: "Past kuchlanish uskunalari",
  },
  {
    key: "handtools",
    slug: "santehnika",
    icon: "🔩",
    image:
      "https://images.unsplash.com/photo-1504382103100-db7e92322d95?w=200&h=200&fit=crop&auto=format",
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

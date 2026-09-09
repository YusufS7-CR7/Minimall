import type { CategoryDef } from "./types";

export const CATEGORIES: CategoryDef[] = [
  {
    key: "drills",
    slug: "elektroinstumenty",
    icon: "🔌",
    image:
      "https://iccvortex.uz/wp-content/uploads/2023/12/DSFFD-181.png",
    labelRu: "Электроинструменты",
    labelUz: "Elektr asboblar",
  },
  {
    key: "grinders",
    slug: "sad-i-ogorod",
    icon: "🌿",
    image:
      "https://image.made-in-china.com/2f0j00RsyiOgJlEapc/4-Pieces-Garden-Tools-Set-Hot-Sale-on-Amazon-Non-Slip-Handle-Trowel-Transplanter-Rake-Hoe.webp",
    labelRu: "Всё для сада",
    labelUz: "Bog' uchun",
  },
  {
    key: "saws",
    slug: "bytovaya-tehnika",
    icon: "🏠",
    image:
      "https://ikarvon.uz/storage/products/July2026/xdwGlgll0MZ04S4RjGaUc-small.png.pagespeed.ic.1lQlvido9u.jpg",
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

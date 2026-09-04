import type { Product } from "./types";

// ─── Slug Helpers ─────────────────────────────────────────────────────────────

/**
 * Converts a product name to a URL-safe slug.
 * e.g. "Угловая шлифмашина Makita GA5030" → "makita-ga5030"
 * For SEO we prioritize the model number from the name.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[а-я]/g, (c) => {
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
        ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
        н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
        ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
        ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
      };
      return map[c] || c;
    })
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Find a product by its slug */
export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/** Find products by brand slug */
export function getProductsByBrand(brandSlug: string): Product[] {
  return PRODUCTS.filter((p) => slugify(p.brand) === brandSlug);
}

/** Unique brand list */
export const BRANDS = ["Bosch", "Makita", "DeWalt", "Milwaukee", "Metabo", "Hilti"];

// ─── Product Data ─────────────────────────────────────────────────────────────

export const PRODUCTS: Product[] = [
  {
    id: 1,
    slug: "bosch-gsr-18v-55",
    name: "Дрель-шуруповёрт Bosch GSR 18V-55",
    nameUz: "Bosch GSR 18V-55 burg'u-burgi",
    brand: "Bosch",
    category: "drills",
    price: 1250000,
    oldPrice: 1490000,
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=600&fit=crop&auto=format",
    ],
    voltage: "18V",
    power: "55Нм",
    type: "cordless",
    descRu:
      "Профессиональная аккумуляторная дрель-шуруповёрт Bosch GSR 18V-55 с высоким крутящим моментом 55 Нм. Идеально подходит для завинчивания, сверления и ударного сверления. Совместима с аккумуляторами Bosch 18V Professional.",
    descUz:
      "Yuqori burilish momentiga (55 Nm) ega Bosch GSR 18V-55 professional akkumulyatorli burg'u-burgi. Vintlash, burg'ulash va zarb bilan burg'ulash uchun ideal. Bosch 18V Professional akkumulyatorlari bilan mos keladi.",
    specs: {
      "Крутящий момент": "55 Нм",
      Скорость: "0–1750 об/мин",
      Патрон: "13 мм",
      Вес: "1.9 кг",
      АКБ: "18V 4.0 Ah",
      Режимов: "2",
    },
    badge: "Хит",
    inStock: true,
    rating: 5,
  },
  {
    id: 2,
    slug: "makita-ga5030",
    name: "Угловая шлифмашина Makita GA5030",
    nameUz: "Makita GA5030 burchak silliqlash mashinasi",
    brand: "Makita",
    category: "grinders",
    price: 890000,
    image:
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=600&fit=crop&auto=format",
    ],
    voltage: "220V",
    power: "720Вт",
    type: "corded",
    descRu:
      "Надёжная угловая шлифмашина Makita GA5030 для резки и шлифовки металла, камня и плитки. Мощность 720 Вт, диск 125 мм, скорость вращения 11 000 об/мин.",
    descUz:
      "Metall, tosh va plitkani kesish va silliqlash uchun ishonchli Makita GA5030 burchak silliqlash mashinasi. Quvvati 720 Vt, diski 125 mm, aylanish tezligi 11 000 ayl/daqiqa.",
    specs: {
      Мощность: "720 Вт",
      Диск: "125 мм",
      Скорость: "11000 об/мин",
      Вес: "1.8 кг",
    },
    inStock: true,
    rating: 4,
  },
  {
    id: 3,
    slug: "dewalt-dch253m2",
    name: "Перфоратор DeWalt DCH253M2",
    nameUz: "DeWalt DCH253M2 perforator",
    brand: "DeWalt",
    category: "drills",
    price: 2100000,
    oldPrice: 2400000,
    image:
      "https://images.unsplash.com/photo-1530124566582-a45a7e3e29f0?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1530124566582-a45a7e3e29f0?w=600&h=600&fit=crop&auto=format",
    ],
    voltage: "18V",
    power: "1.7Дж",
    type: "cordless",
    descRu:
      "Мощный аккумуляторный перфоратор DeWalt DCH253M2 SDS Plus для бурения в бетоне, кирпиче и камне. Энергия удара 1.7 Дж, три режима работы.",
    descUz:
      "Beton, g'isht va toshda burg'ulash uchun quvvatli DeWalt DCH253M2 SDS Plus perforator. Zarba energiyasi 1.7 J, uch xil ish rejimi.",
    specs: {
      "Энергия удара": "1.7 Дж",
      "Макс. бур": "26 мм",
      Режимы: "3",
      Вес: "2.8 кг",
    },
    badge: "Новинка",
    inStock: true,
    rating: 5,
  },
  {
    id: 4,
    slug: "milwaukee-m18-blcs66",
    name: "Циркулярная пила Milwaukee M18",
    nameUz: "Milwaukee M18 BLCS66 aylana arra",
    brand: "Milwaukee",
    category: "saws",
    price: 1950000,
    image:
      "https://images.unsplash.com/photo-1504382103100-db7e92322d95?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1504382103100-db7e92322d95?w=600&h=600&fit=crop&auto=format",
    ],
    voltage: "18V",
    power: "3600 об/мин",
    type: "cordless",
    descRu:
      "Профессиональная аккумуляторная циркулярная пила Milwaukee M18 с бесщёточным двигателем. Диск 165 мм, глубина реза до 57 мм.",
    descUz:
      "Cho'tkasiz dvigatelga ega Milwaukee M18 professional akkumulyatorli aylana arra. Disk 165 mm, kesish chuqurligi 57 mm gacha.",
    specs: {
      Диск: "165 мм",
      "Глубина реза 90°": "57 мм",
      Скорость: "3600 об/мин",
      Вес: "3.2 кг",
    },
    inStock: true,
    rating: 4,
  },
  {
    id: 5,
    slug: "bosch-gll-3-80",
    name: "Лазерный уровень Bosch GLL 3-80",
    nameUz: "Bosch GLL 3-80 lazer nivelirlash moslamasi",
    brand: "Bosch",
    category: "measuring",
    price: 1680000,
    image:
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop&auto=format",
    ],
    voltage: "N/A",
    power: "3 луча",
    type: "battery",
    descRu:
      "Профессиональный 3-лучевой лазерный уровень Bosch GLL 3-80 с функцией самовыравнивания. Дальность 30 м, точность ±0.2 мм/м.",
    descUz:
      "O'z-o'zini tekislash funksiyasi bilan Bosch GLL 3-80 professional 3 nurli lazer. Masofasi 30 m, aniqligi ±0.2 mm/m.",
    specs: {
      Лучи: "3 (1H + 2V)",
      Дальность: "30 м",
      Точность: "±0.2 мм/м",
      Вес: "0.7 кг",
    },
    badge: "Хит",
    inStock: true,
    rating: 5,
  },
  {
    id: 6,
    slug: "resanta-315a",
    name: "Сварочный инвертор Ресанта 315А",
    nameUz: "Resanta 315A payvandlash invertori",
    brand: "Metabo",
    category: "welding",
    price: 3200000,
    oldPrice: 3800000,
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=600&fit=crop&auto=format",
    ],
    voltage: "220V",
    power: "6800Вт",
    type: "corded",
    descRu:
      "Профессиональный инверторный сварочный аппарат TIG/MMA Ресанта 315А. Сварочный ток 10–315 А, мощность 6800 Вт, ПВ 60% — 230 А.",
    descUz:
      "Resanta 315A TIG/MMA professional invertor payvandlash aparati. Payvandlash toki 10–315 A, quvvati 6800 Vt.",
    specs: {
      Ток: "10–315 А",
      Мощность: "6800 Вт",
      "ПВ 60%": "230 А",
      Вес: "5.6 кг",
    },
    inStock: true,
    rating: 4,
  },
  {
    id: 7,
    slug: "makita-mac320q",
    name: "Компрессор Makita MAC320Q",
    nameUz: "Makita MAC320Q kompressor",
    brand: "Makita",
    category: "compressors",
    price: 2750000,
    oldPrice: 2950000,
    image:
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=600&fit=crop&auto=format",
    ],
    voltage: "220V",
    power: "1100Вт",
    type: "corded",
    descRu:
      "Малошумный поршневой компрессор Makita MAC320Q для пневматического инструмента. Давление 8 бар, ресивер 6 л, уровень шума 58 дБ(А).",
    descUz:
      "Pnevmatik asboblar uchun Makita MAC320Q kam shovqinli porshenli kompressor. Bosimi 8 bar, siqilgan havo hajmi 6 l, shovqin darajasi 58 dB(A).",
    specs: {
      Давление: "8 бар",
      Ресивер: "6 л",
      "Производит.": "165 л/мин",
      Шум: "58 дБ(А)",
    },
    inStock: true,
    rating: 3,
  },
  {
    id: 8,
    slug: "total-tmt460013",
    name: "Цифровой мультиметр TOTAL TMT460013",
    nameUz: "TOTAL TMT460013 raqamli multimetr",
    brand: "Hilti",
    category: "measuring",
    price: 512500,
    image:
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop&auto=format",
    ],
    voltage: "N/A",
    power: "N/A",
    type: "battery",
    descRu:
      "Цифровой мультиметр TOTAL TMT460013 с автоматическим выбором диапазона. Дисплей 6000 отсчётов, категория CAT III 600V.",
    descUz:
      "Avtomatik diapazon tanlash bilan TOTAL TMT460013 raqamli multimetr. Displeyi 6000 hisobga, CAT III 600V kategoriyasi.",
    specs: {
      Дисплей: "6000 отсчётов",
      CAT: "III 600V",
      "Авто-диапазон": "Да",
      Вес: "0.3 кг",
    },
    inStock: true,
    rating: 4,
  },
  {
    id: 9,
    slug: "bosch-screwdriver-set-25",
    name: "Набор отвёрток Bosch 25 предметов",
    nameUz: "Bosch 25 ta dona otvertka to'plami",
    brand: "Bosch",
    category: "handtools",
    price: 185000,
    image:
      "https://images.unsplash.com/photo-1530124566582-a45a7e3e29f0?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1530124566582-a45a7e3e29f0?w=600&h=600&fit=crop&auto=format",
    ],
    voltage: "N/A",
    power: "N/A",
    type: "manual",
    descRu:
      "Профессиональный набор отвёрток Bosch 25 предметов с рукоятками SoftGrip. Биты из хром-ванадиевой стали, удобный кейс для хранения.",
    descUz:
      "SoftGrip dastakli 25 ta donali professional Bosch otvertka to'plami. Xrom-vanadiy po'latdan yasalgan bitlar, qulay saqlash qutisi.",
    specs: {
      Предметов: "25",
      Биты: "Хром-ванадий",
      Рукоятка: "SoftGrip",
      Кейс: "Есть",
    },
    inStock: true,
    rating: 5,
  },
  {
    id: 10,
    slug: "makita-df333dwye",
    name: "Шуруповёрт Makita DF333DWYE",
    nameUz: "Makita DF333DWYE burgi",
    brand: "Makita",
    category: "drills",
    price: 780000,
    oldPrice: 920000,
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=600&fit=crop&auto=format",
    ],
    voltage: "12V",
    power: "30Нм",
    type: "cordless",
    descRu:
      "Компактный аккумуляторный шуруповёрт Makita DF333DWYE для бытовых и полупрофессиональных задач. Крутящий момент 30 Нм, вес всего 1.0 кг.",
    descUz:
      "Maishiy va yarim professional vazifalar uchun Makita DF333DWYE ixcham akkumulyatorli burgi. Burilish momenti 30 Nm, vazni atigi 1.0 kg.",
    specs: {
      "Крутящий момент": "30 Нм",
      Скорость: "0–1300 об/мин",
      Патрон: "10 мм",
      Вес: "1.0 кг",
    },
    inStock: true,
    rating: 4,
  },
  {
    id: 11,
    slug: "milwaukee-m18-bljs",
    name: "Лобзик Milwaukee M18 BLJS",
    nameUz: "Milwaukee M18 BLJS lobzik",
    brand: "Milwaukee",
    category: "saws",
    price: 1420000,
    image:
      "https://images.unsplash.com/photo-1504382103100-db7e92322d95?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1504382103100-db7e92322d95?w=600&h=600&fit=crop&auto=format",
    ],
    voltage: "18V",
    power: "3200 ход/мин",
    type: "cordless",
    descRu:
      "Профессиональный аккумуляторный лобзик Milwaukee M18 BLJS с бесщёточным двигателем. Рез дерева до 135 мм, металла до 10 мм.",
    descUz:
      "Cho'tkasiz dvigatelga ega Milwaukee M18 BLJS professional akkumulyatorli lobzik. Yog'och kesish 135 mm gacha, metall 10 mm gacha.",
    specs: {
      Ходов: "3200 ход/мин",
      "Рез дерева": "135 мм",
      "Рез металла": "10 мм",
      Вес: "2.4 кг",
    },
    inStock: true,
    rating: 4,
  },
  {
    id: 12,
    slug: "hilti-ag-125-s",
    name: "Болгарка Hilti AG 125-S",
    nameUz: "Hilti AG 125-S bolgacha",
    brand: "Hilti",
    category: "grinders",
    price: 1100000,
    image:
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=600&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=600&fit=crop&auto=format",
    ],
    voltage: "220V",
    power: "1350Вт",
    type: "corded",
    descRu:
      "Профессиональная угловая шлифмашина Hilti AG 125-S с плавным пуском и системой защиты от перегрузки. Мощность 1350 Вт.",
    descUz:
      "Silliq ishga tushirish va haddan tashqari yuklanishdan himoya tizimiga ega Hilti AG 125-S professional burchak silliqlash mashinasi. Quvvati 1350 Vt.",
    specs: {
      Мощность: "1350 Вт",
      Диск: "125 мм",
      Скорость: "11000 об/мин",
      Вес: "2.2 кг",
    },
    badge: "Новинка",
    inStock: true,
    rating: 5,
  },
];

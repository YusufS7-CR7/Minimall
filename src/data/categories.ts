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
    subcategories: [
      { key: "akkumulyatornye-otvertki", slug: "akkumulyatornye-otvertki", labelRu: "Аккумуляторные отвёртки", labelUz: "Akkumulyatorli o'rgichilar" },
      { key: "bormashiny", slug: "bormashiny", labelRu: "Бормашины", labelUz: "Bormashina" },
      { key: "gaykoverty", slug: "gaykoverty", labelRu: "Гайковёрты", labelUz: "Gaykao'rgichilar" },
      { key: "dreli", slug: "dreli", labelRu: "Дрели", labelUz: "Burg'ulagichlar" },
      { key: "lobziki", slug: "lobziki", labelRu: "Лобзики", labelUz: "Arra (lob)" },
      { key: "mikksery-elektro", slug: "miksery-elektro", labelRu: "Миксеры (эл.)", labelUz: "Mikserlar" },
      { key: "nastolnye-pily", slug: "nastolnye-pily", labelRu: "Настольные пилы", labelUz: "Stol arralari" },
      { key: "nozhnicy-metall", slug: "nozhnicy-metall", labelRu: "Ножницы по металлу", labelUz: "Metal qaychilar" },
      { key: "otboynye-molotki", slug: "otboynye-molotki", labelRu: "Отбойные молотки", labelUz: "Bolg'acha (zarb)" },
      { key: "perforatory", slug: "perforatory", labelRu: "Перфораторы", labelUz: "Perforatorlar" },
      { key: "pily-diskovye", slug: "pily-diskovye", labelRu: "Пилы дисковые", labelUz: "Disk arralari" },
      { key: "pily-torcovochnye", slug: "pily-torcovochnye", labelRu: "Пилы торцовочные", labelUz: "Torcovka arralari" },
      { key: "pnevmoinstrument", slug: "pnevmoinstrument", labelRu: "Пневмоинструмент", labelUz: "Pnevmo asboblar" },
      { key: "polirovahnye-mashiny", slug: "polirovalnye-mashiny", labelRu: "Полировальные машины", labelUz: "Jilolash mashinalari" },
      { key: "shlifmashiny", slug: "shlifmashiny", labelRu: "Шлифмашины", labelUz: "Silliqlash mashinalari" },
      { key: "shurupoverty", slug: "shurupoverty", labelRu: "Шуруповёрты", labelUz: "Shurupo'rgichilar" },
    ],
  },
  {
    key: "grinders",
    slug: "sad-i-ogorod",
    icon: "🌿",
    image:
      "https://image.made-in-china.com/2f0j00RsyiOgJlEapc/4-Pieces-Garden-Tools-Set-Hot-Sale-on-Amazon-Non-Slip-Handle-Trowel-Transplanter-Rake-Hoe.webp",
    labelRu: "Всё для сада",
    labelUz: "Bog' uchun",
    subcategories: [
      { key: "benzopily", slug: "benzopily", labelRu: "Бензопилы", labelUz: "Benzin arralari" },
      { key: "gazonokosylki", slug: "gazonokosylki", labelRu: "Газонокосилки", labelUz: "Maysazorlar" },
      { key: "kustorezy", slug: "kustorezy", labelRu: "Кусторезы / Триммеры", labelUz: "Kesuvchilar / Trimmerlar" },
      { key: "kultyvatory", slug: "kultyvatory", labelRu: "Культиваторы", labelUz: "Kultivátor" },
      { key: "minitraktor", slug: "minitraktor", labelRu: "Мини-тракторы", labelUz: "Mini-traktorlar" },
      { key: "motobloki", slug: "motobloki", labelRu: "Мотоблоки", labelUz: "Motobloklar" },
      { key: "opryskivateli", slug: "opryskivateli", labelRu: "Опрыскиватели", labelUz: "Purkagichlar" },
      { key: "sad-ruchnye", slug: "sad-ruchnye", labelRu: "Ручной садовый инвентарь", labelUz: "Qo'l bog' asboblari" },
    ],
  },
  {
    key: "saws",
    slug: "bytovaya-tehnika",
    icon: "🏠",
    image:
      "https://ikarvon.uz/storage/products/July2026/xdwGlgll0MZ04S4RjGaUc-small.png.pagespeed.ic.1lQlvido9u.jpg",
    labelRu: "Бытовая техника",
    labelUz: "Maishiy texnika",
    subcategories: [
      { key: "blendery", slug: "blendery", labelRu: "Блендеры", labelUz: "Blenderlar" },
      { key: "vafelnicy", slug: "vafelnicy", labelRu: "Вафельницы / Грили", labelUz: "Vafelnilar / Grilli" },
      { key: "hlebopechki", slug: "hlebopechki", labelRu: "Хлебопечки", labelUz: "Non pishirgichlar" },
      { key: "kofevarki", slug: "kofevarki", labelRu: "Кофеварки", labelUz: "Qahva mashinalar" },
      { key: "miksery-bytovye", slug: "miksery-bytovye", labelRu: "Миксеры бытовые", labelUz: "Maishiy mikserlar" },
      { key: "myasorubki", slug: "myasorubki", labelRu: "Мясорубки", labelUz: "Go'sht maydalagich" },
      { key: "pylesos", slug: "pylesos", labelRu: "Пылесосы", labelUz: "Chang so'rg'ichlar" },
      { key: "utyugi", slug: "utyugi", labelRu: "Утюги", labelUz: "Dazmollar" },
    ],
  },
  {
    key: "measuring",
    slug: "vodyanye-nasosy",
    icon: "💧",
    image:
      "https://ikarvon.uz/storage/products/July2024/UH6gQ8ecoKFAGJfrSFFJ.png",
    labelRu: "Водяные насосы",
    labelUz: "Suv nasoslari",
    subcategories: [
      { key: "drenazhnye-nasosy", slug: "drenazhnye-nasosy", labelRu: "Дренажные насосы", labelUz: "Drenaj nasoslar" },
      { key: "kanalizacionnye-nasosy", slug: "kanalizacionnye-nasosy", labelRu: "Канализационные насосы", labelUz: "Kanalizatsiya nasoslar" },
      { key: "nasosnye-stancii", slug: "nasosnye-stancii", labelRu: "Насосные станции", labelUz: "Nasos stansiyalari" },
      { key: "pogreuzhnye-nasosy", slug: "pogreuzhnye-nasosy", labelRu: "Погружные насосы", labelUz: "Cho'mqich nasoslar" },
      { key: "poverhnostnye-nasosy", slug: "poverhnostnye-nasosy", labelRu: "Поверхностные насосы", labelUz: "Yuza nasoslar" },
      { key: "skvazhinnye-nasosy", slug: "skvazhinnye-nasosy", labelRu: "Скважинные насосы", labelUz: "Quduq nasoslar" },
    ],
  },
  {
    key: "welding",
    slug: "ruchnye-instrumenty",
    icon: "🔧",
    image:
      "https://tekman.com.ua/wp-content/uploads/2018/04/instrument-slide1-760x700-1.jpg",
    labelRu: "Ручные инструменты",
    labelUz: "Qo'l asboblari",
    subcategories: [
      { key: "klyuchi", slug: "klyuchi", labelRu: "Ключи", labelUz: "Kalitlar" },
      { key: "molotki", slug: "molotki", labelRu: "Молотки / Кувалды", labelUz: "Bolg'alar" },
      { key: "naborytool", slug: "nabory-instrumentov", labelRu: "Наборы инструментов", labelUz: "Asboblar to'plami" },
      { key: "otvyortki", slug: "otvyortki", labelRu: "Отвёртки", labelUz: "O'rgichilar" },
      { key: "ploskogubcy", slug: "ploskogubcy", labelRu: "Плоскогубцы / Кусачки", labelUz: "Keski / Qisqich" },
      { key: "urovni", slug: "urovni", labelRu: "Уровни / Рулетки", labelUz: "Darajalar / O'lchov lentasi" },
      { key: "shtangencirkuli", slug: "shtangencirkuli", labelRu: "Штангенциркули", labelUz: "Shtangensiркul" },
    ],
  },
  {
    key: "compressors",
    slug: "elektrika-i-svet",
    icon: "💡",
    image:
      "https://lu.ru/images/articles/lampochki-dlya-doma-5.jpg",
    labelRu: "Электрика и свет",
    labelUz: "Elektrika va yorug'lik",
    subcategories: [
      { key: "lampy", slug: "lampy", labelRu: "Лампы и светильники", labelUz: "Chiroqlar" },
      { key: "prozhektory", slug: "prozhektory", labelRu: "Прожекторы", labelUz: "Prожекторlar" },
      { key: "rozetki-vykey", slug: "rozetki-vyklyuchateli", labelRu: "Розетки / Выключатели", labelUz: "Rozetkalar / Kalitlar" },
      { key: "kabeli", slug: "kabeli", labelRu: "Кабели и провода", labelUz: "Kabel va simlar" },
      { key: "schetchiki", slug: "schetchiki", labelRu: "Счётчики электроэнергии", labelUz: "Elektr o'lchagichlar" },
      { key: "udlinitely", slug: "udlinitely", labelRu: "Удлинители / Сетевые фильтры", labelUz: "Uzaytgichlar" },
    ],
  },
  {
    key: "generators",
    slug: "nizkovoltnoye-oborudovanie",
    icon: "⚡",
    image:
      "https://www.ec74.ru/images/catalogue/avtomat_vikl_1.jpg",
    labelRu: "Низковольтное оборудование",
    labelUz: "Past kuchlanish uskunalari",
    subcategories: [
      { key: "avtomaty", slug: "avtomaty", labelRu: "Автоматические выключатели", labelUz: "Avtomatik uzgichlar" },
      { key: "uzo", slug: "uzo", labelRu: "УЗО / Дифавтоматы", labelUz: "UZO / Difavtomatlar" },
      { key: "schity", slug: "schity", labelRu: "Щиты и боксы", labelUz: "Qalqonlar va qutular" },
      { key: "transformatory", slug: "transformatory", labelRu: "Трансформаторы", labelUz: "Transformatorlar" },
      { key: "genratory", slug: "generatory", labelRu: "Генераторы", labelUz: "Generatorlar" },
      { key: "stabilizatory", slug: "stabilizatory", labelRu: "Стабилизаторы напряжения", labelUz: "Kuchlanish stabilizatorlari" },
      { key: "akb-invertery", slug: "akb-invertery", labelRu: "АКБ / Инверторы", labelUz: "AKB / Inverterlar" },
    ],
  },
  {
    key: "handtools",
    slug: "santehnika",
    icon: "🔩",
    image:
      "https://iccvortex.uz/wp-content/uploads/2023/11/f9262981_5b14_11e7_80e9_00265586-1.png",
    labelRu: "Сантехника",
    labelUz: "Santexnika",
    subcategories: [
      { key: "smesiteli", slug: "smesiteli", labelRu: "Смесители", labelUz: "Armatürlar" },
      { key: "unitazy", slug: "unitazy", labelRu: "Унитазы / Инсталляции", labelUz: "Unitazlar" },
      { key: "truby", slug: "truby", labelRu: "Трубы и фитинги", labelUz: "Quvurlar va fitinglar" },
      { key: "radiatory", slug: "radiatory", labelRu: "Радиаторы отопления", labelUz: "Isitish radiatorlari" },
      { key: "vanny", slug: "vanny", labelRu: "Ванны и душевые", labelUz: "Vanna va dushlar" },
      { key: "vodogrey", slug: "vodogrey", labelRu: "Водонагреватели", labelUz: "Suv isitgichlar" },
    ],
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

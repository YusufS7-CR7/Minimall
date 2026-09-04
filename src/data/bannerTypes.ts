export interface BannerSlide {
  id: string;
  titleRu: string;
  titleUz: string;
  descRu: string;
  descUz: string;
  image: string; // URL or base64 DataURL
  link?: string;
  isActive: boolean;
  badge1?: string;
  badge2?: string;
  badge3?: string;
}

export const INITIAL_BANNER_SLIDES: BannerSlide[] = [
  {
    id: "banner-1",
    titleRu: "Новое поступление Bosch Professional",
    titleUz: "Bosch Professional yangi mahsulotlar",
    descRu: "Официальные поставки профессионального инструмента с официальной гарантией. Перфораторы, болгарки, лазерные уровни.",
    descUz: "Rasmiy kafolat bilan professional asboblarni yetkazib berish. Perforatorlar, bolgarkalar, lazer sathlari.",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&h=500&fit=crop&auto=format",
    link: "/catalog",
    isActive: true,
    badge1: "Оригинал",
    badge2: "Быстрая доставка",
    badge3: "Лучшие цены",
  },
  {
    id: "banner-2",
    titleRu: "Инструменты Makita — японская надежность",
    titleUz: "Makita asboblari — yapon ishonchliligi",
    descRu: "Шуруповерты, дисковые пилы и аккумуляторные системы 18V LXT в наличии со склада в Ташкенте.",
    descUz: "Buragichlar, diskli arralar va 18V LXT akkumulyator tizimlari Toshkentdagi ombordan mavjud.",
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1200&h=500&fit=crop&auto=format",
    link: "/brand/makita",
    isActive: true,
    badge1: "Япония",
    badge2: "Гарантия 1 год",
    badge3: "Скидки до 15%",
  },
  {
    id: "banner-3",
    titleRu: "Спецпредложение для строительных бригад",
    titleUz: "Qurilish brigadalari uchun maxsus taklif",
    descRu: "Оптовые скидки до 20% на комплексные закупки оборудования. Безналичный расчет с НДС и доставка на объект.",
    descUz: "Uskunalarni ommaviy xarid qilishda 20% gacha chegirmalar. QQS bilan hisob-kitob va obyektga yetkazish.",
    image: "https://images.unsplash.com/photo-1530124566582-a45a7e3e29f0?w=1200&h=500&fit=crop&auto=format",
    link: "/catalog",
    isActive: true,
    badge1: "Оптом дешевле",
    badge2: "Работаем с НДС",
    badge3: "Любые объемы",
  },
  {
    id: "banner-4",
    titleRu: "DeWalt — мощь американских стандартов",
    titleUz: "DeWalt — Amerika standartlari quvvati",
    descRu: "Сверхнадежный инструмент XR FlexVolt для самых тяжелых нагрузок на стройплощадке.",
    descUz: "Qurilish maydonidagi eng og'ir ishlar uchun ishonchli XR FlexVolt asboblari.",
    image: "https://images.unsplash.com/photo-1504382103100-db7e92322d95?w=1200&h=500&fit=crop&auto=format",
    link: "/brand/dewalt",
    isActive: true,
    badge1: "Heavy Duty",
    badge2: "Бесщеточные",
    badge3: "Доставка",
  },
];

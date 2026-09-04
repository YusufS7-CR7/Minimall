import type { Lang } from "./types";

type Translations = {
  siteName: string;
  tagline: string;
  searchPlaceholder: string;
  allCategories: string;
  catalog: string;
  filters: string;
  brand: string;
  type: string;
  voltage: string;
  power: string;
  priceRange: string;
  applyFilters: string;
  resetFilters: string;
  addToCart: string;
  inStock: string;
  outOfStock: string;
  characteristics: string;
  description: string;
  from: string;
  news: string;
  favorites: string;
  cart: string;
  login: string;
  ourLocation: string;
  locationDesc: string;
  address: string;
  workHours: string;
  phone: string;
  email: string;
  coordinates: string;
  aboutUs: string;
  contacts: string;
  delivery: string;
  payment: string;
  warranty: string;
  returns: string;
  forBusiness: string;
  wholesale: string;
  partnership: string;
  tenders: string;
  copyright: string;
  privacyPolicy: string;
  publicOffer: string;
  subscribe: string;
  subscribeBtn: string;
  emailPlaceholder: string;
  discounts: string;
  brands: string;
  serviceCenters: string;
  allCategoriesLink: string;
  advantages: string;
  backToHome: string;
  breadcrumbHome: string;
  buyInTashkent: string;
  newsItems: { title: string; desc: string; date: string }[];
  advantageItems: { title: string; desc: string }[];
};

export const T: Record<Lang, Translations> = {
  ru: {
    siteName: "Minimall",
    tagline: "ИНТЕРНЕТ-МАГАЗИН",
    searchPlaceholder: "Я хочу купить ...",
    allCategories: "Все категории",
    catalog: "Каталог",
    filters: "Фильтры",
    brand: "Бренд",
    type: "Тип питания",
    voltage: "Напряжение",
    power: "Мощность",
    priceRange: "Цена",
    applyFilters: "Применить",
    resetFilters: "Сбросить",
    addToCart: "В корзину",
    inStock: "В наличии",
    outOfStock: "Нет в наличии",
    characteristics: "Характеристики",
    description: "Описание",
    from: "от",
    news: "Новости",
    favorites: "Избранное",
    cart: "Корзина",
    login: "Войти",
    ourLocation: "Наш адрес",
    locationDesc:
      "Приходите к нам в шоу-рум и убедитесь в качестве инструмента лично",
    address: "г. Ташкент, ул. Амира Темура, 107Б",
    workHours: "Пн–Сб: 9:00–19:00, Вс: 10:00–17:00",
    phone: "+998 (97) 036 36 36",
    email: "info@minimall.uz",
    coordinates: "41°21'21.1\"N 69°14'41.8\"E",
    aboutUs: "О нас",
    contacts: "Контакты",
    delivery: "Доставка",
    payment: "Оплата",
    warranty: "Гарантия",
    returns: "Возврат товара",
    forBusiness: "Для юридических лиц",
    wholesale: "Оптовые закупки",
    partnership: "Партнёрство",
    tenders: "Тендеры",
    copyright: "© 2024 Minimall. Все права защищены.",
    privacyPolicy: "Политика конфиденциальности",
    publicOffer: "Публичная оферта",
    subscribe: "Подписаться на новости",
    subscribeBtn: "Подписаться",
    emailPlaceholder: "Ваш email",
    discounts: "Скидки",
    brands: "Бренды",
    serviceCenters: "Сервисные центры",
    allCategoriesLink: "Все категории",
    advantages: "Преимущества",
    backToHome: "На главную",
    breadcrumbHome: "Главная",
    buyInTashkent: "купить в Ташкенте",
    newsItems: [
      {
        title: "Сварочные аппараты MMA",
        desc: "Интернет-магазин Minimall предлагает купить сварочные аппараты MMA в Ташкенте на максимально выгодных для вас условиях.",
        date: "15 авг 2024",
      },
      {
        title: "Скидки до 30% на инструменты Makita",
        desc: "До конца сентября действуют специальные цены на весь ассортимент Makita — успейте обновить свой арсенал.",
        date: "10 авг 2024",
      },
      {
        title: "Открытие нового шоу-рума",
        desc: "Minimall открывает расширенный шоу-рум — теперь можно протестировать любой инструмент перед покупкой.",
        date: "1 авг 2024",
      },
      {
        title: "DeWalt FLEXVOLT: революция",
        desc: "Новая платформа DeWalt FLEXVOLT совместима со всеми аккумуляторами 20V MAX.",
        date: "25 июл 2024",
      },
    ],
    advantageItems: [
      { title: "Оригинальное качество", desc: "Только сертифицированные товары" },
      { title: "Быстрая доставка", desc: "По всему Узбекистану за 1-3 дня" },
      { title: "Доступные цены", desc: "Прямые поставки без посредников" },
      {
        title: "Гарантия и сервис",
        desc: "Официальная гарантия от производителя",
      },
      { title: "Удобная оплата", desc: "Наличные, карта, рассрочка" },
      {
        title: "Профессиональная консультация",
        desc: "Поможем с выбором",
      },
    ],
  },
  uz: {
    siteName: "Minimall",
    tagline: "INTERNET-DO'KON",
    searchPlaceholder: "Men sotib olmoqchiman ...",
    allCategories: "Barcha kategoriyalar",
    catalog: "Katalog",
    filters: "Filtrlar",
    brand: "Brend",
    type: "Quvvat turi",
    voltage: "Kuchlanish",
    power: "Quvvat",
    priceRange: "Narx",
    applyFilters: "Qo'llash",
    resetFilters: "Tozalash",
    addToCart: "Savatga",
    inStock: "Mavjud",
    outOfStock: "Mavjud emas",
    characteristics: "Xususiyatlar",
    description: "Tavsif",
    from: "dan",
    news: "Yangiliklar",
    favorites: "Sevimlilar",
    cart: "Savat",
    login: "Kirish",
    ourLocation: "Bizning manzil",
    locationDesc: "Showroomimizga kelib, asbob sifatini o'zingiz ko'ring",
    address: "Toshkent sh., Amir Temur ko'chasi, 107B",
    workHours: "Du–Sh: 9:00–19:00, Ya: 10:00–17:00",
    phone: "+998 (97) 036 36 36",
    email: "info@minimall.uz",
    coordinates: "41°21'21.1\"N 69°14'41.8\"E",
    aboutUs: "Biz haqimizda",
    contacts: "Aloqa",
    delivery: "Yetkazib berish",
    payment: "To'lov",
    warranty: "Kafolat",
    returns: "Qaytarish",
    forBusiness: "Yuridik shaxslar uchun",
    wholesale: "Ulgurji xaridlar",
    partnership: "Hamkorlik",
    tenders: "Tenderlar",
    copyright: "© 2024 Minimall. Barcha huquqlar himoyalangan.",
    privacyPolicy: "Maxfiylik siyosati",
    publicOffer: "Ommaviy taklif",
    subscribe: "Yangiliklarga obuna bo'ling",
    subscribeBtn: "Obuna bo'lish",
    emailPlaceholder: "Email manzilingiz",
    discounts: "Chegirmalar",
    brands: "Brendlar",
    serviceCenters: "Servis markazlari",
    allCategoriesLink: "Barcha kategoriyalar",
    advantages: "Afzalliklar",
    backToHome: "Bosh sahifaga",
    breadcrumbHome: "Bosh sahifa",
    buyInTashkent: "Toshkentda sotib olish",
    newsItems: [
      {
        title: "MMA payvandlash apparatlari",
        desc: "Minimall internet-do'koni Toshkentda MMA payvandlash apparatlarini eng qulay shartlarda sotib olishni taklif etadi.",
        date: "15 Avg 2024",
      },
      {
        title: "Makita asboblariga 30% gacha chegirma",
        desc: "Sentyabr oxirigacha barcha Makita assortimentiga maxsus narxlar amal qiladi.",
        date: "10 Avg 2024",
      },
      {
        title: "Toshkentda yangi showroom ochilishi",
        desc: "Minimall 800 m² maydonli kengaytirilgan showroom ochadi.",
        date: "1 Avg 2024",
      },
      {
        title: "DeWalt FLEXVOLT: inqilob",
        desc: "Yangi DeWalt FLEXVOLT platformasi barcha 20V MAX akkumulyatorlar bilan mos keladi.",
        date: "25 Iyl 2024",
      },
    ],
    advantageItems: [
      { title: "Original sifat", desc: "Faqat sertifikatlangan tovarlar" },
      {
        title: "Tez yetkazib berish",
        desc: "O'zbekiston bo'ylab 1-3 kunda",
      },
      {
        title: "Arzon narxlar",
        desc: "Vositachilarsiz to'g'ridan-to'g'ri",
      },
      {
        title: "Kafolat va xizmat",
        desc: "Ishlab chiqaruvchidan rasmiy kafolat",
      },
      { title: "Qulay to'lov", desc: "Naqd pul, karta, bo'lib to'lash" },
      {
        title: "Professional maslahat",
        desc: "Tanlashda yordam beramiz",
      },
    ],
  },
};

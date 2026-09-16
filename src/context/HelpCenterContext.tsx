import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { InfoModalSection } from "@/components/ui/InfoModal";

export interface HelpSectionData {
  id: InfoModalSection;
  icon: string;
  labelRu: string;
  labelUz: string;
  badgeRu?: string;
  badgeUz?: string;
  titleRu: string;
  titleUz: string;
  descriptionRu?: string;
  descriptionUz?: string;
  /** Detailed HTML or markdown or formatted text body for this section */
  contentRu: string;
  contentUz: string;
  /** Key metrics or badges */
  stats?: { value: string; labelRu: string; labelUz: string }[];
  /** FAQ or Q&A accordion items */
  faqList?: { qRu: string; qUz: string; aRu: string; aUz: string }[];
  /** Contacts details */
  contacts?: {
    phone: string;
    email: string;
    telegram: string;
    addressRu: string;
    addressUz: string;
    hoursRu: string;
    hoursUz: string;
  };
}

const STORAGE_KEY = "minimall_help_center_v1";

export const INITIAL_HELP_SECTIONS: Record<InfoModalSection, HelpSectionData> = {
  about: {
    id: "about",
    icon: "🏢",
    labelRu: "О компании",
    labelUz: "Kompaniya haqida",
    badgeRu: "Официальный поставщик инструмента с 2018 года",
    badgeUz: "2018 yildan beri rasmiy asboblar yetkazib beruvchi",
    titleRu: "mini-mall.uz — Эксперт и надежный маркетплейс инструмента в Узбекистане",
    titleUz: "mini-mall.uz — O'zbekistonda ishonchli asboblar va uskunalar bozori",
    descriptionRu:
      "Более 6 лет мы обеспечиваем частных мастеров, профессиональные монтажные бригады и крупнейшие строительные холдинги Узбекистана оригинальным электроинструментом, силовым оборудованием и расходными материалами мирового уровня.",
    descriptionUz:
      "6 yildan ortiq vaqt davomida biz xususiy ustalar, montaj guruhlari va O'zbekistonning yirik qurilish xoldinglarini jahon darajasidagi original elektr asboblari va uskunalari bilan ta'minlab kelmoqdamiz.",
    stats: [
      { value: "6+ лет", labelRu: "Безупречной работы на рынке", labelUz: "Bozorda muvaffaqiyatli faoliyat" },
      { value: "50 000+", labelRu: "Выполненных заказов", labelUz: "Bajarilgan buyurtmalar" },
      { value: "10 000+", labelRu: "Позиций инструмента на складе", labelUz: "Ombordagi tovar turlari" },
      { value: "100%", labelRu: "Оригинал с гарантией", labelUz: "Kafolatlangan original mahsulot" },
    ],
    contentRu:
      "Основанный в 2018 году, проект Minimall начинался как узкоспециализированная дистрибьюторская компания для снабжения монтажных организаций столицы. За годы динамичного развития мы выросли в масштабную платформу и надежный складской хаб в Ташкенте с прямыми контрактами от заводов-изготовителей.\n\nСегодня mini-mall.uz — это продуманная экосистема для снабжения строительных объектов любой сложности: от компактных мастерских до масштабных промышленных комплексов. Мы исключаем серые схемы и подделки: каждый поставляемый инструмент имеет официальный серийный номер, сертифицирован и обеспечивается гарантией авторизованных сервисных центров.",
    contentUz:
      "2018 yilda tashkil topgan Minimall loyihasi poytaxt montaj korxonalarini ta'minlash uchun ixtisoslashtirilgan distribyutorlik sifatida boshlangan. Yillar davomida biz Toshkentda to'g'ridan-to'g'ri ishlab chiqaruvchi zavodlar bilan ishlovchi yirik ombor va platformaga aylandik.\n\nBugungi kunda mini-mall.uz — har qanday murakkablikdagi qurilish obyektlarini ta'minlash uchun qulay ekotizimdir. Har bir taqdim etilayotgan asbob rasmiy seriya raqamiga ega, to'liq sertifikatlangan va rasmiy servis kafolatiga ega.",
    contacts: {
      phone: "+998 (97) 036 36 36",
      email: "info@mini-mall.uz",
      telegram: "@minimall_uzb",
      addressRu: "г. Ташкент (координаты 41°21'21.1\"N 69°14'41.8\"E)",
      addressUz: "Toshkent sh. (koordinatalar 41°21'21.1\"N 69°14'41.8\"E)",
      hoursRu: "Пн–Вс с 9:00 до 19:00",
      hoursUz: "Du–Ya 9:00 dan 19:00 gacha",
    },
  },
  delivery: {
    id: "delivery",
    icon: "🚚",
    labelRu: "Доставка",
    labelUz: "Yetkazib berish",
    badgeRu: "Собственная служба доставки",
    badgeUz: "Shaxsiy yetkazib berish xizmati",
    titleRu: "Доставка и получение заказов",
    titleUz: "Yetkazib berish va buyurtmalarni olish",
    descriptionRu:
      "Оперативная логистика по городу Ташкенту собственной курьерской службой и отправка заказов в регионы Узбекистана за 24–48 часов.",
    descriptionUz:
      "Toshkent shahri bo'ylab shaxsiy kuryerlarimiz orqali tezkor yetkazib berish va viloyatlarga 24-48 soat ichida yuborish.",
    contentRu:
      "1. Бесплатная доставка от 1 000 000 сум:\nДоставка осуществляется БЕСПЛАТНО по городу Ташкенту при заказе на сумму от 1 000 000 сум. Важное примечание: товары в мешках (сухие строительные смеси, цемент, шпатлевка и т.д.) не учитываются при расчете порога бесплатной доставки.\n\n2. Доставка до 1 000 000 сум и мешковых товаров:\nПри сумме заказа менее 1 000 000 сум, а также при заказе товаров в мешках, стоимость доставки является договорной и рассчитывается индивидуально менеджером в зависимости от объема груза и адреса.\n\n3. Доставка по всему Узбекистану:\nОтправляем заказы через надежные курьерские службы (BTS, Fargo, EMU) в Самарканд, Бухару, Андижан, Фергану, Наманган и другие регионы в течение 24–48 часов.\n\n4. Самовывоз со склада:\nВы можете бесплатно забрать и проверить инструмент в нашем пункте выдачи в Ташкенте ежедневно с 9:00 до 19:00.",
    contentUz:
      "1. 1 000 000 so'mdan bepul yetkazib berish:\nBuyurtma summasi 1 000 000 so'm va undan yuqori bo'lganda Toshkent shahri bo'ylab yetkazib berish BEPUL amalga oshiriladi. Muhim eslatma: qopdagi tovarlar (quruq qurilish aralashmalari, sement, shpatlyovka va h.k.) bepul yetkazib berish summasiga kirmaydi.\n\n2. 1 000 000 so'mgacha va qopdagi tovarlar:\nBuyurtma summasi 1 000 000 so'mdan kam bo'lganda, shuningdek qopdagi tovarlar uchun yetkazib berish narxi kelishilgan holda, yuk hajmi va manzilga qarab alohida hisoblanadi.\n\n3. O'zbekiston bo'ylab yetkazib berish:\nViloyatlarga buyurtmalar (Samarqand, Buxoro, Andijon, Farg'ona, Namangan va h.k.) ishonchli kuryerlik xizmatlari orqali 24-48 soat ichida yetkaziladi.\n\n4. Ombordan olib ketish:\nBuyurtmangizni Toshkentdagi punktimizdan har kuni soat 9:00 dan 19:00 gacha bepul olib ketishingiz mumkin.",
  },
  payment: {
    id: "payment",
    icon: "💳",
    labelRu: "Оплата",
    labelUz: "To'lov usullari",
    badgeRu: "Безопасные платежи",
    badgeUz: "Xavfsiz to'lovlar",
    titleRu: "Способы оплаты",
    titleUz: "To'lov usullari",
    descriptionRu: "Мы принимаем все популярные и безопасные способы расчета:",
    descriptionUz: "Biz barcha qulay va xavfsiz to'lov turlarini qabul qilamiz:",
    contentRu:
      "💵 Наличными курьеру — Оплата после осмотра товара при получении в руки курьеру.\n\n📱 Click / Payme — Быстрый перевод через приложение на расчетный счет продавца.\n\n🏢 Безналичный расчет для юридических лиц — Выставление счета на оплату через ЭСФ (электронные счета-фактуры) с НДС и полным пакетом закрывающих документов.",
    contentUz:
      "💵 Kuryerga naqd to'lov — Tovarni ko'rib tekshirgach, to'lovni kuryerga berish.\n\n📱 Click / Payme — Ilova orqali bir zumda sotuvchining hisob-raqamiga to'lash.\n\n🏢 Yuridik shaxslar uchun bank o'tkazmasi — QQS bilan elektron hisob-fakturalar (EHF) orqali to'liq yuridik hujjatlar to'plami bilan to'lash.",
  },
  warranty: {
    id: "warranty",
    icon: "🛡️",
    labelRu: "Гарантия",
    labelUz: "Kafolat",
    badgeRu: "100% официальная гарантия",
    badgeUz: "100% rasmiy kafolat",
    titleRu: "Официальная гарантия",
    titleUz: "Rasmiy kafolat",
    descriptionRu:
      "На весь инструмент, представленный на mini-mall.uz, распространяется официальная гарантия производителя от 1 года до 3 лет.",
    descriptionUz:
      "mini-mall.uz saytida taqdim etilgan barcha asboblarga ishlab chiqaruvchining 1 yildan 3 yilgacha rasmiy kafolati beriladi.",
    contentRu:
      "В комплекте с каждым заказом покупатель получает гарантийный талон с печатью и датой продажи.\n\nВ случае возникновения вопросов по работе оборудования наши инженеры проводят бесплатную диагностику в авторизованных центрах.\n\nСроки гарантии по брендам:\n• Bosch Professional: 12–36 месяцев\n• Makita: 12 месяцев\n• DeWalt: 12–36 месяцев\n• Crown, Total, Ingco: 12 месяцев",
    contentUz:
      "Har bir buyurtma bilan birga xaridor muhr va sotuv sanasi qo'yilgan kafolat talonini oladi.\n\nUskunaning ishlashida savollar tug'ilganda, muhandislarimiz rasmiy servis markazlarida bepul diagnostika o'tkazadilar.\n\nBrendlar bo'yicha kafolat muddatlari:\n• Bosch Professional: 12–36 oy\n• Makita: 12 oy\n• DeWalt: 12–36 oy\n• Crown, Total, Ingco: 12 oy",
  },
  returns: {
    id: "returns",
    icon: "🔄",
    labelRu: "Возврат и обмен",
    labelUz: "Qaytarish va almashtirish",
    badgeRu: "Защита прав потребителей",
    badgeUz: "Iste'molchilar huquqlarini himoya qilish",
    titleRu: "Возврат и обмен товара",
    titleUz: "Tovarni qaytarish va almashtirish",
    descriptionRu:
      "Вы имеете право вернуть или обменять приобретенный товар надлежащего качества в течение 4 дней с момента покупки при соблюдении следующих условий:",
    descriptionUz:
      "Siz xarid qilingan tegishli sifatdagi tovarni sotib olingan kundan boshlab 4 kun ichida quyidagi shartlarga rioya qilingan holda qaytarishingiz yoki almashtirishingiz mumkin:",
    contentRu:
      "Условия возврата товара:\n1. Срок возврата и обмена — в течение 4 дней с момента получения товара.\n2. Товар не был в эксплуатации, отсутствуют следы монтажа, сколов или использования.\n3. Полностью сохранен товарный вид, заводская упаковка, пломбы и комплектные аксессуары.\n4. Имеется кассовый/электронный чек либо иной документ, подтверждающий факт покупки.\n\nВозврат денежных средств осуществляется тем же способом, которым была произведена оплата (наличными или на банковскую карту) в течение 1–3 рабочих дней.",
    contentUz:
      "Tovarni qaytarish shartlari:\n1. Qaytarish va almashtirish muddati — tovar olingan kundan boshlab 4 kun ichida.\n2. Tovar ishlatilmagan, montaj yoki foydalanish izlari bo'lmasligi lozim.\n3. Tovar ko'rinishi, zavod o'rami, plombalari va jamlanma aksessuarlari to'liq saqlangan bo'lishi kerak.\n4. Xarid cheki yoki xaridni tasdiqlovchi boshqa hujjat mavjud bo'lishi kerak.\n\nPul mablag'larini qaytarish to'lov amalga oshirilgan usulda (naqd yoki bank kartasiga) 1-3 ish kuni ichida amalga oshiriladi.",
  },
  service: {
    id: "service",
    icon: "🛠️",
    labelRu: "Сервисные центры",
    labelUz: "Servis markazlari",
    badgeRu: "Авторизованный ремонт",
    badgeUz: "Rasmiy ta'mirlash",
    titleRu: "Авторизованные сервисные центры",
    titleUz: "Avtorizatsiyalangan servis markazlari",
    descriptionRu:
      "Обслуживание техники Bosch, Makita, DeWalt и других брендов осуществляется в сертифицированных мастерских г. Ташкента с оригинальными запчастями.",
    descriptionUz:
      "Bosch, Makita, DeWalt va boshqa brendlar uskunalariga sertifikatlangan Toshkent ustaxonalarida original ehtiyot qismlar bilan xizmat ko'rsatiladi.",
    contentRu:
      "Центральный сервисный пункт Minimall:\n📍 г. Ташкент, координаты 41°21'21.1\"N 69°14'41.8\"E\n📞 Прием заявок на сервис: +998 (97) 036 36 36\n⏱ Режим работы: Пн–Вс с 9:00 до 19:00\n\nСервисные услуги:\n• Бесплатное гарантийное обслуживание\n• Постгарантийный ремонт электро- и бензоинструмента\n• Замена расходных деталей (щётки, якоря, патроны, ремни)\n• Проверка и юстировка лазерных нивелиров",
    contentUz:
      "Minimall markaziy servis punkti:\n📍 Toshkent sh., koordinatalar 41°21'21.1\"N 69°14'41.8\"E\n📞 Servis buyurtmalari: +998 (97) 036 36 36\n⏱ Ish vaqti: Du–Ya 9:00 dan 19:00 gacha\n\nXizmatlar:\n• Bepul kafolatli ta'mirlash\n• Kafolatdan keyingi ta'mirlash\n• Ehtiyot qismlarni almashtirish (cho'tkalar, yakor, patronlar)\n• Lazer sathlarini sozlash va tekshirish",
  },
  contacts: {
    id: "contacts",
    icon: "📍",
    labelRu: "Контакты и адрес",
    labelUz: "Aloqa va manzil",
    badgeRu: "Всегда на связи",
    badgeUz: "Doimo aloqadamiz",
    titleRu: "Контакты и магазин",
    titleUz: "Aloqa va do'kon",
    descriptionRu: "Свяжитесь с нами удобным способом или посетите наш склад-магазин в Ташкенте.",
    descriptionUz: "Biz bilan o'zingizga qulay usulda bog'laning yoki Toshkentdagi ombor-do'konimizga tashrif buyuring.",
    contentRu:
      "Отдел продаж и консультаций:\n📞 Телефон: +998 (97) 036 36 36\n✉️ Email: info@mini-mall.uz\n✈️ Telegram: @minimall_uzb\n\nАдрес шоу-рума и склада:\n📍 г. Ташкент (координаты 41°21'21.1\"N 69°14'41.8\"E)\n⏱ Часы работы: с 9:00 до 19:00 каждый день без выходных",
    contentUz:
      "Sotuv va maslahat bo'limi:\n📞 Telefon: +998 (97) 036 36 36\n✉️ Email: info@mini-mall.uz\n✈️ Telegram: @minimall_uzb\n\nShowroom va ombor manzili:\n📍 Toshkent sh. (koordinatalar 41°21'21.1\"N 69°14'41.8\"E)\n⏱ Ish vaqti: Har kuni 9:00 dan 19:00 gacha dam olish kunlarisiz",
    contacts: {
      phone: "+998 (97) 036 36 36",
      email: "info@mini-mall.uz",
      telegram: "@minimall_uzb",
      addressRu: "г. Ташкент (координаты 41°21'21.1\"N 69°14'41.8\"E)",
      addressUz: "Toshkent sh. (koordinatalar 41°21'21.1\"N 69°14'41.8\"E)",
      hoursRu: "Ежедневно с 9:00 до 19:00",
      hoursUz: "Har kuni 9:00 dan 19:00 gacha",
    },
  },
  b2b: {
    id: "b2b",
    icon: "📑",
    labelRu: "Юридическим лицам",
    labelUz: "Yuridik shaxslar uchun",
    badgeRu: "Оптовые поставки и тендеры",
    badgeUz: "Ulgurji ta'minot va tenderlar",
    titleRu: "Для юридических лиц и оптовых клиентов",
    titleUz: "Yuridik shaxslar va ulgurji mijozlar uchun",
    descriptionRu:
      "mini-mall.uz комплектует строительные объекты, промышленные предприятия и монтажные бригады по всему Узбекистану.",
    descriptionUz:
      "mini-mall.uz butun O'zbekiston bo'ylab qurilish obyektlari, sanoat korxonalari va montaj brigadalarini to'liq asboblar bilan ta'minlaydi.",
    contentRu:
      "Преимущества работы с нами:\n• Специальные оптовые цены и гибкая система скидок\n• Работа по официальному договору и ЭСФ с НДС\n• Персональный менеджер для быстрого подбора оборудования\n• Отсрочка платежа для постоянных партнеров\n\nОтправляйте спецификации и реквизиты на info@mini-mall.uz, пишите в Telegram @minimall_uzb или звоните +998 (97) 036 36 36.",
    contentUz:
      "Biz bilan ishlashning afzalliklari:\n• Maxsus ulgurji narxlar va qulay chegirmalar tizimi\n• QQS ko'rsatilgan rasmiy shartnoma va elektron hisob-fakturalar (EHF)\n• Uskunalarni tezkor tanlash uchun shaxsiy menejer\n• Doimiy hamkorlar uchun kechiktirib to'lash imkoniyati\n\nSpetsifikatsiyangizni info@mini-mall.uz pochtasiga yuboring, Telegram @minimall_uzb ga yozing yoki +998 (97) 036 36 36 ga qo'ng'iroq qiling.",
  },
  offer: {
    id: "offer",
    icon: "📜",
    labelRu: "Публичная оферта",
    labelUz: "Ommaviy oferta",
    badgeRu: "Официальный юридический документ",
    badgeUz: "Rasmiy yuridik hujjat",
    titleRu: "ДОГОВОР ПУБЛИЧНОЙ ОФЕРТЫ КУПЛИ-ПРОДАЖИ ТОВАРОВ ДИСТАНЦИОННЫМ СПОСОБОМ",
    titleUz: "TOVARLARNI MASOFADAN SOTISH VA SOTIB OLISH BO'YICHA OMMAVIY OFERTA SHARTNOMASI",
    descriptionRu: "г. Ташкент, Республика Узбекистан • Редакция от 01 января 2024 года • Юрисдикция: Республика Узбекистан",
    descriptionUz: "Toshkent sh., O'zbekiston Respublikasi • Tahrir: 2024 yil 1 yanvar • Yurisdiksiya: O'zbekiston",
    contentRu:
      "Настоящий документ является официальным предложением (публичной офертой) маркетплейса «mini-mall.uz» (далее — «Продавец») в соответствии со статьями 367, 369 и 426 Гражданского кодекса Республики Узбекистан, Законом Республики Узбекистан «Об электронной коммерции» и Законом Республики Узбекистан «О защите прав потребителей».\n\nОформление Заказа на сайте https://mini-mall.uz, а равно подтверждение Заказа оператору контакт-центра является полным и безоговорочным акцептом настоящей Оферты Покупателем (ст. 370 ГК РУз).\n\n§ 1. Термины и определения\n• Продавец — интернет-магазин mini-mall.uz, осуществляющий реализацию строительного оборудования, электроинструмента и расходных материалов дистанционным способом.\n• Покупатель — дееспособное физическое или юридическое лицо, оформившее заказ исключительно для личных, коммерческих или производственных нужд на условиях настоящего Договора.\n• Товар — сертифицированная материальная продукция производственно-технического назначения, представленная в каталоге интернет-магазина.\n• Заказ — должным образом оформленный электронный запрос Покупателя на покупку и доставку выбранных позиций Товара по указанному адресу.\n\n§ 2. Предмет договора\n2.1. Продавец обязуется передать в собственность Покупателя Товар надлежащего качества, соответствующий заявленным техническим характеристикам и стандартам производителей (Bosch, Makita, DeWalt и др.), а Покупатель обязуется своевременно принять и оплатить Товар в порядке и на условиях, установленных настоящим Договором.\n2.2. Право собственности на Товар, а также риски его случайной гибели или повреждения переходят к Покупателю в момент фактической передачи Товара и подписания товарно-сопроводительных документов.\n\n§ 3. Цена товаров и финансовые расчеты\n3.1. Все цены на Товары в маркетплейсе mini-mall.uz указываются в национальной валюте Республики Узбекистан — сумах (UZS) и включают все применимые налоги.\n3.2. Оплата производится следующими способами: наличными денежными средствами курьеру при получении; посредством платежных систем Click / Payme; либо безналичным банковским переводом на расчетный счет Продавца на основании выставленного электронного счета-фактуры (ЭСФ) с выделенным НДС.\n\n§ 4. Регламент доставки и логистики\n4.1. Бесплатная доставка: Доставка по городу Ташкенту осуществляется БЕСПЛАТНО при совокупной сумме Заказа от 1 000 000 (одного миллиона) сум.\n4.2. Исключение для мешковых товаров: Товары, поставляемые в мешковой таре (сухие строительные смеси, шпатлевка, цемент, клеевые составы и аналогичные тяжеловесные строительные материалы), НЕ УЧИТЫВАЮТСЯ при расчете порога бесплатной доставки в силу повышенного веса и объема.\n4.3. Договорная доставка: При сумме Заказа менее 1 000 000 сум, а равно при заказе мешковой продукции, стоимость транспортной доставки является ДОГОВОРНОЙ и согласовывается с менеджером индивидуально.",
    contentUz:
      "Ushbu hujjat O'zbekiston Respublikasi Fuqarolik kodeksining 367, 369 va 426-moddalariga, «Elektron tijorat to'g'risida»gi hamda «Iste'molchilarning huquqlarini himoya qilish to'g'risida»gi qonunlariga muvofiq, «mini-mall.uz» savdo maydonchasining (keyingi o'rinlarda — «Sotuvchi») rasmiy ommaviy ofertasi hisoblanadi.\n\nhttps://mini-mall.uz veb-saytida buyurtmani rasmiylashtirish yoki kontakt-markaz operatoriga buyurtmani tasdiqlash Xaridor tomonidan ushbu Ofertaning to'liq va so'zsiz qabul qilinishi (aksept) hisoblanadi.\n\n§ 1. Atamalar va ta'riflar\n• Sotuvchi — qurilish asbob-uskunalarini masofadan sotishni amalga oshiruvchi mini-mall.uz internet-do'koni.\n• Xaridor — ushbu Shartnoma shartlarida buyurtma rasmiylashtirgan jismoniy yoki yuridik shaxs.\n• Tovar — internet-do'kon katalogida taqdim etilgan sertifikatlangan mahsulot.\n• Buyurtma — Xaridorning tovarni xarid qilish va yetkazib berish bo'yicha rasmiylashtirgan elektron so'rovi.\n\n§ 2. Shartnoma predmeti\n2.1. Sotuvchi e'lon qilingan texnik tavsiflarga mos sifatli Tovarni topshirish, Xaridor esa qabul qilish va to'lash majburiyatini oladi.\n2.2. Tovarga egalik huquqi Tovar topshirilgan paytdan boshlab Xaridorga o'tadi.\n\n§ 3. Tovar narxi va hisob-kitoblar tartibi\n3.1. Barcha narxlar so'mda (UZS) ko'rsatiladi va soliqlarni o'z ichiga oladi.\n3.2. To'lov naqd, Click/Payme yoki QQS ko'rsatilgan elektron hisob-faktura (EHF) asosida bank o'tkazmasi orqali amalga oshiriladi.\n\n§ 4. Yetkazib berish reglamenti\n4.1. 1 000 000 so'm va undan yuqori buyurtmalar Toshkent bo'ylab BEPUL yetkaziladi.\n4.2. Qopdagi tovarlar (sement, shpatlyovka va h.k.) bepul yetkazib berish hisobiga kirmaydi.\n4.3. 1 000 000 so'mdan kam buyurtmalar va qopdagi tovarlar yetkazib berish narxi kelishilgan holda belgilanadi.",
  },
  privacy: {
    id: "privacy",
    icon: "🔒",
    labelRu: "Конфиденциальность",
    labelUz: "Maxfiylik siyosati",
    badgeRu: "Защита персональных данных",
    badgeUz: "Shaxsiy ma'lumotlarni himoya qilish",
    titleRu: "ПОЛИТИКА ОБРАБОТКИ И ЗАЩИТЫ ПЕРСОНАЛЬНЫХ ДАННЫХ",
    titleUz: "SHAXSIY MA'LUMOTLARNI QAYTA ISHLASH VA HIMOYA QILISH SIYOSATI",
    descriptionRu:
      "В соответствии с Законом Республики Узбекистан № ЗРУ-547 «О персональных данных» от 02.07.2019 года.",
    descriptionUz:
      "O'zbekiston Respublikasining 2019 yil 2 iyuldagi «Shaxsiy ma'lumotlar to'g'risida»gi O'RQ-547-son Qonuniga muvofiq.",
    contentRu:
      "Настоящая Политика конфиденциальности определяет порядок сбора, систематизации, хранения, изменения, использования и уничтожения персональных данных пользователей маркетплейса https://mini-mall.uz (далее — «Сайт»), администрируемого сервисом Minimall (далее — «Оператор»).\n\n1. Состав обрабатываемых данных:\nПри регистрации, оформлении заказа или консультациях с менеджером собираются следующие данные: Фамилия, имя, номер мобильного телефона, адрес доставки, история заказов, сведения об организации и банковские реквизиты (для юридических лиц).\n\n2. Цели обработки персональных данных:\n• Обработка и своевременное выполнение оформленных заказов;\n• Доставка товаров курьерскими службами по указанному адресу;\n• Информирование о статусе выполнения заказов через SMS или Telegram;\n• Предоставление официальной гарантии и сервисной поддержки;\n• Оформление договоров и бухгалтерских документов (ЭСФ).\n\n3. Защита и неразглашение данных:\nОператор принимает все необходимые правовые, организационные и технические меры для защиты персональных данных от неправомерного доступа, уничтожения или распространения. Данные пользователей не передаются третьим лицам, за исключением случаев, предусмотренных законодательством Республики Узбекистан.",
    contentUz:
      "Ushbu Maxfiylik siyosati https://mini-mall.uz (keyingi o'rinlarda — «Sayt») foydalanuvchilarining shaxsiy ma'lumotlarini to'plash, saqlash, foydalanish va himoya qilish tartibini belgilaydi.\n\n1. Qayta ishlanadigan ma'lumotlar tarkibi:\nRo'yxatdan o'tishda yoki buyurtma berishda quyidagilar yig'iladi: Ism, familiya, telefon raqami, yetkazib berish manzili, buyurtmalar tarixi, yuridik shaxslar uchun rekvizitlar.\n\n2. Ma'lumotlarni qayta ishlash maqsadlari:\n• Buyurtmalarni o'z vaqtida qabul qilish va bajarish;\n• Tovarlarni ko'rsatilgan manzilga yetkazib berish;\n• SMS yoki Telegram orqali xaridorga buyurtma holatini xabar qilish;\n• Rasmiy kafolat va servis xizmatlarini taqdim etish;\n• Buxgalteriya hujjatlari (EHF) rasmiylashtirish.\n\n3. Ma'lumotlar xavfsizligi:\nOperator shaxsiy ma'lumotlarni ruxsatsiz kirishdan himoya qilish uchun barcha zarur choralarni ko'radi. Ma'lumotlar O'zbekiston Respublikasi qonunlarida belgilangan holatlardan tashqari uchinchi shaxslarga berilmaydi.",
  },
};

interface HelpCenterContextType {
  sections: Record<InfoModalSection, HelpSectionData>;
  getSection: (id: InfoModalSection) => HelpSectionData;
  updateSection: (id: InfoModalSection, patch: Partial<HelpSectionData>) => void;
  resetSection: (id: InfoModalSection) => void;
  resetAllSections: () => void;
}

const HelpCenterContext = createContext<HelpCenterContextType | undefined>(undefined);

function loadLocalHelp(): Record<InfoModalSection, HelpSectionData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return { ...INITIAL_HELP_SECTIONS, ...parsed };
      }
    }
  } catch (e) {
    console.error("Failed to load help center from localStorage", e);
  }
  return INITIAL_HELP_SECTIONS;
}

function saveLocalHelp(data: Record<InfoModalSection, HelpSectionData>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("minimall_help_updated"));
  } catch (e) {
    console.error("Failed to save help center to localStorage", e);
  }
}

export function HelpCenterProvider({ children }: { children: React.ReactNode }) {
  const [sections, setSections] = useState<Record<InfoModalSection, HelpSectionData>>(loadLocalHelp);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setSections(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const getSection = useCallback(
    (id: InfoModalSection): HelpSectionData => {
      return sections[id] || INITIAL_HELP_SECTIONS[id];
    },
    [sections]
  );

  const updateSection = useCallback((id: InfoModalSection, patch: Partial<HelpSectionData>) => {
    setSections((prev) => {
      const current = prev[id] || INITIAL_HELP_SECTIONS[id];
      const updated = {
        ...prev,
        [id]: {
          ...current,
          ...patch,
        },
      };
      saveLocalHelp(updated);
      return updated;
    });
  }, []);

  const resetSection = useCallback((id: InfoModalSection) => {
    setSections((prev) => {
      const updated = {
        ...prev,
        [id]: INITIAL_HELP_SECTIONS[id],
      };
      saveLocalHelp(updated);
      return updated;
    });
  }, []);

  const resetAllSections = useCallback(() => {
    setSections(INITIAL_HELP_SECTIONS);
    saveLocalHelp(INITIAL_HELP_SECTIONS);
  }, []);

  const value = useMemo(
    () => ({
      sections,
      getSection,
      updateSection,
      resetSection,
      resetAllSections,
    }),
    [sections, getSection, updateSection, resetSection, resetAllSections]
  );

  return <HelpCenterContext.Provider value={value}>{children}</HelpCenterContext.Provider>;
}

export function useHelpCenter(): HelpCenterContextType {
  const ctx = useContext(HelpCenterContext);
  if (!ctx) {
    throw new Error("useHelpCenter must be used within a HelpCenterProvider");
  }
  return ctx;
}

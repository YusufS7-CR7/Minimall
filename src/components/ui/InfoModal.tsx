import { useEffect } from "react";
import type { Lang } from "@/data/types";

export type InfoModalSection =
  | "about"
  | "delivery"
  | "payment"
  | "warranty"
  | "returns"
  | "service"
  | "contacts"
  | "b2b"
  | "careers"
  | "blog"
  | "privacy"
  | "offer";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: InfoModalSection;
  onSelectSection: (s: InfoModalSection) => void;
  lang: Lang;
}

export default function InfoModal({
  isOpen,
  onClose,
  section,
  onSelectSection,
  lang,
}: InfoModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const menuItems: { id: InfoModalSection; labelRu: string; labelUz: string; icon: string }[] = [
    { id: "about", labelRu: "О компании", labelUz: "Kompaniya haqida", icon: "🏢" },
    { id: "delivery", labelRu: "Доставка", labelUz: "Yetkazib berish", icon: "🚚" },
    { id: "payment", labelRu: "Оплата", labelUz: "To'lov usullari", icon: "💳" },
    { id: "warranty", labelRu: "Гарантия", labelUz: "Kafolat", icon: "🛡️" },
    { id: "returns", labelRu: "Возврат и обмен", labelUz: "Qaytarish va almashtirish", icon: "🔄" },
    { id: "service", labelRu: "Сервисные центры", labelUz: "Servis markazlari", icon: "🛠️" },
    { id: "contacts", labelRu: "Контакты и адрес", labelUz: "Aloqa va manzil", icon: "📍" },
    { id: "b2b", labelRu: "Юридическим лицам", labelUz: "Yuridik shaxslar uchun", icon: "📑" },
    { id: "careers", labelRu: "Вакансии", labelUz: "Bo'sh ish o'rinlari", icon: "💼" },
    { id: "blog", labelRu: "Блог и советы", labelUz: "Foydali maqolalar", icon: "📰" },
    { id: "offer", labelRu: "Публичная оферта", labelUz: "Ommaviy oferta", icon: "📜" },
    { id: "privacy", labelRu: "Конфиденциальность", labelUz: "Maxfiylik siyosati", icon: "🔒" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row animate-fadeIn">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">ℹ️</span>
              <span className="font-bold text-gray-900 text-sm" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                {lang === "ru" ? "Справочный центр" : "Ma'lumotlar markazi"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="md:hidden w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>

          <nav className="p-2 space-y-1 overflow-y-auto flex-1 text-xs">
            {menuItems.map((item) => {
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-red-600 text-white shadow-xs"
                      : "text-gray-700 hover:bg-gray-200/60"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="truncate">{lang === "ru" ? item.labelRu : item.labelUz}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 bg-white/50 text-[11px] text-gray-500 space-y-1">
            <div>📞 <a href="tel:+998970363636" className="text-gray-800 font-bold hover:text-red-600">+998 (97) 036 36 36</a></div>
            <div>⏱ 9:00 – 19:00 (ежедневно)</div>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Header bar */}
          <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <span className="text-xs text-gray-400 font-medium">Minimall Knowledge Base</span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Section details */}
          <div className="p-6 md:p-8 overflow-y-auto flex-1 text-gray-800 leading-relaxed text-sm space-y-5">
            {section === "about" && (
              <div className="space-y-6">
                {/* Header Badge & Title */}
                <div>
                  <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2 border border-red-100">
                    <span>🏢</span>
                    <span>{lang === "ru" ? "Официальный поставщик инструмента с 2018 года" : "2018 yildan beri rasmiy asboblar yetkazib beruvchi"}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                    {lang === "ru" ? "Minimall.uz — Эксперт и надежный маркетплейс инструмента в Узбекистане" : "Minimall.uz — O'zbekistonda ishonchli asboblar va uskunalar bozori"}
                  </h2>
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                    {lang === "ru"
                      ? "Более 6 лет мы обеспечиваем частных мастеров, профессиональные монтажные бригады и крупнейшие строительные холдинги Узбекистана оригинальным электроинструментом, силовым оборудованием и расходными материалами мирового уровня."
                      : "6 yildan ortiq vaqt davomida biz xususiy ustalar, montaj guruhlari va O'zbekistonning yirik qurilish xoldinglarini jahon darajasidagi original elektr asboblari va uskunalari bilan ta'minlab kelmoqdamiz."}
                  </p>
                </div>

                {/* Key Metrics / Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-gradient-to-br from-red-50/80 to-white p-4 rounded-2xl border border-red-100/80 text-center">
                    <div className="text-2xl sm:text-3xl font-black text-red-600" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                      6+ {lang === "ru" ? "лет" : "yil"}
                    </div>
                    <div className="text-[11px] font-semibold text-gray-700 mt-1">
                      {lang === "ru" ? "Безупречной работы на рынке" : "Bozorda muvaffaqiyatli faoliyat"}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-2xl border border-gray-200 text-center">
                    <div className="text-2xl sm:text-3xl font-black text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                      50 000+
                    </div>
                    <div className="text-[11px] font-semibold text-gray-700 mt-1">
                      {lang === "ru" ? "Выполненных заказов" : "Bajarilgan buyurtmalar"}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-2xl border border-gray-200 text-center">
                    <div className="text-2xl sm:text-3xl font-black text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                      10 000+
                    </div>
                    <div className="text-[11px] font-semibold text-gray-700 mt-1">
                      {lang === "ru" ? "Позиций инструмента на складе" : "Ombordagi tovar turlari"}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50/80 to-white p-4 rounded-2xl border border-emerald-100 text-center">
                    <div className="text-2xl sm:text-3xl font-black text-emerald-600" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                      100%
                    </div>
                    <div className="text-[11px] font-semibold text-gray-700 mt-1">
                      {lang === "ru" ? "Оригинал с гарантией" : "Kafolatlangan original mahsulot"}
                    </div>
                  </div>
                </div>

                {/* Company Story & Scale */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80 space-y-3 text-xs leading-relaxed text-gray-700">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <span>🏗️</span>
                    <span>{lang === "ru" ? "Наша история и развитие" : "Bizning tariximiz va rivojlanishimiz"}</span>
                  </h3>
                  <p>
                    {lang === "ru"
                      ? "Основанный в 2018 году, проект Minimall начинался как узкоспециализированная дистрибьюторская компания для снабжения монтажных организаций столицы. За годы динамичного развития мы выросли в масштабную платформу и надежный складской хаб в Ташкенте с прямыми контрактами от заводов-изготовителей."
                      : "2018 yilda tashkil topgan Minimall loyihasi poytaxt montaj korxonalarini ta'minlash uchun ixtisoslashtirilgan distribyutorlik sifatida boshlangan. Yillar davomida biz Toshkentda to'g'ridan-to'g'ri ishlab chiqaruvchi zavodlar bilan ishlovchi yirik ombor va platformaga aylandik."}
                  </p>
                  <p>
                    {lang === "ru"
                      ? "Сегодня Minimall.uz — это продуманная экосистема для снабжения строительных объектов любой сложности: от компактных мастерских до масштабных промышленных комплексов. Мы исключаем серые схемы и подделки: каждый поставляемый инструмент имеет официальный серийный номер, сертифицирован и обеспечивается гарантией авторизованных сервисных центров."
                      : "Bugungi kunda Minimall.uz — har qanday murakkablikdagi qurilish obyektlarini ta'minlash uchun qulay ekotizimdir. Har bir taqdim etilayotgan asbob rasmiy seriya raqamiga ega, to'liq sertifikatlangan va rasmiy servis kafolatiga ega."}
                  </p>
                </div>

                {/* Official Brand Partners */}
                <div>
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>⚡</span>
                    <span>{lang === "ru" ? "Официальные бренды-производители в нашем каталоге" : "Bizning katalogdagi rasmiy ishlab chiqaruvchi brendlar"}</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    {[
                      { name: "Bosch Professional", country: "Германия", descRu: "Электроинструмент и измерительная техника", descUz: "Elektr asboblar va o'lchov texnikasi" },
                      { name: "Makita", country: "Япония", descRu: "Аккумуляторные платформы LXT и XGT", descUz: "LXT va XGT akkumulyator tizimlari" },
                      { name: "DeWalt", country: "США", descRu: "Тяжелый инструмент серии XR FlexVolt", descUz: "XR FlexVolt seriyasidagi mustahkam asboblar" },
                      { name: "Milwaukee", country: "США", descRu: "Премиальный инструмент M12 & M18 FUEL", descUz: "Premium M12 va M18 FUEL uskunalari" },
                      { name: "Crown", country: "Швейцария / КНР", descRu: "Надежный индустриальный инструмент", descUz: "Ishonchli sanoat darajasidagi asboblar" },
                      { name: "Total & Ingco", country: "Глобальный бренд", descRu: "Оптимальное соотношение цены и ресурса", descUz: "Narx va sifatning a'lo mutanosibligi" },
                      { name: "Metabo", country: "Германия", descRu: "Шлифовальные машины и сетевой инструмент", descUz: "Silliqlash mashinalari va asboblar" },
                      { name: "Kärcher & ADA", country: "Германия / США", descRu: "Моечное и лазерное геодезическое оборудование", descUz: "Yuvish va lazer o'lchov uskunalari" },
                    ].map((brand, idx) => (
                      <div key={idx} className="p-2.5 bg-white rounded-xl border border-gray-200 hover:border-red-300 transition-colors shadow-2xs">
                        <div className="font-bold text-gray-900">{brand.name}</div>
                        <div className="text-[10px] text-red-600 font-medium">{brand.country}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{lang === "ru" ? brand.descRu : brand.descUz}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clients and Partners Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                      <span>🤝</span>
                      <span>{lang === "ru" ? "Компании, которые нам доверяют" : "Bizga ishonch bildirgan kompaniyalar"}</span>
                    </h3>
                    <span className="text-[11px] text-gray-500">
                      {lang === "ru" ? "Крупнейшие застройщики и предприятия Узбекистана" : "O'zbekistonning yirik korxonalari va quruvchilari"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    {lang === "ru"
                      ? "За 6+ лет работы оборудование и инструменты, поставленные Minimall, использовались при строительстве знаковых жилых, коммерческих и промышленных объектов страны. В числе наших партнеров и клиентов:"
                      : "6 yildan ortiq faoliyat davomida Minimall yetkazib bergan asbob-uskunalar yurtimizning yirik turar joy, tijorat va sanoat obyektlari qurilishida qo'llanildi. Hamkorlarimiz qatorida:"}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    {[
                      { name: "Enter Engineering", roleRu: "Крупнейший EPC-подрядчик промышленных строек", roleUz: "Yirik sanoat EPC pudratchisi" },
                      { name: "Discover Invest", roleRu: "Инфраструктурное и масштабное строительство", roleUz: "Infratuzilma va keng ko'lamli qurilish" },
                      { name: "Murad Buildings", roleRu: "Премиальные высотные жилые комплексы (Nest One)", roleUz: "Premium darajadagi turar joy majmualari" },
                      { name: "Golden House", roleRu: "Девелопмент жилых кварталов и комплексов", roleUz: "Turar joy mavzelari devalopmenti" },
                      { name: "AKFA Group", roleRu: "Оснащение производственных и монтажных участков", roleUz: "Ishlab chiqarish va montaj maydonlarini ta'minlash" },
                      { name: "Artel Electronics", roleRu: "Инструментальное обеспечение сборочных линий", roleUz: "Zavod va yig'uv liniyalarini asboblar bilan ta'minlash" },
                      { name: "BI Group Uzbekistan", roleRu: "Международный девелопмент и генподряд", roleUz: "Xalqaro devalopment va bosh pudrat" },
                      { name: "Knauf Gips Bukhara/Tashkent", roleRu: "Системы отделки и комплектные решения", roleUz: "Pardozlash tizimlari va to'liq yechimlar" },
                      { name: "UzAuto Motors", roleRu: "Сервисные и технические подразделения", roleUz: "Servis va texnik bo'linmalar" },
                    ].map((client, idx) => (
                      <div key={idx} className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/70 hover:bg-red-50/40 hover:border-red-200 transition-colors">
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>{client.name}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1 leading-tight">
                          {lang === "ru" ? client.roleRu : client.roleUz}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Pillars / Why Minimall */}
                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">🚚</span>
                      <span className="font-bold text-gray-900 text-xs">
                        {lang === "ru" ? "Собственная логистика и склад" : "Shaxsiy logistika va ombor"}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      {lang === "ru"
                        ? "Бесплатная доставка заказов от 1 000 000 сум (кроме товаров в мешках), отправка в регионы за 24–48 часов."
                        : "1 000 000 so'mdan yuqori buyurtmalarni bepul yetkazish (qopdagi tovarlar kirmaydi), viloyatlarga 24-48 soatda yetkazish."}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">🛠️</span>
                      <span className="font-bold text-gray-900 text-xs">
                        {lang === "ru" ? "Авторизованный сервис и гарантия" : "Rasmiy servis va kafolat"}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      {lang === "ru"
                        ? "Заводская гарантия до 3 лет, собственный сервисный пункт в Ташкенте и наличие оригинальных запчастей."
                        : "3 yilgacha zavod kafolati, Toshkentda shaxsiy servis markazi va original ehtiyot qismlar mavjudligi."}
                    </p>
                  </div>
                </div>

                {/* Showroom Contacts Footer inside About */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-sm">
                      {lang === "ru" ? "Приезжайте в наш шоу-рум в Ташкенте" : "Toshkentdagi showroomimizga tashrif buyuring"}
                    </div>
                    <div className="text-gray-300 text-[11px] mt-0.5">
                      📍 {lang === "ru" ? "г. Ташкент (координаты 41°21'21.1\"N 69°14'41.8\"E) • Пн–Вс с 9:00 до 19:00" : "Toshkent sh. (koordinatalar 41°21'21.1\"N 69°14'41.8\"E) • Du–Ya 9:00 dan 19:00 gacha"}
                    </div>
                  </div>
                  <a
                    href="tel:+998970363636"
                    className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition-all shrink-0 text-xs shadow-md"
                  >
                    <span>📞 +998 (97) 036 36 36</span>
                  </a>
                </div>
              </div>
            )}

            {section === "delivery" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  {lang === "ru" ? "Доставка и получение заказов" : "Yetkazib berish va buyurtmalarni olish"}
                </h2>
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <span>🚚</span> <span>{lang === "ru" ? "Бесплатная доставка от 1 000 000 сум" : "1 000 000 so'mdan bepul yetkazib berish"}</span>
                    </h3>
                    <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                      {lang === "ru"
                        ? "Доставка осуществляется БЕСПЛАТНО при заказе на сумму от 1 000 000 сум. Важное примечание: товары в мешках (сухие строительные смеси, цемент, шпатлевка и т.д.) не учитываются при расчете суммы для бесплатной доставки."
                        : "Buyurtma summasi 1 000 000 so'm va undan yuqori bo'lganda yetkazib berish BEPUL amalga oshiriladi. Muhim eslatma: qopdagi tovarlar (quruq qurilish aralashmalari, sement, shpatlyovka va h.k.) bepul yetkazib berish summasiga kirmaydi."}
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <span>🤝</span> <span>{lang === "ru" ? "Доставка до 1 000 000 сум и мешковых товаров" : "1 000 000 so'mgacha va qopdagi tovarlar"}</span>
                    </h3>
                    <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                      {lang === "ru"
                        ? "При сумме заказа менее 1 000 000 сум, а также при заказе товаров в мешках, стоимость доставки является договорной и рассчитывается индивидуально менеджером в зависимости от объема груза и адреса."
                        : "Buyurtma summasi 1 000 000 so'mdan kam bo'lganda, shuningdek qopdagi tovarlar uchun yetkazib berish narxi kelishilgan holda, yuk hajmi va manzilga qarab alohida hisoblanadi."}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <span>📦</span> <span>{lang === "ru" ? "Доставка по всему Узбекистану" : "O'zbekiston bo'ylab yetkazib berish"}</span>
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {lang === "ru"
                        ? "Отправляем заказы через надежные курьерские службы (BTS, Fargo, EMU) в Самарканд, Бухару, Андижан, Фергану, Наманган и другие города в течение 24–48 часов."
                        : "Viloyatlarga buyurtmalar (Samarqand, Buxoro, Andijon, Farg'ona, Namangan va h.k.) ishonchli kuryerlik xizmatlari orqali 24-48 soat ichida yetkaziladi."}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <span>🏬</span> <span>{lang === "ru" ? "Самовывоз со склада" : "Ombordan olib ketish"}</span>
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {lang === "ru"
                        ? "Вы можете самостоятельно и бесплатно забрать и проверить инструмент в нашем пункте выдачи в Ташкенте с 9:00 до 19:00."
                        : "Buyurtmangizni Toshkentdagi punktimizdan har kuni soat 9:00 dan 19:00 gacha bepul olib ketishingiz mumkin."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {section === "payment" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  Способы оплаты
                </h2>
                <p className="text-xs text-gray-600">Мы принимаем все популярные и безопасные способы расчета:</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-gray-200">
                    <div className="font-bold text-gray-900 flex items-center gap-2">💵 Наличными курьеру</div>
                    <div className="text-xs text-gray-500 mt-1">Оплата после осмотра товара при получении в руки курьеру.</div>
                  </div>
                  <div className="p-4 rounded-2xl border border-gray-200">
                    <div className="font-bold text-gray-900 flex items-center gap-2">📱 Click / Payme</div>
                    <div className="text-xs text-gray-500 mt-1">Быстрый перевод через приложение на расчетный счет продавца.</div>
                  </div>
                  <div className="p-4 rounded-2xl border border-gray-200 sm:col-span-2">
                    <div className="font-bold text-gray-900 flex items-center gap-2">🏢 Безналичный расчет для юридических лиц</div>
                    <div className="text-xs text-gray-500 mt-1">Выставление счета на оплату через ЭСФ (электронные счета-фактуры) с НДС и полным пакетом закрывающих документов.</div>
                  </div>
                </div>
              </div>
            )}

            {section === "warranty" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  Официальная гарантия
                </h2>
                <p>
                  На весь инструмент, представленный на Minimall.uz, распространяется <strong>официальная гарантия производителя от 1 года до 3 лет</strong>.
                </p>
                <p className="text-xs text-gray-600">
                  В комплекте с каждым заказом покупатель получает гарантийный талон с печатью и датой продажи. В случае возникновения вопросов по работе оборудования наши инженеры проводят бесплатную диагностику в авторизованных центрах.
                </p>
              </div>
            )}

            {section === "returns" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  {lang === "ru" ? "Возврат и обмен товара" : "Tovarni qaytarish va almashtirish"}
                </h2>
                <p className="leading-relaxed">
                  {lang === "ru"
                    ? "Вы имеете право вернуть или обменять приобретенный товар надлежащего качества в течение 4 дней с момента покупки при соблюдении следующих условий:"
                    : "Siz xarid qilingan tegishli sifatdagi tovarni sotib olingan kundan boshlab 4 kun ichida quyidagi shartlarga rioya qilingan holda qaytarishingiz yoki almashtirishingiz mumkin:"}
                </p>
                <ul className="list-disc list-inside text-xs text-gray-700 space-y-2 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <li>
                    {lang === "ru"
                      ? "Срок возврата и обмена — в течение 4 дней с момента получения товара."
                      : "Qaytarish va almashtirish muddati — tovar olingan kundan boshlab 4 kun ichida."}
                  </li>
                  <li>
                    {lang === "ru"
                      ? "Товар не был в эксплуатации, отсутствуют следы монтажа или использования."
                      : "Tovar ishlatilmagan, montaj yoki foydalanish izlari bo'lmasligi lozim."}
                  </li>
                  <li>
                    {lang === "ru"
                      ? "Полностью сохранен товарный вид, заводская упаковка, пломбы и комплектные аксессуары."
                      : "Tovar ko'rinishi, zavod o'rami, plombalari va jamlanma aksessuarlari to'liq saqlangan bo'lishi kerak."}
                  </li>
                  <li>
                    {lang === "ru"
                      ? "Имеется кассовый/электронный чек либо иной документ, подтверждающий факт покупки."
                      : "Xarid cheki yoki xaridni tasdiqlovchi boshqa hujjat mavjud bo'lishi kerak."}
                  </li>
                </ul>
              </div>
            )}

            {section === "service" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  Авторизованные сервисные центры
                </h2>
                <p className="text-xs text-gray-600">
                  Обслуживание техники Bosch, Makita, DeWalt и других брендов осуществляется в сертифицированных мастерских г. Ташкента с оригинальными запчастями.
                </p>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
                  <div className="font-bold text-gray-900">Центральный сервисный пункт Minimall:</div>
                  <div>📍 г. Ташкент, координаты 41°21'21.1"N 69°14'41.8"E</div>
                  <div>📞 Прием заявок на сервис: +998 (97) 036 36 36</div>
                  <div>⏱ Режим работы: Пн–Вс с 9:00 до 19:00</div>
                </div>
              </div>
            )}

            {section === "contacts" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  Контакты и магазин
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-2">
                    <div className="font-bold text-gray-900 text-sm">Отдел продаж и консультаций</div>
                    <div>📞 Телефон: <a href="tel:+998970363636" className="font-bold text-red-600">+998 (97) 036 36 36</a></div>
                    <div>✉️ Email: <a href="mailto:info@minimall.uz" className="text-gray-800">info@minimall.uz</a></div>
                    <div>✈️ Telegram: <a href="https://t.me/minimall_uz" target="_blank" rel="noreferrer" className="text-sky-600 font-bold">@minimall_uz</a></div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-2">
                    <div className="font-bold text-gray-900 text-sm">Адрес и время работы</div>
                    <div>📍 г. Ташкент (координаты 41°21'21.1"N 69°14'41.8"E)</div>
                    <div>⏱ Часы работы: с 9:00 до 19:00 каждый день без выходных</div>
                  </div>
                </div>
              </div>
            )}

            {section === "b2b" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  Для юридических лиц и оптовых клиентов
                </h2>
                <p>
                  Minimall.uz комплектует строительные объекты, промышленные предприятия и монтажные бригады по всему Узбекистану.
                </p>
                <div className="p-4 bg-red-50/70 rounded-2xl border border-red-100 space-y-2 text-xs">
                  <div className="font-bold text-red-800">Преимущества работы с нами:</div>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Специальные оптовые цены и гибкая система скидок</li>
                    <li>Работа по официальному договору и ЭСФ с НДС</li>
                    <li>Персональный менеджер для быстрого подбора оборудования</li>
                    <li>Отсрочка платежа для постоянных партнеров.</li>
                  </ul>
                  <div className="pt-2">
                    Отправляйте спецификации и реквизиты на <a href="mailto:info@minimall.uz" className="font-bold text-red-600">info@minimall.uz</a> или звоните <a href="tel:+998970363636" className="font-bold text-red-600">+998 (97) 036 36 36</a>.
                  </div>
                </div>
              </div>
            )}

            {section === "careers" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  Вакансии в Minimall
                </h2>
                <p className="text-xs text-gray-600">
                  Мы активно растем и приглашаем в команду профессионалов в Ташкенте:
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-900">Менеджер по продажам строительного инструмента</span>
                      <div className="text-gray-500 text-[11px]">Ташкент, полная занятость</div>
                    </div>
                    <span className="text-red-600 font-bold">от 6 000 000 сум</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-900">Специалист по складской логистике</span>
                      <div className="text-gray-500 text-[11px]">Ташкент, график 6/1</div>
                    </div>
                    <span className="text-red-600 font-bold">от 5 000 000 сум</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Резюме отправляйте на <a href="mailto:info@minimall.uz" className="text-red-600 font-bold">info@minimall.uz</a> с темой «Резюме».
                </p>
              </div>
            )}

            {section === "blog" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  Блог и советы экспертов
                </h2>
                <div className="space-y-3 text-xs">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[10px] text-red-600 font-bold uppercase">Руководство</span>
                    <h3 className="font-bold text-sm text-gray-900 mt-1">Как отличить оригинальный перфоратор Bosch от реплики?</h3>
                    <p className="text-gray-500 mt-1">Обзор серийных номеров, качества литья корпуса и защитных голограмм официального дистрибьютора.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[10px] text-red-600 font-bold uppercase">Сравнение</span>
                    <h3 className="font-bold text-sm text-gray-900 mt-1">Аккумуляторный или сетевой шуруповерт: что выбрать для стройки?</h3>
                    <p className="text-gray-500 mt-1">Анализ мощности, автономности и веса при работе на высоте.</p>
                  </div>
                </div>
              </div>
            )}

            {section === "offer" && (
              <div className="space-y-3 text-xs text-gray-600">
                <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  Публичная оферта интернет-магазина Minimall.uz
                </h2>
                <p>
                  Настоящий документ является официальным предложением (публичной офертой) маркетплейса Minimall.uz заключить договор купли-продажи товаров дистанционным способом.
                </p>
                <p>
                  1. Акцептом оферты признается оформление покупателем заказа на сайте Minimall.uz или подтверждение заказа оператору контакт-центра.
                </p>
                <p>
                  2. Продавец гарантирует соответствие передаваемого товара заявленным характеристикам, а также надлежащее качество и оригинальность продукции.
                </p>
                <p>
                  3. Оплата товара производится выбранным покупателем способом из представленных на сайте при оформлении заказа.
                </p>
              </div>
            )}

            {section === "privacy" && (
              <div className="space-y-3 text-xs text-gray-600">
                <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  Политика конфиденциальности и обработки данных
                </h2>
                <p>
                  Minimall.uz с уважением относится к персональным данным клиентов и строго соблюдает Закон Республики Узбекистан «О персональных данных».
                </p>
                <p>
                  1. Данные клиента (имя, номер телефона, адрес доставки) используются исключительно для выполнения заказов, информирования о статусе доставки и обратной связи.
                </p>
                <p>
                  2. Мы не передаем конфиденциальную информацию третьим лицам, за исключением служб курьерской доставки для вручения заказа.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

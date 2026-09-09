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
  | "offer"
  | "privacy";

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
                    {lang === "ru" ? "mini-mall.uz — Эксперт и надежный маркетплейс инструмента в Узбекистане" : "mini-mall.uz — O'zbekistonda ishonchli asboblar va uskunalar bozori"}
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
                      ? "Сегодня mini-mall.uz — это продуманная экосистема для снабжения строительных объектов любой сложности: от компактных мастерских до масштабных промышленных комплексов. Мы исключаем серые схемы и подделки: каждый поставляемый инструмент имеет официальный серийный номер, сертифицирован и обеспечивается гарантией авторизованных сервисных центров."
                      : "Bugungi kunda mini-mall.uz — har qanday murakkablikdagi qurilish obyektlarini ta'minlash uchun qulay ekotizimdir. Har bir taqdim etilayotgan asbob rasmiy seriya raqamiga ega, to'liq sertifikatlangan va rasmiy servis kafolatiga ega."}
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
                  На весь инструмент, представленный на mini-mall.uz, распространяется <strong>официальная гарантия производителя от 1 года до 3 лет</strong>.
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
                    <div>✉️ Email: <a href="mailto:minimalluzbek@gmail.com" className="text-gray-800">minimalluzbek@gmail.com</a></div>
                    <div>✈️ Telegram: <a href="https://t.me/minimall_uzb" target="_blank" rel="noreferrer" className="text-sky-600 font-bold hover:underline">@minimall_uzb</a></div>
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
                  mini-mall.uz комплектует строительные объекты, промышленные предприятия и монтажные бригады по всему Узбекистану.
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
                    Отправляйте спецификации и реквизиты на <a href="mailto:minimalluzbek@gmail.com" className="font-bold text-red-600">minimalluzbek@gmail.com</a>, пишите в Telegram <a href="https://t.me/minimall_uzb" target="_blank" rel="noreferrer" className="font-bold text-sky-600">@minimall_uzb</a> или звоните <a href="tel:+998970363636" className="font-bold text-red-600">+998 (97) 036 36 36</a>.
                  </div>
                </div>
              </div>
            )}

            {section === "offer" && (
              <div className="space-y-6 text-gray-800 text-xs leading-relaxed">
                {/* Formal Document Header */}
                <div className="border-b border-gray-200 pb-5">
                  <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-full mb-3 border border-gray-300">
                    <span>⚖️</span>
                    <span>{lang === "ru" ? "Официальный юридический документ" : "Rasmiy yuridik hujjat"}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                    {lang === "ru"
                      ? "ДОГОВОР ПУБЛИЧНОЙ ОФЕРТЫ КУПЛИ-ПРОДАЖИ ТОВАРОВ ДИСТАНЦИОННЫМ СПОСОБОМ"
                      : "TOVARLARNI MASOFADAN SOTISH VA SOTIB OLISH BO'YICHA OMMAVIY OFERTA SHARTNOMASI"}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-[11px] text-gray-500 mt-2 font-mono">
                    <span>{lang === "ru" ? "г. Ташкент, Республика Узбекистан" : "Toshkent sh., O'zbekiston Respublikasi"}</span>
                    <span>•</span>
                    <span>{lang === "ru" ? "Редакция от 01 января 2024 года" : "Tahrir: 2024 yil 1 yanvar"}</span>
                    <span>•</span>
                    <span>{lang === "ru" ? "Юрисдикция: Республика Узбекистан" : "Yurisdiksiya: O'zbekiston"}</span>
                  </div>
                </div>

                {/* Preamble */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 text-[11px] text-gray-700 space-y-2">
                  <p>
                    {lang === "ru"
                      ? "Настоящий документ является официальным предложением (публичной офертой) маркетплейса «mini-mall.uz» (далее — «Продавец») в соответствии со статьями 367, 369 и 426 Гражданского кодекса Республики Узбекистан, Законом Республики Узбекистан «Об электронной коммерции» и Законом Республики Узбекистан «О защите прав потребителей»."
                      : "Ushbu hujjat O'zbekiston Respublikasi Fuqarolik kodeksining 367, 369 va 426-moddalariga, «Elektron tijorat to'g'risida»gi hamda «Iste'molchilarning huquqlarini himoya qilish to'g'risida»gi qonunlariga muvofiq, «mini-mall.uz» savdo maydonchasining (keyingi o'rinlarda — «Sotuvchi») rasmiy ommaviy ofertasi hisoblanadi."}
                  </p>
                  <p>
                    {lang === "ru"
                      ? "Оформление Заказа на сайте https://mini-mall.uz, а равно подтверждение Заказа оператору контакт-центра является полным и безоговорочным акцептом настоящей Оферты Покупателем (ст. 370 ГК РУз)."
                      : "https://mini-mall.uz veb-saytida buyurtmani rasmiylashtirish yoki kontakt-markaz operatoriga buyurtmani tasdiqlash Xaridor tomonidan ushbu Ofertaning to'liq va so'zsiz qabul qilinishi (aksept) hisoblanadi."}
                  </p>
                </div>

                {/* Article 1 */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-red-600">§ 1.</span>
                    <span>{lang === "ru" ? "Термины и определения" : "Atamalar va ta'riflar"}</span>
                  </h3>
                  <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-700">
                    <li><strong>{lang === "ru" ? "Продавец" : "Sotuvchi"}</strong> — интернет-магазин mini-mall.uz, осуществляющий реализацию строительного оборудования, электроинструмента и расходных материалов дистанционным способом.</li>
                    <li><strong>{lang === "ru" ? "Покупатель" : "Xaridor"}</strong> — дееспособное физическое или юридическое лицо, оформившее заказ исключительно для личных, коммерческих или производственных нужд на условиях настоящего Договора.</li>
                    <li><strong>{lang === "ru" ? "Товар" : "Tovar"}</strong> — сертифицированная материальная продукция производственно-технического назначения, представленная в каталоге интернет-магазина.</li>
                    <li><strong>{lang === "ru" ? "Заказ" : "Buyurtma"}</strong> — должным образом оформленный электронный запрос Покупателя на покупку и доставку выбранных позиций Товара по указанному адресу.</li>
                  </ul>
                </div>

                {/* Article 2 */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-red-600">§ 2.</span>
                    <span>{lang === "ru" ? "Предмет договора" : "Shartnoma predmeti"}</span>
                  </h3>
                  <p>
                    {lang === "ru"
                      ? "2.1. Продавец обязуется передать в собственность Покупателя Товар надлежащего качества, соответствующий заявленным техническим характеристикам и стандартам производителей (Bosch, Makita, DeWalt и др.), а Покупатель обязуется своевременно принять и оплатить Товар в порядке и на условиях, установленных настоящим Договором."
                      : "2.1. Sotuvchi e'lon qilingan texnik tavsiflar va ishlab chiqaruvchi standartlariga (Bosch, Makita, DeWalt va h.k.) mos keladigan sifatli Tovarni Xaridor egaligiga topshirish majburiyatini, Xaridor esa ushbu Shartnomada belgilangan tartibda qabul qilish va to'lash majburiyatini oladi."}
                  </p>
                  <p>
                    {lang === "ru"
                      ? "2.2. Право собственности на Товар, а также риски его случайной гибели или повреждения переходят к Покупателю в момент фактической передачи Товара и подписания товарно-сопроводительных документов."
                      : "2.2. Tovarga egalik huquqi hamda uning tasodifiy yo'qolishi yoki shikastlanishi xavfi Tovar amalda topshirilgan va yuk xati imzolangan paytdan boshlab Xaridorga o'tadi."}
                  </p>
                </div>

                {/* Article 3 */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-red-600">§ 3.</span>
                    <span>{lang === "ru" ? "Цена товаров и финансовые расчеты" : "Tovar narxi va hisob-kitoblar tartibi"}</span>
                  </h3>
                  <p>
                    {lang === "ru"
                      ? "3.1. Все цены на Товары в маркетплейсе mini-mall.uz указываются в национальной валюте Республики Узбекистан — сумах (UZS) и включают все применимые налоги."
                      : "3.1. mini-mall.uz saytidagi barcha tovar narxlari O'zbekiston Respublikasining milliy valyutasi — so'mda (UZS) ko'rsatiladi va barcha tegishli soliqlarni o'z ichiga oladi."}
                  </p>
                  <p>
                    {lang === "ru"
                      ? "3.2. Оплата производится следующими способами: наличными денежными средствами курьеру при получении; посредством платежных систем Click / Payme; либо безналичным банковским переводом на расчетный счет Продавца на основании выставленного электронного счета-фактуры (ЭСФ) с выделенным НДС."
                      : "3.2. To'lov quyidagi usullarda amalga oshiriladi: tovar olinganda kuryerga naqd pul; Click / Payme to'lov tizimlari orqali; yoki QQS ko'rsatilgan elektron hisob-faktura (EHF) asosida Sotuvchining hisob-raqamiga bank o'tkazmasi orqali."}
                  </p>
                </div>

                {/* Article 4 - Delivery with 1,000,000 UZS rules */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-red-600">§ 4.</span>
                    <span>{lang === "ru" ? "Регламент доставки и логистики" : "Yetkazib berish va logistika reglamenti"}</span>
                  </h3>
                  <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 space-y-1.5">
                    <p>
                      <strong>{lang === "ru" ? "4.1. Бесплатная доставка:" : "4.1. Bepul yetkazib berish:"}</strong>{" "}
                      {lang === "ru"
                        ? "Доставка по городу Ташкенту осуществляется БЕСПЛАТНО при совокупной сумме Заказа от 1 000 000 (одного миллиона) сум."
                        : "Buyurtmaning umumiy summasi 1 000 000 (bir million) so'm va undan yuqori bo'lganda Toshkent shahri bo'ylab yetkazib berish BEPUL amalga oshiriladi."}
                    </p>
                    <p>
                      <strong>{lang === "ru" ? "4.2. Исключение для мешковых товаров:" : "4.2. Qopdagi tovarlar uchun istisno:"}</strong>{" "}
                      {lang === "ru"
                        ? "Товары, поставляемые в мешковой таре (сухие строительные смеси, шпатлевка, цемент, клеевые составы и аналогичные тяжеловесные строительные материалы), НЕ УЧИТЫВАЮТСЯ при расчете порога бесплатной доставки в силу повышенного веса и объема."
                        : "Qopdagi tovarlar (quruq qurilish qorishmalari, shpatlyovka, sement, yelimlar va shunga o'xshash og'ir qurilish materiallari) yuqori og'irlik va hajm sababli bepul yetkazib berish chegarasini hisoblashda HISOBGA OLINMAYDI."}
                    </p>
                    <p>
                      <strong>{lang === "ru" ? "4.3. Договорная доставка:" : "4.3. Kelishilgan yetkazib berish:"}</strong>{" "}
                      {lang === "ru"
                        ? "При сумме Заказа менее 1 000 000 сум, а равно при заказе мешковой продукции, стоимость транспортной доставки является ДОГОВОРНОЙ и согласовывается с менеджером индивидуально."
                        : "Buyurtma summasi 1 000 000 so'mdan kam bo'lganda yoki qopdagi tovarlar xarid qilinganda yetkazib berish narxi KELISHILGAN bo'lib, menejer bilan alohida tasdiqlanadi."}
                    </p>
                    <p>
                      <strong>{lang === "ru" ? "4.4. Доставка по регионам Узбекистана:" : "4.4. Viloyatlar bo'ylab yetkazish:"}</strong>{" "}
                      {lang === "ru"
                        ? "Осуществляется партнерскими логистическими операторами (BTS, Fargo, EMU) в течение 24–48 часов с момента комплектации Заказа."
                        : "Buyurtma shakllantirilgandan so'ng 24-48 soat ichida hamkor logistika xizmatlari (BTS, Fargo, EMU) orqali amalga oshiriladi."}
                    </p>
                  </div>
                </div>

                {/* Article 5 - 4-day returns */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-red-600">§ 5.</span>
                    <span>{lang === "ru" ? "Порядок возврата и обмена товара" : "Tovarni qaytarish va almashtirish tartibi"}</span>
                  </h3>
                  <p>
                    {lang === "ru"
                      ? "5.1. В соответствии с регламентом маркетплейса mini-mall.uz Покупатель вправе заявить о возврате или обмене непродовольственного товара надлежащего качества в течение 4 (четырех) календарных дней с даты фактического получения Товара."
                      : "5.1. mini-mall.uz savdo maydonchasi reglamentiga muvofiq, Xaridor tegishli sifatdagi nooziq-ovqat tovarini amalda qabul qilib olgan kundan boshlab 4 (to'rt) kalendar kun ichida qaytarish yoki almashtirish huquqiga ega."}
                  </p>
                  <p>
                    {lang === "ru"
                      ? "5.2. Возврат или обмен Товара надлежащего качества допускается исключительно при одновременном соблюдении следующих критериев:"
                      : "5.2. Tegishli sifatdagi tovarni qaytarish yoki almashtirish faqat quyidagi shartlar bir vaqtda bajarilganda amalga oshiriladi:"}
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-2 text-gray-700">
                    <li>{lang === "ru" ? "Товар не был в эксплуатации (отсутствуют следы подключения, монтажа, царапины и сколы);" : "Tovar ishlatilmagan (montaj, foydalanish izlari, tirnalishlar yo'q);"}</li>
                    <li>{lang === "ru" ? "Полностью сохранены товарный вид, потребительские свойства, заводская упаковка, пломбы и фирменные ярлыки;" : "Tovar ko'rinishi, iste'mol xususiyatlari, zavod o'rami, plombalari va yorliqlari to'liq saqlangan;"}</li>
                    <li>{lang === "ru" ? "Предоставлен фискальный чек, электронный документ об оплате либо товарная накладная." : "Fiskal chek, to'lov to'g'risidagi elektron hujjat yoki yuk xati taqdim etilgan."}</li>
                  </ul>
                  <p>
                    {lang === "ru"
                      ? "5.3. Возврат денежных средств осуществляется в течение 3 (трех) банковских дней с момента осмотра Товара на складе Продавца тем же способом, которым была произведена оплата."
                      : "5.3. Pul mablag'larini qaytarish Tovar Sotuvchi omborida ko'rikdan o'tkazilgan paytdan boshlab 3 (uch) bank kuni ichida to'lov qanday usulda amalga oshirilgan bo'lsa, xuddi shu usulda qaytariladi."}
                  </p>
                </div>

                {/* Article 6 */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-red-600">§ 6.</span>
                    <span>{lang === "ru" ? "Гарантийные обязательства и сервис" : "Kafolat majburiyatlari va servis"}</span>
                  </h3>
                  <p>
                    {lang === "ru"
                      ? "6.1. На весь поставляемый профессиональный электроинструмент распространяется официальная заводская гарантия фирм-производителей на срок от 12 до 36 месяцев."
                      : "6.1. Barcha taqdim etilayotgan professional asboblarga ishlab chiqaruvchi korxonalar tomonidan 12 oydan 36 oygacha rasmiy zavod kafolati beriladi."}
                  </p>
                  <p>
                    {lang === "ru"
                      ? "6.2. Гарантийное и постгарантийное техническое обслуживание осуществляется в авторизованных сервисных центрах на территории Республики Узбекистан при предъявлении оригинального гарантийного талона."
                      : "6.2. Kafolatli va kafolatdan keyingi texnik xizmat ko'rsatish O'zbekiston Respublikasi hududidagi rasmiy servis markazlarida kafolat taloni taqdim etilganda amalga oshiriladi."}
                  </p>
                </div>

                {/* Article 7 */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-red-600">§ 7.</span>
                    <span>{lang === "ru" ? "Ответственность сторон и разрешение споров" : "Tomonlarning javobgarligi va nizolarni hal etish"}</span>
                  </h3>
                  <p>
                    {lang === "ru"
                      ? "7.1. Стороны несут ответственность за неисполнение либо ненадлежащее исполнение обязательств в соответствии с действующим законодательством Республики Узбекистан."
                      : "7.1. Tomonlar majburiyatlarni bajarmaganlik yoki lozim darajada bajarmaganlik uchun O'zbekiston Respublikasining amaldagi qonunchiligiga muvofiq javobgar bo'ladilar."}
                  </p>
                  <p>
                    {lang === "ru"
                      ? "7.2. Все споры и разногласия разрешаются путем переговоров. В случае недостижения согласия спор подлежит рассмотрению в судебных органах города Ташкента."
                      : "7.2. Barcha nizolar muzokaralar yo'li bilan hal qilinadi. Kelishuvga erishilmagan taqdirda, nizo Toshkent shahri sud organlarida ko'rib chiqiladi."}
                  </p>
                </div>

                {/* Sign-off Seal */}
                <div className="pt-4 border-t border-gray-200 text-[11px] text-gray-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-gray-50/60 p-3 rounded-xl font-mono">
                  <div>Юрисдикция: г. Ташкент • Электронная коммерция РУз</div>
                  <div className="text-gray-900 font-bold">Minimall Marketplace • Юридическая служба</div>
                </div>
              </div>
            )}

            {section === "privacy" && (
              <div className="space-y-6 text-gray-800 text-xs leading-relaxed">
                {/* Formal Document Header */}
                <div className="border-b border-gray-200 pb-5">
                  <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-full mb-3 border border-gray-300">
                    <span>🔒</span>
                    <span>{lang === "ru" ? "Политика информационной безопасности" : "Axborot xavfsizligi siyosati"}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                    {lang === "ru"
                      ? "ПОЛОЖЕНИЕ ОБ ОБРАБОТКЕ И ЗАЩИТЕ ПЕРСОНАЛЬНЫХ ДАННЫХ ПОЛЬЗОВАТЕЛЕЙ"
                      : "FOYDALANUVCHILARNING SHAXSIY MA'LUMOTLARINI QAYTA ISHLASH VA HIMOYALASH TO'G'RISIDAGI NIZOM"}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-[11px] text-gray-500 mt-2 font-mono">
                    <span>{lang === "ru" ? "Закон РУз № ЗРУ-547 «О персональных данных»" : "O'zbekiston Qonuni O'RQ-547 «Shaxsiy ma'lumotlar to'g'risida»"}</span>
                    <span>•</span>
                    <span>{lang === "ru" ? "Редакция от 2024 года" : "Tahrir: 2024 yil"}</span>
                  </div>
                </div>

                {/* Preamble */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 text-[11px] text-gray-700 space-y-2">
                  <p>
                    {lang === "ru"
                      ? "Настоящее Положение определяет порядок обработки, систематизации, хранения и защиты персональных данных субъектов (пользователей и клиентов маркетплейса mini-mall.uz) в строгом соответствии с Законом Республики Узбекистан «О персональных данных» от 2 июля 2019 года № ЗРУ-547 и международными стандартами информационной безопасности."
                      : "Ushbu Nizom 2019 yil 2 iyuldagi O'zbekiston Respublikasining «Shaxsiy ma'lumotlar to'g'risida»gi O'RQ-547-son Qonuniga muvofiq, mini-mall.uz foydalanuvchilari shaxsiy ma'lumotlarini qayta ishlash, saqlash va himoya qilish tartibini belgilaydi."}
                  </p>
                  <p>
                    {lang === "ru"
                      ? "Использование Сервиса, оформление Заказа или регистрация учетной записи означает безоговорочное согласие субъекта персональных данных с настоящим Положением."
                      : "Saytdan foydalanish, buyurtma berish yoki ro'yxatdan o'tish subyektning ushbu Nizom shartlariga to'liq roziligini bildiradi."}
                  </p>
                </div>

                {/* Article 1 */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-red-600">§ 1.</span>
                    <span>{lang === "ru" ? "Категории и объем обрабатываемых данных" : "Qayta ishlanadigan ma'lumotlar toifalari"}</span>
                  </h3>
                  <p>
                    {lang === "ru"
                      ? "Оператор осуществляет обработку исключительно тех персональных данных, которые необходимы для полноценного исполнения договорных обязательств перед Пользователем:"
                      : "Operator foydalanuvchi oldidagi majburiyatlarni to'liq bajarish uchun zarur bo'lgan shaxsiy ma'lumotlarni qayta ishlaydi:"}
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-700">
                    <li><strong>{lang === "ru" ? "Идентификационные данные:" : "Identifikatsiya ma'lumotlari:"}</strong> {lang === "ru" ? "Фамилия, имя, отчество, контактный номер телефона, адрес электронной почты." : "Familiya, ism, sharif, telefon raqami, elektron pochta manzili."}</li>
                    <li><strong>{lang === "ru" ? "Адресные данные:" : "Manzil ma'lumotlari:"}</strong> {lang === "ru" ? "Точный географический адрес доставки заказов, ориентиры, почтовый индекс." : "Yetkazib berishning aniq manzili, mo'ljallar."}</li>
                    <li><strong>{lang === "ru" ? "Реквизиты юридических лиц (B2B):" : "Yuridik shaxslar rekvizitlari:"}</strong> {lang === "ru" ? "Наименование организации, ИНН, ОКЭД, банковские реквизиты, статус плательщика НДС." : "Tashkilot nomi, STIR (INN), bank rekvizitlari, QQS to'lovchisi maqomi."}</li>
                    <li><strong>{lang === "ru" ? "Технические сведения:" : "Texnik ma'lumotlar:"}</strong> {lang === "ru" ? "IP-адрес, данные файлов cookies, сведения о типе браузера и операционной системы устройства." : "IP-manzil, cookie fayllari, brauzer va qurilma operatsion tizimi to'g'risidagi ma'lumotlar."}</li>
                  </ul>
                </div>

                {/* Article 2 */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-red-600">§ 2.</span>
                    <span>{lang === "ru" ? "Цели обработки персональной информации" : "Shaxsiy ma'lumotlarni qayta ishlash maqsadlari"}</span>
                  </h3>
                  <ul className="list-disc list-inside space-y-1 pl-2 text-gray-700">
                    <li>{lang === "ru" ? "Оформление, комплектация, бухгалтерский учет и вручение Заказов Покупателю;" : "Buyurtmalarni rasmiylashtirish, buxgalteriya hisobi va xaridorni yetkazib berish;"}</li>
                    <li>{lang === "ru" ? "Осуществление электронного документооборота и выставление счетов-фактур (ЭСФ);" : "Elektron hujjat aylanishi va elektron hisob-fakturalarni (EHF) rasmiylashtirish;"}</li>
                    <li>{lang === "ru" ? "Информирование о статусе логистического перемещения отправления посредством SMS и телефонной связи;" : "SMS va qo'ng'iroqlar orqali yetkazib berish holati haqida xabardor qilish;"}</li>
                    <li>{lang === "ru" ? "Обеспечение гарантийного сервисного обслуживания приобретенного оборудования." : "Xarid qilingan uskunalarga kafolatli texnik xizmat ko'rsatishni ta'minlash."}</li>
                  </ul>
                </div>

                {/* Article 3 - Storage compliance */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-red-600">§ 3.</span>
                    <span>{lang === "ru" ? "Локализация и техническая безопасность хранения" : "Lokalizatsiya va saqlash xavfsizligi"}</span>
                  </h3>
                  <p>
                    {lang === "ru"
                      ? "3.1. В строгом соответствии со статьей 27-1 Закона РУз «О персональных данных» базы данных, содержащие персональные сведения граждан Республики Узбекистан, размещены на защищенных серверах, физически локализованных на территории Республики Узбекистан."
                      : "3.1. O'zbekiston Respublikasining «Shaxsiy ma'lumotlar to'g'risida»gi Qonunining 27-1-moddasiga muvofiq, O'zbekiston fuqarolarining shaxsiy ma'lumotlari bazalari O'zbekiston Respublikasi hududida joylashgan serverlarda saqlanadi."}
                  </p>
                  <p>
                    {lang === "ru"
                      ? "3.2. Оператор применяет комплекс административных, организационных и программно-технических мер, включая сквозное шифрование протокола SSL/TLS, многофакторную авторизацию персонала и регулярный аудит безопасности."
                      : "3.2. Operator SSL/TLS protokoli orqali shifrlash, ko'p bosqichli autentifikatsiya va doimiy xavfsizlik auditini o'z ichiga olgan texnik choralarni qo'llaydi."}
                  </p>
                </div>

                {/* Article 4 */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-red-600">§ 4.</span>
                    <span>{lang === "ru" ? "Передача информации третьим лицам" : "Ma'lumotlarni uchinchi shaxslarga berish"}</span>
                  </h3>
                  <p>
                    {lang === "ru"
                      ? "4.1. Передача персональных данных третьим лицам допускается исключительно в объемах, минимально необходимых для выполнения Заказа: службам курьерской экспресс-доставки (для осуществления вручения) и финансовым шлюзам (Click, Payme, обслуживающим банкам — для проведения платежа)."
                      : "4.1. Shaxsiy ma'lumotlarni uchinchi shaxslarga o'tkazish faqat buyurtmani bajarish uchun zarur bo'lgan hajmda: kuryerlik yetkazib berish xizmatlari va to'lov tizimlariga (Click, Payme, banklar) ruxsat etiladi."}
                  </p>
                  <p>
                    {lang === "ru"
                      ? "4.2. Продавец гарантирует, что ни при каких обстоятельствах не осуществляет возмездную передачу, продажу или распространение клиентских баз данных в рекламных или маркетинговых целях сторонних организаций."
                      : "4.2. Sotuvchi mijozlar ma'lumotlarini hech qanday holatda uchinchi shaxslarga sotmaslik va noqonuniy tarqatmaslik majburiyatini oladi."}
                  </p>
                </div>

                {/* Article 5 */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-red-600">§ 5.</span>
                    <span>{lang === "ru" ? "Права субъекта персональных данных" : "Shaxsiy ma'lumotlar subyektining huquqlari"}</span>
                  </h3>
                  <p>
                    {lang === "ru"
                      ? "Субъект персональных данных имеет право требовать уточнения, блокирования или полного уничтожения своих данных в случае их неполноты, устаревания или неправомерности обработки, направив официальное письменное обращение на адрес электронной почты minimalluzbek@gmail.com."
                      : "Foydalanuvchi o'z shaxsiy ma'lumotlarini aniqlashtirish, bloklash yoki butunlay o'chirishni talab qilish huquqiga ega bo'lib, buning uchun minimalluzbek@gmail.com manziliga yozma murojaat yuborishi kifoya."}
                  </p>
                </div>

                {/* Sign-off Seal */}
                <div className="pt-4 border-t border-gray-200 text-[11px] text-gray-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-gray-50/60 p-3 rounded-xl font-mono">
                  <div>Соответствие Закону № ЗРУ-547 • Безопасность данных</div>
                  <div className="text-gray-900 font-bold">Служба информационной безопасности mini-mall.uz</div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

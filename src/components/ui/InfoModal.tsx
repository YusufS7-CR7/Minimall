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
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  О маркетплейсе Minimall.uz
                </h2>
                <p>
                  <strong>Minimall.uz</strong> — ведущий специализированный маркетплейс строительного, монтажного и профессионального инструмента в Узбекистане. Мы объединяем проверенных дилеров и предоставляем только 100% оригинальную технику мировых брендов: Bosch, Makita, DeWalt, Milwaukee, Crown, Total, Ingco и других.
                </p>
                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-red-50/60 p-4 rounded-2xl border border-red-100">
                    <div className="text-2xl mb-1">🛡️</div>
                    <div className="font-bold text-gray-900 text-sm">100% оригинал</div>
                    <div className="text-xs text-gray-500 mt-1">Официальные поставки с заводской гарантией</div>
                  </div>
                  <div className="bg-red-50/60 p-4 rounded-2xl border border-red-100">
                    <div className="text-2xl mb-1">⚡</div>
                    <div className="font-bold text-gray-900 text-sm">Быстрая доставка</div>
                    <div className="text-xs text-gray-500 mt-1">День в день по Ташкенту и 1-2 дня по регионам РУз</div>
                  </div>
                  <div className="bg-red-50/60 p-4 rounded-2xl border border-red-100">
                    <div className="text-2xl mb-1">🤝</div>
                    <div className="font-bold text-gray-900 text-sm">Сервис и поддержка</div>
                    <div className="text-xs text-gray-500 mt-1">Консультации специалистов 7 дней в неделю</div>
                  </div>
                </div>
              </div>
            )}

            {section === "delivery" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  Доставка и получение заказов
                </h2>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <span>🚚</span> <span>Доставка по Ташкенту</span>
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Осуществляется курьерской службой в день заказа или на следующий день. При заказе на сумму от 1 000 000 сум — доставка бесплатная.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <span>📦</span> <span>Доставка по всему Узбекистану</span>
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Отправляем заказы через надежные экспресс-службы (BTS, Fargo, EMU) в Самарканд, Бухару, Андижан, Фергану, Наманган и другие города за 24–48 часов до двери или пункта выдачи.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <span>🏬</span> <span>Самовывоз со склада</span>
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Вы можете бесплатно забрать и проверить инструмент в нашем пункте выдачи в Ташкенте с 9:00 до 19:00.
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
                  Возврат и обмен товара
                </h2>
                <p>
                  В соответствии с Законом Республики Узбекистан «О защите прав потребителей» вы имеете право вернуть или обменять товар надлежащего качества в течение <strong>14 дней</strong> с момента покупки, если:
                </p>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                  <li>Товар не был в употреблении (отсутствуют следы эксплуатации и сколы)</li>
                  <li>Сохранен товарный вид, заводская упаковка, пломбы и ярлыки</li>
                  <li>Имеется товарный чек или подтверждение заказа.</li>
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

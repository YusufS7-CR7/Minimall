import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { CATEGORIES } from "@/data/categories";

export default function NotFoundPage() {
  const { lang } = useApp();

  useDocumentMeta({
    title: lang === "ru" ? "Страница не найдена (404) — Minimall" : "Sahifa topilmadi (404) — Minimall",
    description:
      lang === "ru"
        ? "Запрашиваемая страница не найдена на маркетплейсе mini-mall.uz. Вернитесь на главную страницу или воспользуйтесь каталогом товаров."
        : "mini-mall.uz marketpleysida so'ralgan sahifa topilmadi. Bosh sahifaga qayting yoki mahsulotlar katalogidan foydalaning.",
    noIndex: true,
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-3xl p-8 md:p-14 border border-gray-100 shadow-sm relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div
            className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600 select-none tracking-tight"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            404
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2 mb-3">
            {lang === "ru" ? "Страница не найдена" : "Sahifa topilmadi"}
          </h1>

          <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base mb-8">
            {lang === "ru"
              ? "Возможно, страница была удалена, перемещена или вы ввели неверный адрес."
              : "Sahifa o'chirilgan, boshqa manzilga ko'chirilgan yoki siz noto'g'ri havola kiritgan bo'lishingiz mumkin."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Link
              to="/"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30"
            >
              {lang === "ru" ? "На главную страницу" : "Bosh sahifaga qaytish"}
            </Link>
            <Link
              to="/catalog"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              {lang === "ru" ? "Перейти в каталог" : "Katalogga o'tish"}
            </Link>
          </div>

          {/* Quick Categories */}
          <div className="border-t border-gray-100 pt-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
              {lang === "ru" ? "Популярные категории:" : "Ommabop kategoriyalar:"}
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/catalog/${cat.slug}`}
                  className="px-3.5 py-1.5 rounded-lg bg-gray-50 hover:bg-red-50 hover:text-red-600 text-xs font-medium text-gray-600 transition-colors border border-gray-100"
                >
                  {lang === "ru" ? cat.labelRu : cat.labelUz}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

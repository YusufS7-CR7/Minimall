import { Link } from "react-router-dom";
import { T } from "@/data/translations";
import { CATEGORIES } from "@/data/categories";
import { useProducts } from "@/context/ProductsContext";
import type { Lang } from "@/data/types";

interface CatalogModalProps {
  id: string;
  lang: Lang;
  open: boolean;
  onClose: () => void;
}

export default function CatalogModal({ id, lang, open, onClose }: CatalogModalProps) {
  const t = T[lang];
  const { products } = useProducts();

  if (!open) return null;

  return (
    <div id={id} className="fixed inset-0 top-[104px] z-30 flex" role="dialog" aria-modal="true" aria-label={t.catalog}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white w-full max-w-5xl mx-auto my-4 rounded-2xl shadow-2xl p-6 overflow-hidden border border-gray-100 animate-fadeIn">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
            {t.catalog}
          </h2>
          <button onClick={onClose} aria-label="Закрыть каталог" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav aria-label="Каталог категорий">
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {CATEGORIES.map((c) => {
              const label = lang === "ru" ? c.labelRu : c.labelUz;
              const count = products.filter((p) => p.category === c.key).length;
              return (
                <li key={c.key}>
                  <Link
                    to={`/catalog/${c.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50/50 transition-all text-left group"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                      <img src={c.image} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform" width={48} height={48} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors leading-snug">{label}</div>
                      <div className="text-xs text-gray-400">{count} {lang === "ru" ? "товаров" : "ta tovar"}</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

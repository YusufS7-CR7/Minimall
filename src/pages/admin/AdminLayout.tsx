import { Link } from "react-router-dom";
import { useProducts } from "@/context/ProductsContext";
import { useApp } from "@/context/AppContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { products, exportCatalog, resetProducts } = useProducts();
  const { showToast } = useApp();

  const handleReset = () => {
    if (
      window.confirm(
        "Вы действительно хотите сбросить каталог к исходным 12 товарам? Все добавленные и отредактированные товары будут удалены."
      )
    ) {
      resetProducts();
      showToast("Каталог сброшен к исходному состоянию");
    }
  };

  const handleExport = () => {
    exportCatalog();
    showToast("Файл каталога успешно экспортирован");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Admin Top Header */}
      <header className="bg-gray-900 text-white border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Brand + Status */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.jpg"
                alt="Minimall"
                className="w-8 h-8 rounded-lg object-contain bg-white p-0.5"
              />
              <span
                className="text-xl font-extrabold tracking-wide"
                style={{ fontFamily: "Barlow Condensed, sans-serif" }}
              >
                minimall<span className="text-red-500">.admin</span>
              </span>
            </Link>
            <span className="hidden md:inline-flex items-center gap-1.5 bg-red-950/60 border border-red-500/30 text-red-400 text-xs px-2.5 py-0.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Панель управления маркетплейсом
            </span>
          </div>

          {/* Quick Actions & Storefront Link */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-colors"
              title="Скачать все товары в формате JSON"
            >
              📥 Экспорт JSON
            </button>
            <button
              onClick={handleReset}
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition-colors"
              title="Восстановить заводские 12 товаров"
            >
              🔄 Сброс к дефолту
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3.5 py-2 rounded-xl transition-all shadow-md shadow-red-600/20"
            >
              ← В магазин
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">
              Управление
            </div>
            <nav className="space-y-1">
              <Link
                to="/admin"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-red-50 text-red-700 font-semibold text-sm transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span>📦</span>
                  <span>Товары каталога</span>
                </div>
                <span className="text-xs bg-red-200/60 text-red-800 font-bold px-2 py-0.5 rounded-full">
                  {products.length}
                </span>
              </Link>

              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-400 text-sm cursor-not-allowed">
                <div className="flex items-center gap-2.5">
                  <span>🛒</span>
                  <span>Заказы</span>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-400 font-medium px-1.5 py-0.5 rounded-md">
                  Скоро
                </span>
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-400 text-sm cursor-not-allowed">
                <div className="flex items-center gap-2.5">
                  <span>👥</span>
                  <span>Продавцы / Дилеры</span>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-400 font-medium px-1.5 py-0.5 rounded-md">
                  Скоро
                </span>
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-400 text-sm cursor-not-allowed">
                <div className="flex items-center gap-2.5">
                  <span>⚡</span>
                  <span>Акции и скидки</span>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-400 font-medium px-1.5 py-0.5 rounded-md">
                  Скоро
                </span>
              </div>
            </nav>
          </div>

          {/* Quick System Info Box */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-4 shadow-sm border border-gray-800 text-xs space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-gray-200">
              <span>🚀</span>
              <span>Minimall Platform</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Все изменения каталога моментально сохраняются и синхронизируются со страницами витрины и SEO-индексацией.
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
              <span>База данных:</span>
              <span className="text-emerald-400 font-medium">LocalSync (v1)</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

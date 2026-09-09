import { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import AppContextBridge from "@/context/AppContextBridge";
import { ProductsProvider } from "@/context/ProductsContext";
import { AuthProvider } from "@/context/AuthContext";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import { OrdersProvider } from "@/context/OrdersContext";
import { BannersProvider } from "@/context/BannersContext";

// Layout components
import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import CategoryNavBar from "@/components/layout/CategoryNavBar";
import Footer from "@/components/layout/Footer";
import FloatingButtons from "@/components/layout/FloatingButtons";
import Toast from "@/components/ui/Toast";
import AuthModal from "@/components/auth/AuthModal";
import InfoModal, { type InfoModalSection } from "@/components/ui/InfoModal";

// Storefront Pages
import HomePage from "@/pages/HomePage";
import ProductPage from "@/pages/ProductPage";
import CategoryPage from "@/pages/CategoryPage";
import BrandPage from "@/pages/BrandPage";
import SearchPage from "@/pages/SearchPage";
import NotFoundPage from "@/pages/NotFoundPage";

// Admin Pages (Code-split for fast customer load times)
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminProductsPage = lazy(() => import("@/pages/admin/AdminProductsPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));
const AdminOrdersPage = lazy(() => import("@/pages/admin/AdminOrdersPage"));
const AdminBannersPage = lazy(() => import("@/pages/admin/AdminBannersPage"));
const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage"));

function AdminLoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-gray-400">Загрузка панели управления...</span>
      </div>
    </div>
  );
}

/**
 * Automatically scrolls the browser window to top on page navigation.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

function AppLayout() {
  const { lang } = useApp();
  const { pathname } = useLocation();
  const { isAuthenticated } = useAdminAuth();
  const isAdminRoute = pathname.startsWith("/admin");

  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoModalSection, setInfoModalSection] = useState<InfoModalSection>("about");

  const handleOpenInfo = (section: InfoModalSection) => {
    setInfoModalSection(section);
    setInfoModalOpen(true);
  };

  if (isAdminRoute) {
    if (!isAuthenticated) {
      return (
        <Suspense fallback={<AdminLoadingSpinner />}>
          <ScrollToTop />
          <AdminLoginPage />
          <Toast />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<AdminLoadingSpinner />}>
        <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-red-500 selection:text-white">
          <ScrollToTop />
          <AdminLayout>
            <Routes>
              <Route path="/admin" element={<AdminProductsPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/banners" element={<AdminBannersPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/admins" element={<AdminUsersPage />} />
              <Route path="/admin/*" element={<AdminProductsPage />} />
            </Routes>
          </AdminLayout>
          <Toast />
          <AuthModal />
        </div>
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-red-500 selection:text-white">
      <ScrollToTop />
      <TopBar lang={lang} onOpenInfo={handleOpenInfo} />
      <Header lang={lang} />
      <CategoryNavBar lang={lang} />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CategoryPage />} />
          <Route path="/catalog/:slug" element={<CategoryPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/brand/:slug" element={<BrandPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer lang={lang} onOpenInfo={handleOpenInfo} />
      <FloatingButtons />
      <Toast />
      <AuthModal />
      <InfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        section={infoModalSection}
        onSelectSection={setInfoModalSection}
        lang={lang}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContextBridge>
        <ProductsProvider>
          <BannersProvider>
            <OrdersProvider>
              <AdminAuthProvider>
                <AppLayout />
              </AdminAuthProvider>
            </OrdersProvider>
          </BannersProvider>
        </ProductsProvider>
      </AppContextBridge>
    </AuthProvider>
  );
}

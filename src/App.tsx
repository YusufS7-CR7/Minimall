import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { AuthProvider } from "@/context/AuthContext";

// Layout components
import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import CategoryNavBar from "@/components/layout/CategoryNavBar";
import Footer from "@/components/layout/Footer";
import FloatingButtons from "@/components/layout/FloatingButtons";
import Toast from "@/components/ui/Toast";
import AuthModal from "@/components/auth/AuthModal";

// Storefront Pages
import HomePage from "@/pages/HomePage";
import ProductPage from "@/pages/ProductPage";
import CategoryPage from "@/pages/CategoryPage";
import BrandPage from "@/pages/BrandPage";
import SearchPage from "@/pages/SearchPage";
import NotFoundPage from "@/pages/NotFoundPage";

// Admin Pages
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminProductsPage from "@/pages/admin/AdminProductsPage";

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
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-red-500 selection:text-white">
        <ScrollToTop />
        <AdminLayout>
          <Routes>
            <Route path="/admin" element={<AdminProductsPage />} />
            <Route path="/admin/*" element={<AdminProductsPage />} />
          </Routes>
        </AdminLayout>
        <Toast />
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-red-500 selection:text-white">
      <ScrollToTop />
      <TopBar lang={lang} />
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
      <Footer lang={lang} />
      <FloatingButtons />
      <Toast />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ProductsProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </ProductsProvider>
    </AppProvider>
  );
}

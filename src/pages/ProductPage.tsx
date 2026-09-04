import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useProducts } from "@/context/ProductsContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { getCategoryByKey } from "@/data/categories";
import { T } from "@/data/translations";
import StarRating from "@/components/ui/StarRating";
import ProductCard from "@/components/ui/ProductCard";

import { formatPrice } from "@/utils/formatPrice";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, addToCart } = useApp();
  const { getProductBySlug, products } = useProducts();
  const t = T[lang];

  const product = getProductBySlug(slug ?? "");

  // SEO — always call hooks before any conditional return
  const category = product ? getCategoryByKey(product.category) : undefined;
  const name = product ? (lang === "uz" ? (product.nameUz || product.name) : product.name) : "";
  const desc = product ? (lang === "uz" ? (product.descUz || product.descRu) : product.descRu) : "";
  const categoryLabel = category ? (lang === "uz" ? (category.labelUz || category.labelRu) : category.labelRu) : "";

  useDocumentMeta({
    title: product
      ? `${name} — купить в Ташкенте | Minimall`
      : "Товар не найден | Minimall",
    description: product
      ? `${name}: ${desc.slice(0, 150)}. Купить на Minimall.uz с доставкой по Узбекистану.`
      : undefined,
    canonical: product ? `https://minimall.uz/product/${product.slug}` : undefined,
    structuredData: product
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name,
          description: desc,
          image: product.images ?? [product.image],
          brand: { "@type": "Brand", name: product.brand },
          sku: `MM-${product.id}`,
          offers: {
            "@type": "Offer",
            url: `https://minimall.uz/product/${product.slug}`,
            priceCurrency: "UZS",
            price: product.price,
            availability: product.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            seller: { "@type": "Organization", name: "Minimall" },
          },
          ...(product.rating !== undefined && {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              bestRating: 5,
              ratingCount: 42,
            },
          }),
        }
      : undefined,
  });

  if (!product) return <Navigate to="/404" replace />;

  const related = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const [mainImage, setMainImage] = useState(product.image);
  const [activeTab, setActiveTab] = useState<"specs" | "desc">("specs");

  useEffect(() => {
    if (product) {
      setMainImage(product.image);
    }
  }, [product?.id, product?.image]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
          <li>
            <Link to="/" className="hover:text-red-500 transition-colors">{t.breadcrumbHome}</Link>
          </li>
          <li aria-hidden="true"><span className="text-gray-300">›</span></li>
          {category && (
            <>
              <li>
                <Link to={`/catalog/${category.slug}`} className="hover:text-red-500 transition-colors">
                  {categoryLabel}
                </Link>
              </li>
              <li aria-hidden="true"><span className="text-gray-300">›</span></li>
            </>
          )}
          <li className="text-gray-800 font-medium" aria-current="page">{name}</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm mb-3" style={{ height: 420 }}>
            <img
              src={mainImage}
              alt={name}
              className="w-full h-full object-cover"
              width={600}
              height={420}
            />
          </div>
          {(product.images?.length ?? 0) > 1 && (
            <div className="flex gap-2.5 flex-wrap">
              {product.images!.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMainImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    mainImage === img
                      ? "border-red-600 shadow-sm ring-2 ring-red-500/20 scale-105"
                      : "border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`${name} фото ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {/* Brand & badges */}
          <div className="flex items-center gap-2 mb-3">
            <Link to={`/brand/${product.brand.toLowerCase()}`} className="text-xs font-bold text-red-500 uppercase tracking-wider hover:text-red-700 transition-colors">
              {product.brand}
            </Link>
            {product.badge && (
              <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg">
                {product.badge}
              </span>
            )}
            {product.oldPrice && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                -{Math.round((1 - product.price / product.oldPrice) * 100)}%
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-3" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
            {name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating} size="md" />
            <span className="text-xs text-gray-400">42 {lang === "ru" ? "отзыва" : "ta sharh"}</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${product.inStock ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {product.inStock ? t.inStock : t.outOfStock}
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="text-3xl font-extrabold text-gray-900">{formatPrice(product.price)}</div>
            {product.oldPrice && (
              <div className="text-sm text-gray-400 line-through mt-0.5">{formatPrice(product.oldPrice)}</div>
            )}
          </div>

          {/* CTA */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => addToCart(product)}
              disabled={!product.inStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all ${
                product.inStock
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4" /></svg>
              {t.addToCart}
            </button>
            <a
              href="tel:+998970363636"
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-600 text-sm font-bold transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              {lang === "ru" ? "Позвонить" : "Qo'ng'iroq"}
            </a>
          </div>

          {/* Key specs preview */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {Object.entries(product.specs).slice(0, 4).map(([k, v]) => (
                <div key={k}>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{k}</div>
                  <div className="text-sm font-semibold text-gray-900">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specs / Description */}
      <div className="mb-12">
        <div className="flex gap-0 border-b border-gray-200 mb-6">
          {(["specs", "desc"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-bold transition-all relative ${
                activeTab === tab ? "text-red-600" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab === "specs" ? t.characteristics : t.description}
              {activeTab === tab && <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-red-500 rounded-t-full" />}
            </button>
          ))}
        </div>

        {activeTab === "specs" ? (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specs).map(([k, v], i) => (
                  <tr key={k} className={i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}>
                    <td className="px-5 py-3 text-gray-500 font-medium w-1/2">{k}</td>
                    <td className="px-5 py-3 text-gray-900 font-semibold">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-gray-700 leading-relaxed text-sm">{desc}</p>
          </div>
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-2xl font-extrabold text-gray-900 mb-6" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
            {lang === "ru" ? "Похожие товары" : "O'xshash tovarlar"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

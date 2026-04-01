"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  categoryId: string;
  category?: { name: string; slug: string };
  price: number;
  imageUrl: string | null;
  isActive: boolean;
};

interface PageInfo {
  productId: string;
  isPublished: boolean;
  heroImages: string[];
  subtitle: string;
  updatedAt: string;
}

const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "시저 샐러드", categoryId: "salad", category: { name: "샐러드", slug: "salad" }, price: 8900, imageUrl: null, isActive: true },
  { id: "2", name: "콥 샐러드", categoryId: "salad", category: { name: "샐러드", slug: "salad" }, price: 9500, imageUrl: null, isActive: true },
  { id: "3", name: "그릴드 치킨 볼", categoryId: "bowl", category: { name: "그레인볼", slug: "bowl" }, price: 10900, imageUrl: null, isActive: true },
  { id: "4", name: "연어 포케 볼", categoryId: "bowl", category: { name: "그레인볼", slug: "bowl" }, price: 12900, imageUrl: null, isActive: true },
  { id: "5", name: "프로틴 박스", categoryId: "protein", category: { name: "프로틴", slug: "protein" }, price: 11500, imageUrl: null, isActive: true },
  { id: "6", name: "디톡스 주스", categoryId: "juice", category: { name: "주스/음료", slug: "juice" }, price: 5900, imageUrl: null, isActive: true },
];

export default function PagesListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Try fetching from API, fall back to mock
      let prods: Product[] = [];
      try {
        const res = await fetch("/api/admin/products");
        if (res.ok) {
          prods = await res.json();
        }
      } catch {
        // ignore
      }
      if (!prods || prods.length === 0) {
        prods = MOCK_PRODUCTS;
      }
      setProducts(prods);

      // Load page info from localStorage
      const pageInfos: PageInfo[] = [];
      for (const p of prods) {
        const stored = localStorage.getItem(`w2o_page_${p.id}`);
        if (stored) {
          try {
            const data = JSON.parse(stored);
            pageInfos.push({
              productId: p.id,
              isPublished: data.is_published || false,
              heroImages: data.hero_images || [],
              subtitle: data.subtitle || "",
              updatedAt: data._updatedAt || "",
            });
          } catch {
            // ignore bad data
          }
        }
      }
      setPages(pageInfos);
      setLoading(false);
    }
    load();
  }, []);

  const getPage = (productId: string) =>
    pages.find((p) => p.productId === productId);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">로딩 중...</div>
    );
  }

  const withPage = products.filter((p) => getPage(p.id));
  const withoutPage = products.filter((p) => !getPage(p.id));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">상세페이지</h1>
          <p className="text-sm text-gray-400 mt-1">
            상품별 상세페이지를 관리하세요 -- {pages.length}개 생성됨 / 전체{" "}
            {products.length}개 상품
          </p>
        </div>
      </div>

      {/* 생성된 페이지 */}
      {withPage.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            상세페이지 관리
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {withPage.map((product) => {
              const pg = getPage(product.id)!;
              return (
                <div
                  key={product.id}
                  className="rounded-2xl border border-white/10 bg-[#1a1f2e] overflow-hidden hover:border-[#1D9E75]/50 transition-colors"
                >
                  {/* 히어로 이미지 미리보기 */}
                  <div className="h-36 bg-[#0f1420] relative">
                    {pg.heroImages.length > 0 && pg.heroImages[0] ? (
                      <img
                        src={pg.heroImages[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <span className="material-symbols-outlined text-4xl">image</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          pg.isPublished
                            ? "bg-emerald-400/20 text-emerald-400"
                            : "bg-red-400/20 text-red-400"
                        }`}
                      >
                        {pg.isPublished ? "공개" : "비공개"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white truncate">
                      {product.name}
                    </h3>
                    {pg.subtitle && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {pg.subtitle}
                      </p>
                    )}
                    {pg.updatedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        수정:{" "}
                        {new Date(pg.updatedAt).toLocaleDateString("ko-KR")}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Link
                        href={`/admin/pages/${product.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1D9E75]/10 text-[#1D9E75] text-sm font-medium hover:bg-[#1D9E75]/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                        편집
                      </Link>
                      <Link
                        href={`/products/${product.id}`}
                        target="_blank"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">visibility</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 미생성 상품 */}
      {withoutPage.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            상세페이지 미생성
          </h2>
          <div className="rounded-2xl border border-white/10 bg-[#1a1f2e] divide-y divide-white/5">
            {withoutPage.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-base text-gray-500">cancel</span>
                  <span className="text-sm text-white">
                    {product.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {product.category?.name}
                  </span>
                </div>
                <Link
                  href={`/admin/pages/${product.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#1D9E75] hover:bg-[#1D9E75]/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  생성
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

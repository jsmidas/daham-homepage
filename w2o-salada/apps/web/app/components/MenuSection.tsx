"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  kcal: number | null;
  tags: string | null;
  imageUrl: string | null;
  category: { name: string; slug: string };
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

const gradients: Record<string, string> = {
  salad: "from-[#a8e6cf] to-[#88d8b0]",
  bowl: "from-[#c3bef7] to-[#a5b4fc]",
  protein: "from-[#ffeaa7] to-[#fdcb6e]",
  juice: "from-[#fd79a8] to-[#e84393]",
};

const icons: Record<string, string> = {
  salad: "lunch_dining",
  bowl: "rice_bowl",
  protein: "fitness_center",
  juice: "local_cafe",
};

export default function MenuSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  const filtered = filter === "all"
    ? products
    : products.filter((p) => p.category.slug === filter);

  return (
    <section id="menu" className="py-20 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-brand-green text-xs tracking-[0.3em] uppercase font-medium">
            OUR MENU
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
            오늘의 신선함을<br />선택하세요
          </h2>
        </div>

        {/* 필터 */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
              filter === "all"
                ? "bg-brand-green text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            전체
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.slug)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                filter === c.slug
                  ? "bg-brand-green text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* 메뉴 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.id}`}
              className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-brand-green/30 hover:scale-[1.02] transition-all group block"
            >
              {/* 이미지 */}
              <div
                className={`h-48 bg-gradient-to-br ${gradients[item.category.slug] ?? "from-gray-400 to-gray-500"} flex items-center justify-center relative overflow-hidden`}
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-white/40 text-6xl">
                    {icons[item.category.slug] ?? "lunch_dining"}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="px-4 py-2 bg-white text-gray-800 rounded-full text-sm font-medium">
                    자세히 보기
                  </span>
                </div>
              </div>
              <div className="p-5">
                {item.tags && (
                  <span className="text-xs font-bold text-brand-amber tracking-wider">
                    {item.tags}
                  </span>
                )}
                <h3 className="text-white font-bold text-lg mt-1">{item.name}</h3>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-gray-500 text-sm">
                    {item.kcal ? `${item.kcal} kcal` : ""}
                  </span>
                  <span className="text-brand-amber font-bold">
                    {item.price.toLocaleString()}원
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

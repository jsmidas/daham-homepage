"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../store/cart";

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

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <p className="text-gray-400">상품을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-brand-deep/95 backdrop-blur border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-lg font-black text-brand-green">W2O</span>
            <span className="text-xs text-white/50 tracking-widest">SALADA</span>
          </Link>
          <Link href="/cart" className="relative text-white/70 hover:text-white">
            <span className="material-symbols-outlined">shopping_cart</span>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* 뒤로가기 */}
        <Link href="/#menu" className="text-gray-500 text-sm hover:text-brand-green mb-6 inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          메뉴로 돌아가기
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
          {/* 이미지 */}
          <div className="aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <span className="material-symbols-outlined text-7xl text-white/10">lunch_dining</span>
                <p className="text-gray-600 text-sm mt-2">이미지 준비중</p>
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div>
            {/* 카테고리 + 태그 */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-brand-green text-sm">{product.category.name}</span>
              {product.tags && (
                <span className="px-2 py-0.5 bg-brand-amber/20 text-brand-amber text-xs font-bold rounded">
                  {product.tags}
                </span>
              )}
            </div>

            {/* 이름 */}
            <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>

            {/* 설명 */}
            {product.description && (
              <p className="text-gray-400 leading-relaxed mb-6">{product.description}</p>
            )}

            {/* 칼로리 */}
            {product.kcal && (
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-brand-green text-lg">local_fire_department</span>
                <span className="text-gray-300 text-sm">{product.kcal} kcal</span>
              </div>
            )}

            {/* 가격 */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/10 mb-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-gray-500 text-sm">가격</p>
                  <p className="text-3xl font-black text-white mt-1">
                    {product.price.toLocaleString()}
                    <span className="text-lg font-normal text-gray-400 ml-1">원</span>
                  </p>
                </div>
                {/* 수량 */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-lg border border-white/20 text-white flex items-center justify-center hover:bg-white/10"
                  >
                    -
                  </button>
                  <span className="text-white text-lg font-bold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-lg border border-white/20 text-white flex items-center justify-center hover:bg-white/10"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex justify-between">
                <span className="text-gray-400 text-sm">합계</span>
                <span className="text-brand-amber font-bold text-lg">
                  {(product.price * quantity).toLocaleString()}원
                </span>
              </div>
            </div>

            {/* 장바구니 + 주문 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                  added
                    ? "bg-brand-green text-white"
                    : "border border-brand-green text-brand-green hover:bg-brand-green/10"
                }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {added ? "check" : "shopping_cart"}
                </span>
                {added ? "담았습니다!" : "장바구니 담기"}
              </button>
              <button className="flex-1 py-3.5 bg-brand-amber text-white rounded-xl font-semibold hover:opacity-90 transition">
                바로 주문하기
              </button>
            </div>

            {/* 배송 안내 */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-brand-green">local_shipping</span>
                <span className="text-gray-400">PM 11시 이전 주문 시 <span className="text-white">내일 새벽 배송</span></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-brand-green">payments</span>
                <span className="text-gray-400">15,000원 이상 <span className="text-white">무료 배송</span></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-brand-green">autorenew</span>
                <span className="text-gray-400">정기구독 시 <span className="text-brand-amber">최대 15% 할인</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

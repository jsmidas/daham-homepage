"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type OrderItem = { id: string; quantity: number; product: { id: string; name: string; imageUrl: string | null; category: { name: string } } };
type Order = { id: string; orderNo: string; status: string; createdAt: string; items: OrderItem[] };
type Review = { id: string; productId: string; rating: number; content: string; createdAt: string; product: { name: string } };

export default function MyReviewsPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // 리뷰 작성 모달
  const [writeTarget, setWriteTarget] = useState<{ productId: string; productName: string; orderId: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/reviews?my=true").then((r) => r.json()),
    ]).then(([ordersData, reviewsData]) => {
      setOrders(Array.isArray(ordersData) ? ordersData.filter((o: Order) => o.status === "DELIVERED") : []);
      setMyReviews(reviewsData.reviews || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const reviewedProductIds = new Set(myReviews.map((r) => r.productId));

  // 리뷰 가능한 상품 목록 (배송 완료 주문에서, 아직 리뷰 안 쓴 것)
  const reviewableItems: { productId: string; productName: string; imageUrl: string | null; orderId: string; category: string }[] = [];
  for (const order of orders) {
    for (const item of order.items) {
      if (!reviewedProductIds.has(item.product.id) && !reviewableItems.some((r) => r.productId === item.product.id)) {
        reviewableItems.push({
          productId: item.product.id,
          productName: item.product.name,
          imageUrl: item.product.imageUrl,
          orderId: order.id,
          category: item.product.category.name,
        });
      }
    }
  }

  const handleSubmit = async () => {
    if (!writeTarget || !content.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: writeTarget.productId,
        orderId: writeTarget.orderId,
        rating,
        content: content.trim(),
      }),
    });
    if (res.ok) {
      const review = await res.json();
      setMyReviews((prev) => [review, ...prev]);
      setWriteTarget(null);
      setContent("");
      setRating(5);
    } else {
      const err = await res.json();
      alert(err.error || "리뷰 작성에 실패했습니다.");
    }
    setSubmitting(false);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#f7fdf9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">로그인이 필요합니다.</p>
          <Link href="/login" className="text-[#1D9E75] font-semibold">로그인하기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fdf9]">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/mypage" className="text-gray-400 hover:text-gray-600 transition">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-bold text-gray-800">내 리뷰</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-6">
        {loading ? (
          <p className="text-center text-gray-400 py-12">로딩 중...</p>
        ) : (
          <>
            {/* 리뷰 작성 가능 상품 */}
            {reviewableItems.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-bold text-gray-600 mb-3">리뷰 작성 가능</h2>
                <div className="space-y-2">
                  {reviewableItems.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 bg-white rounded-xl border border-[#1D9E75]/10 p-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="material-symbols-outlined text-gray-300">eco</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#1D9E75]">{item.category}</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                      </div>
                      <button
                        onClick={() => { setWriteTarget({ productId: item.productId, productName: item.productName, orderId: item.orderId }); setRating(5); setContent(""); }}
                        className="px-3 py-1.5 bg-[#1D9E75] text-white text-xs rounded-lg font-semibold hover:bg-[#167A5B] transition"
                      >
                        리뷰 쓰기
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 내가 쓴 리뷰 */}
            <h2 className="text-sm font-bold text-gray-600 mb-3">내가 쓴 리뷰 ({myReviews.length})</h2>
            {myReviews.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <span className="material-symbols-outlined text-3xl mb-2 block">rate_review</span>
                <p className="text-sm">아직 작성한 리뷰가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myReviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-800">{r.product.name}</p>
                      <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("ko-KR")}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className={`material-symbols-outlined text-sm ${s <= r.rating ? "text-[#EF9F27]" : "text-gray-200"}`}>star</span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{r.content}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 리뷰 작성 모달 */}
      {writeTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={() => setWriteTarget(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-1">리뷰 작성</h3>
            <p className="text-sm text-[#1D9E75] mb-4">{writeTarget.productName}</p>

            {/* 별점 */}
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className="p-0.5">
                  <span className={`material-symbols-outlined text-3xl ${s <= rating ? "text-[#EF9F27]" : "text-gray-200"}`}>star</span>
                </button>
              ))}
            </div>

            {/* 내용 */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="맛, 신선도, 양 등 솔직한 후기를 남겨주세요"
              rows={4}
              className="w-full px-4 py-3 border rounded-xl text-sm resize-none focus:outline-none focus:border-[#1D9E75]"
            />

            <div className="flex gap-3 mt-4">
              <button onClick={() => setWriteTarget(null)} className="flex-1 py-3 border rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition">취소</button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !content.trim()}
                className="flex-1 py-3 bg-[#1D9E75] text-white rounded-xl font-bold hover:bg-[#167A5B] transition disabled:opacity-50"
              >
                {submitting ? "등록 중..." : "리뷰 등록"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

type Product = {
  id?: string;
  name: string;
  categoryId: string;
  price: number;
  kcal: number | null;
  description: string;
  tags: string | null;
  imageUrl: string | null;
  isActive: boolean;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function ProductModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!product?.id;
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    categoryId: product?.categoryId ?? "",
    price: product?.price ?? 0,
    kcal: product?.kcal ?? 0,
    description: product?.description ?? "",
    tags: product?.tags ?? "",
    imageUrl: product?.imageUrl ?? "",
    isActive: product?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products";
    const method = isEdit ? "PATCH" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        kcal: form.kcal || null,
        tags: form.tags || null,
        imageUrl: form.imageUrl || null,
      }),
    });

    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold">{isEdit ? "상품 수정" : "상품 등록"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 상품명 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">상품명 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#1D9E75]"
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">카테고리 *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#1D9E75]"
            >
              <option value="">선택하세요</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* 가격 + 칼로리 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">가격 (원) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#1D9E75]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">칼로리 (kcal)</label>
              <input
                type="number"
                value={form.kcal}
                onChange={(e) => setForm({ ...form, kcal: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#1D9E75]"
              />
            </div>
          </div>

          {/* 태그 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">태그</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="BEST, NEW 등"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#1D9E75]"
            />
          </div>

          {/* 이미지 URL */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">이미지 URL</label>
            <input
              type="text"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#1D9E75]"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">설명</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] resize-none"
            />
          </div>

          {/* 판매 상태 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-600">판매중</label>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#5DCAA5] disabled:opacity-50"
            >
              {saving ? "저장 중..." : isEdit ? "수정" : "등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

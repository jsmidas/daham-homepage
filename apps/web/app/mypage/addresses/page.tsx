"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

declare global {
  interface Window {
    daum: {
      Postcode: new (opts: { oncomplete: (data: DaumAddr) => void }) => { open: () => void };
    };
  }
}
interface DaumAddr {
  address: string;
  zonecode: string;
  buildingName: string;
}

type Address = {
  id: string;
  name: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2: string | null;
  isDefault: boolean;
  deliveryMemo: string | null;
};

type FormState = {
  id?: string;
  name: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2: string;
  isDefault: boolean;
  deliveryMemo: string;
};

const emptyForm: FormState = {
  name: "",
  phone: "",
  zipCode: "",
  address1: "",
  address2: "",
  isDefault: false,
  deliveryMemo: "",
};

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  // 다음 주소검색 스크립트 로드
  useEffect(() => {
    if (document.getElementById("daum-postcode")) return;
    const script = document.createElement("script");
    script.id = "daum-postcode";
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const loadAddresses = useCallback(() => {
    fetch("/api/addresses")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setAddresses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/mypage/addresses");
      return;
    }
    if (status === "authenticated") loadAddresses();
  }, [status, router, loadAddresses]);

  const openAddressSearch = useCallback(() => {
    if (!window.daum) {
      alert("주소 검색을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data: DaumAddr) => {
        const addr = data.buildingName
          ? `${data.address} (${data.buildingName})`
          : data.address;
        setForm((prev) => ({ ...prev, zipCode: data.zonecode, address1: addr }));
      },
    }).open();
  }, []);

  const startCreate = () => {
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (a: Address) => {
    setForm({
      id: a.id,
      name: a.name,
      phone: a.phone,
      zipCode: a.zipCode,
      address1: a.address1,
      address2: a.address2 ?? "",
      isDefault: a.isDefault,
      deliveryMemo: a.deliveryMemo ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.zipCode || !form.address1) {
      alert("이름, 전화번호, 주소는 필수입니다.");
      return;
    }
    setSaving(true);
    try {
      const url = form.id ? `/api/addresses/${form.id}` : "/api/addresses";
      const method = form.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          zipCode: form.zipCode,
          address1: form.address1,
          address2: form.address2 || null,
          isDefault: form.isDefault,
          deliveryMemo: form.deliveryMemo || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "저장 실패");
        return;
      }
      setShowForm(false);
      setForm(emptyForm);
      loadAddresses();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("배송지를 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? "삭제 실패");
      return;
    }
    loadAddresses();
  };

  const handleSetDefault = async (id: string) => {
    await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    loadAddresses();
  };

  if (status === "loading" || !session) return null;

  return (
    <div className="min-h-screen bg-brand-dark">
      <header className="sticky top-0 z-50 bg-brand-deep/95 backdrop-blur border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/mypage"
            className="flex items-center gap-1 text-gray-400 hover:text-white transition"
          >
            <span className="material-symbols-outlined text-xl">chevron_left</span>
            <span className="text-sm">마이페이지</span>
          </Link>
          <h1 className="text-white font-bold">배송지 관리</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* 배송지 목록 */}
        {loading ? (
          <p className="text-gray-400 text-center py-12">로딩 중...</p>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {addresses.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-5xl text-white/10 block mb-3">
                    location_on
                  </span>
                  <p className="text-gray-500">등록된 배송지가 없습니다.</p>
                </div>
              ) : (
                addresses.map((a) => (
                  <div
                    key={a.id}
                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold">{a.name}</p>
                        {a.isDefault && (
                          <span className="text-[10px] px-2 py-0.5 bg-brand-green/20 text-brand-green rounded-full font-semibold">
                            기본
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{a.phone}</p>
                    </div>
                    <p className="text-gray-300 text-sm">
                      ({a.zipCode}) {a.address1}
                    </p>
                    {a.address2 && (
                      <p className="text-gray-400 text-sm">{a.address2}</p>
                    )}
                    {a.deliveryMemo && (
                      <p className="text-gray-500 text-xs mt-1">📝 {a.deliveryMemo}</p>
                    )}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                      {!a.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(a.id)}
                          className="text-xs text-gray-400 hover:text-brand-green transition"
                        >
                          기본으로 설정
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => startEdit(a)}
                        className="text-xs text-gray-400 hover:text-white transition ml-auto"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(a.id)}
                        className="text-xs text-gray-400 hover:text-red-400 transition"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {!showForm && (
              <button
                type="button"
                onClick={startCreate}
                className="w-full py-3 bg-brand-green text-white rounded-xl font-semibold hover:bg-brand-mint transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                새 배송지 추가
              </button>
            )}
          </>
        )}

        {/* 배송지 폼 */}
        {showForm && (
          <div className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
            <h2 className="text-white font-bold mb-3">
              {form.id ? "배송지 수정" : "새 배송지"}
            </h2>

            <div>
              <label className="text-xs text-gray-400 block mb-1">수령인 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-green"
                placeholder="홍길동"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">전화번호 *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-green"
                placeholder="010-0000-0000"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">주소 *</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={form.zipCode}
                  readOnly
                  className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="우편번호"
                />
                <button
                  type="button"
                  onClick={openAddressSearch}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition"
                >
                  주소 검색
                </button>
              </div>
              <input
                type="text"
                value={form.address1}
                readOnly
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm mb-2"
                placeholder="기본 주소"
              />
              <input
                type="text"
                value={form.address2}
                onChange={(e) => setForm({ ...form, address2: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-green"
                placeholder="상세 주소 (동/호수)"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">배송 메모</label>
              <input
                type="text"
                value={form.deliveryMemo}
                onChange={(e) => setForm({ ...form, deliveryMemo: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-green"
                placeholder="예: 문 앞에 놓아주세요"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="accent-brand-green"
              />
              <span className="text-sm text-gray-300">기본 배송지로 설정</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(emptyForm);
                }}
                className="flex-1 py-2.5 border border-white/10 text-gray-300 rounded-lg hover:border-white/30 transition text-sm"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-mint transition text-sm disabled:opacity-50"
              >
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

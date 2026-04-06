import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#060D09] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* 브랜드 */}
          <div>
            <div className="flex items-center gap-1.5 mb-4">
              <span className="text-xl font-black text-brand-green">W2O</span>
              <span className="text-sm font-medium text-brand-green/70 tracking-widest">
                SALADA
              </span>
            </div>
            <p className="text-gray-500 text-sm">새벽, 신선함이 도착합니다.</p>
            <div className="flex gap-4 mt-4 text-sm text-gray-500">
              <a href="#" className="hover:text-brand-green transition">Instagram</a>
              <a href="#" className="hover:text-brand-green transition">YouTube</a>
              <a href="#" className="hover:text-brand-green transition">Blog</a>
            </div>
          </div>

          {/* 서비스 */}
          <div>
            <h4 className="text-white font-bold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#subscribe" className="hover:text-gray-300 transition">구독 안내</a></li>
              <li><a href="#weekly-menu" className="hover:text-gray-300 transition">이번 주 식단</a></li>
              <li><a href="#delivery" className="hover:text-gray-300 transition">배송 안내</a></li>
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h4 className="text-white font-bold mb-4">고객지원</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/faq" className="hover:text-gray-300 transition">자주 묻는 질문</Link></li>
              <li><Link href="/contact" className="hover:text-gray-300 transition">1:1 문의</Link></li>
              <li><Link href="/terms" className="hover:text-gray-300 transition">이용약관</Link></li>
              <li><Link href="/privacy" className="hover:text-gray-300 transition">개인정보처리방침</Link></li>
            </ul>
          </div>

          {/* 문의 */}
          <div>
            <h4 className="text-white font-bold mb-4">문의</h4>
            <div className="space-y-2 text-sm text-gray-500">
              <p>전화: 053-721-7794</p>
              <p>이메일: hello@w2osalada.co.kr</p>
              <p>운영시간: 평일 09:00 - 18:00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 py-6">
        <p className="text-center text-gray-600 text-sm">
          &copy; 2026 W2O SALADA. All rights reserved. | 다함푸드
        </p>
      </div>
    </footer>
  );
}

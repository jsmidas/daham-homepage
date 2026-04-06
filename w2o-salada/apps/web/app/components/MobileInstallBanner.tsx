"use client";

import { useState, useEffect } from "react";
import { useInstallPWA } from "./InstallPWA";

const DISMISS_KEY = "w2o_install_dismissed";

export default function MobileInstallBanner() {
  const { canInstall, install, isInstalled } = useInstallPWA();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 이미 설치됨 or 이미 닫음 → 안 보임
    if (isInstalled) return;
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      // 3일 지나면 다시 보여줌
      const dismissedAt = parseInt(dismissed);
      if (Date.now() - dismissedAt < 3 * 24 * 60 * 60 * 1000) return;
    }
    // 2초 후 나타남
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, [isInstalled]);

  if (!visible || !canInstall || isInstalled) return null;

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden animate-slide-up">
      <div className="mx-3 mb-3 bg-white rounded-2xl shadow-2xl shadow-black/20 border border-[#1D9E75]/15 p-4">
        <div className="flex items-start gap-3">
          {/* 아이콘 */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1D9E75] to-[#5DCAA5] flex items-center justify-center shrink-0 shadow-lg shadow-[#1D9E75]/30">
            <span className="text-white font-black text-sm">W2O</span>
          </div>

          {/* 텍스트 */}
          <div className="flex-1 min-w-0">
            <p className="text-[#0A1A0F] font-bold text-sm">앱처럼 사용하기</p>
            <p className="text-[#4a7a5e] text-xs mt-0.5">
              홈 화면에 추가하면 앱처럼 바로 열 수 있어요
            </p>
          </div>

          {/* 닫기 */}
          <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 shrink-0 -mt-1">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={dismiss}
            className="flex-1 py-2.5 text-sm text-[#7aaa90] font-medium rounded-xl hover:bg-gray-50 transition"
          >
            나중에
          </button>
          <button
            onClick={() => { install(); dismiss(); }}
            className="flex-1 py-2.5 text-sm text-white font-bold bg-[#1D9E75] rounded-xl hover:bg-[#167A5B] transition shadow-md shadow-[#1D9E75]/20"
          >
            홈 화면에 추가
          </button>
        </div>
      </div>
    </div>
  );
}

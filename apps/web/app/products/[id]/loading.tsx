export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7fdf9] to-[#edf7f0]">
      {/* 헤더 자리 */}
      <div className="h-14 bg-white/95 backdrop-blur-md border-b border-[#1D9E75]/10" />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="animate-pulse">
          {/* 뒤로가기 */}
          <div className="h-4 w-28 bg-gray-200 rounded mb-6" />

          {/* 히어로 이미지 */}
          <div className="rounded-2xl aspect-video bg-white/60 border border-[#1D9E75]/10" />

          {/* 정보 */}
          <div className="mt-8 max-w-2xl space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-gray-200 rounded-full" />
              <div className="h-6 w-12 bg-gray-200 rounded-full" />
            </div>
            <div className="h-10 w-3/5 bg-gray-200 rounded" />
            <div className="h-5 w-4/5 bg-gray-200 rounded" />
            <div className="h-24 bg-white/60 border border-[#1D9E75]/10 rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-14 bg-gray-200 rounded-xl" />
              <div className="h-14 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

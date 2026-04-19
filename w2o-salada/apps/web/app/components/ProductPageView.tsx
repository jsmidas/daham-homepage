// 상세페이지 렌더러 (admin preview와 공개 상품 상세 페이지가 공유)
//
// 입력: 파싱된 ProductPageData + 상품명
// 출력: 섹션 순서대로 렌더링된 JSX
//
// 어떤 섹션이든 데이터가 비어 있으면 자동으로 렌더 스킵.

export type KeyPoint = { icon: string; title: string; description: string };
export type SpecItem = { label: string; value: string };
export type NutritionItem = { label: string; value: string };

export type ProductPageData = {
  heroImages: string[];
  subtitle: string;
  featureTitle: string;
  featureDescription: string;
  featureImages: string[];
  keyPoints: KeyPoint[];
  specs: SpecItem[];
  detailDescription: string;
  detailImages: string[];
  nutrition: NutritionItem[];
  galleryImages: string[];
  sectionOrder: string[];
};

/**
 * DB row(JSON string들) → ProductPageData 파싱.
 * 빈 값/파싱 실패엔 기본값 반환.
 */
export function parseProductPage(row: {
  heroImages?: string | null;
  subtitle?: string | null;
  featureTitle?: string | null;
  featureDescription?: string | null;
  featureImages?: string | null;
  keyPoints?: string | null;
  specs?: string | null;
  detailDescription?: string | null;
  detailImages?: string | null;
  nutrition?: string | null;
  galleryImages?: string | null;
  sectionOrder?: string | null;
}): ProductPageData {
  const safeParse = <T,>(v: string | null | undefined, fallback: T): T => {
    if (!v) return fallback;
    try {
      return JSON.parse(v) as T;
    } catch {
      return fallback;
    }
  };

  return {
    heroImages: safeParse<string[]>(row.heroImages, []),
    subtitle: row.subtitle || "",
    featureTitle: row.featureTitle || "",
    featureDescription: row.featureDescription || "",
    featureImages: safeParse<string[]>(row.featureImages, []),
    keyPoints: safeParse<KeyPoint[]>(row.keyPoints, []),
    specs: safeParse<SpecItem[]>(row.specs, []),
    detailDescription: row.detailDescription || "",
    detailImages: safeParse<string[]>(row.detailImages, []),
    nutrition: safeParse<NutritionItem[]>(row.nutrition, []),
    galleryImages: safeParse<string[]>(row.galleryImages, []),
    sectionOrder: safeParse<string[]>(row.sectionOrder, [
      "hero",
      "feature",
      "keypoints",
      "specs",
      "detail",
      "nutrition",
      "gallery",
    ]),
  };
}

export default function ProductPageView({
  data,
  productName,
  showHeroTitle = true,
}: {
  data: ProductPageData;
  productName: string;
  /** 히어로 섹션에 상품명·서브타이틀 블록을 표시할지 (공개 페이지는 이미 상단에 이름 있으므로 false 가능) */
  showHeroTitle?: boolean;
}) {
  const heroImages = data.heroImages.filter(Boolean);
  const featureImages = data.featureImages.filter(Boolean);
  const filledKps = data.keyPoints.filter((kp) => kp.title);
  const filledSpecs = data.specs.filter((s) => s.label);
  const detailImages = data.detailImages.filter(Boolean);
  const filledNutrition = data.nutrition.filter((n) => n.label && n.value);
  const filledGallery = data.galleryImages.filter(Boolean);

  return (
    <>
      {data.sectionOrder.map((sectionId) => {
        switch (sectionId) {
          case "hero":
            return (
              <div key="hero">
                {heroImages.length > 0 ? (
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    <img
                      src={heroImages[0]}
                      alt="Hero"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-300">
                    <span className="material-symbols-outlined text-5xl">panorama</span>
                  </div>
                )}
                {showHeroTitle && (productName || data.subtitle) && (
                  <div className="px-5 py-4">
                    <h2 className="text-xl font-bold text-gray-900">{productName}</h2>
                    {data.subtitle && (
                      <p className="text-sm text-gray-500 mt-1">{data.subtitle}</p>
                    )}
                  </div>
                )}
              </div>
            );

          case "feature":
            if (!data.featureTitle && !data.featureDescription && featureImages.length === 0) {
              return null;
            }
            return (
              <div key="feature" className="px-5 py-4 border-t border-gray-100">
                {data.featureTitle && (
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{data.featureTitle}</h3>
                )}
                {data.featureDescription && (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.featureDescription}</p>
                )}
                {featureImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {featureImages.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className="rounded-lg w-full aspect-square object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            );

          case "keypoints":
            if (filledKps.length === 0) return null;
            return (
              <div key="keypoints" className="px-5 py-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  {filledKps.map((kp, i) => (
                    <div key={i} className="bg-[#f0faf5] rounded-xl p-3 text-center">
                      <span className="material-symbols-outlined text-2xl text-[#1D9E75]">
                        {kp.icon}
                      </span>
                      <div className="text-sm font-semibold text-gray-900 mt-1">{kp.title}</div>
                      {kp.description && (
                        <div className="text-xs text-gray-500 mt-0.5">{kp.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );

          case "specs":
            if (filledSpecs.length === 0) return null;
            return (
              <div key="specs" className="px-5 py-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-2">제품 스펙</h4>
                <div className="space-y-1.5">
                  {filledSpecs.map((s, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-500">{s.label}</span>
                      <span className="text-gray-900 font-medium">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );

          case "detail":
            if (!data.detailDescription && detailImages.length === 0) return null;
            return (
              <div key="detail" className="px-5 py-4 border-t border-gray-100">
                {data.detailDescription && (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {data.detailDescription}
                  </p>
                )}
                {detailImages.map((url, i) => (
                  <img key={i} src={url} alt="" className="rounded-lg w-full mt-3" />
                ))}
              </div>
            );

          case "nutrition":
            if (filledNutrition.length === 0) return null;
            return (
              <div key="nutrition" className="px-5 py-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-2">영양 정보</h4>
                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                  {filledNutrition.map((n, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-500">{n.label}</span>
                      <span className="text-gray-900 font-medium">{n.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );

          case "gallery":
            if (filledGallery.length === 0) return null;
            return (
              <div key="gallery" className="px-5 py-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-2">갤러리</h4>
                <div className="grid grid-cols-2 gap-2">
                  {filledGallery.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="rounded-lg w-full aspect-square object-cover"
                    />
                  ))}
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </>
  );
}

import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Img,
  staticFile,
  AbsoluteFill,
} from "remotion";

// 샐러드 쇼케이스 장면
export const SceneSalad: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 샐러드 이미지 그리드 (다양한 종류)
  const saladImages = [
    "디스플레이용샐러드 (1).jpg",
    "맛살샐러드 (1).jpg",
    "메밀샐러드 (1).jpg",
    "치킨텐더샐러드 (1).jpg",
    "디스플레이용샐러드 (3).jpg",
    "맛살샐러드 (3).jpg",
  ];

  // 각 카드의 stagger 등장
  const cards = saladImages.map((img, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const delay = i * 6;

    const cardSpring = spring({
      fps,
      frame: frame - delay,
      config: { damping: 14, stiffness: 80 },
    });

    const scale = interpolate(cardSpring, [0, 1], [0.6, 1]);
    const opacity = interpolate(cardSpring, [0, 1], [0, 1]);

    // 호버 같은 부유 효과
    const floatY = Math.sin(frame * 0.05 + i * 1.5) * 5;

    const cardWidth = 380;
    const cardHeight = 280;
    const gap = 40;
    const totalW = 3 * cardWidth + 2 * gap;
    const totalH = 2 * cardHeight + gap;
    const startX = (width - totalW) / 2;
    const startY = (height - totalH) / 2;

    const x = startX + col * (cardWidth + gap);
    const y = startY + row * (cardHeight + gap) + floatY;

    return { img, x, y, scale, opacity, cardWidth, cardHeight, key: i };
  });

  // 배경 글로우 펄스
  const glowOpacity = interpolate(
    Math.sin(frame * 0.04),
    [-1, 1],
    [0.03, 0.1]
  );

  // 상단 타이틀
  const titleOpacity = interpolate(frame, [0, fps * 0.8], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, fps * 0.8], [20, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0A1A0F",
      }}
    >
      {/* 배경 글로우 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, #1D9E75, transparent)",
          transform: "translate(-50%, -50%)",
          opacity: glowOpacity,
        }}
      />

      {/* 타이틀 */}
      <div
        style={{
          position: "absolute",
          top: 60,
          width: "100%",
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: "#5DCAA5",
            fontFamily: "Arial, sans-serif",
            letterSpacing: 6,
            fontWeight: 500,
          }}
        >
          FRESH MENU
        </div>
        <div
          style={{
            fontSize: 44,
            color: "#FFFFFF",
            fontFamily: "Arial, sans-serif",
            fontWeight: 800,
            marginTop: 8,
          }}
        >
          오늘의 <span style={{ color: "#EF9F27" }}>샐러드</span>
        </div>
      </div>

      {/* 샐러드 카드 그리드 */}
      {cards.map((card) => (
        <div
          key={card.key}
          style={{
            position: "absolute",
            left: card.x,
            top: card.y,
            width: card.cardWidth,
            height: card.cardHeight,
            borderRadius: 16,
            overflow: "hidden",
            transform: `scale(${card.scale})`,
            opacity: card.opacity,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            border: "1px solid rgba(93,202,165,0.15)",
          }}
        >
          <Img
            src={staticFile(card.img)}
            style={{
              width: card.cardWidth,
              height: card.cardHeight,
              objectFit: "cover",
            }}
          />
          {/* 하단 그라데이션 */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 80,
              background:
                "linear-gradient(transparent, rgba(10,26,15,0.8))",
            }}
          />
        </div>
      ))}
    </AbsoluteFill>
  );
};

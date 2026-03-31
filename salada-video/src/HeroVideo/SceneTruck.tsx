import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  Img,
  staticFile,
  AbsoluteFill,
} from "remotion";

// 새벽을 달리는 배송 차량 장면
export const SceneTruck: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 선택된 차량 사진들 (순차적으로 표시)
  const truckImages = [
    "다함차량_26 (1).jpg",
    "다함차량_26 (5).jpg",
    "다함차량_26 (10).jpg",
    "다함차량_26 (15).jpg",
    "다함차량_26 (20).jpg",
    "다함차량_26 (25).jpg",
  ];

  const imageDuration = Math.floor(fps * 1.2); // 각 이미지 1.2초
  const currentImageIndex = Math.min(
    Math.floor(frame / imageDuration),
    truckImages.length - 1
  );
  const localFrame = frame - currentImageIndex * imageDuration;

  // Ken Burns 효과: 느린 줌인 + 패닝
  const scale = interpolate(localFrame, [0, imageDuration], [1.0, 1.15], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const translateX = interpolate(localFrame, [0, imageDuration], [0, -30], {
    extrapolateRight: "clamp",
  });

  // 페이드 인/아웃
  const imageOpacity = interpolate(
    localFrame,
    [0, Math.floor(fps * 0.3), imageDuration - Math.floor(fps * 0.3), imageDuration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 오버레이 텍스트 등장
  const textOpacity = interpolate(frame, [fps * 0.5, fps * 1.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textY = interpolate(frame, [fps * 0.5, fps * 1.5], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // 스피드 라인 효과
  const speedLines = Array.from({ length: 8 }, (_, i) => {
    const y = 100 + i * (height - 200) / 7;
    const lineProgress = interpolate(
      frame,
      [i * 3, i * 3 + fps * 0.8],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    const lineX = interpolate(lineProgress, [0, 1], [-200, width + 200]);
    const lineOpacity = interpolate(
      lineProgress,
      [0, 0.2, 0.8, 1],
      [0, 0.4, 0.4, 0]
    );
    return { y, x: lineX, opacity: lineOpacity, key: i, width: 150 + i * 20 };
  });

  return (
    <AbsoluteFill>
      {/* 차량 이미지 (Ken Burns) */}
      <Img
        src={staticFile(truckImages[currentImageIndex])}
        style={{
          width: width,
          height: height,
          objectFit: "cover",
          transform: `scale(${scale}) translateX(${translateX}px)`,
          opacity: imageOpacity,
        }}
      />

      {/* 다크 오버레이 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(180deg, rgba(10,26,15,0.7) 0%, rgba(10,26,15,0.3) 40%, rgba(10,26,15,0.6) 100%)",
        }}
      />

      {/* 스피드 라인 */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {speedLines.map((l) => (
          <line
            key={l.key}
            x1={l.x - l.width}
            y1={l.y}
            x2={l.x}
            y2={l.y}
            stroke="#5DCAA5"
            strokeWidth={2}
            opacity={l.opacity}
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* 텍스트 오버레이 */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 100,
          transform: `translateY(${textY}px)`,
          opacity: textOpacity,
        }}
      >
        <div
          style={{
            fontSize: 22,
            color: "#5DCAA5",
            fontFamily: "Arial, sans-serif",
            letterSpacing: 4,
            fontWeight: 500,
            marginBottom: 12,
          }}
        >
          DAWN DELIVERY
        </div>
        <div
          style={{
            fontSize: 52,
            color: "#FFFFFF",
            fontFamily: "Arial, sans-serif",
            fontWeight: 800,
            lineHeight: 1.2,
          }}
        >
          새벽을 달리는
          <br />
          <span style={{ color: "#EF9F27" }}>신선함</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

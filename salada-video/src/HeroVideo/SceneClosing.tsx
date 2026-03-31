import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  AbsoluteFill,
} from "remotion";
import { W2OLogo } from "../W2OLogo";

// 클로징: 로고 + 슬로건 + CTA
export const SceneClosing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 로고 스케일 인
  const logoSpring = spring({
    fps,
    frame,
    config: { damping: 14, stiffness: 80 },
    durationInFrames: Math.floor(fps * 1),
  });

  const logoScale = interpolate(logoSpring, [0, 1], [0.5, 1]);
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1]);

  // 화살표 진행도
  const arrowProgress = interpolate(
    frame,
    [fps * 1, fps * 2.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.ease) }
  );

  // CTA 텍스트
  const ctaOpacity = interpolate(frame, [fps * 2.5, fps * 3.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaY = interpolate(frame, [fps * 2.5, fps * 3.5], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // 배경 라인 패턴
  const bgLines = Array.from({ length: 5 }, (_, i) => {
    const angle = i * 36 + frame * 0.1;
    const rad = (angle * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;
    const r = 350 + i * 30;
    const opacity = interpolate(
      frame,
      [fps * 0.5, fps * 1.5],
      [0, 0.06],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    return {
      cx: cx + Math.cos(rad) * 20,
      cy: cy + Math.sin(rad) * 20,
      r,
      opacity,
      key: i,
    };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0A1A0F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 장식 원 */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {bgLines.map((l) => (
          <circle
            key={l.key}
            cx={l.cx}
            cy={l.cy}
            r={l.r}
            fill="none"
            stroke="#5DCAA5"
            strokeWidth={1}
            opacity={l.opacity}
            strokeDasharray="8 6"
          />
        ))}
      </svg>

      {/* 로고 */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
        }}
      >
        <W2OLogo
          size={350}
          variant="transparent"
          showSlogan={true}
          arrowProgress={arrowProgress}
        />
      </div>

      {/* CTA */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          width: "100%",
          textAlign: "center",
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "16px 48px",
            borderRadius: 50,
            border: "2px solid #EF9F27",
            fontSize: 20,
            color: "#EF9F27",
            fontFamily: "Arial, sans-serif",
            fontWeight: 700,
            letterSpacing: 3,
          }}
        >
          지금 주문하기
        </div>
      </div>
    </AbsoluteFill>
  );
};

import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
} from "remotion";

// 추상적이고 미래지향적인 배경 모션 그래픽
export const AbstractBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 느리게 회전하는 그라데이션 각도
  const gradientAngle = interpolate(frame, [0, 20 * fps], [0, 360]);

  // 파티클 라인들 (기하학적 패턴)
  const lines = Array.from({ length: 12 }, (_, i) => {
    const delay = i * 8;
    const progress = interpolate(
      frame - delay,
      [0, 3 * fps],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) }
    );
    const opacity = interpolate(
      frame - delay,
      [0, 1 * fps, 3 * fps, 4 * fps],
      [0, 0.3, 0.3, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    const angle = (i * 30) + frame * 0.15;
    const length = progress * 300;
    const cx = width / 2;
    const cy = height / 2;
    const rad = (angle * Math.PI) / 180;
    const startDist = 100 + i * 30;
    const x1 = cx + Math.cos(rad) * startDist;
    const y1 = cy + Math.sin(rad) * startDist;
    const x2 = cx + Math.cos(rad) * (startDist + length);
    const y2 = cy + Math.sin(rad) * (startDist + length);

    return { x1, y1, x2, y2, opacity, key: i };
  });

  // 떠다니는 원형 파티클
  const particles = Array.from({ length: 20 }, (_, i) => {
    const speed = 0.3 + (i % 5) * 0.15;
    const radius = 2 + (i % 4) * 1.5;
    const baseX = ((i * 137) % width);
    const baseY = ((i * 97) % height);
    const x = baseX + Math.sin(frame * speed * 0.03 + i) * 60;
    const y = baseY + Math.cos(frame * speed * 0.025 + i * 0.7) * 40;
    const opacity = interpolate(
      Math.sin(frame * 0.04 + i * 1.2),
      [-1, 1],
      [0.05, 0.35]
    );
    return { x, y, radius, opacity, key: i };
  });

  // 육각형 그리드 패턴 (미래지향적)
  const hexOpacity = interpolate(
    frame,
    [0, 2 * fps, 4 * fps],
    [0, 0.08, 0.08],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const hexagons = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 + frame * 0.2) * (Math.PI / 180);
    const dist = 250 + Math.sin(frame * 0.02 + i) * 30;
    const cx = width / 2 + Math.cos(angle) * dist;
    const cy = height / 2 + Math.sin(angle) * dist;
    const size = 80 + Math.sin(frame * 0.03 + i * 2) * 15;
    const points = Array.from({ length: 6 }, (_, j) => {
      const a = (j * 60 - 30) * (Math.PI / 180);
      return `${cx + Math.cos(a) * size},${cy + Math.sin(a) * size}`;
    }).join(" ");
    return { points, key: i };
  });

  return (
    <AbsoluteFill>
      {/* 다크 그린 → 딥 다크 그라데이션 배경 */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `linear-gradient(${gradientAngle}deg, #0A1A0F 0%, #0F2318 30%, #0B1E12 60%, #061209 100%)`,
        }}
      />

      {/* SVG 오버레이: 기하학적 라인 + 파티클 + 헥사곤 */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* 방사형 라인 */}
        {lines.map((l) => (
          <line
            key={l.key}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="#5DCAA5"
            strokeWidth={1.5}
            opacity={l.opacity}
            strokeLinecap="round"
          />
        ))}

        {/* 육각형 */}
        {hexagons.map((h) => (
          <polygon
            key={h.key}
            points={h.points}
            fill="none"
            stroke="#5DCAA5"
            strokeWidth={1}
            opacity={hexOpacity}
          />
        ))}

        {/* 파티클 */}
        {particles.map((p) => (
          <circle
            key={p.key}
            cx={p.x}
            cy={p.y}
            r={p.radius}
            fill="#5DCAA5"
            opacity={p.opacity}
          />
        ))}

        {/* 중앙 글로우 */}
        <defs>
          <radialGradient id="centerGlow">
            <stop offset="0%" stopColor="#1D9E75" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#1D9E75" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle
          cx={width / 2}
          cy={height / 2}
          r={350}
          fill="url(#centerGlow)"
        />
      </svg>
    </AbsoluteFill>
  );
};

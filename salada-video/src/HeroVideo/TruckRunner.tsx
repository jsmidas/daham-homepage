import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
} from "remotion";
import { DeliveryVan } from "./DeliveryVan";
import { useShakeEffect } from "./MissileGag";
import { useJumpEffect } from "./Obstacles";

// ─────────────────────────────────────────────
// 달리는 배송밴 (SVG 기반, 부드러운 애니메이션)
//
// - SVG 벡터 차량 사용 (사진 X)
// - 부드러운 진입 → 정속 주행
// - 헤드라이트 빔
// - 도로 먼지/스피드 파티클
// ─────────────────────────────────────────────

export const TruckRunner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const groundY = height * 0.72;

  // 차량 크기/위치 (580x230 스타리아 55도 경사)
  const vanScale = 0.8;
  const vanWidth = 580 * vanScale;
  const vanHeight = 230 * vanScale;
  const vanBaseY = groundY - vanHeight + 38;

  // 차량 진입: 왼쪽에서 부드럽게 등장 → 중앙 정속
  const vanX = interpolate(
    frame,
    [0, fps * 2, fps * 3],
    [-vanWidth - 50, width * 0.25, width * 0.3],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  // 미사일 충돌 흔들림 + 가로등 점프
  const shake = useShakeEffect(frame, fps);
  const jump = useJumpEffect(frame, fps);

  // 차량 opacity
  const vanOpacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 헤드라이트 빔 (전방으로 뻗는 빛)
  const beamOpacity = interpolate(
    frame,
    [fps * 1, fps * 2],
    [0, 0.25],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const beamPulse = interpolate(Math.sin(frame * 0.12), [-1, 1], [0.8, 1]);

  // 스피드 라인 (차량 뒤에서 나오는 바람 선)
  const speedLines = Array.from({ length: 10 }, (_, i) => {
    const cycle = fps * 1.5; // 각 라인의 생명주기
    const offset = i * (cycle / 10);
    const life = ((frame + offset) % cycle) / cycle; // 0~1
    const lineY = vanBaseY + 40 + (i % 5) * 35;
    const lineStartX = vanX - 10;
    const lineLength = 40 + (i % 3) * 30;
    const lineX = lineStartX - life * 350;
    const lineOpacity = interpolate(life, [0, 0.1, 0.5, 1], [0, 0.4, 0.2, 0]);
    return { x: lineX, y: lineY, length: lineLength, opacity: lineOpacity * vanOpacity, key: i };
  });

  // 도로 파티클 (미세한 먼지)
  const dustParticles = Array.from({ length: 12 }, (_, i) => {
    const cycle = fps * 2;
    const offset = i * (cycle / 12);
    const life = ((frame + offset) % cycle) / cycle;
    const px = vanX - 20 - life * 200;
    const py = groundY - 5 + Math.sin(i * 4 + life * 8) * 12 - life * 20;
    const size = 2 + life * 4;
    const opacity = interpolate(life, [0, 0.15, 0.6, 1], [0, 0.15, 0.08, 0]) * vanOpacity;
    return { x: px, y: py, size, opacity, key: i };
  });

  // 차량 아래 도로 반사
  const reflectOpacity = interpolate(frame, [fps * 1, fps * 2], [0, 0.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* 헤드라이트 빔 */}
        <defs>
          <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFFDD" stopOpacity={beamOpacity * beamPulse} />
            <stop offset="100%" stopColor="#FFFFDD" stopOpacity={0} />
          </linearGradient>
          <radialGradient id="vanReflect">
            <stop offset="0%" stopColor="#5DCAA5" stopOpacity={reflectOpacity} />
            <stop offset="100%" stopColor="#5DCAA5" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* 전방 빔 */}
        <polygon
          points={`
            ${vanX + vanWidth - 10},${vanBaseY + vanHeight * 0.35}
            ${vanX + vanWidth + 500},${vanBaseY + vanHeight * 0.1}
            ${vanX + vanWidth + 500},${vanBaseY + vanHeight * 0.75}
            ${vanX + vanWidth - 10},${vanBaseY + vanHeight * 0.55}
          `}
          fill="url(#beamGrad)"
        />

        {/* 도로 반사 */}
        <ellipse
          cx={vanX + vanWidth / 2}
          cy={groundY + 35}
          rx={vanWidth * 0.5}
          ry={15}
          fill="url(#vanReflect)"
        />

        {/* 스피드 라인 */}
        {speedLines.map((l) => (
          <line
            key={l.key}
            x1={l.x}
            y1={l.y}
            x2={l.x + l.length}
            y2={l.y}
            stroke="#8EEACD"
            strokeWidth={1.5}
            opacity={l.opacity}
            strokeLinecap="round"
          />
        ))}

        {/* 먼지 파티클 */}
        {dustParticles.map((p) => (
          <circle
            key={p.key}
            cx={p.x}
            cy={p.y}
            r={p.size}
            fill="#AADDCC"
            opacity={p.opacity}
          />
        ))}
      </svg>

      {/* SVG 배송밴 (미사일 흔들림 + 가로등 점프 적용) */}
      <div
        style={{
          position: "absolute",
          left: vanX + shake,
          top: vanBaseY + jump,
          opacity: vanOpacity,
        }}
      >
        <DeliveryVan scale={vanScale} wheelSpeed={1.2} />
      </div>
    </AbsoluteFill>
  );
};

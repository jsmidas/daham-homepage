import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
} from "remotion";

// ─────────────────────────────────────────────
// 연속 스크롤 배경 레이어 (강화 버전)
//
// 추가 효과:
//  - 네온 사인 / 글로우 강화
//  - LED 간판
//  - 새벽 하늘 그라데이션 (오렌지/핑크)
//  - 움직이는 빛 줄기 (반대편 차량 라이트)
// ─────────────────────────────────────────────

// ── 미래 시설 건물 생성 ──
const generateFacilityBuildings = (count: number, seed: number) => {
  return Array.from({ length: count }, (_, i) => {
    const hash = ((seed + i) * 137 + 97) % 256;
    const w = 80 + (hash % 120);
    const h = 150 + ((hash * 3) % 250);
    const x = i * 200;
    const hasDome = hash % 3 === 0;
    const hasTower = hash % 4 === 0;
    const pipeCount = 1 + (hash % 3);
    return { x, w, h, hasDome, hasTower, pipeCount, key: i };
  });
};

// ── 도시 건물 생성 (네온/LED 강화) ──
const generateCityBuildings = (count: number, seed: number) => {
  return Array.from({ length: count }, (_, i) => {
    const hash = ((seed + i) * 173 + 53) % 256;
    const w = 60 + (hash % 100);
    const h = 120 + ((hash * 7) % 350);
    const x = i * 160;
    const windowRows = 3 + (hash % 8);
    const windowCols = 2 + (hash % 4);
    const hasAntenna = hash % 5 === 0;
    const hasSign = hash % 3 === 0; // LED 간판
    const signColor = ["#EF9F27", "#5DCAA5", "#FF6B9D", "#7B68EE", "#00DDFF"][hash % 5];
    const neonEdge = hash % 4 === 0; // 네온 윤곽
    return { x, w, h, windowRows, windowCols, hasAntenna, hasSign, signColor, neonEdge, key: i };
  });
};

const FACILITY_BUILDINGS = generateFacilityBuildings(40, 42);
const CITY_BUILDINGS = generateCityBuildings(40, 77);

// ── 미래 시설 렌더 (네온 강화) ──
const FacilityLayer: React.FC<{ scrollX: number; y: number; opacity: number; frame: number }> = ({
  scrollX, y, opacity, frame,
}) => {
  return (
    <g opacity={opacity}>
      {FACILITY_BUILDINGS.map((b) => {
        const bx = b.x - scrollX;
        if (bx < -300 || bx > 2200) return null;
        const by = y - b.h;
        const glowPulse = 0.4 + Math.sin(frame * 0.05 + b.key * 1.3) * 0.2;
        return (
          <g key={b.key}>
            <rect x={bx} y={by} width={b.w} height={b.h} fill="#0D2B1A" stroke="#1D9E75" strokeWidth={0.8} opacity={0.9} />
            {/* 네온 글로우 라인 (더 밝게) */}
            <line x1={bx} y1={by + b.h * 0.3} x2={bx + b.w} y2={by + b.h * 0.3} stroke="#5DCAA5" strokeWidth={1.5} opacity={glowPulse} />
            <line x1={bx} y1={by + b.h * 0.6} x2={bx + b.w} y2={by + b.h * 0.6} stroke="#5DCAA5" strokeWidth={1} opacity={glowPulse * 0.7} />
            {/* 네온 윤곽 글로우 */}
            <rect x={bx - 1} y={by - 1} width={b.w + 2} height={b.h + 2} fill="none" stroke="#5DCAA5" strokeWidth={0.5} opacity={glowPulse * 0.3} />
            {b.hasDome && (
              <ellipse cx={bx + b.w / 2} cy={by} rx={b.w / 2} ry={25} fill="#0D2B1A" stroke="#5DCAA5" strokeWidth={1.2} opacity={0.8} />
            )}
            {b.hasTower && (
              <>
                <rect x={bx + b.w / 2 - 6} y={by - 60} width={12} height={60} fill="#0D2B1A" stroke="#1D9E75" strokeWidth={0.6} />
                <circle cx={bx + b.w / 2} cy={by - 60} r={5} fill="#EF9F27" opacity={0.6 + Math.sin(frame * 0.1 + b.key) * 0.3} />
                {/* 타워 글로우 */}
                <circle cx={bx + b.w / 2} cy={by - 60} r={12} fill="#EF9F27" opacity={0.08} />
              </>
            )}
            {Array.from({ length: b.pipeCount }, (_, pi) => (
              <line key={pi} x1={bx + b.w} y1={by + 20 + pi * 30} x2={bx + b.w + 40} y2={by + 20 + pi * 30 - 10} stroke="#1D9E75" strokeWidth={3} opacity={0.4} />
            ))}
            {Array.from({ length: 3 }, (_, wi) => (
              <rect key={wi} x={bx + 10 + wi * (b.w / 3 - 5)} y={by + 15} width={b.w / 4} height={8} fill="#5DCAA5" opacity={glowPulse * 0.8} rx={1} />
            ))}
          </g>
        );
      })}
    </g>
  );
};

// ── 도시 빌딩 렌더 (네온 + LED 간판) ──
const CityLayer: React.FC<{ scrollX: number; y: number; opacity: number; frame: number }> = ({
  scrollX, y, opacity, frame,
}) => {
  return (
    <g opacity={opacity}>
      {CITY_BUILDINGS.map((b) => {
        const bx = b.x - scrollX;
        if (bx < -300 || bx > 2200) return null;
        const by = y - b.h;
        const windowFlicker = Math.sin(frame * 0.03 + b.key * 2.7);
        return (
          <g key={b.key}>
            <rect x={bx} y={by} width={b.w} height={b.h} fill="#0F1F16" stroke={b.neonEdge ? b.signColor : "#1D9E75"} strokeWidth={b.neonEdge ? 1.2 : 0.5} opacity={0.85} />

            {/* 네온 윤곽 글로우 */}
            {b.neonEdge && (
              <rect x={bx - 2} y={by - 2} width={b.w + 4} height={b.h + 4} fill="none" stroke={b.signColor} strokeWidth={0.8} opacity={0.15 + windowFlicker * 0.05} />
            )}

            {/* 창문 (밝기 변화) */}
            {Array.from({ length: b.windowRows }, (_, ri) =>
              Array.from({ length: b.windowCols }, (_, ci) => {
                const wx = bx + 8 + ci * ((b.w - 16) / b.windowCols);
                const wy = by + 12 + ri * ((b.h - 24) / b.windowRows);
                const lit = ((ri + ci + b.key) % 3) !== 0;
                const flicker = lit ? 0.45 + Math.sin(frame * 0.06 + ri * 1.5 + ci * 2.3 + b.key) * 0.2 : 0.15;
                const windowColor = lit
                  ? (ri + ci + b.key) % 7 === 0 ? "#5DCAA5" : (ri + ci + b.key) % 5 === 0 ? "#FF6B9D" : "#EF9F27"
                  : "#0A1A0F";
                return (
                  <rect
                    key={`${ri}-${ci}`}
                    x={wx} y={wy}
                    width={(b.w - 20) / b.windowCols - 4}
                    height={((b.h - 30) / b.windowRows) - 6}
                    fill={windowColor}
                    opacity={flicker}
                    rx={1}
                  />
                );
              })
            )}

            {/* LED 간판 */}
            {b.hasSign && (
              <>
                <rect x={bx + 5} y={by + b.h * 0.35} width={b.w - 10} height={16} rx={2} fill="#0A1A0F" />
                <rect x={bx + 6} y={by + b.h * 0.35 + 1} width={b.w - 12} height={14} rx={1.5} fill="none" stroke={b.signColor} strokeWidth={1} opacity={0.7 + windowFlicker * 0.15} />
                {/* 간판 글로우 */}
                <rect x={bx + 3} y={by + b.h * 0.35 - 3} width={b.w - 6} height={22} rx={3} fill={b.signColor} opacity={0.06 + windowFlicker * 0.02} />
                {/* 간판 텍스트 (작은 바) */}
                <rect x={bx + 12} y={by + b.h * 0.35 + 5} width={b.w * 0.4} height={3} rx={1.5} fill={b.signColor} opacity={0.6} />
                <rect x={bx + 12 + b.w * 0.45} y={by + b.h * 0.35 + 5} width={b.w * 0.2} height={3} rx={1.5} fill={b.signColor} opacity={0.4} />
              </>
            )}

            {b.hasAntenna && (
              <>
                <line x1={bx + b.w / 2} y1={by} x2={bx + b.w / 2} y2={by - 40} stroke="#5DCAA5" strokeWidth={1.5} opacity={0.6} />
                <circle cx={bx + b.w / 2} cy={by - 40} r={3} fill="#FF3333" opacity={0.5 + Math.sin(frame * 0.15 + b.key) * 0.4} />
              </>
            )}

            {/* 옥상 네온 라인 */}
            <line x1={bx} y1={by} x2={bx + b.w} y2={by} stroke={b.neonEdge ? b.signColor : "#5DCAA5"} strokeWidth={1.5} opacity={b.neonEdge ? 0.8 : 0.6} />
          </g>
        );
      })}
    </g>
  );
};

// ── 도로 렌더 ──
const Road: React.FC<{ scrollX: number; width: number; y: number; frame: number }> = ({
  scrollX, width: w, y, frame,
}) => {
  const markers = Array.from({ length: 40 }, (_, i) => {
    const mx = i * 120 - (scrollX * 1.2) % 120;
    return (
      <rect key={i} x={mx} y={y + 25} width={60} height={4} fill="#EF9F27" opacity={0.6} rx={2} />
    );
  });

  // 도로 위 반사광 (젖은 도로 느낌)
  const reflections = Array.from({ length: 15 }, (_, i) => {
    const rx = ((i * 300 + frame * 6) % (w + 300)) - 150;
    const ro = 0.03 + Math.sin(frame * 0.04 + i * 1.7) * 0.02;
    return (
      <ellipse key={`ref-${i}`} cx={rx} cy={y + 28} rx={40} ry={3} fill="#5DCAA5" opacity={ro} />
    );
  });

  return (
    <g>
      <rect x={0} y={y} width={w} height={55} fill="#111D15" />
      <line x1={0} y1={y} x2={w} y2={y} stroke="#1D9E75" strokeWidth={2} opacity={0.5} />
      {markers}
      {reflections}
      <line x1={0} y1={y + 55} x2={w} y2={y + 55} stroke="#1D9E75" strokeWidth={1.5} opacity={0.4} />
    </g>
  );
};

// ── 메인 배경 레이어 조합 ──
export const BackgroundLayers: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const totalDuration = 19 * fps;

  const progress = interpolate(frame, [0, totalDuration], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scrollFar = progress * 3000;
  const scrollMid = progress * 5000;
  const scrollRoad = progress * 8000;

  const facilityOpacity = interpolate(frame, [0, 7 * fps, 10 * fps], [1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const cityOpacity = interpolate(frame, [7 * fps, 10 * fps, totalDuration], [0, 1, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── 새벽 하늘 그라데이션 (다크 → 오렌지/핑크 여명) ──
  const dawnProgress = interpolate(frame, [0, totalDuration], [0, 1], {
    extrapolateRight: "clamp",
  });
  // 색상 채널
  const skyTopR = interpolate(dawnProgress, [0, 0.5, 1], [5, 15, 30]);
  const skyTopG = interpolate(dawnProgress, [0, 0.5, 1], [12, 14, 18]);
  const skyTopB = interpolate(dawnProgress, [0, 0.5, 1], [20, 28, 40]);
  const skyMidR = interpolate(dawnProgress, [0, 0.4, 0.8, 1], [8, 35, 80, 100]);
  const skyMidG = interpolate(dawnProgress, [0, 0.4, 0.8, 1], [15, 25, 40, 45]);
  const skyMidB = interpolate(dawnProgress, [0, 0.4, 0.8, 1], [12, 30, 50, 55]);
  const skyBotR = interpolate(dawnProgress, [0, 0.3, 0.7, 1], [10, 60, 140, 180]);
  const skyBotG = interpolate(dawnProgress, [0, 0.3, 0.7, 1], [20, 40, 70, 80]);
  const skyBotB = interpolate(dawnProgress, [0, 0.3, 0.7, 1], [15, 30, 50, 60]);

  // 별
  const stars = Array.from({ length: 60 }, (_, i) => {
    const sx = ((i * 137 + 31) % width);
    const sy = ((i * 97 + 13) % (height * 0.5));
    const twinkle = Math.sin(frame * 0.08 + i * 2.1);
    const starOpacity = interpolate(twinkle, [-1, 1], [0.15, 0.7]) *
      interpolate(frame, [0, totalDuration * 0.6, totalDuration], [1, 0.4, 0.1], { extrapolateRight: "clamp" });
    return { x: sx, y: sy, opacity: starOpacity, r: 1 + (i % 3) * 0.6, key: i };
  });

  // 수평선 글로우 (오렌지 + 핑크)
  const horizonGlow = interpolate(frame, [0, 5 * fps, 15 * fps], [0.03, 0.2, 0.35], {
    extrapolateRight: "clamp", easing: Easing.out(Easing.quad),
  });
  const horizonPink = interpolate(frame, [5 * fps, 12 * fps, totalDuration], [0, 0.12, 0.2], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── 움직이는 빛 줄기 (반대편 차량 헤드라이트) ──
  const headlightBeams = Array.from({ length: 5 }, (_, i) => {
    const speed = 8 + i * 3;
    const cycle = width + 600;
    const bx = cycle - ((frame * speed + i * 400) % cycle);
    const by = height * 0.68 + (i % 2) * 8;
    const beamLength = 200 + i * 40;
    const beamOpacity = 0.08 + Math.sin(frame * 0.06 + i * 2) * 0.03;
    return { x: bx, y: by, length: beamLength, opacity: beamOpacity, key: i };
  });

  // ── 가로등 빛 ──
  const streetLights = Array.from({ length: 8 }, (_, i) => {
    const lx = ((i * 600 - scrollFar * 0.5) % (width + 600));
    const ly = height * 0.4;
    const lightOn = 0.15 + Math.sin(frame * 0.04 + i * 3.1) * 0.05;
    return { x: lx, y: ly, opacity: lightOn, key: i };
  });

  const groundY = height * 0.72;

  return (
    <AbsoluteFill>
      {/* ── 새벽 하늘 그라데이션 ── */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: `linear-gradient(180deg,
            rgb(${Math.round(skyTopR)}, ${Math.round(skyTopG)}, ${Math.round(skyTopB)}) 0%,
            rgb(${Math.round(skyMidR)}, ${Math.round(skyMidG)}, ${Math.round(skyMidB)}) 50%,
            rgb(${Math.round(skyBotR)}, ${Math.round(skyBotG)}, ${Math.round(skyBotB)}) 85%,
            rgb(${Math.round(skyBotR * 0.6)}, ${Math.round(skyBotG * 0.5)}, ${Math.round(skyBotB * 0.4)}) 100%)`,
        }}
      />

      <svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
        {/* 별 */}
        {stars.map((s) => (
          <circle key={s.key} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" opacity={s.opacity} />
        ))}

        {/* 수평선 오렌지 글로우 */}
        <defs>
          <linearGradient id="horizonGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF9F27" stopOpacity={0} />
            <stop offset="60%" stopColor="#EF9F27" stopOpacity={horizonGlow} />
            <stop offset="100%" stopColor="#EF9F27" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="horizonPinkGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6B9D" stopOpacity={0} />
            <stop offset="50%" stopColor="#FF6B9D" stopOpacity={horizonPink} />
            <stop offset="100%" stopColor="#FF6B9D" stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect x={0} y={groundY - 250} width={width} height={300} fill="url(#horizonGlow)" />
        <rect x={width * 0.2} y={groundY - 200} width={width * 0.6} height={250} fill="url(#horizonPinkGlow)" />

        {/* 원경: 미래 시설 */}
        <FacilityLayer scrollX={scrollFar} y={groundY - 10} opacity={facilityOpacity} frame={frame} />

        {/* 원경: 도시 */}
        <CityLayer scrollX={scrollFar * 0.8} y={groundY - 10} opacity={cityOpacity} frame={frame} />

        {/* 근경: 미래 시설 */}
        <g transform={`scale(1.3) translate(0, ${-groundY * 0.05})`}>
          <FacilityLayer scrollX={scrollMid} y={groundY * 0.78} opacity={facilityOpacity * 0.6} frame={frame} />
        </g>

        {/* 근경: 도시 */}
        <g transform={`scale(1.3) translate(0, ${-groundY * 0.05})`}>
          <CityLayer scrollX={scrollMid * 0.9} y={groundY * 0.78} opacity={cityOpacity * 0.6} frame={frame} />
        </g>

        {/* 가로등 빛 */}
        {streetLights.map((l) => (
          <g key={l.key}>
            {/* 가로등 기둥 */}
            <line x1={l.x} y1={l.y} x2={l.x} y2={groundY} stroke="#1D9E75" strokeWidth={2} opacity={0.3} />
            {/* 가로등 헤드 */}
            <line x1={l.x - 15} y1={l.y} x2={l.x + 5} y2={l.y} stroke="#1D9E75" strokeWidth={2} opacity={0.4} />
            {/* 빛 원뿔 */}
            <polygon
              points={`${l.x - 12},${l.y + 2} ${l.x - 50},${groundY} ${l.x + 20},${groundY}`}
              fill="#EF9F27"
              opacity={l.opacity}
            />
            {/* 빛 글로우 */}
            <circle cx={l.x - 10} cy={l.y} r={8} fill="#EF9F27" opacity={l.opacity * 0.6} />
          </g>
        ))}

        {/* 도로 */}
        <Road scrollX={scrollRoad} width={width} y={groundY} frame={frame} />

        {/* 지면 */}
        <rect x={0} y={groundY + 55} width={width} height={height - groundY - 55} fill="#0A140E" />

        {/* ── 움직이는 빛 줄기 (반대편 차량) ── */}
        {headlightBeams.map((b) => (
          <g key={b.key}>
            {/* 헤드라이트 빔 */}
            <line
              x1={b.x} y1={b.y}
              x2={b.x - b.length} y2={b.y - 2}
              stroke="#FFFFDD" strokeWidth={2} opacity={b.opacity}
              strokeLinecap="round"
            />
            <line
              x1={b.x} y1={b.y + 5}
              x2={b.x - b.length * 0.8} y2={b.y + 3}
              stroke="#FFFFDD" strokeWidth={1.5} opacity={b.opacity * 0.7}
              strokeLinecap="round"
            />
            {/* 라이트 글로우 포인트 */}
            <circle cx={b.x} cy={b.y + 2} r={4} fill="#FFFFDD" opacity={b.opacity * 2} />
          </g>
        ))}

        {/* 도로 위 스피드 라인 */}
        {Array.from({ length: 6 }, (_, i) => {
          const lineX = ((i * 400 + frame * 12) % (width + 400)) - 200;
          const lineY = groundY + 20 + (i % 3) * 15;
          return (
            <line
              key={i}
              x1={lineX} y1={lineY}
              x2={lineX + 100 + i * 20} y2={lineY}
              stroke="#5DCAA5" strokeWidth={1.5} opacity={0.3}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

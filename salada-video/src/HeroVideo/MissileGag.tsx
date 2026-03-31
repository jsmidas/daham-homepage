import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  AbsoluteFill,
} from "remotion";

// ─────────────────────────────────────────────
// 미사일 개그 애니메이션
//
// "어떤 시련이 와도 배송합니다"
//
// 타임라인 (메인 영상 기준, 5초 로고 후):
//   8~10초: 미사일 1발 날아옴 → 차에 맞고 코믹하게 튕겨나감
//   12~14초: 미사일 3발 동시 → 전부 튕겨나감
//   16~17초: 거대 미사일 → 구겨지면서 튕겨나감 + "배송은 계속됩니다" 텍스트
// ─────────────────────────────────────────────

interface Missile {
  startFrame: number;
  impactFrame: number;
  fromX: number;
  fromY: number;
  toX: number;     // 차량 위치
  toY: number;
  bounceAngle: number; // 튕겨나가는 각도
  size: number;
  isBig?: boolean;
}

const MissileSprite: React.FC<{
  missile: Missile;
  frame: number;
  fps: number;
}> = ({ missile, frame, fps }) => {
  const { startFrame, impactFrame, fromX, fromY, toX, toY, bounceAngle, size, isBig } = missile;
  const localFrame = frame - startFrame;
  const impactLocal = impactFrame - startFrame;

  if (localFrame < 0 || localFrame > impactLocal + fps * 3) return null;

  const beforeImpact = localFrame < impactLocal;

  if (beforeImpact) {
    // 날아오는 중
    const flyProgress = interpolate(localFrame, [0, impactLocal], [0, 1], {
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.quad),
    });
    const x = interpolate(flyProgress, [0, 1], [fromX, toX]);
    const y = interpolate(flyProgress, [0, 1], [fromY, toY]);
    const rotation = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);
    const trail = interpolate(flyProgress, [0, 1], [0.2, 0.8]);

    return (
      <g>
        {/* 연기 꼬리 */}
        <line
          x1={x - Math.cos(rotation * Math.PI / 180) * size * 3}
          y1={y - Math.sin(rotation * Math.PI / 180) * size * 3}
          x2={x}
          y2={y}
          stroke="#AAAAAA"
          strokeWidth={size * 0.4}
          opacity={trail * 0.4}
          strokeLinecap="round"
        />
        {/* 미사일 본체 */}
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
          {/* 몸체 */}
          <ellipse cx={0} cy={0} rx={size * 1.5} ry={size * 0.5} fill="#666666" />
          {/* 탄두 (빨간색) */}
          <ellipse cx={size * 1.2} cy={0} rx={size * 0.5} ry={size * 0.4} fill="#FF4444" />
          {/* 날개 */}
          <polygon points={`${-size},${-size * 0.8} ${-size * 0.5},0 ${-size},${size * 0.8}`} fill="#888888" />
          {/* 불꽃 */}
          <circle cx={-size * 1.5} cy={0} r={size * 0.4} fill="#EF9F27" opacity={0.5 + Math.sin(localFrame * 2) * 0.3} />
          <circle cx={-size * 1.8} cy={0} r={size * 0.25} fill="#FF4444" opacity={0.4 + Math.sin(localFrame * 3) * 0.2} />
        </g>
      </g>
    );
  }

  // 충돌 후 — 튕겨나감
  const bounceFrame = localFrame - impactLocal;

  // 충돌 이펙트 (처음 몇 프레임)
  const impactFlash = interpolate(bounceFrame, [0, 8], [1, 0], {
    extrapolateRight: "clamp",
  });

  // 튕겨나가는 궤적 (포물선)
  const bounceProgress = interpolate(bounceFrame, [0, fps * 2.5], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const bounceRad = bounceAngle * Math.PI / 180;
  const bounceSpeed = isBig ? 400 : 600;
  const bx = toX + Math.cos(bounceRad) * bounceProgress * bounceSpeed;
  const by = toY + Math.sin(bounceRad) * bounceProgress * bounceSpeed - bounceProgress * (1 - bounceProgress) * 300;

  // 회전 (빙글빙글 돌면서 튕겨나감)
  const spin = bounceFrame * (isBig ? 8 : 15);

  // 크기 변화 (구겨지는 효과)
  const squash = isBig
    ? interpolate(bounceFrame, [0, 5, 15], [1, 0.3, 0.6], { extrapolateRight: "clamp" })
    : interpolate(bounceFrame, [0, 3, 10], [1, 0.5, 0.8], { extrapolateRight: "clamp" });

  const bounceOpacity = interpolate(bounceFrame, [fps * 1.5, fps * 2.5], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <g>
      {/* 충돌 플래시 */}
      {impactFlash > 0.01 && (
        <>
          <circle cx={toX} cy={toY} r={40 + impactFlash * 60} fill="#FFFFFF" opacity={impactFlash * 0.6} />
          <circle cx={toX} cy={toY} r={20 + impactFlash * 30} fill="#EF9F27" opacity={impactFlash * 0.4} />
          {/* 충격파 링 */}
          <circle cx={toX} cy={toY} r={impactFlash * 100 + 30} fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={impactFlash * 0.5} />
        </>
      )}

      {/* 별 이펙트 (만화 스타일) */}
      {impactFlash > 0.3 && (
        <>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const d = 20 + (1 - impactFlash) * 40;
            const sx = toX + Math.cos(angle * Math.PI / 180) * d;
            const sy = toY + Math.sin(angle * Math.PI / 180) * d;
            return (
              <text key={angle} x={sx} y={sy} fontSize={12} fill="#EF9F27" textAnchor="middle" opacity={impactFlash}>
                ✦
              </text>
            );
          })}
        </>
      )}

      {/* 튕겨나가는 미사일 (구겨진 채로 빙글빙글) */}
      <g
        transform={`translate(${bx}, ${by}) rotate(${spin}) scale(${squash}, ${1 / squash})`}
        opacity={bounceOpacity}
      >
        <ellipse cx={0} cy={0} rx={size * 1.5} ry={size * 0.5} fill="#888888" />
        <ellipse cx={size * 0.8} cy={0} rx={size * 0.4} ry={size * 0.35} fill="#FF6666" />
        <polygon points={`${-size},${-size * 0.6} ${-size * 0.5},0 ${-size},${size * 0.6}`} fill="#999999" />
        {/* 구겨진 표시 */}
        {isBig && (
          <>
            <line x1={-size * 0.5} y1={-size * 0.3} x2={size * 0.3} y2={size * 0.2} stroke="#555" strokeWidth={1} />
            <line x1={-size * 0.3} y1={size * 0.2} x2={size * 0.5} y2={-size * 0.1} stroke="#555" strokeWidth={1} />
          </>
        )}
      </g>

      {/* "띠용" 텍스트 (충돌 직후) */}
      {bounceFrame > 3 && bounceFrame < fps * 1.2 && (
        <text
          x={toX + 30}
          y={toY - 40 - bounceFrame * 1.5}
          fontSize={isBig ? 28 : 20}
          fontWeight={800}
          fontFamily="Arial, sans-serif"
          fill="#EF9F27"
          opacity={interpolate(bounceFrame, [3, fps * 0.3, fps * 1, fps * 1.2], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
          textAnchor="middle"
        >
          {isBig ? "끄떡없음 💪" : "띠용~!"}
        </text>
      )}
    </g>
  );
};

export const MissileGag: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const groundY = height * 0.72;
  const vanCenterX = width * 0.3 + 230;
  const vanCenterY = groundY - 60;

  // 미사일 정의
  const missiles: Missile[] = [
    // 8초: 오른쪽 위에서 1발
    {
      startFrame: fps * 3,
      impactFrame: fps * 4.5,
      fromX: width + 100,
      fromY: 100,
      toX: vanCenterX + 50,
      toY: vanCenterY - 20,
      bounceAngle: -120,
      size: 14,
    },
    // 12초: 3발 동시 (다양한 방향)
    {
      startFrame: fps * 7,
      impactFrame: fps * 8,
      fromX: width + 50,
      fromY: 200,
      toX: vanCenterX + 30,
      toY: vanCenterY,
      bounceAngle: -140,
      size: 12,
    },
    {
      startFrame: fps * 7.3,
      impactFrame: fps * 8.2,
      fromX: width + 150,
      fromY: 50,
      toX: vanCenterX + 80,
      toY: vanCenterY - 30,
      bounceAngle: -100,
      size: 11,
    },
    {
      startFrame: fps * 7.6,
      impactFrame: fps * 8.5,
      fromX: width + 80,
      fromY: 350,
      toX: vanCenterX + 20,
      toY: vanCenterY + 20,
      bounceAngle: -160,
      size: 13,
    },
    // 16초: 거대 미사일
    {
      startFrame: fps * 12,
      impactFrame: fps * 13.5,
      fromX: width + 200,
      fromY: height * 0.3,
      toX: vanCenterX + 60,
      toY: vanCenterY,
      bounceAngle: -130,
      size: 28,
      isBig: true,
    },
  ];

  // "배송은 계속됩니다" 텍스트 (거대 미사일 후)
  const finalTextFrame = fps * 14.5;
  const finalTextOpacity = interpolate(
    frame,
    [finalTextFrame, finalTextFrame + fps * 0.8, finalTextFrame + fps * 3, finalTextFrame + fps * 3.5],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const finalTextScale = spring({
    fps,
    frame: frame - finalTextFrame,
    config: { damping: 8, stiffness: 100 },
  });

  // 차량 흔들림은 useShakeEffect로 TruckRunner에서 처리

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* 차량 흔들림은 부모 레이어에서 처리하므로 여기선 export만 */}

      <svg width={width} height={height} style={{ position: "absolute" }}>
        {missiles.map((m, i) => (
          <MissileSprite key={i} missile={m} frame={frame} fps={fps} />
        ))}

        {/* "배송은 계속됩니다" */}
        {finalTextOpacity > 0.01 && (
          <g opacity={finalTextOpacity}>
            <text
              x={width / 2}
              y={height * 0.35}
              fontSize={48}
              fontWeight={800}
              fontFamily="Arial, sans-serif"
              fill="#EF9F27"
              textAnchor="middle"
              transform={`scale(${interpolate(finalTextScale, [0, 1], [0.3, 1])})`}
              style={{ transformOrigin: `${width / 2}px ${height * 0.35}px` }}
            >
              🚚 배송은 계속됩니다
            </text>
            <text
              x={width / 2}
              y={height * 0.35 + 35}
              fontSize={18}
              fontFamily="Arial, sans-serif"
              fill="#5DCAA5"
              textAnchor="middle"
              letterSpacing={3}
              opacity={interpolate(frame - finalTextFrame, [fps * 0.5, fps * 1.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
            >
              어떤 시련이 와도, W2O SALADA는 멈추지 않습니다
            </text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// 차량 흔들림 값을 외부에서 사용할 수 있도록 export
export const useShakeEffect = (frame: number, fps: number): number => {
  const impacts = [fps * 4.5, fps * 8, fps * 8.2, fps * 8.5, fps * 13.5];
  const sizes = [3, 3, 3, 3, 6];
  return impacts.reduce((acc, impactFrame, i) => {
    const after = frame - impactFrame;
    if (after >= 0 && after < 10) {
      return acc + Math.sin(after * 4) * sizes[i] * (1 - after / 10);
    }
    return acc;
  }, 0);
};

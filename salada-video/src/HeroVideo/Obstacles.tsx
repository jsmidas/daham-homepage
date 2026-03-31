import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
} from "remotion";

// ─────────────────────────────────────────────
// 장애물 개그 — 가로등이 쓰러지고 차가 밟고 지나감
//
// 가로등은 도로 위에 고정 → 오른쪽에서 왼쪽으로 흘러옴
// 차량 앞에서 쓰러짐 → 차량이 그 위를 밟고 지나감
// ─────────────────────────────────────────────

interface FallingPole {
  appearFrame: number;  // 화면 오른쪽에 등장
  fallFrame: number;    // 쓰러지는 시점
  speed: number;        // 왼쪽으로 이동 속도 (px/frame)
}

const FallingStreetLight: React.FC<{
  pole: FallingPole;
  frame: number;
  fps: number;
  groundY: number;
  screenWidth: number;
}> = ({ pole, frame, fps, groundY, screenWidth }) => {
  const localFrame = frame - pole.appearFrame;
  if (localFrame < 0 || localFrame > fps * 8) return null;

  const poleHeight = 220;

  // 가로등의 X 위치: 오른쪽에서 왼쪽으로 계속 이동 (도로와 함께)
  const poleX = screenWidth + 100 - localFrame * pole.speed;

  // 화면 밖이면 렌더 안 함
  if (poleX < -300 || poleX > screenWidth + 200) return null;

  const fallLocal = frame - pole.fallFrame;

  // 쓰러지기 전 흔들림
  const preWobble = fallLocal < 0
    ? Math.sin(localFrame * 0.6) * interpolate(
        localFrame,
        [0, pole.fallFrame - pole.appearFrame],
        [0, 8],
        { extrapolateRight: "clamp" }
      )
    : 0;

  // 쓰러지는 각도 (0 → 90도, 차량 방향 = 왼쪽으로)
  const fallAngle = fallLocal >= 0
    ? interpolate(fallLocal, [0, fps * 0.6], [0, -88], {
        extrapolateRight: "clamp",
        easing: Easing.in(Easing.quad),
      })
    : 0;

  // 바운스
  const bounceAngle = fallLocal > fps * 0.6
    ? interpolate(
        fallLocal,
        [fps * 0.6, fps * 0.8, fps * 0.95, fps * 1.05],
        [-88, -82, -88, -86],
        { extrapolateRight: "clamp" }
      )
    : fallAngle;

  const totalAngle = bounceAngle + preWobble;

  // 바닥 충돌 이펙트
  const impactFlash = fallLocal >= fps * 0.6 && fallLocal < fps * 1
    ? interpolate(fallLocal, [fps * 0.6, fps * 1], [0.8, 0], { extrapolateRight: "clamp" })
    : 0;

  // 차량이 밟고 지나갈 때 눌리는 효과
  // 차량 위치 약 width * 0.3 + 200
  const vanPassX = screenWidth * 0.3 + 200;
  const isBeingRunOver = fallLocal > fps * 0.6 && poleX < vanPassX + 100 && poleX > vanPassX - 300;
  const crushScale = isBeingRunOver ? 0.7 : 1;

  // 사라짐
  const poleOpacity = interpolate(localFrame, [fps * 6, fps * 8], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <g opacity={poleOpacity}>
      {/* 기둥 (왼쪽으로 쓰러짐) */}
      <g transform={`translate(${poleX}, ${groundY}) rotate(${totalAngle}) scale(1, ${crushScale})`}>
        {/* 기둥 */}
        <line
          x1={0} y1={0}
          x2={0} y2={-poleHeight}
          stroke="#556B5E"
          strokeWidth={7}
          strokeLinecap="round"
        />
        {/* 가로등 헤드 (왼쪽으로 뻗음) */}
        <line
          x1={0} y1={-poleHeight}
          x2={-25} y2={-poleHeight}
          stroke="#556B5E"
          strokeWidth={5}
          strokeLinecap="round"
        />
        {/* 라이트 */}
        <circle
          cx={-25}
          cy={-poleHeight + 5}
          r={7}
          fill="#EF9F27"
          opacity={fallLocal < fps * 0.6 ? 0.8 : 0.15}
        />
        {/* 라이트 글로우 */}
        {fallLocal < fps * 0.6 && (
          <circle cx={-25} cy={-poleHeight + 5} r={18} fill="#EF9F27" opacity={0.1} />
        )}
        {/* 기둥 베이스 */}
        <rect x={-10} y={-5} width={20} height={8} rx={2} fill="#445544" />
      </g>

      {/* 충돌 이펙트 (바닥에 부딪힐 때) */}
      {impactFlash > 0 && (
        <>
          {/* 먼지 구름 */}
          <circle cx={poleX - poleHeight * 0.5} cy={groundY - 5} r={25} fill="#887766" opacity={impactFlash * 0.25} />
          <circle cx={poleX - poleHeight * 0.7} cy={groundY - 15} r={18} fill="#887766" opacity={impactFlash * 0.2} />
          {/* 충격 이펙트 */}
          <circle cx={poleX - poleHeight * 0.5} cy={groundY - 10} r={40 * impactFlash} fill="none" stroke="#EF9F27" strokeWidth={2} opacity={impactFlash * 0.5} />
        </>
      )}

      {/* 파편 */}
      {fallLocal > fps * 0.6 && fallLocal < fps * 2 && (
        <>
          {[0, 1, 2, 3].map((di) => {
            const dp = interpolate(fallLocal, [fps * 0.6, fps * 2], [0, 1], { extrapolateRight: "clamp" });
            const angle = -40 - di * 30;
            const dist = dp * (60 + di * 25);
            const dx = poleX - poleHeight * 0.5 + Math.cos(angle * Math.PI / 180) * dist;
            const dy = groundY - 10 + Math.sin(angle * Math.PI / 180) * dist + dp * dp * 40;
            return (
              <rect
                key={di}
                x={dx} y={dy}
                width={5 + di} height={3}
                fill="#778877"
                opacity={(1 - dp) * 0.5}
                transform={`rotate(${dp * 300 + di * 60}, ${dx}, ${dy})`}
              />
            );
          })}
        </>
      )}

      {/* "쾅!" / "우당탕!" 텍스트 */}
      {fallLocal > fps * 0.6 && fallLocal < fps * 2 && (
        <text
          x={poleX - poleHeight * 0.3}
          y={groundY - 50 - (fallLocal - fps * 0.6) * 1.5}
          fontSize={26}
          fontWeight={800}
          fontFamily="Arial, sans-serif"
          fill="#EF9F27"
          textAnchor="middle"
          opacity={interpolate(fallLocal, [fps * 0.6, fps * 0.8, fps * 1.5, fps * 2], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        >
          쾅!
        </text>
      )}

      {/* 차량이 밟고 지나갈 때 "우지직" */}
      {isBeingRunOver && (
        <text
          x={poleX}
          y={groundY - 30}
          fontSize={18}
          fontWeight={700}
          fontFamily="Arial, sans-serif"
          fill="#5DCAA5"
          textAnchor="middle"
          opacity={0.8}
        >
          우지직!
        </text>
      )}
    </g>
  );
};

export const Obstacles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const groundY = height * 0.72;

  // 가로등: 도로와 같은 속도로 오른쪽에서 왼쪽으로 이동
  // speed = 도로 이동 속도와 비슷하게
  const poles: FallingPole[] = [
    // 5초쯤: 첫 번째 가로등
    { appearFrame: fps * 3, fallFrame: fps * 4.5, speed: 10 },
    // 10초쯤: 두 번째
    { appearFrame: fps * 8.5, fallFrame: fps * 9.8, speed: 10 },
    // 연속: 세 번째
    { appearFrame: fps * 9.5, fallFrame: fps * 10.8, speed: 11 },
  ];

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {poles.map((p, i) => (
          <FallingStreetLight key={i} pole={p} frame={frame} fps={fps} groundY={groundY} screenWidth={width} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// 차량 점프 효과 (가로등 밟을 때)
export const useJumpEffect = (frame: number, fps: number): number => {
  const jumpPoints = [
    { at: fps * 6.2, duration: fps * 0.5, height: 15 },
    { at: fps * 11.5, duration: fps * 0.4, height: 12 },
    { at: fps * 12.2, duration: fps * 0.4, height: 10 },
  ];

  return jumpPoints.reduce((acc, j) => {
    const t = frame - j.at;
    if (t >= 0 && t < j.duration) {
      const progress = t / j.duration;
      return acc - Math.sin(progress * Math.PI) * j.height;
    }
    return acc;
  }, 0);
};

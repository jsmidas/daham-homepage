import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
// W2OLogo used for static renders

// ─────────────────────────────────────────────
// W2O Logo 애니메이션 컴포지션
//
// 타임라인 (30fps 기준 150프레임 = 5초):
//   0  ~ 20f  : 원 페이드인 + 스케일 업
//   20 ~ 50f  : W·2·O 텍스트 등장 (왼→오 순서)
//   50 ~ 80f  : 화살표 드로잉
//   80 ~ 110f : SALAD + 슬로건 페이드인
//   110~ 150f : 전체 유지 (hold)
// ─────────────────────────────────────────────

export const W2OLogoAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. 원 스케일 인
  const circleScale = spring({
    fps,
    frame,
    config: { damping: 14, stiffness: 80, mass: 1 },
    durationInFrames: 25,
  });

  // 2. 전체 불투명도
  const globalOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.ease),
  });

  // 3. W 등장
  const wOpacity = interpolate(frame, [18, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const wY = interpolate(frame, [18, 32], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // 4. 2 등장
  const twoOpacity = interpolate(frame, [26, 38], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const twoY = interpolate(frame, [26, 40], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // 5. O 등장
  const oOpacity = interpolate(frame, [34, 48], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const oY = interpolate(frame, [34, 50], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // 6. 화살표 그리기 진행도
  const arrowProgress = interpolate(frame, [50, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });

  // 7. 슬로건 페이드인
  const sloganOpacity = interpolate(frame, [85, 110], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.ease),
  });

  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: '#0A1A0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: 'absolute' }}
      >
        {/* ── 배경 원: 스케일 인 ── */}
        <g
          transform={`translate(${cx}, ${cy}) scale(${circleScale}) translate(${-cx}, ${-cy})`}
          opacity={globalOpacity}
        >
          <circle cx={cx} cy={cy} r={194} fill="#0F2318" />
          <circle cx={cx} cy={cy} r={186} fill="none"
            stroke="#1D9E75" strokeWidth={1.2} strokeDasharray="4 3" opacity={0.5} />
          <circle cx={cx} cy={cy} r={176} fill="#162E1E" />
          <circle cx={cx} cy={cy} r={169} fill="none"
            stroke="#5DCAA5" strokeWidth={0.8} opacity={0.22} />
        </g>

        {/* ── 상단 앰버 도트 ── */}
        <g opacity={globalOpacity}>
          <circle cx={cx}      cy={cy - 190} r={5.5} fill="#EF9F27" />
          <circle cx={cx - 26} cy={cy - 181} r={3.2} fill="#EF9F27" opacity={0.55} />
          <circle cx={cx + 26} cy={cy - 181} r={3.2} fill="#EF9F27" opacity={0.55} />
        </g>

        {/* ── W ── */}
        <g
          transform={`translate(0, ${wY})`}
          opacity={wOpacity}
        >
          <text x={cx - 132} y={cy + 10}
            fontSize={78} fontWeight={800}
            fontFamily="'Arial Black', Arial, sans-serif"
            fill="#FFFFFF" letterSpacing={-2}>W</text>
          <circle cx={cx - 57} cy={cy - 15} r={6} fill="#EF9F27" />
        </g>

        {/* ── 2 ── */}
        <g
          transform={`translate(0, ${twoY})`}
          opacity={twoOpacity}
        >
          <text x={cx - 44} y={cy + 10}
            fontSize={78} fontWeight={800}
            fontFamily="'Arial Black', Arial, sans-serif"
            fill="#EF9F27" letterSpacing={-2}>2</text>
          <circle cx={cx + 10} cy={cy - 15} r={6} fill="#EF9F27" />
        </g>

        {/* ── 화살표 라인 (O 이전) ── */}
        <g opacity={oOpacity}>
          <line
            x1={cx + 42} y1={cy - 15}
            x2={cx + 96} y2={cy - 67}
            stroke="#EF9F27" strokeWidth={6} strokeLinecap="round"
            strokeDasharray={`${74 * arrowProgress} 74`}
          />
        </g>

        {/* ── O ── */}
        <g
          transform={`translate(0, ${oY})`}
          opacity={oOpacity}
        >
          <text x={cx + 22} y={cy + 10}
            fontSize={78} fontWeight={800}
            fontFamily="'Arial Black', Arial, sans-serif"
            fill="#5DCAA5" letterSpacing={-2}>O</text>
        </g>

        {/* ── 화살표 헤드 ── */}
        {arrowProgress > 0.85 && (
          <path
            d={`M${cx + 77} ${cy - 71} L${cx + 99} ${cy - 71} L${cx + 99} ${cy - 49}`}
            fill="none" stroke="#EF9F27" strokeWidth={6}
            strokeLinecap="round" strokeLinejoin="round"
            opacity={(arrowProgress - 0.85) / 0.15}
          />
        )}

        {/* ── SALAD + 슬로건 ── */}
        <g opacity={sloganOpacity}>
          <line x1={cx - 80} y1={cy + 24} x2={cx + 100} y2={cy + 24}
            stroke="#5DCAA5" strokeWidth={0.8} opacity={0.4} />
          <text x={cx} y={cy + 44} fontSize={13} fontFamily="Arial, sans-serif"
            fill="#5DCAA5" textAnchor="middle" letterSpacing={6} fontWeight={500}>
            SALAD
          </text>
          <line x1={cx - 140} y1={cy + 65} x2={cx + 140} y2={cy + 65}
            stroke="#EF9F27" strokeWidth={0.8} opacity={0.5} />
          <text x={cx} y={cy + 86} fontSize={14.5} fontFamily="Arial, sans-serif"
            fill="#EF9F27" textAnchor="middle" letterSpacing={1.5} fontWeight={700}>
            일어나면 이미 준비된 하루
          </text>
          <line x1={cx - 140} y1={cy + 96} x2={cx + 140} y2={cy + 96}
            stroke="#EF9F27" strokeWidth={0.8} opacity={0.5} />
          <text x={cx} y={cy + 116} fontSize={9} fontFamily="Arial, sans-serif"
            fill="#5F5E5A" textAnchor="middle" letterSpacing={2}>
            wake up to go out
          </text>
        </g>
      </svg>
    </div>
  );
};

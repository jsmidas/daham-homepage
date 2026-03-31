import React from 'react';

// ─────────────────────────────────────────────
// W2O Logo Component
// props:
//   size       — SVG 크기 (px), default 400
//   variant    — 'dark' | 'light' | 'transparent'
//   showSlogan — 슬로건 표시 여부, default true
//   arrowProgress — 화살표 그리기 진행도 0~1, default 1
//   opacity    — 전체 투명도 0~1, default 1
// ─────────────────────────────────────────────

interface W2OLogoProps {
  size?: number;
  variant?: 'dark' | 'light' | 'transparent';
  showSlogan?: boolean;
  arrowProgress?: number;
  opacity?: number;
}

export const W2OLogo: React.FC<W2OLogoProps> = ({
  size = 400,
  variant = 'dark',
  showSlogan = true,
  arrowProgress = 1,
  opacity = 1,
}) => {
  const bgColor =
    variant === 'dark' ? '#0F2318' :
    variant === 'light' ? '#F4F0E8' : 'none';

  const wColor   = variant === 'light' ? '#0F2318' : '#FFFFFF';
  const oColor   = variant === 'light' ? '#1D9E75' : '#5DCAA5';
  const sloganColor = '#EF9F27';

  // 화살표 strokeDasharray 로 그리기 애니메이션
  const arrowLen = 74; // line 길이 √((296-242)²+(133-185)²) ≈ 74
  const arrowDash = arrowLen * arrowProgress;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      {/* 배경 */}
      {variant !== 'transparent' && (
        <circle cx={200} cy={200} r={194} fill={bgColor} />
      )}

      {/* 점선 링 */}
      <circle
        cx={200} cy={200} r={186}
        fill="none"
        stroke="#1D9E75"
        strokeWidth={1.2}
        strokeDasharray="4 3"
        opacity={0.5}
      />

      {/* 내부 원 */}
      <circle cx={200} cy={200} r={176} fill="#162E1E" />

      {/* 내부 미세 링 */}
      <circle
        cx={200} cy={200} r={169}
        fill="none"
        stroke="#5DCAA5"
        strokeWidth={0.8}
        opacity={0.22}
      />

      {/* 상단 앰버 도트 */}
      <circle cx={200} cy={10}  r={5.5} fill="#EF9F27" />
      <circle cx={174} cy={19}  r={3.2} fill="#EF9F27" opacity={0.55} />
      <circle cx={226} cy={19}  r={3.2} fill="#EF9F27" opacity={0.55} />
      <circle cx={152} cy={36}  r={2}   fill="#EF9F27" opacity={0.28} />
      <circle cx={248} cy={36}  r={2}   fill="#EF9F27" opacity={0.28} />

      {/* ── 로고 타입 ── */}

      {/* W : 화이트/딥그린 */}
      <text
        x={68} y={210}
        fontSize={78}
        fontWeight={800}
        fontFamily="'Arial Black', Arial, sans-serif"
        fill={wColor}
        letterSpacing={-2}
      >W</text>

      {/* 구분 점 1 */}
      <circle cx={143} cy={185} r={6} fill="#EF9F27" />

      {/* 2 : 앰버 */}
      <text
        x={156} y={210}
        fontSize={78}
        fontWeight={800}
        fontFamily="'Arial Black', Arial, sans-serif"
        fill="#EF9F27"
        letterSpacing={-2}
      >2</text>

      {/* 구분 점 2 */}
      <circle cx={210} cy={185} r={6} fill="#EF9F27" />

      {/* 화살표 라인 (O 이전에 그려야 O가 내부를 가림) */}
      <line
        x1={242} y1={185}
        x2={296} y2={133}
        stroke="#EF9F27"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={`${arrowDash} ${arrowLen}`}
      />

      {/* O : 민트/그린 */}
      <text
        x={222} y={210}
        fontSize={78}
        fontWeight={800}
        fontFamily="'Arial Black', Arial, sans-serif"
        fill={oColor}
        letterSpacing={-2}
      >O</text>

      {/* 화살표 헤드 */}
      {arrowProgress > 0.85 && (
        <path
          d="M277 129 L299 129 L299 151"
          fill="none"
          stroke="#EF9F27"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={(arrowProgress - 0.85) / 0.15}
        />
      )}

      {/* SALAD 위 구분선 */}
      <line
        x1={120} y1={224}
        x2={300} y2={224}
        stroke="#5DCAA5"
        strokeWidth={0.8}
        opacity={0.4}
      />

      {/* SALAD */}
      <text
        x={200} y={244}
        fontSize={13}
        fontFamily="Arial, sans-serif"
        fill={oColor}
        textAnchor="middle"
        letterSpacing={6}
        fontWeight={500}
      >SALAD</text>

      {/* ── 슬로건 ── */}
      {showSlogan && (
        <>
          <line x1={60} y1={265} x2={340} y2={265}
            stroke={sloganColor} strokeWidth={0.8} opacity={0.5} />

          <text
            x={200} y={286}
            fontSize={14.5}
            fontFamily="Arial, sans-serif"
            fill={sloganColor}
            textAnchor="middle"
            letterSpacing={1.5}
            fontWeight={700}
          >일어나면 이미 준비된 하루</text>

          <line x1={60} y1={296} x2={340} y2={296}
            stroke={sloganColor} strokeWidth={0.8} opacity={0.5} />

          <text
            x={200} y={316}
            fontSize={9}
            fontFamily="Arial, sans-serif"
            fill="#5F5E5A"
            textAnchor="middle"
            letterSpacing={2}
          >wake up to go out</text>
        </>
      )}
    </svg>
  );
};

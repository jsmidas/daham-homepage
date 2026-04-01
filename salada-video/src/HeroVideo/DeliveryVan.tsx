import React from "react";
import {
  useCurrentFrame,
  interpolate,
  staticFile,
} from "remotion";

// ─────────────────────────────────────────────
// 다함푸드 1톤 배송밴 SVG
//
// 현대 스타리아 1톤 캡섀시 + 냉장 탑차
// 수정: 적재함 좁게, 운전석 넓고 낮게, 경사 55도
// ─────────────────────────────────────────────

interface DeliveryVanProps {
  scale?: number;
  wheelSpeed?: number;
}

export const DeliveryVan: React.FC<DeliveryVanProps> = ({
  scale = 1,
  wheelSpeed = 1,
}) => {
  const frame = useCurrentFrame();
  const wheelRotation = frame * 8 * wheelSpeed;
  const lightPulse = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.75, 1]);

  const w = 580 * scale;
  const h = 230 * scale;

  // 기준 좌표
  // 적재함: x 40~280, 높이 120
  // 캡: x 285~510, 지붕 y50 → 앞범퍼 y195, 약 55도 경사
  // 도로면: y 200

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 580 230"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 그림자 */}
      <ellipse cx={280} cy={218} rx={240} ry={7} fill="#000" opacity={0.3} />

      {/* ═══════════════════════════════════════ */}
      {/*  적재함 (냉장 탑차) — 좁게                */}
      {/* ═══════════════════════════════════════ */}
      <rect x={40} y={60} width={240} height={130} rx={3} fill="#F3F3F3" stroke="#DCDCDC" strokeWidth={1} />
      {/* 지붕 */}
      <path d="M 40 63 Q 40 52 50 52 L 272 52 Q 280 52 280 63" fill="#EAEAEA" stroke="#DCDCDC" strokeWidth={0.8} />

      {/* 냉장기 유닛 */}
      <rect x={140} y={43} width={40} height={9} rx={3.5} fill="#D5D5D5" stroke="#C5C5C5" strokeWidth={0.5} />

      {/* ── 오렌지 대각선 브랜딩 ── */}
      <clipPath id="cargoClip">
        <rect x={40} y={52} width={240} height={138} rx={3} />
      </clipPath>
      <g clipPath="url(#cargoClip)">
        <polygon points="40,52 170,52 40,145" fill="#EF8C1B" />
        <line x1={170} y1={52} x2={40} y2={145} stroke="#E07A10" strokeWidth={1.5} />

        <text x={52} y={69} fontSize={8} fontFamily="Arial, sans-serif" fill="#FFF" opacity={0.9} letterSpacing={0.3}>
          맛있는 변화의 시작
        </text>

        <text x={54} y={104} fontSize={30} fontWeight={800} fontFamily="Arial, sans-serif" fill="#FFF">
          다함
        </text>

        <rect x={46} y={148} width={24} height={10} rx={2} fill="#FFF" opacity={0.8} />
        <text x={49} y={156} fontSize={4.5} fontFamily="Arial, sans-serif" fill="#1A6B3C" fontWeight={700}>HACCP</text>
        <rect x={74} y={148} width={18} height={10} rx={2} fill="#FFF" opacity={0.8} />
        <text x={76} y={156} fontSize={4} fontFamily="Arial, sans-serif" fill="#1565C0" fontWeight={700}>ISO</text>
      </g>

      {/* 사이드 텍스트 */}
      <text x={180} y={88} fontSize={13} fontFamily="Arial, sans-serif" fill="#333" fontWeight={600}>정성을 다함</text>
      <text x={180} y={110} fontSize={13} fontFamily="Arial, sans-serif" fill="#333" fontWeight={600}>신선함을 다함</text>
      <text x={180} y={132} fontSize={13} fontFamily="Arial, sans-serif" fill="#333" fontWeight={600}>가성비를 다함</text>

      <text x={180} y={155} fontSize={11.5} fontFamily="Arial, sans-serif" fill="#222" fontWeight={800} letterSpacing={0.3}>053-721-7794</text>
      <text x={180} y={167} fontSize={6.5} fontFamily="Arial, sans-serif" fill="#888" letterSpacing={0.3}>www.dahamfood.co.kr</text>

      {/* 슬라이딩 도어 라인 */}
      <line x1={170} y1={56} x2={170} y2={188} stroke="#E0E0E0" strokeWidth={1} />
      {/* 하단 엣지 */}
      <line x1={40} y1={190} x2={280} y2={190} stroke="#CCC" strokeWidth={1.2} />

      {/* ═══════════════════════════════════════ */}
      {/*  캡 (스타리아) — 넓고 낮은, 55도 경사      */}
      {/* ═══════════════════════════════════════ */}
      {/* 캡-적재함 연결부 */}
      <rect x={278} y={54} width={6} height={138} fill="#E0E0E0" />

      {/*
        55도 경사:
        지붕 뒷끝: (284, 54) = 적재함 높이와 맞춤
        지붕 앞끝: (390, 42) = 캡 지붕 가장 높은 점
        노즈 끝:  (510, 198) = 범퍼 하단

        (390,42) → (510,198): dx=120, dy=156
        atan(156/120) = 52.4도 ≈ 55도
      */}

      {/* 캡 바디 (넓은 사다리꼴 — 지붕이 적재함보다 낮음) */}
      <path
        d={`
          M 284 60
          L 284 198
          L 510 198
          L 400 58
          L 284 60
          Z
        `}
        fill="#F0F0F0" stroke="#D8D8D8" strokeWidth={1}
      />

      {/* 지붕 상면 */}
      <path d="M 286 60 Q 286 52 310 52 L 395 52 L 400 58 L 286 58 Z" fill="#E3E3E3" />

      {/* ── 앞유리 (상부만 — 타이어 위 1cm까지만) ── */}
      {/*
        유리 영역: 지붕(y=54)에서 허리선(y=130)까지만
        그 아래는 바디 패널 (흰색/라이트그레이)
      */}
      <path
        d={`
          M 355 54
          L 398 54
          L 448 125
          L 300 125
          L 300 72
          Q 300 56 355 54
          Z
        `}
        fill="#1C2C22" opacity={0.88}
      />

      {/* 앞유리 반사 */}
      <path d="M 365 60 L 390 58 L 430 110 L 365 108 Z" fill="#4A6A58" opacity={0.15} />
      <path d="M 372 65 L 384 64 L 410 98 L 372 96 Z" fill="#6A9A80" opacity={0.1} />

      {/* 사이드 윈도우 (허리선까지만) */}
      <path
        d="M 292 68 L 298 68 L 298 122 L 292 120 Q 288 119 288 110 L 288 78 Q 288 68 292 68 Z"
        fill="#1C2C22" opacity={0.82}
      />

      {/* ── 허리선 아래: 보닛/바디 패널 (유리 아님) ── */}
      <path
        d={`
          M 300 125
          L 448 125
          L 505 192
          L 300 192
          Z
        `}
        fill="#EDEDED" stroke="#D8D8D8" strokeWidth={0.5}
      />

      {/* 허리선 (경사를 따라) */}
      <line x1={284} y1={130} x2={490} y2={178} stroke="#D0D0D0" strokeWidth={1} />

      {/* 하단 다크 클래딩 */}
      <path
        d="M 284 155 L 495 185 L 510 198 L 284 198 Z"
        fill="#3A3A3A" opacity={0.7}
      />

      {/* ── 운전석 도어 다함 로고 ── */}
      <image
        href={staticFile("daham-logo.png")}
        x={330}
        y={120}
        width={110}
        height={70}
        preserveAspectRatio="xMidYMid meet"
      />

      {/* 도어 라인 */}
      <line x1={320} y1={58} x2={320} y2={198} stroke="#DDD" strokeWidth={1} />
      {/* 도어 핸들 */}
      <rect x={314} y={132} width={11} height={4} rx={2} fill="#AAA" />

      {/* ═══════════════════════════════════════ */}
      {/*  전면 디테일 (55도 면 위)                  */}
      {/* ═══════════════════════════════════════ */}

      {/* 수평 LED 라이트 바 (경사면 중간) */}
      <line x1={445} y1={128} x2={475} y2={158} stroke="#FFFFEE" strokeWidth={3} strokeLinecap="round" opacity={lightPulse} />

      {/* 헤드라이트 */}
      <ellipse cx={462} cy={148} rx={5} ry={10} fill="#FFFFDD" opacity={lightPulse * 0.85} transform="rotate(-52, 462, 148)" />
      <ellipse cx={462} cy={148} rx={6} ry={11} fill="none" stroke="#C8C8C8" strokeWidth={0.8} transform="rotate(-52, 462, 148)" />

      {/* DRL */}
      <line x1={478} y1={164} x2={490} y2={175} stroke="#5DCAA5" strokeWidth={2} strokeLinecap="round" opacity={0.8} />

      {/* 에어 인테이크 / 안개등 */}
      <rect x={498} y={186} width={8} height={4} rx={2} fill="#444" />

      {/* 번호판 */}
      <rect x={500} y={192} width={7} height={5} rx={1} fill="#FFF" stroke="#CCC" strokeWidth={0.5} />

      {/* ═══════════════════════════════════════ */}
      {/*  후면부                                   */}
      {/* ═══════════════════════════════════════ */}
      <rect x={34} y={78} width={5} height={28} rx={2.5} fill="#FF3333" opacity={0.75} />
      <rect x={34} y={115} width={5} height={10} rx={2.5} fill="#EF9F27" opacity={0.55} />
      <rect x={34} y={190} width={12} height={8} rx={2} fill="#444" opacity={0.5} />

      {/* ═══════════════════════════════════════ */}
      {/*  사이드 스커트                             */}
      {/* ═══════════════════════════════════════ */}
      <rect x={40} y={190} width={470} height={10} rx={2} fill="#2A2A2A" opacity={0.7} />

      {/* ═══════════════════════════════════════ */}
      {/*  바퀴                                     */}
      {/* ═══════════════════════════════════════ */}
      {/* 뒷바퀴 */}
      <g transform={`rotate(${wheelRotation}, 95, 203)`}>
        <circle cx={95} cy={203} r={21} fill="#1A1A1A" />
        <circle cx={95} cy={203} r={16} fill="#2D2D2D" />
        <circle cx={95} cy={203} r={12} fill="#999" />
        <circle cx={95} cy={203} r={11} fill="#AAA" />
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx={95 + Math.cos((a * Math.PI) / 180) * 7.5} cy={203 + Math.sin((a * Math.PI) / 180) * 7.5} r={1.6} fill="#888" />
        ))}
        <circle cx={95} cy={203} r={3} fill="#777" />
      </g>
      <path d="M 62 195 Q 62 182 78 177 L 112 177 Q 128 182 128 195" fill="#2A2A2A" opacity={0.7} />

      {/* 앞바퀴 */}
      <g transform={`rotate(${wheelRotation}, 395, 203)`}>
        <circle cx={395} cy={203} r={21} fill="#1A1A1A" />
        <circle cx={395} cy={203} r={16} fill="#2D2D2D" />
        <circle cx={395} cy={203} r={12} fill="#999" />
        <circle cx={395} cy={203} r={11} fill="#AAA" />
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx={395 + Math.cos((a * Math.PI) / 180) * 7.5} cy={203 + Math.sin((a * Math.PI) / 180) * 7.5} r={1.6} fill="#888" />
        ))}
        <circle cx={395} cy={203} r={3} fill="#777" />
      </g>
      <path d="M 362 195 Q 362 182 378 177 L 412 177 Q 428 182 428 195" fill="#2A2A2A" opacity={0.7} />

      {/* 루프 레일 */}
      <line x1={70} y1={52} x2={270} y2={52} stroke="#CCC" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
};

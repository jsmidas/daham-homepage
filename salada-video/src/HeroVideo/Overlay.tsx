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

// ─────────────────────────────────────────────
// 오버레이: 로고(우측 상단), 텍스트(하단)
//
// Phase 1 (0~5초): 로고 등장 (우측 상단) + 하단 슬로건
// Phase 2 (5~14초): 하단 텍스트 변경 (새벽배송)
// Phase 3 (14~19초): 하단 CTA
// ─────────────────────────────────────────────

export const Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ── 로고: 우측 상단 (항상 표시, 부드럽게 등장) ──
  const logoSpring = spring({
    fps,
    frame,
    config: { damping: 200 },
    durationInFrames: Math.floor(fps * 1.5),
  });
  const logoOpacity = interpolate(frame, [0, fps * 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const arrowProgress = interpolate(frame, [fps * 1, fps * 2.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  const logoY = interpolate(logoSpring, [0, 1], [-20, 0]);

  // ── Phase 1: 하단 슬로건 ──
  const sloganOpacity = interpolate(
    frame,
    [fps * 1.5, fps * 2.5, fps * 5, fps * 6],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const sloganY = interpolate(
    frame,
    [fps * 1.5, fps * 2.5],
    [30, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // ── Phase 2: 메인 카피 (하단) ──
  const mainTextOpacity = interpolate(
    frame,
    [fps * 6, fps * 7, fps * 13, fps * 14],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const mainTextY = interpolate(
    frame,
    [fps * 6, fps * 7],
    [30, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // ── Phase 3: CTA (하단) ──
  const ctaOpacity = interpolate(
    frame,
    [fps * 15, fps * 16],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const ctaY = interpolate(
    frame,
    [fps * 15, fps * 16],
    [20, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // ── 상단 슬로건 (차량 위, 순차 등장) ──
  // 슬로건 1: "일어나면 이미 준비된 하루"
  const headline1Opacity = interpolate(
    frame,
    [fps * 1, fps * 2, fps * 6, fps * 7],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const headline1Y = interpolate(
    frame,
    [fps * 1, fps * 2],
    [30, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // 슬로건 2: "새벽의 신선함을 깨웁니다"
  const headline2Opacity = interpolate(
    frame,
    [fps * 7, fps * 8, fps * 13, fps * 14],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const headline2Y = interpolate(
    frame,
    [fps * 7, fps * 8],
    [30, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // 슬로건 3: "Wake 2 go Out"
  const headline3Opacity = interpolate(
    frame,
    [fps * 14, fps * 15, fps * 18.5, fps * 19],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const headline3Y = interpolate(
    frame,
    [fps * 14, fps * 15],
    [30, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // ── HUD 프레임 ──
  const hudOpacity = interpolate(frame, [fps * 0.5, fps * 2], [0, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* HUD 프레임 */}
      <svg width={width} height={height} style={{ position: "absolute" }}>
        <g opacity={hudOpacity}>
          {/* 좌상 */}
          <line x1={40} y1={40} x2={100} y2={40} stroke="#5DCAA5" strokeWidth={1.2} />
          <line x1={40} y1={40} x2={40} y2={100} stroke="#5DCAA5" strokeWidth={1.2} />
          {/* 좌하 */}
          <line x1={40} y1={height - 40} x2={100} y2={height - 40} stroke="#5DCAA5" strokeWidth={1.2} />
          <line x1={40} y1={height - 40} x2={40} y2={height - 100} stroke="#5DCAA5" strokeWidth={1.2} />
          {/* 우하 */}
          <line x1={width - 40} y1={height - 40} x2={width - 100} y2={height - 40} stroke="#5DCAA5" strokeWidth={1.2} />
          <line x1={width - 40} y1={height - 40} x2={width - 40} y2={height - 100} stroke="#5DCAA5" strokeWidth={1.2} />
        </g>

        {/* 스캔라인 */}
        <line
          x1={0}
          y1={((frame * 3) % (height + 100)) - 50}
          x2={width}
          y2={((frame * 3) % (height + 100)) - 50}
          stroke="#5DCAA5"
          strokeWidth={1}
          opacity={0.05}
        />
      </svg>

      {/* ── 상단 슬로건 (차량 위쪽, 중앙) ── */}

      {/* 슬로건 1 */}
      {headline1Opacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: "15%",
            width: "100%",
            textAlign: "center",
            opacity: headline1Opacity,
            transform: `translateY(${headline1Y}px)`,
          }}
        >
          <div
            style={{
              fontSize: 58,
              color: "#FFFFFF",
              fontFamily: "Arial, sans-serif",
              fontWeight: 800,
              lineHeight: 1.3,
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            일어나면 이미 준비된 <span style={{ color: "#EF9F27" }}>하루</span>
          </div>
        </div>
      )}

      {/* 슬로건 2 */}
      {headline2Opacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: "15%",
            width: "100%",
            textAlign: "center",
            opacity: headline2Opacity,
            transform: `translateY(${headline2Y}px)`,
          }}
        >
          <div
            style={{
              fontSize: 58,
              color: "#FFFFFF",
              fontFamily: "Arial, sans-serif",
              fontWeight: 800,
              lineHeight: 1.3,
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            새벽의 <span style={{ color: "#5DCAA5" }}>신선함</span>을 깨웁니다
          </div>
        </div>
      )}

      {/* 슬로건 3 */}
      {headline3Opacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: "12%",
            width: "100%",
            textAlign: "center",
            opacity: headline3Opacity,
            transform: `translateY(${headline3Y}px)`,
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: "#5DCAA5",
              fontFamily: "Arial, sans-serif",
              letterSpacing: 6,
              fontWeight: 500,
              marginBottom: 16,
            }}
          >
            W2O SALADA
          </div>
          <div
            style={{
              fontSize: 72,
              color: "#FFFFFF",
              fontFamily: "Arial, sans-serif",
              fontWeight: 800,
              lineHeight: 1.2,
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            Wake <span style={{ color: "#EF9F27" }}>2</span> go Out
          </div>
        </div>
      )}

      {/* ── 로고: 우측 상단 ── */}
      <div
        style={{
          position: "absolute",
          top: 30,
          right: 40,
          opacity: logoOpacity,
          transform: `translateY(${logoY}px)`,
        }}
      >
        <W2OLogo
          size={280}
          variant="transparent"
          showSlogan={false}
          arrowProgress={arrowProgress}
        />
      </div>

      {/* ── 하단 텍스트 영역 ── */}
      <div
        style={{
          position: "absolute",
          top: "78%",
          left: 0,
          width: "100%",
          height: "22%",
          background: "linear-gradient(transparent, rgba(5,10,7,0.85))",
        }}
      />

      {/* Phase 1: 슬로건 (도로 바로 아래) */}
      {sloganOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: "80%",
            width: "100%",
            textAlign: "center",
            opacity: sloganOpacity,
            transform: `translateY(${sloganY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: "#EF9F27",
              fontFamily: "Arial, sans-serif",
              letterSpacing: 3,
              fontWeight: 700,
            }}
          >
            일어나면 이미 준비된 하루
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              fontFamily: "Arial, sans-serif",
              letterSpacing: 3,
              marginTop: 10,
            }}
          >
            wake up to go out
          </div>
        </div>
      )}

      {/* Phase 2: 메인 카피 (도로 바로 아래 좌측) */}
      {mainTextOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: "76%",
            left: 80,
            opacity: mainTextOpacity,
            transform: `translateY(${mainTextY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: "#5DCAA5",
              fontFamily: "Arial, sans-serif",
              letterSpacing: 5,
              fontWeight: 500,
              marginBottom: 12,
            }}
          >
            DAWN DELIVERY
          </div>
          <div
            style={{
              fontSize: 44,
              color: "#FFFFFF",
              fontFamily: "Arial, sans-serif",
              fontWeight: 800,
              lineHeight: 1.3,
            }}
          >
            새벽을 달리는 <span style={{ color: "#EF9F27" }}>신선함</span>
          </div>
          <div
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "Arial, sans-serif",
              marginTop: 12,
              letterSpacing: 1,
            }}
          >
            W2O SALADA — 새벽배송으로 신선함을 배달합니다
          </div>
        </div>
      )}

      {/* Phase 3: CTA (도로 바로 아래 중앙) */}
      {ctaOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: "78%",
            width: "100%",
            textAlign: "center",
            opacity: ctaOpacity,
            transform: `translateY(${ctaY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "Arial, sans-serif",
              letterSpacing: 2,
              marginBottom: 20,
            }}
          >
            일어나면 이미 준비된 하루
          </div>
          <div
            style={{
              display: "inline-block",
              padding: "16px 52px",
              borderRadius: 50,
              border: "2px solid #EF9F27",
              fontSize: 20,
              color: "#EF9F27",
              fontFamily: "Arial, sans-serif",
              fontWeight: 700,
              letterSpacing: 4,
            }}
          >
            지금 주문하기
          </div>
        </div>
      )}

      {/* 비네팅 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(5,10,7,0.5) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

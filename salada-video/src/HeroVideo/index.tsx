import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";

import { BackgroundLayers } from "./BackgroundLayers";
import { TruckRunner } from "./TruckRunner";
import { Overlay } from "./Overlay";
import { MissileGag } from "./MissileGag";
import { Obstacles } from "./Obstacles";
import { W2OLogoAnimation } from "../W2OLogoAnimation";

// ─────────────────────────────────────────────
// W2O SALADA 히어로 섹션 배경 영상
//
// 구조:
//   0~5초: W2O 로고 애니메이션 (150프레임)
//   5~24초: 메인 영상
//     - 배경 (패럴랙스 시설/도시)
//     - 차량 (주행 + 점프 + 흔들림)
//     - 장애물 (가로등 쓰러짐)
//     - 미사일 개그
//     - 오버레이 (텍스트/로고/HUD)
//
// 총: 150 + 570 = 720프레임 = 24초
// ─────────────────────────────────────────────

export const HeroVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const logoFrames = 150;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A1A0F" }}>
      {/* 0~5초: 로고 애니메이션 */}
      <Sequence durationInFrames={logoFrames} premountFor={fps}>
        <AbsoluteFill
          style={{
            backgroundColor: "#0A1A0F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ transform: "scale(2.7)" }}>
            <W2OLogoAnimation />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* 5~24초: 메인 영상 */}
      <Sequence from={logoFrames} premountFor={fps}>
        <AbsoluteFill>
          <BackgroundLayers />
          <Obstacles />
          <TruckRunner />
          <MissileGag />
          <Overlay />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

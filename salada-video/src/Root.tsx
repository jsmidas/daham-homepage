import "./index.css";
import { Composition } from "remotion";
import { HeroVideo } from "./HeroVideo";
import { W2OLogoAnimation } from "./W2OLogoAnimation";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 🎬 히어로 섹션 배경 영상 — 24초 (720프레임 @ 30fps) */}
      <Composition
        id="HeroVideo"
        component={HeroVideo}
        durationInFrames={720}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* 🎬 로고 애니메이션 단독 — 5초 */}
      <Composition
        id="W2OLogoAnimation"
        component={W2OLogoAnimation}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};

import PetStagePanel from "../dashboard/PetStagePanel";
import DailyMissionsPanel from "../dashboard/DailyMissionsPanel";
import CharacterStatsPanel from "../dashboard/CharacterStatsPanel";
import ActiveBuffsPanel from "../dashboard/ActiveBuffsPanel";
import FadeUpContainer from "../animation/FadeUpContainer";

function Home() {
  return (
    <div id="home">
      <FadeUpContainer direction="up" delay={0.1}>
        <PetStagePanel />
      </FadeUpContainer>

      <FadeUpContainer direction="up" delay={0.2}>
        <DailyMissionsPanel />
      </FadeUpContainer>

      <FadeUpContainer direction="up" delay={0.3}>
        <CharacterStatsPanel />
      </FadeUpContainer>

      <FadeUpContainer direction="up" delay={0.4}>
        <ActiveBuffsPanel />
      </FadeUpContainer>
    </div>
  );
}

export default Home;

import { useGlobalState } from "@/components/lib";
import {
    BannerCarousel,
    Gap,
    HeaderSection,
    Page,
    StatsCard,
    WODCard,
} from "../../components";

export default function HomeScreen() {
  const globalState = useGlobalState();
  const user = globalState.get("user");
  const rawUserName = user?.nickname ?? "User";
  const userName = rawUserName.charAt(0).toUpperCase() + rawUserName.slice(1);

  // TODO: Fetch streak from API and store in global state
  const streakDays = 0; // Placeholder - will be loaded from user stats

  return (
    <Page showBackButton={false}>
      <HeaderSection userName={userName} streakDays={streakDays} />
      <Gap size={26} />
      <WODCard
        coach="Yahia"
        workoutCount={4}
        title="Today's WOD"
        workoutType="Strength Day"
        onPress={() => {}}
      />
      <Gap size={26} />
      <BannerCarousel onBannerPress={() => {}} />
      <Gap size={26} />
      <StatsCard />
    </Page>
  );
}

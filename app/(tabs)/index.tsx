import { useGlobalState } from "@/components/lib";
import { router } from "expo-router";
import {
  BannerCarousel,
  Gap,
  HeaderSection,
  HomeSkeleton,
  Page,
  StatsCard,
  WODCard,
} from "../../components";

export default function HomeScreen() {
  const globalState = useGlobalState();
  const user = globalState.get("user");

  // Show skeleton while user data hasn't loaded yet
  if (!user) {
    return <HomeSkeleton />;
  }

  const rawUserName = user?.nickname ?? "User";
  const userName = rawUserName.charAt(0).toUpperCase() + rawUserName.slice(1);

  return (
    <Page showBackButton={false}>
      <HeaderSection
        userName={userName}
        streakDays={user?.statsSummary.currentStreak}
      />
      <Gap size={20} />
      <WODCard onPress={() => router.push("/(tabs)/workouts")} />
      <Gap size={24} />
      <BannerCarousel onBannerPress={() => {}} />
      <Gap size={24} />
      <StatsCard user={user} />
      <Gap size={24} />
    </Page>
  );
}

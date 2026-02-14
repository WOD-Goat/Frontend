import { useStorage } from "@/components/lib";
import { useEffect, useState } from "react";
import {
  BannerCarousel,
  Gap,
  HeaderSection,
  Page,
  StatsCard,
  WODCard
} from "../../components";

export default function HomeScreen() {
  const { get: getStorage } = useStorage();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    getStorage("user").then((user) => {
      setUserName(user?.nickname ?? "User");
    });
  }, [getStorage]);

  return (
    <Page showBackButton={false}>
      <HeaderSection
        userName={userName.charAt(0).toUpperCase() + userName.slice(1)}
      />
      <Gap size={26} />
      <WODCard
        coach="Yahia"
        workoutCount={4}
        title="Today's WOD"
        workoutType="Strength Day"
        onPress={() => {}}
      />
      <Gap size={26} />
      <BannerCarousel />
      <Gap size={26} />
      <StatsCard />
    </Page>
  );
}

import { useStorage } from "@/components/lib";
import {
  BannerCarousel,
  HeaderSection,
  Page,
  ServicesSection,
  SubscriptionOffers,
} from "../../components";
import { useEffect, useState } from "react";

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
      
    </Page>
  );
}

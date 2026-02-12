import {
  BannerCarousel,
  HeaderSection,
  Page,
  ServicesSection,
  SubscriptionOffers
} from "../../components";

export default function HomeScreen() {
  return (
    <Page showBackButton={false}>
      <HeaderSection userName="Yahia" />
      <BannerCarousel />
      <ServicesSection />
      <SubscriptionOffers />
    </Page>
  );
}

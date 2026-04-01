import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import MenuSection from "./components/MenuSection";
import StatsSection from "./components/StatsSection";
import SubscribeSection from "./components/SubscribeSection";
import DeliverySection from "./components/DeliverySection";
import ReviewsSection from "./components/ReviewsSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <SubscribeSection />
        <MenuSection />
        <StatsSection />
        <DeliverySection />
        <ReviewsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

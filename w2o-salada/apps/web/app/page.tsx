import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import WeeklyMenuSection from "./components/WeeklyMenuSection";
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
        <WeeklyMenuSection />
        <DeliverySection />
        <ReviewsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

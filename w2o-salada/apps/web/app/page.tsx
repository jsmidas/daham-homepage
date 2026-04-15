import { prisma } from "@repo/db";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import MarqueeBanner from "./components/MarqueeBanner";
import AboutSection from "./components/AboutSection";
import WeeklyTimeline from "./components/WeeklyTimeline";
import WeeklyMenuSection from "./components/WeeklyMenuSection";
import SubscribeSection from "./components/SubscribeSection";
import DeliverySection from "./components/DeliverySection";
import ReviewsSection from "./components/ReviewsSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

export const revalidate = 60;

async function getMenuData() {
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  const nextMonth = curMonth === 12 ? 1 : curMonth + 1;
  const nextYear = curMonth === 12 ? curYear + 1 : curYear;

  const [curCal, nextCal, cats] = await Promise.all([
    prisma.deliveryCalendar.findMany({
      where: { date: { gte: new Date(curYear, curMonth - 1, 1), lte: new Date(curYear, curMonth, 0, 23, 59, 59) }, isActive: true },
      include: {
        menuAssignments: {
          include: { product: { select: { id: true, name: true, description: true, originalPrice: true, singlePrice: true, price: true, kcal: true, tags: true, imageUrl: true, category: { select: { id: true, name: true, slug: true, icon: true, color: true, sortOrder: true, isActive: true, isOption: true } } } } },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { date: "asc" },
    }).catch(() => []),
    prisma.deliveryCalendar.findMany({
      where: { date: { gte: new Date(nextYear, nextMonth - 1, 1), lte: new Date(nextYear, nextMonth, 0, 23, 59, 59) }, isActive: true },
      include: {
        menuAssignments: {
          include: { product: { select: { id: true, name: true, description: true, originalPrice: true, singlePrice: true, price: true, kcal: true, tags: true, imageUrl: true, category: { select: { id: true, name: true, slug: true, icon: true, color: true, sortOrder: true, isActive: true, isOption: true } } } } },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { date: "asc" },
    }).catch(() => []),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }).catch(() => []),
  ]);

  return {
    calendar: JSON.parse(JSON.stringify([...curCal, ...nextCal])),
    categories: JSON.parse(JSON.stringify(cats)),
  };
}

export default async function Home() {
  const menuData = await getMenuData();

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <MarqueeBanner />
        <AboutSection />
        <WeeklyTimeline />
        <SubscribeSection />
        <WeeklyMenuSection initialData={menuData} />
        <DeliverySection />
        <ReviewsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

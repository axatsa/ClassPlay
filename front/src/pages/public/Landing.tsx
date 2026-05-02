import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import LeaderboardSection from "@/components/landing/LeaderboardSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import GamesSection from "@/components/landing/GamesSection";
import PricingSection from "@/components/landing/PricingSection";
import FaqSection from "@/components/landing/FaqSection";
import CtaSection from "@/components/landing/CtaSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <LandingNavbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <LeaderboardSection />
      <HowItWorksSection />
      <GamesSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}

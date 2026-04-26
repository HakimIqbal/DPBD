import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { RecentDonations } from "@/components/landing/recent-donations"
import { AboutSection } from "@/components/landing/about-section"
import { ProgramsSection } from "@/components/landing/programs-section"
import { TransparencySection } from "@/components/landing/transparency-section"
import { ImpactSection } from "@/components/landing/impact-section"
import { NewsSection } from "@/components/landing/news-section"
import { PartnersSection } from "@/components/landing/partners-section"
import { FaqSection } from "@/components/landing/faq-section"
import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <RecentDonations />
      <AboutSection />
      <ProgramsSection />
      <TransparencySection />
      <ImpactSection />
      <NewsSection />
      <PartnersSection />
      <FaqSection />
      <Footer />
    </main>
  )
}

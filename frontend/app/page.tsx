import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { EndowmentSection } from "@/components/landing/endowment-section"
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
      {/*
        EndowmentSection sits directly after the hero — it's the most
        important differentiator of this platform vs. social crowdfunding
        and needs to be the first scroll-down a visitor hits.
      */}
      <EndowmentSection />
      <RecentDonations />
      <ProgramsSection />
      {/*
        AboutSection now sits between Programs and Transparency —
        visitors first see WHAT they fund (Programs), then WHO runs
        the fund (Tim Pengurus), then HOW transparently it's reported
        (Transparency). The former About copy was generic org-blurb;
        the new content is the governance grid (CEO/CFO/managers/
        Dewan/Audit) which is far more relevant once a visitor has
        already seen the corpus and the program list.
      */}
      <AboutSection />
      <TransparencySection />
      <ImpactSection />
      <NewsSection />
      <PartnersSection />
      <FaqSection />
      <Footer />
    </main>
  )
}

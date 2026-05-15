import { Layout } from "@/components/layout";
import { Hero } from "@/components/hero";
import { MarketplaceTeaser } from "@/components/marketplace-teaser";
import { HowItWorks } from "@/components/how-it-works";
import { Testimonials } from "@/components/testimonials";
import { CTASection } from "@/components/cta-section";

export default function Home() {
  return (
    <Layout>
      <Hero />
      <MarketplaceTeaser />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </Layout>
  );
}

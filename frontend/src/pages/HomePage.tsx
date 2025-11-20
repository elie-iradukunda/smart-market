import HeroSection from '@/components/sections/HeroSection'
import FeaturesSection from '@/components/sections/FeaturesSection'
import ModulesSection from '@/components/sections/ModulesSection'
import IntegrationsSection from '@/components/sections/IntegrationsSection'
import CtaSection from '@/components/sections/CtaSection'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <ModulesSection />
      <IntegrationsSection />
      <CtaSection />
    </div>
  )
}


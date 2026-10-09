import ContactSection from '../../components/public/ContactSection'
import HeroSection from '../../components/public/HeroSection'
import LocationSection from '../../components/public/LocationSection'
import ServicesSection from '../../components/public/ServicesSection'
import { useHashScroll } from '../../hooks/useHashScroll'

// Home del portal: secciones institucionales, navegables por ancla desde el header
export default function HomePage() {
  useHashScroll()

  return (
    <>
      <HeroSection />
      <ServicesSection />
      <LocationSection />
      <ContactSection />
    </>
  )
}

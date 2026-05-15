import React from 'react'
import Hero from './sections/Hero'
import ShowcaseSection from './sections/ShowcaseSection'
import Navbar from './components/Navbar'
import FeatureCards from './sections/FeactureCards'
import ExperienceSection from './sections/ExperienceSection'
import TechStack from './sections/TechStack'
import Contact from './sections/Contact'
import Footer from './sections/Footer'
import SplashCursor from './components/SplashCursor'

const App = () => {
  return (
    <>
      <SplashCursor
        DENSITY_DISSIPATION={3.5}
        VELOCITY_DISSIPATION={2}
        PRESSURE={0.1}
        CURL={3}
        SPLAT_RADIUS={0.2}
        SPLAT_FORCE={6000}
        COLOR_UPDATE_SPEED={10}
        SHADING
        RAINBOW_MODE={false}
        COLOR="#A855F7"
      />

      <Navbar />

      <Hero />
      <ShowcaseSection />
      <FeatureCards />
      <ExperienceSection />
      <TechStack />
      <Contact />
      <Footer />
    </>
  )
}

export default App
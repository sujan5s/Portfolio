import React, { Suspense, lazy, useState, useEffect } from 'react'
import Navbar from './components/Navbar'

// Lazy load sections for better initial performance
const Hero = lazy(() => import('./sections/Hero'))
const ShowcaseSection = lazy(() => import('./sections/ShowcaseSection'))
const FeatureCards = lazy(() => import('./sections/FeactureCards'))
const ExperienceSection = lazy(() => import('./sections/ExperienceSection'))
const TechStack = lazy(() => import('./sections/TechStack'))
const Contact = lazy(() => import('./sections/Contact'))
const Footer = lazy(() => import('./sections/Footer'))
const SplashCursor = lazy(() => import('./components/SplashCursor'))

const App = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      <Navbar />
      
      {/* Optimized SplashCursor loads immediately */}
      <Suspense fallback={null}>
        <SplashCursor
          SIM_RESOLUTION={isMobile ? 64 : 128}
          DYE_RESOLUTION={isMobile ? 512 : 1440}
          PRESSURE_ITERATIONS={isMobile ? 10 : 20}
          DENSITY_DISSIPATION={isMobile ? 4.5 : 3.5}
          VELOCITY_DISSIPATION={isMobile ? 3 : 2}
          PRESSURE={0.1}
          CURL={isMobile ? 2 : 3}
          SPLAT_RADIUS={isMobile ? 0.15 : 0.2}
          SPLAT_FORCE={isMobile ? 4000 : 6000}
          COLOR_UPDATE_SPEED={10}
          SHADING={!isMobile}
          RAINBOW_MODE={false}
          COLOR="#A855F7"
        />
      </Suspense>

      {/* Each section loads independently in the background */}
      <main>
        <Suspense fallback={null}>
          <Hero />
        </Suspense>
        
        <Suspense fallback={null}>
          <ShowcaseSection />
        </Suspense>
        
        <Suspense fallback={null}>
          <FeatureCards />
        </Suspense>
        
        <Suspense fallback={null}>
          <ExperienceSection />
        </Suspense>
        
        <Suspense fallback={null}>
          <TechStack />
        </Suspense>
        
        <Suspense fallback={null}>
          <Contact />
        </Suspense>
        
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </main>
    </>
  )
}

export default App
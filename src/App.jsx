import React, { Suspense, lazy, useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import InitialLoader from './components/InitialLoader'

// 1. Priority Eager Imports: Start fetching critical components immediately
const heroPromise = import('./sections/Hero')
const showcasePromise = import('./sections/ShowcaseSection')
const splashPromise = import('./components/SplashCursor')

const Hero = lazy(() => heroPromise)
const ShowcaseSection = lazy(() => showcasePromise)
const SplashCursor = lazy(() => splashPromise)

// 2. Secondary Background Imports: Will only be fetched when rendered
const FeatureCards = lazy(() => import('./sections/FeactureCards'))
const ExperienceSection = lazy(() => import('./sections/ExperienceSection'))
const TechStack = lazy(() => import('./sections/TechStack'))
const Contact = lazy(() => import('./sections/Contact'))
const Footer = lazy(() => import('./sections/Footer'))

const App = () => {
  // Initialize synchronously so the fluid cursor never mounts on mobile,
  // not even for one render
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  
  // Check session storage so loader only shows once per session
  const hasSeenLoader = sessionStorage.getItem('portfolio_has_seen_loader') === 'true';
  const [showLoader, setShowLoader] = useState(!hasSeenLoader);
  
  // If already seen, we consider priority loaded to skip the stall
  const [priorityLoaded, setPriorityLoaded] = useState(hasSeenLoader);

  useEffect(() => {
    // Determine if mobile for optimizations
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Wait for priority components to finish downloading
    if (!hasSeenLoader) {
      Promise.all([heroPromise, showcasePromise, splashPromise])
        .then(() => {
          setPriorityLoaded(true);
        })
        .catch((err) => {
          console.error("Priority chunk failed to load:", err);
          setPriorityLoaded(true); // Failsafe to prevent endless loader
        });
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, [hasSeenLoader]);

  const handleLoaderComplete = () => {
    setShowLoader(false);
    sessionStorage.setItem('portfolio_has_seen_loader', 'true');
  };

  return (
    <>
      {showLoader && (
        <InitialLoader 
          isLoaded={priorityLoaded} 
          onComplete={handleLoaderComplete} 
        />
      )}
      
      {/* 
        Hide the main content visually while loader is active, 
        but allow priority components to render and mount into the DOM 
      */}
      <div className={`app-content ${showLoader ? 'hidden opacity-0 pointer-events-none fixed inset-0' : 'visible opacity-100 transition-opacity duration-1000'}`}>
        <Navbar />
        
        {/* Priority: Splash Effect — desktop only. A cursor effect is useless on
            touch screens and the fluid sim is the single biggest GPU cost on phones. */}
        {!isMobile && (
          <Suspense fallback={null}>
            <SplashCursor
              SIM_RESOLUTION={128}
              DYE_RESOLUTION={1440}
              PRESSURE_ITERATIONS={20}
              DENSITY_DISSIPATION={3.5}
              VELOCITY_DISSIPATION={2}
              PRESSURE={0.1}
              CURL={3}
              SPLAT_RADIUS={0.2}
              SPLAT_FORCE={6000}
              COLOR_UPDATE_SPEED={10}
              SHADING={true}
              RAINBOW_MODE={false}
              COLOR="#A855F7"
            />
          </Suspense>
        )}

        <main>
          {/* Priority Sections */}
          <Suspense fallback={null}>
            <Hero />
          </Suspense>
          
          <Suspense fallback={null}>
            <ShowcaseSection />
          </Suspense>
          
          {/* Secondary Sections: Only render and fetch AFTER loader is completely gone */}
          {!showLoader && (
            <>
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
            </>
          )}
        </main>
      </div>
    </>
  )
}

export default App
import React, { lazy, Suspense, useRef } from 'react'
import { words } from '../constants/index.js'
import Button from '../components/Button.jsx'
import { useGSAP} from '@gsap/react'
import { gsap } from 'gsap'
import AnimatedCounter from '../components/AnimatedCounter.jsx'
import useParallax from '../hooks/useParallax.js'

const DepthPortrait = lazy(() => import('../components/Heromodels/DepthPortrait.jsx'))

const Hero = () => {
  const bgWrapperRef = useRef(null)
  const bgImgRef = useRef(null)

  // Scroll parallax on the decorative background layer only — the
  // DepthPortrait hologram is untouched and keeps its own pointer-parallax.
  useParallax(bgWrapperRef, { y: 160, trigger: '#hero', start: 'top top', end: 'bottom top' })

  useGSAP(() => {
    gsap.fromTo('.hero-text h1',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power2.out' })

    // Light mouse-parallax on the same background layer, layered on top of
    // its scroll parallax, for extra depth on desktop.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || window.innerWidth <= 768) return

    const img = bgImgRef.current
    if (!img) return

    const xTo = gsap.quickTo(img, 'x', { duration: 0.8, ease: 'power3.out' })
    const yTo = gsap.quickTo(img, 'y', { duration: 0.8, ease: 'power3.out' })

    const handlePointerMove = (e) => {
      const relX = e.clientX / window.innerWidth - 0.5
      const relY = e.clientY / window.innerHeight - 0.5
      xTo(relX * -40)
      yTo(relY * -40)
    }

    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  })

  return (
    <section id="hero" className="relative overflow-hidden">
      <div ref={bgWrapperRef} className="absolute top-0 left-0 z-10">
        <img ref={bgImgRef} src="/images/bg.png" alt="" />
      </div>

      <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between w-full min-h-screen px-5 xl:px-20 pt-32 xl:pt-20 pb-20">
        
        <header className="flex flex-col justify-center xl:w-1/2 w-full z-30">
          <div className="flex flex-col gap-7">
            <div className="hero-text">
              <h1>
                Crafting
                <span className="slide">
                  <span className="wrapper">
                    {words.map((word, index) => (
                      <span
                        key={index}
                        className="flex items-center md:gap-3 gap-1 pb-2"
                      >
                        <img
                          src={word.imgPath}
                          alt="person"
                          className="xl:size-12 md:size-10 size-7 md:p-2 p-1 rounded-full bg-white-50"
                        />
                        <span>{word.text}</span>
                      </span>
                    ))}
                  </span>
                </span>
              </h1>
              <h1>into Real Projects</h1>
              <h1>From Imagination to Implementation</h1>
            </div>

            <p className="text-white-50 md:text-xl relative z-10 pointer-events-none">
             Hi, I’m Sujan, a developer and designer who loves to create with a passiom for code
            </p>

            <Button
              text="See My Work"
              className="md:w-80 md:h-16 w-60 h-12"
              id="counter"
            />
          </div>
        </header>

        <figure className="relative z-20 flex justify-center items-center xl:w-1/2 w-full mt-20 xl:mt-0 perspective-1000">
          <div className="flex justify-center items-center w-full h-full scale-90 xl:scale-100">
            <div className="relative w-[min(80vw,26rem)] aspect-[2/3]">
              {/* Outer purple ambient glow (brand colour) */}
              <div
                className="absolute -inset-10 blur-3xl pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(132, 0, 255, 0.45), transparent 65%)',
                }}
              />
              {/* Inner cyan glow tying the halo to the hologram itself */}
              <div
                className="absolute -inset-4 blur-2xl pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(0, 210, 255, 0.35), transparent 60%)',
                }}
              />
              <Suspense
                fallback={
                  <img
                    src="/images/sujans05.webp"
                    alt="Sujan"
                    className="relative w-full h-full object-contain"
                    draggable={false}
                  />
                }
              >
                <DepthPortrait />
              </Suspense>
            </div>
          </div>
        </figure>
      </div>
      <AnimatedCounter />
    </section>
  )
}

export default Hero
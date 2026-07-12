import React, { lazy, Suspense } from 'react'
import { words } from '../constants/index.js'
import Button from '../components/Button.jsx'
import { useGSAP} from '@gsap/react'
import { gsap } from 'gsap'
import AnimatedCounter from '../components/AnimatedCounter.jsx'

const DepthPortrait = lazy(() => import('../components/Heromodels/DepthPortrait.jsx'))

const Hero = () => {
  useGSAP(() => {
    gsap.fromTo('.hero-text h1',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power2.out' })
  })

  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="absolute top-0 left-0 z-10">
        <img src="/images/bg.png" alt="" />
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
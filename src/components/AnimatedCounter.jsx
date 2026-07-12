import React, { useRef } from 'react'
import { counterItems } from '../constants/index.js'
import CountUp from 'react-countup'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { REVEAL_STAGGER, SCROLL_TRIGGER_START } from '../constants/motion.js'

gsap.registerPlugin(ScrollTrigger)

const AnimatedCounter = () => {
  const containerRef = useRef(null)

  useGSAP(() => {
    gsap.from('.counter-card', {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: 'power2.out',
      stagger: REVEAL_STAGGER,
      scrollTrigger: {
        trigger: containerRef.current,
        start: SCROLL_TRIGGER_START,
      },
    })
  }, { scope: containerRef })

  return (
    <div id='counter' className='padding-x-lg xl:mt-0 mt-32' ref={containerRef}>
        <div className='mx-auto grid-4-cols'>
            {counterItems.map((item)=>(
                <div key={item.label} className='counter-card bg-zinc-900 rounded-lg p-10 flex flex-col justify-center'>
                    <div className='counter-number text-white text-5xl font-bold mb-2'>
                    <CountUp suffix={item.suffix} end={item.value}/>
                </div>
                <div className='text-white-50 text-lg'>{item.label}</div>
                </div>
            ))}
        </div>
    </div>
  )
}

export default AnimatedCounter
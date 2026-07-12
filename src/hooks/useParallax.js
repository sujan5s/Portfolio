import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMediaQuery } from 'react-responsive';

gsap.registerPlugin(ScrollTrigger);

// Scrubs `ref`'s translateY against scroll position so it drifts at a
// different speed than the content around it — the core parallax primitive
// reused across sections. No-ops under prefers-reduced-motion, and the
// travel distance is reduced on mobile where screens (and scroll ranges)
// are much shorter.
const useParallax = (
  ref,
  { y = 60, start = 'top bottom', end = 'bottom top', trigger } = {}
) => {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    const distance = isMobile ? y * 0.4 : y;

    gsap.to(el, {
      y: distance,
      ease: 'none',
      scrollTrigger: {
        // Defaults to the animated element itself, but a small/short el
        // (e.g. a decorative image pinned at the very top of the page)
        // should pass its containing section instead — otherwise its own
        // tiny top/bottom range gets consumed almost immediately and the
        // tween snaps to its end value with no visible scrub.
        trigger: trigger || el,
        start,
        end,
        scrub: true,
      },
    });
  }, [ref, y, start, end, trigger, isMobile]);
};

export default useParallax;

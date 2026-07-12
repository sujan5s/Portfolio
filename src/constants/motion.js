// Shared motion tokens so entrance reveals feel like one system instead of
// scattered magic numbers across sections.
export const EASE = 'power2.out';

export const DURATION = {
  fast: 0.6,
  base: 0.9,
  slow: 1.2,
};

// Standard scroll-triggered "rise + fade in" reveal, spread with gsap.from().
export const REVEAL_UP = {
  y: 40,
  opacity: 0,
  duration: DURATION.base,
  ease: EASE,
};

export const REVEAL_STAGGER = 0.15;

export const SCROLL_TRIGGER_START = 'top 80%';

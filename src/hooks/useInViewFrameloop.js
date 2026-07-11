import { useEffect, useRef, useState } from 'react';

/**
 * Pauses a react-three-fiber Canvas when it is scrolled out of view.
 *
 * Returns a ref to attach to the Canvas wrapper element and a `frameloop`
 * value ("always" | "never") to pass to the Canvas. While offscreen the
 * render loop stops entirely, so the GPU does no work for that canvas.
 */
const useInViewFrameloop = (rootMargin = '200px') => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, inView ? 'always' : 'never'];
};

export default useInViewFrameloop;

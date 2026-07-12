import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SCROLL_TRIGGER_START } from "../constants/motion.js";

gsap.registerPlugin(ScrollTrigger);

const TitleHeader = ({ title, sub }) => {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from(containerRef.current.children, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.15,
      scrollTrigger: {
        trigger: containerRef.current,
        start: SCROLL_TRIGGER_START,
      },
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-5">
      <div className="hero-badge">
        <p>{sub}</p>
      </div>
      <div>
        <h1 className="font-semibold md:text-5xl text-3xl text-center">
          {title}
        </h1>
      </div>
    </div>
  );
};

export default TitleHeader;

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { abilities } from "../constants";
import { REVEAL_STAGGER, SCROLL_TRIGGER_START } from "../constants/motion.js";

gsap.registerPlugin(ScrollTrigger);

const FeatureCards = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from(".ability-card", {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: "power2.out",
      stagger: REVEAL_STAGGER,
      scrollTrigger: {
        trigger: containerRef.current,
        start: SCROLL_TRIGGER_START,
      },
    });
  }, { scope: containerRef });

  return (
    <div className="w-full padding-x-lg" ref={containerRef}>
      <div className="mx-auto grid-3-cols">
        {abilities.map(({ imgPath, title, desc }) => (
          <div
            key={title}
            className="ability-card card-border rounded-xl p-8 flex flex-col gap-4 transition-transform duration-300 hover:-translate-y-2"
          >
            <div className="size-14 flex items-center justify-center rounded-full">
              <img src={imgPath} alt={title} />
            </div>
            <h3 className="text-white text-2xl font-semibold mt-2">{title}</h3>
            <p className="text-white-50 text-lg">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureCards;
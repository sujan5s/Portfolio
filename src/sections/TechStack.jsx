import React, { Suspense, lazy } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMediaQuery } from "react-responsive";

import TitleHeader from "../components/TitleHeader";
import { techStackIcons } from "../constants";
import useInViewFrameloop from "../hooks/useInViewFrameloop";

// Lazy so the Three.js chunk for this section is only downloaded when the
// section actually renders. All 3D icons share ONE WebGL context via drei's
// <View> — five separate contexts is what crashed mobile browsers.
const TechIconCardExperience = lazy(() =>
  import("../components/models/tech_logos/TechIconCardExperience")
);
const TechIconsCanvas = lazy(() =>
  import("../components/models/tech_logos/TechIconCardExperience").then((m) => ({
    default: m.TechIconsCanvas,
  }))
);

const TechStack = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  // Pauses the shared canvas entirely while the section is scrolled offscreen.
  // A large rootMargin keeps the render loop warm well before/after the
  // section enters view — drei's <View> needs continuous frames to track
  // each card's scroll position, so a tight margin caused a visible
  // jump/desync right at the intersection boundary and made drag rotation
  // feel stuttery near it.
  const [containerRef, frameloop] = useInViewFrameloop('800px');

  // Animate the tech cards in the skills section
  useGSAP(() => {
    gsap.fromTo(
      ".tech-card",
      {
        y: 50,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.inOut",
        stagger: 0.2,
        scrollTrigger: {
          trigger: "#skills",
          start: "top center",
        },
      }
    );
  });

  return (
    <div id="skills" className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          title="How I Can Contribute & My Key Skills"
          sub="🤝 What I Bring to the Table"
        />
        {/* relative wrapper so the shared canvas overlay covers the grid */}
        <div ref={containerRef} className="relative">
          <div className="tech-grid">
            {techStackIcons.map((techStackIcon) => (
              <div
                key={techStackIcon.name}
                className="card-border tech-card overflow-hidden group xl:rounded-full rounded-lg"
              >
                <div className="tech-card-animated-bg" />
                <div className="tech-card-content">
                  <div className="tech-icon-wrapper">
                    <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-xs opacity-50">...</div>}>
                      <TechIconCardExperience model={techStackIcon} />
                    </Suspense>
                  </div>
                  <div className="padding-x w-full">
                    <p>{techStackIcon.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* One WebGL context renders every icon above via <View.Port /> */}
          <Suspense fallback={null}>
            <TechIconsCanvas
              eventSource={containerRef}
              frameloop={frameloop}
              isMobile={isMobile}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default TechStack;

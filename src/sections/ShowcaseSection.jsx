import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import MagicBento from "../components/MagicBento";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    color: '#120F17',
    title: 'Smart Finance Tracker',
    description: 'A Smart Platform to Track your expenses and manage your income and expenses .',
    label: 'Smart Finance Tracker',
    image: '/images/finance.webp',
    link: 'https://finance-tracker-x6mi.vercel.app/dashboard'
  },
  {
    color: '#120F17',
    title: 'AeroClub Nitte Website',
    description: 'The official website showcasing projects and events for AeroClub Nitte.',
    label: 'AeroClub',
    image: '/images/project33.webp',
    link: 'https://www.aeroclubnitte-nmamit.com'
  },
  {
    color: '#120F17',
    title: 'Incridea',
    description: 'A technocultural fest website for NMAMIT. Built with React, Node.js, & TailwindCSS.',
    label: 'Incridea',
    image: '/images/incridea.webp',
    link: 'https://incridea.in/'
  },
 {
    color: '#120F17',
    title: 'Shara Ayurveda',
    description: 'A ecommerce website to sell ayurvedic products (Freelancing project).',
    label: 'Shara Ayurveda',
    image: '/images/shara.webp',
    link: 'https://ayurvedic-client.vercel.app/'
  },
  {
    color: '#120F17',
    title: 'Shara Dashboard',
    description: 'A Dashboard for Shara Ayurveda (Freelancing project).',
    label: 'Shara Dashboard',
    image: '/images/sharad.webp',
    link: 'https://ayurvedic-dashboard.vercel.app/'
  },
  {
    color: '#120F17',
    title: 'Stock market pridiction',
    description: 'Stock market pridiction using Machine Learning.',
    label: 'Stock market pridiction',
    image: '/images/stock.webp',
    link: ''
  },
];

const AppShowcase = () => {
  const sectionRef = useRef(null);

  useGSAP(() => {
    // Animation for the main section
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1.5,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom-=100",
        }
      }
    );
  }, []);

  return (
    <div id="work" ref={sectionRef} className="app-showcase py-20">
      <div className="w-full px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">My Projects</h2>
          <p className="text-white-50 max-w-2xl mx-auto">
            Here are some of the recent projects I've worked on, showcasing my skills in frontend and backend development.
          </p>
        </div>
        
        <MagicBento 
          cards={projects}
          textAutoHide={false}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={true}
          clickEffect={true}
          spotlightRadius={400}
          particleCount={12}
          glowColor="132, 0, 255"
          disableAnimations={false}
        />
      </div>
    </div>
  );
};

export default AppShowcase;
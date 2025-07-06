const words = [
    {text: 'Ideas', imgPath:'/images/ideas.svg'},
    {text: 'Vision', imgPath:'/images/concepts.svg'},
]

const counterItems = [
  { value: 2, suffix: "+", label: "Years of Experience" },
  { value: 4, suffix: "+", label: "Languages working on" },
  { value: 4, suffix: "+", label: "Completed Projects" },
 
];

const navLinks = [
  {
    name: "Work",
    link: "#work",
  },
  {
    name: "Experience",
    link: "#experience",
  },
  {
    name: "Skills",
    link: "#skills",
  },
  
];
const abilities = [
  {
    imgPath: "/images/seo.png",
    title: "Quality Focus",
    desc: "Delivering high-quality results while maintaining attention to every detail.",
  },
  {
    imgPath: "/images/chat.png",
    title: "Reliable Communication",
    desc: "Keeping you updated at every step to ensure transparency and clarity.",
  },
  {
    imgPath: "/images/time.png",
    title: "On-Time Delivery",
    desc: "Making sure projects are completed on schedule, with quality & attention to detail.",
  },
];

const expCards = [
  {
    review: "I'm a front-end developer skilled in React, Next.js, JavaScript, Tailwind CSS, and Three.js. I build responsive, user-friendly interfaces and enjoy creating smooth, interactive web experiences with clean, scalable code.",
    imgPath: "/images/exp1.png",
    logoPath: "/images/logo1.png",
    title: "Frontend Developer",
    date: "May 2024 - Present",
    responsibilities: [
      "Developed and maintained user-facing features for the website.",
      "Collaborated closely with UI/UX designers to ensure seamless user experiences.",
      "Optimized web applications for maximum speed and scalability.",
    ],
  },
  {
    review: "I'm a full-stack developer with experience in React, Next.js, Node.js, MongoDB, PostgreSQL, and SQL. I build end-to-end web applications with clean, scalable code — from responsive front-end interfaces to robust back-end systems and databases.",
    imgPath: "/images/exp2.png",
    logoPath: "/images/logo2.png",
    title: "Full Stack Developer",
    date: "Jan 2025",
    responsibilities: [
      "Led the development web applications, focusing on scalability.",
      "Worked on backend to integrate APIs seamlessly with the frontend.",
      "Contributed to projects that with the fullstack features.",
    ],
  },
  {
    review: "Focused on creating high-performance mobile apps using React Native and JavaScript. Delivers smooth, cross-platform experiences with intuitive UI and maintainable codebases..",
    imgPath: "/images/exp3.png",
    logoPath: "/images/logo3.png",
    title: "React Native Developer",
    date: "June 2024",
    responsibilities: [
      "Built cross-platform mobile apps using React Native, integrating with Appwrite's backend services.",
      "Improved app performance and user experience through code optimization and testing.",
      "Coordinated with the product team to implement features based on feedback.",
    ],
  },
];

const techStackIcons = [
  {
    name: "React Developer",
    modelPath: "/models/react_logo-transformed.glb",
    scale: 1,
    rotation: [0, 0, 0],
  },
  {
    name: "Python Developer",
    modelPath: "/models/python-transformed.glb",
    scale: 0.8,
    rotation: [0, 0, 0],
  },
  {
    name: "Backend Developer",
    modelPath: "/models/node-transformed.glb",
    scale: 5,
    rotation: [0, -Math.PI / 2, 0],
  },
  {
    name: "Interactive Developer",
    modelPath: "/models/three.js-transformed.glb",
    scale: 0.05,
    rotation: [0, 0, 0],
  },
  {
    name: "GitHub ",
    modelPath: "/models/git-svg-transformed.glb",
    scale: 0.05,
    rotation: [0, -Math.PI / 4, 0],
  },
];

const socialImgs = [
  {
    name: "insta",
    url: "https://www.instagram.com/sujan_s_ganiga?igsh=MXFoa21pMzQ0MzJmag==",
    imgPath: "/images/insta.png",
  },
  {
    name: "git",
    url:"https://github.com/sujan5s",
    imgPath: "/images/github1.jpg",
  },
  {
    name: "x",
    url:"https://x.com/sujan_s40707?t=gGP6m48fBwUphTGjfF6bJQ&s=09",
    imgPath: "/images/x.png",
  },
  {
    name: "linkedin",
    url:"https://www.linkedin.com/in/sujan-s-74b61b288?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    imgPath: "/images/linkedin.png",
  },
];

export {
  words,
  counterItems,
  navLinks,
  abilities,
  expCards,
  techStackIcons,
  socialImgs
};
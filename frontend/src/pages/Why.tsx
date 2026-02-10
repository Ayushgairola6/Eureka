import { Users, ShieldCheck, Target } from "lucide-react";

const aboutAntiNode = [
  {
    id: "about-1",
    title: "Research Together",
    subtitle: "Real-Time Collaboration",
    description:
      "Stop sending links back and forth. Create shared workspaces where your team researches together in real-time. No more email chains or scattered findings.",
    icon: <Users />,
    img: "/Rooms.png",
    badge: "The Problem",
  },
  {
    id: "about-2",
    title: "Transparent Verification",
    subtitle: "See The Sources & Logs",
    description:
      "Every claim is sourced. Every reasoning step is visible. Cross-reference everything yourself. No black boxes, no hidden hallucinations.",
    icon: <ShieldCheck />,
    img: "/Process logs2.png",
    badge: "Our Solution",
  },
  {
    id: "about-3",
    title: "Built for Accuracy",
    subtitle: "Self-Correcting Agentic system",
    description:
      "Agents verify their own claims before showing results. Deep web access finds sources others miss. You control the process, AI handles the work.",
    icon: <Target />,
    img: "/Self_correction.png",
    badge: "How It Works",
  },
];


import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { BsArrowUpRight } from "react-icons/bs";

const Why = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // Smooth out the line drawing effect
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} className="relative bg-white dark:bg-[#030303] py-32 px-6 overflow-hidden">

      {/* 1. THE CENTRAL DATA BUS (The Vertical Line) */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-neutral-200 dark:bg-neutral-800 -translate-x-1/2 hidden md:block" />
      <motion.div
        style={{ scaleY, originY: 0 }}
        className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-orange-500 -translate-x-1/2  hidden md:block shadow-red"
      />

      <header className="max-w-4xl mx-auto text-center mb-32 relative ">
        <h2 className="text-[10px] font-mono tracking-[0.5em] uppercase text-orange-500 mb-4 font-bold">
          [ Protocol_Architecture_v1.0 ]
        </h2>
        <h1 className="text-4xl md:text-6xl bai-jamjuree-bold tracking-tighter">
          Beyond Search. <br /> <span className="text-neutral-400">Pure Intelligence.</span>
        </h1>
      </header>

      <div className="max-w-6xl mx-auto space-y-40">
        {aboutAntiNode.map((data, i) => {
          const isEven = i % 2 === 0;

          return (
            <div key={i} className={`relative flex flex-col md:flex-row items-center gap-12 md:gap-24 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

              {/* THE IMAGE SIDE - "The Technical Feed" */}
              <motion.div
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="flex-1 w-full"
              >
                <div className="relative group">
                  {/* Decorative Coordinate Markers */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 border-t border-l border-orange-500/50" />
                  <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b border-r border-orange-500/50" />

                  <div className="relative aspect-video rounded-sm overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10">
                    <img
                      src={data.img}
                      alt={data.title}
                      className="w-full h-full object-cover group-hover:scale-105  group-hover:opacity-100 transition-all duration-300"
                    />
                    {/* HUD Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4 font-mono text-[10px] text-orange-400">
                      REF_ID: 0x{i}FF92 / SCAN_COMPLETE
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* THE CONNECTOR NODE (The dot on the line) */}
              <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-black dark:bg-white border-2 border-orange-500  shadow-orange-400" />
                <div className={`absolute h-[1px] bg-orange-500/50 w-12 md:w-24 ${isEven ? 'left-4' : 'right-4'}`} />
              </div>

              {/* THE TEXT SIDE */}
              <motion.div
                initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex-1 space-y-6 ${isEven ? 'text-left' : 'md:text-right'}`}
              >
                <span className="inline-block py-1 px-3 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 font-mono text-[10px] uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">
                  {data.badge}
                </span>
                <h3 className="text-3xl md:text-4xl bai-jamjuree-bold tracking-tight">
                  {data.title}
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 space-grotesk text-base leading-relaxed max-w-md ${!isEven && 'md:ml-auto'}">
                  {data.description}
                </p>
                <div className={`flex ${!isEven && 'md:justify-end'}`}>
                  <button className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest hover:text-orange-500 transition-colors">
                    Execute Protocol <BsArrowUpRight />
                  </button>
                </div>
              </motion.div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Why
import { BsArrowUpRight, BsPeople } from "react-icons/bs";
import {
  FaArrowLeft,
  FaArrowRight,
  FaGitAlt,
  FaResearchgate,
} from "react-icons/fa";
import { FiUploadCloud } from "react-icons/fi";
import { motion } from "framer-motion";
import React from "react";
import { LuBrainCircuit } from "react-icons/lu";
const eurekaFeatures = [
  {
    id: "feat-5",
    title: "Neuro-Symbolic Core",
    subtitle: "Hybrid Intelligence",
    description:
      "Experience the fusion of deep learning and formal logic. We combine statistical neural models for intuition with deterministic algorithms to eliminate hallucinations and ensure factual grounding.",
    icon: <LuBrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
    gradient: "from-indigo-600 via-cyan-500 to-emerald-400", // A "Fusion" gradient
    badgeColor: "bg-cyan-500/10",
    border: "border-cyan-400/50",
    img: "/neuro-symbolic.png",
    message: "Explore Architecture",
  },
  {
    id: "feat-1",
    title: "AI Chatrooms",
    subtitle: "Collective Intelligence",
    description:
      "Launch real-time research rooms. Perform web searches and multi-file analysis (RAG) with your team in a unified, synchronized interface.",
    icon: <BsPeople />,
    gradient: "from-purple-600 to-indigo-600", // Collaborative purple
    badgeColor: "bg-purple-500/10",
    border: "border-purple-500/50",
    img: "/rooms.png",
    message: "Create Room",
  },
  {
    id: "feat-2",
    title: "Synthesis Mode",
    subtitle: "Deep Reasoning",
    description:
      "Go beyond chat. Use deep reasoning with our Neuro-Symoblic architecture to synthesize insights from private docs, community knowledge, and the live web simultaneously.",
    icon: <FaResearchgate />,
    gradient: "from-emerald-500 to-teal-600", // "Growth" and deep-tech green
    badgeColor: "bg-emerald-500/10",
    border: "border-emerald-500/50",
    img: "/synthesis.png",
    message: "Try Synthesis",
  },
  {
    id: "feat-3",
    title: "Persistent Memory",
    subtitle: "Tiered Context",
    description:
      "Your AI grows with you. Free users enjoy sharp short-term context, while Pro members unlock 'Infinite Memory' for massive project histories.",
    icon: <FaGitAlt />,
    gradient: "from-rose-500 to-pink-600", // High-value "Premium" feel
    badgeColor: "bg-pink-500/10",
    border: "border-pink-500/50",
    img: "/memory.png",
    message: "View Tiers",
  },
  {
    id: "feat-4",
    title: "Doc-RAG Engine",
    subtitle: "Knowledge Retrieval",
    description:
      "Upload complex PDFs or datasets. Eureka cross-references your files against community truths to find the specific answer you need instantly.",
    icon: <FiUploadCloud />,
    gradient: "from-cyan-500 to-blue-500", // Your "Arctic Neon" vibe
    badgeColor: "bg-cyan-500/10",
    border: "border-cyan-500/50",
    img: "/rag.png",
    message: "Analyze Docs",
  },
];
export const Features = () => {
  const ContainerRef = React.useRef<HTMLDivElement>(null);
  return (
    <>
      <div className=" bg-gray dark:bg-black text-black dark:text-white relative p-4  overflow-hidden ">
        {/* <div className="z-[-1] absolute top-0 left-0 h-full w-full bg-gradient-to-br from-blue-600/10 to-pink-600/10 blur-3xl"></div> */}
        <section className="p-2 text-center mt-4 mb-8">
          <h1 className="bai-jamjuree-bold text-3xl md:text-4xl">
            Differentiator
          </h1>
          <p className="bai-jamjuree-regular text-xs">What makes use unique?</p>
        </section>
        {/* container to hold overflowing cards container */}
        <div className="relative max-w-7xl mx-auto ">
          <div
            className={`absolute -top-11 right-4 flex gap-2 dark:bg-black dark:text-white border bg-gray-100 text-black rounded-md`}
          >
            <button
              onClick={() => {
                if (ContainerRef.current) {
                  ContainerRef.current.scrollBy({
                    left: -336,
                    behavior: "smooth",
                  });
                }
              }}
              className={`p-2 rounded-full transition-all duration-300 
                 text-black dark:text-white
              `}
            >
              <FaArrowLeft />
            </button>
            <button
              onClick={() => {
                if (ContainerRef.current) {
                  ContainerRef.current.scrollBy({
                    left: 336,
                    behavior: "smooth",
                  });
                }
              }}
              className={`p-2 rounded-full transition-all duration-300 text-black dark:text-white`}
            >
              <FaArrowRight />
            </button>
          </div>
          <div
            ref={ContainerRef}
            className="flex overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory"
          >
            <div className="flex flex-nowrap gap-6 py-2 px-4">
              {eurekaFeatures.map((data, index) => {
                return (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "50px" }}
                      transition={{ type: "tween", duration: 0.3 }}
                      key={`${data.id}+${index}_${data.title}`}
                      className=" border bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/10 dark:to-black  rounded-sm w-80 h-auto  p-2 relative group overflow-hidden group "
                    >
                      {/* grid svg background */}
                      <svg
                        width="100%"
                        height="100%"
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none"
                      >
                        <defs>
                          <pattern
                            id="circuit"
                            x="0"
                            y="0"
                            width="100"
                            height="100"
                            patternUnits="userSpaceOnUse"
                          >
                            <path
                              d="M10 10 h80 v80 h-80 z"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="0.5"
                            />
                            <circle cx="10" cy="10" r="2" fill="currentColor" />
                            <circle cx="90" cy="10" r="2" fill="currentColor" />
                            <circle cx="90" cy="90" r="2" fill="currentColor" />
                            <circle cx="10" cy="90" r="2" fill="currentColor" />
                            <path
                              d="M50 10 v20 M10 50 h20 M90 50 h-20 M50 90 v-20"
                              stroke="currentColor"
                              strokeWidth="0.5"
                            />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#circuit)" />
                      </svg>
                      <motion.div
                        animate={{
                          rotate: [10, 20, 15, 5, -10, -40, -20, 10, 20],
                        }}
                        transition={{
                          duration: 4,
                          ease: "linear",
                          repeat: Infinity,
                        }}
                        className={` opacity-30 pointer-events-none absolute z-[-13] -bottom-5 -left-15  
                        h-1/2 w-full  blur-[150px] bg-gradient-to-tr ${data.gradient}
                          `}
                      />
                      <div
                        className={`block md:hidden absolute bottom-0 h-20  left-0 rounded-tl-xl rounded-tr-xl blur-[100px] opacity-40 w-full  bg-gradient-to-r ${data.gradient}`}
                      />
                      <div className=" px-4 py-2 flex items-center justify-start gap-2 rounded-lg">
                        <ul
                          className={`bg-gradient-to-br ${data.gradient} rounded-md p-1`}
                        >
                          {data.icon}
                        </ul>
                        <h2 className="bai-jamjuree-semibold text-xl">
                          {data.title}
                        </h2>
                      </div>

                      <p className="px-4 py-2 space-grotesk text-sm">
                        {data.description}
                      </p>
                      <section className="p-2 justify-self-end cursor-pointer">
                        <h6
                          className={`text-xs space-grotesk text-center w-fit 
                              ${data.badgeColor}
                              rounded-xl px-2 py-1 border ${data.border} flex items-center justify-center gap-2 `}
                        >
                          {data.subtitle}
                          <BsArrowUpRight />
                        </h6>
                      </section>
                    </motion.div>
                  </>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

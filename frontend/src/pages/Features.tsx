const AntiNodeFeatures = [
  {
    id: "feat-1",
    title: "Autonomus deep Web Search",
    subtitle: "Beyond Surface Results",
    description:
      "AI does the work for you by analyzing your statement, breaking it down and initiating parallel web searchs to make sure you always get a vast and quality  information not just SEO facts.",
    icon: <Globe size={16} />,
    img: "/Process logs2.png",
  },
  {
    id: "feat-2",
    title: "Real-Time Collaboration",
    subtitle: "Research Together",
    description:
      "Create shared workspaces where teams research/disuss simultaneously. Live updates, shared context, unified insights, prvate yet global documents. Stop sending links back and forth.",
    icon: <Users size={16} />,
    img: "/AntiNode_rooms.png",
  },
  {
    id: "feat-3",
    title: "Multi-Source Synthesis",
    subtitle: "Connect Everything",
    description:
      "Cross-reference private documents with web data in one query. Synthesize multiple sources, resolve conflicts, cite everything create reports or analyze mutliple data source at once.",
    icon: <GitBranch size={16} />,
    img: "/Synthesis1.png",
  },
  {
    id: "feat-4",
    title: "Verified Results",
    subtitle: "Self-Correcting AI",
    description:
      "AI verifies its own claims before showing results. Confidence scoring on every statement. Flags uncertainties automatically, tries to catch descrepancies and source validation.",
    icon: <ShieldCheck size={16} />,
    img: "/Source.png",
  },
  {
    id: "feat-5",
    title: "Private Knowledge",
    subtitle: "Your Data, Your Control",
    description:
      "Upload documents securely to the cloud. Toggle privacy with one click. Your research stays private, AI remembers your context and data never used for training without your permission.",
    icon: <Database size={16} />,
    img: "/Privacy.png",
  },
  {
    id: "feat-6",
    title: "Public contributions",
    subtitle: "More control over misinformation",
    description:
      "Upload documents to share your knowledge with others. You can help in building a seperate space for everyone just like stack-overflow but with AI",
    icon: <Database size={16} />,
    img: "/Public.png",
  },
];

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsArrowUpRight } from "react-icons/bs";
import { Database, GitBranch, Globe, ShieldCheck, Users } from "lucide-react";

export const Features = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="bg-white dark:bg-black py-20 border-y border-neutral-100 dark:border-neutral-900">
      <div className="max-w-6xl mx-auto px-6">

        {/* Compact Header */}
        <div className="mb-12">
          <h2 className="text-orange-600 font-mono text-[10px] uppercase tracking-[0.3em] font-bold mb-2">
            System_Capabilities_v1
          </h2>
          <h1 className="bai-jamjuree-bold text-3xl md:text-4xl tracking-tight">
            Modes & Features
          </h1>
        </div>

        {/* The Switcher Container */}
        <div className="flex flex-col lg:flex-row border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden bg-white dark:bg-[#050505]">

          {/* Left Side: Navigation (The Menu) */}
          <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800">
            {AntiNodeFeatures.map((feat, idx) => (
              <button
                key={feat.id}
                onClick={() => setActiveTab(idx)}
                className={`w-full flex items-center gap-4 p-6 text-left transition-all relative group
                  ${activeTab === idx
                    ? "bg-neutral-50 dark:bg-neutral-900/50"
                    : "hover:bg-neutral-50/50 dark:hover:bg-white/[0.02]"
                  }`}
              >
                {/* Active Indicator Line */}
                {activeTab === idx && (
                  <motion.div
                    layoutId="activeTabLine"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-orange-600"
                  />
                )}

                <div className={`transition-colors duration-300 ${activeTab === idx ? "text-orange-600" : "text-neutral-400"}`}>
                  {feat.icon}
                </div>

                <div>
                  <h3 className={`text-sm bai-jamjuree-bold transition-colors ${activeTab === idx ? "text-black dark:text-white" : "text-neutral-500"}`}>
                    {feat.title}
                  </h3>
                  <p className="text-[10px] space-grotesk uppercase tracking-widest text-neutral-400 mt-0.5">
                    {feat.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Right Side: Content Display */}
          <div className="lg:w-2/3 p-8 md:p-12 min-h-[450px] flex flex-col justify-center bg-[#fafafa] dark:bg-[#080808]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Feature Image - Scaled down for cleanliness */}
                <div className="relative aspect-video w-full rounded-sm overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-black">
                  <img
                    src={AntiNodeFeatures[activeTab].img}
                    alt="Feature preview"
                    loading='lazy'
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Feature Description */}
                <div className="max-w-lg">
                  <p className="space-grotesk text-sm md:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {AntiNodeFeatures[activeTab].description}
                  </p>

                  <div className="mt-6">
                    <a href="/Interface" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-600 hover:text-orange-500 transition-colors group">
                      Launch Protocol <BsArrowUpRight className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Minimal Footer Info */}
        <div className="mt-6 flex justify-between items-center px-2">
          <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-tighter">Verified_Research_Environment // 2024</span>
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
            <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-tighter">System_Online</span>
          </div>
        </div>
      </div>
    </section>
  );
};
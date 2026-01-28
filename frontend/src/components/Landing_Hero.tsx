import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setQuestion } from "../store/InterfaceSlice.ts";
import { LightBlob } from '@/components/light_blob.tsx'
import { Terminal, Zap } from "lucide-react";
import { DataFlowGrid } from '@/components/DataFlow_grid.tsx'
type props = {
  value: string;
};

const Hero: React.FC<props> = ({ value }) => {
  const services = [
    {
      id: "01",
      title: "Collaborative research spectrum.",
      description: "Two users in the same room chatting and using AI powered research together in real time.",
      tag: "Collaborative AI Research",
      video: "/chatoom_final.mp4",
      logs: [
        "> ROOM INITIATED",
        "> CHATTING",
        "> COLLABORATIVE RESEARCH STARTED",
        "> THOUGHTS AND REASONING",
        "> UNDERSTANDING INTENT",
        "< RESPONSE GENERATED"
      ]
    },
    {
      id: "02",
      title: "Surface & Deep Web Analysis.",
      description: "Autonomous agent understanding the user prompt and searching the web for broader results for accuracy.",
      tag: "Autonomous deep web research",
      video: "/Web+search+final.mp4",
      logs: [
        "> UNDERSTANDING INTENT",
        "> FETCHING LINKS",
        "> CRAWLING THE WEB",
        "> SCRAPING SITES",
        "< SHOWING LOGS",
        "10+ RESOURCES FOUND"
      ]
    },
    {
      id: "03",
      title: "Contextual Synthesis.",
      description: "User asked Agent to cite two different sources and create a detailed plan and strategy to market their product.",
      tag: "Multi source synthesis",
      video: "/SynthesisMode.mp4",
      logs: [
        "> MULTIPLE DOCUMENTS SELECTED",
        "> READING DOCUMENT METADATA",
        "> CHOOSING CONFIDENCE SCORE",
        "< GATHERING CONTEXT",
        '< SYNTHESIZING REPORT'
      ]
    }
  ];

  const [isAuto, setIsAuto] = React.useState(true);
  const [currentLog, setCurrentLog] = React.useState<string[]>([]);
  const [active, setActive] = React.useState(services[0]);
  const InputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const { isLoggedIn } = useAppSelector(s => s.auth);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (!isAuto) return;

    let currentIndex = services.findIndex(s => s.id === active.id);

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % services.length;
      setActive(services[currentIndex]);
      setCurrentLog([]); // Reset logs when switching
    }, 8000);

    return () => clearInterval(interval);
  }, [isAuto]);


  React.useEffect(() => {
    if (!active?.logs || active.logs.length === 0) return;

    setCurrentLog([]); // Reset logs when active changes
    let logIndex = 0;

    const interval = setInterval(() => {
      if (logIndex < active.logs.length) {
        setCurrentLog(prev => [...prev, active.logs[logIndex]]);
        logIndex++;
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load(); // Reload video when source changes
    }
  }, [active.video]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white text-black dark:bg-black dark:text-white flex items-center justify-center">
      <DataFlowGrid />

      <div className="relative z-1 mx-auto w-full px-2 py-4 flex flex-col items-center gap-16">
        {/* Header Section */}
        <section className="text-center max-w-full flex flex-col items-center gap-2">
          <h1 className="bai-jamjuree-bold text-4xl lg:text-6xl leading-tight">
            <motion.span
              animate={{ width: "auto" }}
              key={value}
              transition={{ ease: "linear", duration: 1 }}
              className="flex items-center justify-center gap-2"
            >
              The
              <AnimatePresence mode="wait">
                <motion.span
                  key={`value-${value}`}
                  className="text-transparent bg-clip-text bg-gradient-to-tr from-orange-400 via-red-500 to-pink-400"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {value}
                </motion.span>
              </AnimatePresence>
            </motion.span>
            knowledge agent—customized for you
          </h1>

          <h2 className="bai-jamjuree-semibold text-md md:text-xl text-gray-900 dark:text-gray-300">
            Research together with AI. Verified sources. Real-time collaboration.
          </h2>

          <p className='text-sm md:text-md bai-jamjuree-regular dark:text-gray-400 text-gray-700'>
            "Deep web search, multi-document analysis, and team workspaces in one platform."
          </p>

          {/* Search Input */}
          <div className="z-20 overflow-hidden md:w-120 w-100 p-[1px] mt-8 shadow-xl border relative h-full rounded-md bg-white dark:bg-black dark:shadow-gray-400/10">
            <motion.section
              animate={{ rotate: 360 }}
              transition={{
                type: "tween",
                duration: 10,
                ease: "linear",
                repeat: Infinity,
              }}
              className="absolute top-0 left-0 h-full w-full z-[-2] border-dashed border-e-amber-200 p-2"
            />

            {/* input section and button container */}
            <div className="flex items-center justify-between gap-3 z-10 bg-white rounded-sm py-3 px-1 dark:bg-black">
              <input
                ref={InputRef}
                className="space-grotesk py-1 w-4/5 px-2 text-sm md:text-sm border rounded-md text-black dark:text-white border-none outline-none focus:ring-0 dark:bg-black bg-white"
                type="text"
                placeholder="What are neural networks?"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && InputRef.current?.value) {
                    dispatch(setQuestion(InputRef.current.value));
                  }
                }}
              />

              <Link
                onClick={() => {
                  if (InputRef.current?.value) {
                    dispatch(setQuestion(InputRef.current.value));
                    sessionStorage.setItem('AntiNode_Redirect_prompt', JSON.stringify(InputRef.current.value))
                  }
                }}
                role="button"
                to={isLoggedIn === true ? "/interface" : `/Login`}
                className="px-2 py-1 rounded-sm bg-black text-white dark:bg-white dark:text-black space-grotesk font-semibold uppercase flex items-center gap-2 text-xs md:text-sm"
              >
                Research
              </Link>
            </div>

          </div>


        </section>

        {/* Demo Section */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full flex justify-center px-4"
        >
          {/* Background Glow - Controlled */}
          <LightBlob
            from="from-orange-400"
            via="via-red-500"
            to="to-pink-400"
            dark_from="dark:from-orange-700"
            dark_via="dark:via-red-600"
            dark_to="dark:to-pink-700"
            top="-top-10"
          />

          <div className="relative w-full max-w-6xl rounded-sm overflow-hidden bg-white dark:bg-[#050505] border border-neutral-200 dark:border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">

            {/* 1. TERMINAL BAR */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-[#0A0A0A]">
              <div className="flex items-center gap-6">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/80" />
                  <div className="w-2 h-2 rounded-full bg-orange-500/80" />
                  <div className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-white/10" />
                </div>

                <div className="flex items-center gap-1 bg-neutral-200 dark:bg-white/5 p-0.5 rounded-sm border border-neutral-300 dark:border-white/5">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setActive(s); setIsAuto(false); }}
                      className={`px-3 py-1 text-[9px] font-bold uppercase tracking-tighter transition-all ${active.id === s.id
                        ? "bg-white dark:bg-zinc-800 text-orange-600 shadow-sm"
                        : "text-neutral-500 hover:text-orange-500"
                        }`}
                    >
                      {s.tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4 font-mono text-[9px] tracking-widest text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <span className={`w-1 h-1 rounded-full ${isAuto ? 'bg-orange-500 animate-pulse' : 'bg-neutral-600'}`} />
                  AUTO_SYNC: {isAuto ? "ACTIVE" : "PAUSED"}
                </span>
                <span className="text-neutral-700 dark:text-neutral-800">|</span>
                <span>OS_VER: 2.0.4_BETA</span>
              </div>
            </div>

            {/* 2. MAIN INTERFACE GRID */}
            <div className="grid grid-cols-12 h-[520px]">

              {/* Sidebar: Diagnostic Logs */}
              <div className="col-span-3 border-r border-neutral-200 dark:border-white/5 bg-neutral-50/50 dark:bg-black/40 p-5 hidden lg:flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-orange-600" />
                    <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">Diagnostics</span>
                  </div>
                  <div className="text-[9px] font-mono text-neutral-600">LN: {currentLog.length}</div>
                </div>

                <div className="flex-1 overflow-hidden font-mono text-[10px] leading-relaxed space-y-1">
                  <p className="text-orange-500/60 mb-2">// INIT_SEQUENCE_{active.id}</p>
                  {currentLog.map((log, index) => (
                    <motion.div
                      key={`${active.id}-${index}`}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-2"
                    >
                      <span className="text-neutral-700 dark:text-neutral-600">[{new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}]</span>
                      <span className={index === currentLog.length - 1 ? "text-orange-500" : "text-neutral-500 dark:text-neutral-400"}>
                        {log}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Video Viewport: THE HUD */}
              <div className="col-span-12 lg:col-span-9 relative bg-black overflow-hidden group">

                {/* HUD Corner Brackets */}
                <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-white/20 z-20" />
                <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-white/20 z-20" />
                <div className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-white/20 z-20" />
                <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-white/20 z-20" />

                {/* Video with Filter */}
                <video
                  key={active.video}
                  autoPlay muted loop playsInline
                  className="w-full h-full object-cover "
                  src={active.video}
                />

                {/* Scanning Overlay (Subtle scanline) */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />

                {/* Top Right Tooltip Card */}
                <div className="absolute top-6 right-6 z-30 max-w-[240px]">
                  <div className="bg-white/95 dark:bg-black/80 backdrop-blur-md border border-neutral-200 dark:border-white/10 p-4 rounded-sm shadow-2xl">
                    <div className="flex items-center gap-2 mb-2 text-orange-600">
                      <Zap size={14} fill="currentColor" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{active.tag} MODE</span>
                    </div>
                    <h3 className="text-xs font-bold mb-1 dark:text-white uppercase">{active.title}</h3>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-normal">
                      {active.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Progress Tracker */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-neutral-900 z-30">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: isAuto ? "100%" : "0%" }}
                    transition={{ duration: 8, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-orange-600 to-red-600 shadow-[0_0_10px_#ea580c]"
                  />
                </div>

                {/* Data Feed Footer (Inside Video) */}
                <div className="absolute bottom-6 left-8 z-30 hidden md:flex gap-10">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-neutral-500 uppercase font-bold">Latency</span>
                    <span className="text-xs font-mono text-orange-500">0.002ms</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-neutral-500 uppercase font-bold">Bitrate</span>
                    <span className="text-xs font-mono text-white">42.8 Mb/s</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* CTA Button */}

      </div>
    </div>
  );
};

export default Hero;
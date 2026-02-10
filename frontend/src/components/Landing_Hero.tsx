import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setQuestion } from "../store/InterfaceSlice.ts";
import { LightBlob } from '@/components/light_blob.tsx'
import { Pause, Play } from "lucide-react";
import { DataFlowGrid } from '@/components/DataFlow_grid.tsx'
import { BsChatDots } from "react-icons/bs";
import { FaWebflow } from "react-icons/fa6";
import { GiMultipleTargets } from "react-icons/gi";
type props = {
  value: string;
};
const ChatroomUrl = import.meta.env.VITE_CHATROOM_URL;
const webSearchUrl = import.meta.env.VITE_WEBSEARCH_URL;
const synthesisUrl = import.meta.env.VITE_SYNTHESIS_URL

const Hero: React.FC<props> = ({ value }) => {
  const services = [
    {
      id: "01",
      title: "Research workspace .",
      description: "Two users in the same room chatting and using AI powered research together in real time.",
      tag: "Collaborative AI Research",
      video: ChatroomUrl,
      icon: <BsChatDots />,
      logs: [
        "> WORKSPACE INITIATED",
        "> CHATTING",
        "> COLLABORATIVE RESEARCH STARTED",
        "> THOUGHTS AND REASONING",
        "> UNDERSTANDING INTENT",
        "< RESPONSE GENERATED"
      ]
    },
    {
      id: "02",
      title: " Deep Web Search.",
      description: "Autonomous agent understanding the user prompt and searching the web for broader results for accuracy.",
      tag: "Autonomous deep web research",
      video: webSearchUrl,
      icon: <FaWebflow />,
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
      title: "Multi-Source Synthesis.",
      description: "User asked Agent to cite two different sources and create a detailed plan and strategy to market their product.",
      tag: "Multi source synthesis",
      video: synthesisUrl,
      icon: <GiMultipleTargets />,
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
  const [isPlaying, setIsPlaying] = React.useState(true);
  const { isLoggedIn } = useAppSelector(s => s.auth);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (!isAuto) return;

    let currentIndex = services.findIndex(s => s.id === active.id);

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % services.length;
      setActive(services[currentIndex]);
      setIsPlaying(true);

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
            AI agent—customized for you
          </h1>

          <h2 className="bai-jamjuree-semibold text-md md:text-xl text-gray-900 dark:text-gray-300">
            Research together with AI. Verify sources. Real-time collaboration. Full Transparency.
          </h2>

          <p className='text-sm md:text-md bai-jamjuree-regular dark:text-gray-400 text-gray-700'>
            "Deep web search, multi-document analysis, and team workspaces in one platform."
          </p>

          {/* Search Input */}
          <div className="z-20 overflow-hidden md:w-120 w-full p-[1px] mt-8 shadow-xl border relative h-full rounded-md bg-white dark:bg-black dark:shadow-gray-400/10">
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
        <div className='relative z-10 w-full max-w-6xl'>
          <LightBlob from='from-orange-600' via='via-pink-600' to='to-red-600' top='top-0' />
          <section className="flex flex-col md:flex-row w-full mx-auto mt-12 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[600px] ">

            {/* 1. SIDEBAR: The "Page Tree" */}
            <aside className="w-full md:w-64 bg-zinc-50 dark:bg-neutral-900 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-8 space-grotesk z-10">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 font-bold text-sm">
                  A
                </div>
                <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">AntiNode</span>
              </div>

              <nav className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 mb-2">Services</p>
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActive(s)
                      if (isAuto === true) setIsAuto(false);
                      else if (isAuto === false) setIsAuto(true);
                    }}
                    className={`flex items-start justify-start gap-3 px-3 py-2 rounded-md text-sm transition-colors ${active.id === s.id
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700"
                      : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-neutral-900"
                      }`}
                  >
                    <ul>
                      {s.icon}
                    </ul>
                    <ul>
                      {s.title}
                    </ul>
                  </button>
                ))}
              </nav>
            </aside>

            {/* 2. MAIN CONTENT: The "Document" */}
            <main className="flex-1 flex flex-col bg-white dark:bg-zinc-950 overflow-y-auto z-10">

              {/* Page Header Area */}
              <header className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-end z-10 flex-wrap gap-3">
                <div className="space-y-1">
                  <div className="bai-jamjuree-semibold flex items-center gap-2 text-zinc-400 text-xs ">
                    <span>AntiNode</span>
                    <span>/</span>
                    <span className="text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-2">
                      <ul>
                        {active.icon}
                      </ul>{active.tag}</span>
                  </div>
                  <h1 className="text-lg md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 space-grotesk flex items-center justify-center gap-2">
                    <ul>
                      {active.icon}
                    </ul> {active.title}
                  </h1>
                </div>

                <button
                  onClick={() => setIsAuto(!isAuto)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-semibold transition-all space-grotesk ${isAuto
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                    : "bg-zinc-50 border-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700"
                    }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isAuto ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
                  {isAuto ? "Auto-Sync On" : "Auto-Sync Off"}
                </button>
              </header>

              {/* Video Embed Style */}
              <div className="p-6">
                <div className="group relative rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm z-10">
                  <video
                    ref={videoRef}
                    key={active.video}
                    autoPlay muted loop playsInline
                    className="w-full aspect-video object-cover"
                    src={active.video}
                  />

                  {/* Play/Pause Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <button
                      onClick={() => {
                        if (isPlaying === true) {
                          videoRef.current?.pause();
                          setIsPlaying(false);
                        }
                        else if (isPlaying === false) {
                          videoRef.current?.play();
                          setIsPlaying(true)

                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-4 bg-white/90 backdrop-blur rounded-full shadow-xl text-zinc-900 transform transition-all hover:scale-110"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. LOGS: The "Database View" */}
              <div className="px-8  bai-jamjuree-semibold z-10">
                <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-900 pb-2">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Process Logs</h3>
                  <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    {currentLog.length} Operations
                  </span>
                </div>

                <div className="space-y-1 space-grotesk h-20 overflow-y-scroll" >
                  {currentLog.map((log, i) => (
                    <div key={i} className=" flex items-center justify-start  px-2 transition-colors rounded-md bg-white dark:bg-neutral-950  py-2">
                      <span className="text-[10px] text-zinc-300 dark:text-zinc-700 w-12 pt-0.5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className='flex items-center justify-center gap-3'>
                        <span className="text-zinc-400 dark:text-zinc-600 text-[10px]  uppercase font-bold ">
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <p className={`text-[10px] leading-relaxed ${i === currentLog.length - 1 ? "text-orange-600 font-medium" : "text-zinc-600 dark:text-zinc-400"}`}>
                          {log}
                        </p>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </main>
          </section>
        </div>



      </div >
    </div >
  );
};

export default Hero;
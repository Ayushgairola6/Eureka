import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import { BsLightningChargeFill } from "react-icons/bs";
import React from "react";
import { useAppDispatch } from "../store/hooks";
import { setQuestion } from "../store/InterfaceSlice.ts";
type props = {
  value: string;
};

const Hero: React.FC<props> = ({ value }) => {
  const InputRef = React.useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white text-black dark:bg-black dark:text-white flex items-center justify-center ">
      {/* ================= MAIN CONTENT ================= */}
      <div className="relative z-1 mx-auto w-full px-6 py-16 flex flex-col items-center gap-16">
        {/* ---------- TEXT ---------- */}
        <section className="text-center max-w-full flex flex-col items-center gap-2 ">
          <h1 className="bai-jamjuree-bold  text-5xl lg:text-6xl leading-tight px-4">
            <span className="flex items-center justify-center gap-2  ">
              The
              <AnimatePresence mode="wait">
                <motion.span
                  key={value}
                  className="text-transparent bg-clip-text bg-gradient-to-tr from-blue-600 to-sky-600 "
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, width: "auto" }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {value}
                </motion.span>
              </AnimatePresence>
            </span>
            knowledge agent-customized for you
          </h1>

          <h2 className="space-grotesk text-xs md:text-sm text-gray-800 dark:text-gray-300 max-w-xl">
            An agentic knowledge environment built on people verification.
            Analyze private data, perform live research, and collaborate through
            shared agent workspaces.
          </h2>

          {/* CTA */}
          <div className="z-20 overflow-hidden  max-w-full w-130 p-[1px] mt-8 shadow-xl border relative  h-full rounded-md bg-white dark:bg-black ">
            <motion.section
              animate={{ rotate: [45, 90, 180, 90, 180, 270, 360, 90] }}
              transition={{
                type: "tween",
                duration: 4,
                ease: "anticipate",
                repeat: Infinity,
              }}
              className="absolute top-0 left-0  h-full w-full z-[-2]   border-t-4 dark:border-white border-gray-700 p-2 "
            />

            <div
              className="flex items-center  justify-between gap-3  z-10 bg-white rounded-sm py-3 px-1 dark:bg-black 
            "
            >
              <input
                ref={InputRef}
                className="space-grotesk py-1 w-4/5 px-2 text-xs md:text-sm border rounded-md text-black dark:text-white border-none outline-none focus:ring-0  dark:bg-black bg-white "
                type="text"
                placeholder="What are neural networks?"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && InputRef.current?.value) {
                    dispatch(setQuestion(InputRef?.current?.value));
                  }
                }}
              />

              <Link
                onClick={() => {
                  dispatch(setQuestion(InputRef?.current?.value));
                }}
                role="button"
                to="/Interface"
                className="px-2 py-1 rounded-sm bg-black text-white dark:bg-white dark:text-black
              space-grotesk flex items-center gap-2 text-xs md:text-sm"
              >
                Find
                <BsLightningChargeFill />
              </Link>
            </div>
          </div>
        </section>

        {/* ---------- FLOATING PRODUCT CARD ---------- */}
        <motion.div className="relative z-10 w-full flex justify-center mt-8 lg:mt-0">
          {/* --- 1. THE AMBIENT BACKLIGHT (The "Aura") --- */}
          {/* Centered it behind the card for a better halo effect */}
          <div
            className="pointer-events-none absolute -top-20 lg:-top-10  
    h-full w-1/2  
    bg-gradient-to-r from-blue-900 via-sky-900 to-blue-900
    blur-[160px] z-[-5] rounded-full"
          />
          {/* --- 2. THE WINDOW CONTAINER (The "Mac" Shell) --- */}
          <div
            className="relative w-full lg:w-[90%] max-w-5xl rounded-xl overflow-hidden
    bg-neutral-100 dark:bg-black 
    shadow-2xl shadow-blue-900/20 
    border border-white/20 dark:border-white/10 
    ring-1 ring-black/5"
          >
            {/* --- A. WINDOW HEADER (The Controls) --- */}
            <div className="h-5 lg:h-9 w-full bg-white/50 dark:bg-white/5 backdrop-blur-md border-b border-neutral-200 dark:border-white/5 flex items-center px-4 gap-2">
              <div className="flex gap-2">
                <div className="w-2 h-2 lg:h-3 lg:w-3 rounded-full bg-[#FF5F56] border border-black/10 shadow-inner" />
                <div className="w-2 h-2 lg:h-3 lg:w-3 rounded-full bg-[#FFBD2E] border border-black/10 shadow-inner" />
                <div className="w-2 h-2 lg:h-3 lg:w-3 rounded-full bg-[#27C93F] border border-black/10 shadow-inner" />
              </div>

              {/* Optional: Fake URL bar for extra realism */}
              <div className="mx-auto w-1/3 h-5 rounded-md bg-black/5 dark:bg-white/5 hidden sm:block" />
            </div>

            {/* --- B. THE IMAGE CONTENT --- */}
            <div className="relative group">
              {/* The actual image */}
              <img
                src="/2.png" // replace with your actual UI screenshot
                alt="Agent workspace interface"
                className="w-full h-auto object-cover block"
              />

              {/* Glossy Screen Reflection (Subtle overlay) */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              {/* Inner Shadow to make image look "inset" */}
              <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none rounded-b-xl" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;

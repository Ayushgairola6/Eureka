import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import { BsLightningChargeFill } from "react-icons/bs";
import React from "react";
import { useAppDispatch } from "../store/hooks";
import { setQuestion } from "../store/InterfaceSlice.ts";
import { LightBlob } from "./light_blob.tsx";
type props = {
  value: string;
};

const Hero: React.FC<props> = ({ value }) => {
  const InputRef = React.useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white text-black dark:bg-black dark:text-white flex items-center justify-center ">
      {/* ================= MAIN CONTENT ================= */}
      <div className="relative z-1 mx-auto w-full px-2 py-4 flex flex-col items-center gap-16">
        {/* ---------- TEXT ---------- */}
        <section className="text-center  max-w-full flex flex-col items-center gap-2 ">
          <h1 className="bai-jamjuree-bold  text-4xl lg:text-6xl leading-tight ">
            <motion.span
              animate={{ width: "auto" }}
              key={value}
              transition={{ ease: "linear", duration: 1 }}
              className="flex items-center justify-center gap-2  "
            >
              The
              <AnimatePresence mode="wait">
                <motion.span
                  key={value}
                  className={`text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 via-blue-500 to-emerald-400 `}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {value}
                </motion.span>
              </AnimatePresence>
            </motion.span>
            knowledge agent-customized for you
          </h1>

          <h2 className="space-grotesk text-xs md:text-sm text-gray-800 dark:text-gray-300 max-w-xl">
            An agentic knowledge environment built on people verification.
            Analyze private data, perform live research, and collaborate through
            shared agent workspaces.
          </h2>

          {/* CTA */}
          <div className="z-20 overflow-hidden  md:w-120 w-80 p-[1px] mt-8 shadow-xl border relative  h-full rounded-md bg-white dark:bg-black dark:shadow-gray-400/10">
            <motion.section
              animate={{ rotate: 360 }}
              transition={{
                type: "tween",
                duration: 10,
                ease: "linear",
                repeat: Infinity,
              }}
              className="absolute top-0 left-0  h-full w-full z-[-2]   border-dashed border-e-amber-200   p-2 "
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
                className="px-1 py-1 rounded-sm bg-black text-white dark:bg-white dark:text-black
              space-grotesk flex items-center gap-2 text-xs md:text-sm"
              >
                Find
                <BsLightningChargeFill />
              </Link>
            </div>
          </div>
        </section>

        <motion.div
          initial={{ scale: 1 }}
          whileInView={{ scale: 1.02 }}
          transition={{ ease: "linear", duration: 0.4 }}
          className="relative z-10 w-full flex justify-center "
        >
          <LightBlob
            from={"from-cyan-400"}
            via={"via-blue-500"}
            to={"to-emerald-400"}
            dark_from={"dark:from-cyan-700"}
            dark_via={"dark:via-blue-600"}
            dark_to={"dark:to-emerald-700  "}
            top={"-top-10"}
          />
          {/* --- 2. THE WINDOW CONTAINER (The "Mac" Shell) --- */}
          <div
            className="relative w-full lg:w-[90%] max-w-5xl rounded-sm overflow-hidden
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
            <div className="relative group shadow-2xl">
              {/* The actual image */}
              <img
                src="/cron-with-ss.png" // replace with your actual UI screenshot
                alt="Agent workspace interface"
                className="w-full h-auto  block object-fill"
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

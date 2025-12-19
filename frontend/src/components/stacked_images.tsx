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
    <div className="relative min-h-screen w-full overflow-hidden bg-white text-black dark:bg-black dark:text-white flex items-center justify-center p-4">
      {/* ================= MAIN CONTENT ================= */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 flex flex-col items-center gap-16">
        {/* ---------- TEXT ---------- */}
        <section className="text-center flex flex-col items-center gap-2 max-1/2">
          <h1 className="bai-jamjuree-semibold text-5xl lg:text-6xl leading-tight px-4">
            <span className="flex items-center justify-center gap-2">
              The
              <AnimatePresence mode="wait">
                <motion.span
                  key={value}
                  className="text-transparent bg-clip-text bg-gradient-to-tr from-blue-600 to-sky-600 "
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {value}
                </motion.span>
              </AnimatePresence>
            </span>
            knowledge agent-customized for you
          </h1>

          <h2 className="space-grotesk text-sm text-gray-800 dark:text-gray-300 max-w-xl">
            An agentic knowledge environment built on people verification.
            Analyze private data, perform live research, and collaborate through
            shared agent workspaces.
          </h2>

          {/* CTA */}
          <div className="flex items-center justify-between  w-130 max-w-full z-[99] bg-white rounded-sm p-2 dark:bg-black mt-7">
            <input
              ref={InputRef}
              className="space-grotesk py-1 w-4/5 px-2 border rounded-md text-black dark:text-white border-none outline-none focus:ring-0"
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
              className="px-2 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black
              space-grotesk flex items-center gap-2"
            >
              Find
              <BsLightningChargeFill />
            </Link>
          </div>
        </section>

        {/* ---------- FLOATING PRODUCT CARD ---------- */}
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          whileHover={{ y: -6, scale: 1.05 }}
          className="relative z-10"
        >
          <div
            className="pointer-events-none absolute  left-50 -top-10 h-1/2 w-[60%] rounded-full
        bg-gradient-to-br dark:from-sky-600 dark:via-blue-600 dark:to-purple-600
        blur-[160px] z-[-5] from-blue-700 to-sky-700 "
          />{" "}
          <div className="rounded-2xl shadow-2xl ring-1 ring-black/10 dark:ring-white/10 bg-white dark:bg-neutral-900 relative">
            <div className="absolute -top-7 left-0 right-0 h-8 bg-gray-50 dark:bg-black flex items-center px-4 gap-2 z-20 backdrop-blur-md rounded-tl-md rounded-tr-md w-full">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <img
              src="/2.png" // replace with your actual UI screenshot
              alt="Agent workspace interface"
              className="rounded-2xl w-full max-w-5xl"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;

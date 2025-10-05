import { Link } from "react-router";

import { FiZap } from "react-icons/fi";
import { FaGitAlt } from "react-icons/fa";
import { MdOutlineHourglassEmpty } from "react-icons/md";
import { motion } from "framer-motion";
import { FiUploadCloud } from "react-icons/fi";
import { useAppSelector } from "../store/hooks.tsx";

const Why = () => {
  const isDarkMode = useAppSelector((state) => state.auth.isDarkMode);

  function HandleCardTiltEffect(e: any) {
    const rect = e.currentTarget.getBoundingClientRect();
    // current position of the mouse
    const x = e.clientX - rect.left; // X position within the element
    const y = e.clientY - rect.top; // Y position within the element

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 3; // Max 3 degrees rotation
    const rotateX = ((centerY - y) / centerY) * 3; // Max 3 degrees rotation

    e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }
  return (
    <>
      <motion.div
        className={`relative min-h-screen py-16 px-4 sm:px-6 z-[1] overflow-hidden bg-white text-black dark:bg-black dark:text-white`}
      >
        {/* Enhanced gradient background */}
        {!isDarkMode && (
          <div className="z-[-2] absolute inset-0 bg-gradient-to-br from-sky-600/20 via-purple-600/15 to-red-400/20 blur-3xl"></div>
        )}

        {/* Animated gradient dots */}
        <div className="z-[-1] absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-600/10 blur-3xl animate-float"></div>
          <div className="absolute top-3/4 left-3/4 w-40 h-40 rounded-full bg-blue-600/10 blur-3xl animate-float-delay"></div>
        </div>

        {/* Section header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl bai-jamjuree-semibold py-4 relative">
            Why
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-sky-600 font-bold">
              {" "}
              EUREKA{" "}
            </span>
            ?
          </h1>
          <p className="text-center text-xs md:text-sm space-grotesk text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Reason for existence of such a tool, even though there are multiple
            AI knowledge based tools already in the market!
          </p>
        </div>

        {/* Modern feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto px-4">
          {/* Card 1: Purpose */}
          <motion.div
            onMouseOver={(e) => {
              HandleCardTiltEffect(e);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{}}
            className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-black backdrop-blur-xl border border-gray-400 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02]"
          >
            {/* Gradient border effect on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-shadow duration-500">
                <FiZap className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex-1">
                <h2 className="bai-jamjuree-semibold text-xl mb-3 flex items-center gap-2">
                  Purpose
                  <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full">
                    Authenticity
                  </span>
                </h2>
                <p className="space-grotesk text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Creating a means for authentic information sharing and
                  gathering platform in the age of AI and misinformation for
                  studies, research, curiosity and any other purpose.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Problem Solved */}
          <motion.div
            onMouseOver={(e) => {
              HandleCardTiltEffect(e);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-black backdrop-blur-xl border border-gray-400 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02]"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg group-hover:shadow-orange-500/25 transition-shadow duration-500">
                <FaGitAlt className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex-1">
                <h2 className="bai-jamjuree-semibold text-xl mb-3 flex items-center gap-2">
                  Problem we solve?
                  <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 rounded-full">
                    Misinformation
                  </span>
                </h2>
                <p className="space-grotesk text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Traditional knowledge sources are siloed and filled with false
                  information which makes learning 10x slower, and LLMs suffer
                  from hallucinations.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 3: How Eureka is different */}
          <motion.div
            onMouseOver={(e) => {
              HandleCardTiltEffect(e);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-black backdrop-blur-xl border border-gray-400 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02]"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg group-hover:shadow-amber-500/25 transition-shadow duration-500">
                <MdOutlineHourglassEmpty className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex-1">
                <h2 className="bai-jamjuree-semibold text-xl mb-3 flex items-center gap-2">
                  How Eureka is different?
                  <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 rounded-full">
                    Differentiator
                  </span>
                </h2>
                <p className="space-grotesk text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Eureka uses public contributions as knowledge base and trusts
                  YOU to verify information through voting, reducing false
                  information by up to 89% with community-verified AI responses.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 4: How to use it */}
          <motion.div
            onMouseOver={(e) => {
              HandleCardTiltEffect(e);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-black backdrop-blur-xl border border-gray-400 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02]"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-shadow duration-500">
                <FiUploadCloud className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex-1">
                <h2 className="bai-jamjuree-semibold text-xl mb-3 flex items-center gap-2">
                  How to use it!
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-full">
                    Know-how
                  </span>
                </h2>
                <p className="space-grotesk text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  1. Choose category → 2. Select subdomain → 3. Ask question →
                  4. Get AI response from community knowledge → 5. Missing info?{" "}
                  <Link
                    to="/Interface"
                    className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-sky-600 underline hover:from-purple-700 hover:to-sky-700 transition-colors"
                  >
                    Upload a file
                  </Link>{" "}
                  to teach Eureka and build an authentic knowledge hub.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default Why;

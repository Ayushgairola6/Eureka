import { FiBookOpen, FiPlay } from "react-icons/fi";
import { motion } from "framer-motion";
import { Link } from "react-router";

const Tutorial = () => {
  return (
    <>
      <div className="relative w-full py-12 md:py-24 px-4 sm:px-8 flex items-center justify-center flex-col md:flex-row gap-8 md:gap-16 lg:gap-24 overflow-hidden">
        {/* Enhanced gradient background */}
        <div className="absolute inset-0 -z-[1] bg-gradient-to-br from-emerald-600/20 via-blue-600/15 to-sky-600/20 dark:from-black dark:to-black blur-3xl" />

        {/* Animated gradient dots */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-[1]">
          <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full bg-blue-600/10 blur-3xl animate-float"></div>
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-emerald-600/10 blur-3xl animate-float-delay"></div>
        </div>

        {/* Video container with enhanced floating effect */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative w-72 sm:w-80 md:w-96 aspect-video rounded-2xl overflow-hidden shadow-2xl group"
        >
          {/* Glass morphism border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border-2 border-white/50 dark:border-gray-700/50 backdrop-blur-sm"></div>

          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/10 dark:bg-black/30 flex items-center justify-center cursor-pointer transition-all duration-500 group-hover:bg-black/5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center transform-gpu transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-blue-500/50">
              <FiPlay className="text-white text-2xl md:text-3xl ml-1 transition-transform duration-300 group-hover:scale-110" />
            </div>
          </div>

          {/* Thumbnail image */}
          <img
            src="user2.jpg"
            alt="Eureka Tutorial Video"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </motion.div>

        {/* Enhanced text content */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center md:text-left max-w-md lg:max-w-lg"
        >
          <div className="mb-4 md:mb-6">
            {/* Enhanced badge */}
            <span className="inline-block px-4 py-2 text-xs md:text-sm rounded-full bg-gradient-to-r from-blue-100 to-emerald-100 dark:from-blue-900/40 dark:to-emerald-900/40 text-blue-600 dark:text-blue-300 mb-3 shadow-lg border border-white/50 dark:border-gray-700/50 backdrop-blur-sm">
              Getting Started
            </span>

            {/* Enhanced title with gradient */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bai-jamjuree-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 dark:from-blue-400 dark:via-purple-400 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
              Eureka Tutorial
            </h1>

            {/* Enhanced subtitle */}
            <h2 className="text-xl md:text-3xl bai-jamjuree-semibold font-semibold text-gray-800 dark:text-gray-200 mt-1 md:mt-2">
              Beginner's Guide
            </h2>
          </div>

          {/* Enhanced description */}
          <p className="text-gray-600 dark:text-gray-300 space-grotesk text-sm md:text-base mb-8 leading-relaxed bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/50 dark:border-gray-700/50">
            Watch our 5-minute tutorial to master Eureka's powerful features.
            Learn how to upload documents, query knowledge, and contribute to
            the community.
          </p>

          {/* Enhanced buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button className="px-8 py-3.5 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-medium shadow-lg hover:shadow-blue-500/40 hover:shadow-xl transition-all duration-500 inline-flex items-center gap-3 text-sm sm:text-base group hover:scale-105">
              <FiPlay className="text-lg transition-transform duration-300 group-hover:scale-110" />
              Watch Tutorial
            </button>
            <Link
              to="/Api/introduction"
              className="px-8 py-3.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl font-medium hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-500 inline-flex items-center gap-3 text-sm sm:text-base group hover:scale-105 backdrop-blur-sm"
            >
              <FiBookOpen className="text-lg transition-transform duration-300 group-hover:scale-110" />
              Read Docs
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Tutorial;

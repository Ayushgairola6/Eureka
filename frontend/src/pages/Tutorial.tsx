import { FiBookOpen, FiPlay } from "react-icons/fi";
import { motion } from 'framer-motion';
import { Link } from "react-router";

const Tutorial = () => {
    return (<>
        <div className="relative w-full py-12 md:py-24 px-4 sm:px-8 flex items-center justify-center flex-col md:flex-row gap-8 md:gap-16 lg:gap-24 overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 -z-[1] bg-gradient-to-br from-emerald-600/20 to-sky-600/20 dark:from-black dark:to-black blur-3xl" />

            {/* Video container with floating effect */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative w-72 sm:w-80 md:w-96 aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-purple-500/30 dark:border-purple-400/30"
            >
                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center cursor-pointer group transition-all duration-300 hover:bg-black/10">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-purple-600/90 dark:bg-purple-500/90 flex items-center justify-center transform-gpu transition-transform duration-300 group-hover:scale-110">
                        <FiPlay className="text-white text-2xl md:text-3xl ml-1" />
                    </div>
                </div>

                {/* Thumbnail image */}
                <img
                    src="user2.jpg"
                    alt="Eureka Tutorial Video"
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </motion.div>

            {/* Text content */}
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center md:text-left max-w-md lg:max-w-lg"
            >
                <div className="mb-2 md:mb-4">
                    <span className="inline-block px-3 py-1 text-xs md:text-sm rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 mb-2">
                        Getting Started
                    </span>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bai-jamjuree-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                        Eureka Tutorial
                    </h1>
                    <h2 className="text-xl md:text-3xl bai-jamjuree-semibold font-semibold text-gray-800 dark:text-gray-200 mt-1 md:mt-2">
                        Beginner's Guide
                    </h2>
                </div>

                <p className="text-gray-600 dark:text-gray-300 space-grotesk text-sm md:text-base mb-6">
                    Watch our 5-minute tutorial to master Eureka's powerful features. Learn how to upload documents, query knowledge, and contribute to the community.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                    <button className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl font-medium shadow-lg hover:shadow-purple-400/30 transition-all duration-300 inline-flex items-center gap-2 text-sm sm:text-base">
                        <FiPlay className="text-lg" />
                        Watch Tutorial
                    </button>
                    <Link to='/API/featured' className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 inline-flex items-center gap-2 text-sm sm:text-base">
                        <FiBookOpen className="text-lg" />
                        Read Docs
                    </Link>
                </div>
            </motion.div>
        </div>
    </>)
}

export default Tutorial;
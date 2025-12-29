import {
  FiArrowUpRight,
  FiUploadCloud,
  FiHelpCircle,
  FiMessageSquare,
  FiUsers,
} from "react-icons/fi";
import { motion } from "framer-motion"; // Assuming you're using Framer Motion
import { Link } from "react-router";

const About = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-gray-50 dark:bg-black z-[1] p-4 sm:p-8">
      {/* Abstract 3D Background */}
      <div className="h-full w-full absolute top-0 left-0 z-[-1] bg-gradient-to-br from-red-400/20 to-emerald-600/20 dark:from-black dark:to-black blur-3xl"></div>

      {/* Main Content Area */}
      <div className="max-w-4xl w-full bg-white/80 dark:bg-black backdrop-blur-sm rounded-2xl shadow-xl border border-gray-300 dark:border-gray-600 p-6 md:p-12 z-[1] my-10">
        <h1 className="space-grotesk text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Quick Start Guide to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-sky-600 dark:from-purple-400 dark:to-sky-400">
            AntiNode
          </span>
        </h1>

        <p className="bai-jamjuree-semibold text-sm md:text-lg text-center text-gray-600 dark:text-gray-300 mb-10">
          Get started with AntiNode in just a few simple steps and unlock a
          world of community-driven knowledge.
        </p>

        {/* Step-by-step Guide */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Step 1: Upload Your Notes/PDFs */}
          <motion.div
            whileHover={{
              y: -10,
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
            }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center py-6 px-4 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-600"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4"
            >
              <FiUploadCloud className="text-emerald-600 dark:text-emerald-400 text-5xl md:text-6xl" />
            </motion.div>
            <h3 className="space-grotesk text-xl font-semibold text-gray-800 dark:text-white mb-2">
              1. Upload Your Knowledge
            </h3>
            <p className="bai-jamjuree-light text-gray-600 dark:text-gray-300">
              Start by uploading your PDF documents or notes. AntiNode processes
              your data to make it searchable and queryable. Ensure your files
              are clear and text-based for best results.
            </p>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <p>Accepted formats: .pdf (more coming soon!)</p>
              <p>Max file size: 25MB (for now)</p>
            </div>
          </motion.div>

          {/* Step 2: Ask Your Questions */}
          <motion.div
            whileHover={{
              y: -10,
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
            }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center py-6 px-4 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-600"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-4"
            >
              <FiMessageSquare className="text-purple-600 dark:text-purple-400 text-5xl md:text-6xl" />
            </motion.div>
            <h3 className="space-grotesk text-xl font-semibold text-gray-800 dark:text-white mb-2">
              2. Ask Anything, Instantly
            </h3>
            <p className="bai-jamjuree-light text-gray-600 dark:text-gray-300">
              Once uploaded, simply type your questions related to the
              document's content. AntiNode's agent will provide accurate,
              context-aware answers pulled directly from your data.
            </p>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <p>
                Try: "Summarize this topic," or "What are the key points about
                X?"
              </p>
            </div>
          </motion.div>

          {/* Step 3: Explore Community Knowledge */}
          <motion.div
            whileHover={{
              y: -10,
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
            }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center py-6 px-4 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-600"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mb-4"
            >
              <FiUsers className="text-blue-600 dark:text-blue-400 text-5xl md:text-6xl" />
            </motion.div>
            <h3 className="space-grotesk text-xl font-semibold text-gray-800 dark:text-white mb-2">
              3. Leverage Shared Insights
            </h3>
            <p className="bai-jamjuree-light text-gray-600 dark:text-gray-300">
              Beyond your own uploads, tap into the community's verified
              knowledge base. Ask questions on topics already contributed by
              others, extending your learning beyond personal notes.
            </p>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <p>Discover public knowledge bases on various subjects.</p>
            </div>
          </motion.div>

          {/* Step 4: Get Precise Answers & Share */}
          <motion.div
            whileHover={{
              y: -10,
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
            }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center py-6 px-4 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-600"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mb-4"
            >
              <FiHelpCircle className="text-orange-600 dark:text-orange-400 text-5xl md:text-6xl" />
            </motion.div>
            <h3 className="space-grotesk text-xl font-semibold text-gray-800 dark:text-white mb-2">
              4. Receive & Share Accurate Data
            </h3>
            <p className="bai-jamjuree-light text-gray-600 dark:text-gray-300">
              Get precise answers and context-driven insights. What's more,
              contribute your own verified notes to help the global community
              and make information sharing seamless.
            </p>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <p>Help us grow the collective intelligence!</p>
            </div>
          </motion.div>
        </div>

        {/* Call to Action Button */}
        <div className="flex justify-center mt-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              to="/Interface"
              className="px-6 py-3 rounded-xl bg-indigo-500 text-white space-grotesk flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Dive into AntiNode <FiArrowUpRight className="text-xl" />
            </Link>
          </motion.div>
        </div>

        {/* Optional: More Resources */}
        <div className="mt-16 text-center text-gray-700 dark:text-gray-300">
          <h3 className="space-grotesk text-2xl font-bold mb-4">
            Need More Help?
          </h3>
          <p className="bai-jamjuree-light text-md mb-4">
            Explore our comprehensive{" "}
            <Link
              to="/"
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              User Manual
            </Link>
            , browse{" "}
            <Link
              to="/"
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              FAQs
            </Link>
            , or join our{" "}
            <Link
              to="/"
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              Community Forum
            </Link>{" "}
            for direct support and discussions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
// why is light the fastest thing in the universe ? can something potentially be faster than it , that we have not discovered yet , As the universe itself is made of dark matter which is expanding faster than the speed of light!

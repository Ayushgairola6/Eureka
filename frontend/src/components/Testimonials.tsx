import { motion } from "framer-motion";
import { useRef } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { MdPrivateConnectivity } from "react-icons/md";
import { useAppSelector } from "../store/hooks.tsx";

const TestiMonials = () => {
  const isDarkMode = useAppSelector((state) => state.auth.isDarkMode);
  const ContainerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        className={`z-[1] relative mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-white text-black dark:bg-black dark:text-white`}
      >
        {!isDarkMode && (
          <div className="z-[-1] absolute top-0 left-0 h-full w-full bg-gradient-to-br from-orange-500/20 to-yellow-500/10 blur-3xl"></div>
        )}

        {/* Section Heading */}
        <div className="text-center mb-12">
          <h1 className="bai-jamjuree-semibold text-3xl md:text-4xl mb-4">
            Hear From Our Users
          </h1>
          <p className="space-grotesk text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-xs md:text-sm">
            Discover how Eureka is transforming research and knowledge sharing
            across industries.
          </p>
        </div>

        {/* Enhanced Horizontal Scrollable Testimonials */}
        <div className="relative max-w-7xl mx-auto">
          {/* Navigation Arrows */}
          <div
            className={`absolute -top-16 right-4 flex gap-2 ${
              isDarkMode ? "bg-black/50" : "bg-white/50"
            } backdrop-blur-sm rounded-full p-1 border border-gray-300 dark:border-gray-700`}
          >
            <button
              onClick={() => {
                if (ContainerRef.current) {
                  ContainerRef.current.scrollBy({
                    left: -336,
                    behavior: "smooth",
                  });
                }
              }}
              className={`p-3 rounded-full transition-all duration-300 ${
                isDarkMode
                  ? "hover:bg-gray-800 text-gray-300 hover:text-white"
                  : "hover:bg-gray-100 text-gray-600 hover:text-black"
              }`}
            >
              <FaArrowLeft />
            </button>
            <button
              onClick={() => {
                if (ContainerRef.current) {
                  ContainerRef.current.scrollBy({
                    left: 336,
                    behavior: "smooth",
                  });
                }
              }}
              className={`p-3 rounded-full transition-all duration-300 ${
                isDarkMode
                  ? "hover:bg-gray-800 text-gray-300 hover:text-white"
                  : "hover:bg-gray-100 text-gray-600 hover:text-black"
              }`}
            >
              <FaArrowRight />
            </button>
          </div>

          {/* Scrollable Container */}
          <div
            ref={ContainerRef}
            className="flex overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory"
          >
            <div className="flex flex-nowrap gap-6 py-2 px-4">
              {/* Card 1 - Enhanced */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "50px" }}
                transition={{ type: "tween", duration: 0.3 }}
                className={`flex-shrink-0 w-80 snap-start bg-gradient-to-br  from-gray-100 to-gray-50 border-gray-700
                     dark:from-white/10 dark:to-black border-gray-300
                 rounded-2xl border backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-500 hover:scale-[1.02] group`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-shadow duration-500">
                    <svg
                      className="w-6 h-6 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                  </div>
                  <h3 className="bai-jamjuree-semibold text-lg">
                    Great for quick overview!
                  </h3>
                </div>
                <p
                  className={`space-grotesk ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-6 leading-relaxed`}
                >
                  "I use Eureka's private document feature to upload my personal
                  legal precedents and get quick overview whenever I want. I
                  really like this feature."
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-600/30 dark:border-gray-400/30">
                  <img
                    className="w-12 h-12 rounded-full border-2 border-blue-500/20"
                    src="/user2.jpg"
                    alt="Sarah K."
                  />
                  <div>
                    <p className="bai-jamjuree-medium text-sm">Sarah K.</p>
                    <p className="space-grotesk text-xs text-gray-500">
                      Law Researcher, NY
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 2 - Enhanced */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "50px" }}
                transition={{ type: "tween", duration: 0.3 }}
                className={`flex-shrink-0 w-80 snap-start bg-gradient-to-br  from-gray-100 to-gray-50 border-gray-700
                     dark:from-white/10 dark:to-black border-gray-300
                 rounded-2xl border backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-500 hover:scale-[1.02] group`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-shadow duration-500">
                    <svg
                      className="w-6 h-6 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="bai-jamjuree-semibold text-lg">
                    Studies made simple
                  </h3>
                </div>
                <p
                  className={`space-grotesk ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-6 leading-relaxed`}
                >
                  "I use Eureka for quick information gathering for my
                  assignments, projects and even questions that come to my mind
                  out of curiosity, as the information is community verified."
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-600/30 dark:border-gray-400/30">
                  <img
                    className="w-12 h-12 rounded-full border-2 border-green-500/20"
                    src="/user4.jpg"
                    alt="Michael T."
                  />
                  <div>
                    <p className="bai-jamjuree-medium text-sm">Michael T.</p>
                    <p className="space-grotesk text-xs text-gray-500">
                      University Student, SF
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 3 - Enhanced */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "50px" }}
                transition={{ type: "tween", duration: 0.3 }}
                className={`flex-shrink-0 w-80 snap-start bg-gradient-to-br  from-gray-100 to-gray-50 border-gray-700
                     dark:from-white/10 dark:to-black border-gray-300
                 rounded-2xl border backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-500 hover:scale-[1.02] group`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-shadow duration-500">
                    <svg
                      className="w-6 h-6 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                      />
                    </svg>
                  </div>
                  <h3 className="bai-jamjuree-semibold text-lg">
                    AI Learning Supercharged
                  </h3>
                </div>
                <p
                  className={`space-grotesk ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-6 leading-relaxed`}
                >
                  "I upload my ML notes and get back textbook-quality
                  explanations with code examples. It's like having a friend to
                  make notes for me to study."
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-600/30 dark:border-gray-400/30">
                  <img
                    className="w-12 h-12 rounded-full border-2 border-purple-500/20"
                    src="/user.jpg"
                    alt="Priya M."
                  />
                  <div>
                    <p className="bai-jamjuree-medium text-sm">Priya M.</p>
                    <p className="space-grotesk text-xs text-gray-500">
                      AI/ML Student
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 4 - Enhanced */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "50px" }}
                transition={{ type: "tween", duration: 0.3 }}
                className={`flex-shrink-0 w-80 snap-start bg-gradient-to-br  from-gray-100 to-gray-50 border-gray-700
                     dark:from-white/10 dark:to-black border-gray-300
                 rounded-2xl border backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-500 hover:scale-[1.02] group`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-red-500/25 transition-shadow duration-500">
                    <svg
                      className="w-6 h-6 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                      />
                    </svg>
                  </div>
                  <h3 className="bai-jamjuree-semibold text-lg">
                    Research Breakthrough
                  </h3>
                </div>
                <p
                  className={`space-grotesk ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-6 leading-relaxed`}
                >
                  "I love looking for random facts online but I was tired of
                  fake information. Since I found Eureka, my curiosity lives in
                  the pits of categories and subcategories."
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-600/30 dark:border-gray-400/30">
                  <img
                    className="w-12 h-12 rounded-full border-2 border-red-500/20"
                    src="/user5.jpg"
                    alt="James L."
                  />
                  <div>
                    <p className="bai-jamjuree-medium text-sm">James L.</p>
                    <p className="space-grotesk text-xs text-gray-500">
                      Just a curious person
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 5 - Enhanced */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "50px" }}
                transition={{ type: "tween", duration: 0.3 }}
                className={`flex-shrink-0 w-80 snap-start bg-gradient-to-br  from-gray-100 to-gray-50 border-gray-700
                     dark:from-white/10 dark:to-black border-gray-300
                 rounded-2xl border backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-500 hover:scale-[1.02] group`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/25 transition-shadow duration-500">
                    <MdPrivateConnectivity size={24} className="text-white" />
                  </div>
                  <h3 className="bai-jamjuree-semibold text-lg">
                    Privacy of Documents
                  </h3>
                </div>
                <p
                  className={`space-grotesk ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-6 leading-relaxed`}
                >
                  "With Eureka's private mode, I can securely upload sensitive
                  research without worrying about leaks. It gives me peace of
                  mind knowing my work stays confidential."
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-600/30 dark:border-gray-400/30">
                  <img
                    className="w-12 h-12 rounded-full border-2 border-indigo-500/20"
                    src="/user3.jpg"
                    alt="Dr. Stephanie Ruth"
                  />
                  <div>
                    <p className="bai-jamjuree-medium text-sm">
                      Dr. Stephanie Ruth
                    </p>
                    <p className="space-grotesk text-xs text-gray-500">
                      Open Source Contributor
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestiMonials;

import { motion } from "framer-motion";
import { useRef } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { MdPrivateConnectivity, MdAutoAwesome } from "react-icons/md";
import { HiOutlineCheckCircle } from "react-icons/hi";
import { useAppSelector } from "../store/hooks.tsx";
import { LuBrainCircuit } from "react-icons/lu";

const testimonialCards = [
  {
    id: 1,
    title: "The Ultimate Legal Vault",
    description:
      "I upload 500-page case files to my private vault. AntiNode doesn't just search; it maps the logic across the entire document. It's the only tool I trust with sensitive precedents.",
    icon: <MdPrivateConnectivity />, // Focus on Privacy/RAG
    gradientFrom: "from-cyan-500",
    gradientTo: "to-blue-600",
    userImage: "/user2.jpg",
    userName: "Sarah K.",
    userRole: "Law Researcher, NY",
  },
  {
    id: 2,
    title: "Hallucination-Free Research",
    description:
      "Standard AI used to 'invent' facts for my thesis. With AntiNode's community-verified knowledge base, I get sources I can actually cite in my academic papers.",
    icon: <HiOutlineCheckCircle />, // Focus on Verification
    gradientFrom: "from-emerald-500",
    gradientTo: "to-teal-600",
    userImage: "/user4.jpg",
    userName: "Michael T.",
    userRole: "University Student, SF",
  },
  {
    id: 3,
    title: "Complex Logic, Simplified",
    description:
      "I used the Neuro-Symbolic mode to audit a complex medical report. It caught a mathematical inconsistency that every other LLM missed. It actually 'reasons'.",
    icon: <LuBrainCircuit />, // Focus on Neuro-Symbolic Logic
    gradientFrom: "from-indigo-500",
    gradientTo: "to-purple-600",
    userImage: "/user.jpg",
    userName: "Dr. Aris V.",
    userRole: "Medical Consultant",
  },
  {
    id: 4,
    title: "Synthesis is a Game Changer",
    description:
      "I uploaded three different books on Economics. Synthesis mode connected the theories across all three perfectly. It saved me weeks of cross-referencing notes.",
    icon: <MdAutoAwesome />, // Focus on Synthesis
    gradientFrom: "from-blue-500",
    gradientTo: "to-cyan-400",
    userImage: "/user5.jpg",
    userName: "James L.",
    userRole: "Economics Researcher",
  },
];
const TestiMonials = () => {
  const isDarkMode = useAppSelector((state) => state.auth.isDarkMode);
  const ContainerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        className={`z-[1] relative mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-white text-black dark:bg-black dark:text-white`}
      >
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h1 className="bai-jamjuree-semibold text-3xl md:text-4xl mb-4">
            Hear From Our Users
          </h1>
          <p className="space-grotesk text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-xs md:text-sm">
            Discover how AntiNode is transforming research and knowledge sharing
            across industries.
          </p>
        </div>

        {/* Enhanced Horizontal Scrollable Testimonials */}
        <div className="relative max-w-7xl mx-auto pl-3">
          {/* Navigation Arrows */}
          <div
            className={`absolute -top-11 right-4 flex gap-2 ${
              isDarkMode ? "bg-black/50" : "bg-white/50"
            } backdrop-blur-sm rounded-full p-1 border  dark:border-gray-700`}
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
              className={`p-2 rounded-full transition-all duration-300 ${
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
              className={`p-2 rounded-full transition-all duration-300 ${
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
              {testimonialCards.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "50px" }}
                  transition={{ type: "tween", duration: 0.3 }}
                  className={`shadow-2xl flex-shrink-0 w-80 snap-start bg-gradient-to-br  from-gray-100 to-gray-50 
                       dark:from-neutral-950 dark:to-black 
                   rounded-2xl  backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-500 hover:scale-[1.02] group overflow-hidden border`}
                >
                  <div
                    className={`absolute top-0 left-0 h-full w-full rotate-60 bg-gradient-to-tr ${card.gradientFrom} ${card.gradientTo} z-[-10] opacity-15 blur-[100px] `}
                  />
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-8 h-8 bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} rounded-xl flex items-center justify-center shadow-lg transition-shadow duration-500 text-white`}
                    >
                      {card.icon}
                    </div>
                    <h3 className="bai-jamjuree-semibold text-md md:text-lg ">
                      {card.title}
                    </h3>
                  </div>
                  <p
                    className={`space-grotesk text-sm md:text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    } mb-6 leading-relaxed`}
                  >
                    "{card.description}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-600/30 dark:border-gray-400/30">
                    {/* <img
                      className={`w-12 h-12 rounded-full border-2 border-${
                        card.gradientFrom.split("-")[1]
                      }-500/20`}
                      src={card.userImage}
                      alt={card.userName}
                    /> */}
                    <ul
                      className={`w-7 h-7 rounded-full border-2 border-${
                        card.gradientFrom.split("-")[1]
                      }-500/20 flex items-center justify-center bg-sky-600 space-grotesk`}
                    >
                      {card.userName.trim().split("")[0]}
                    </ul>
                    <div>
                      <p className="bai-jamjuree-medium text-sm">
                        {card.userName}
                      </p>
                      <p className="space-grotesk text-xs text-gray-500">
                        {card.userRole}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestiMonials;

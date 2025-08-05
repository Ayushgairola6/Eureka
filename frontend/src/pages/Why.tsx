import { Link } from "react-router";

import { FiZap } from "react-icons/fi";
import { FaGitAlt } from "react-icons/fa";
import { MdOutlineHourglassEmpty } from "react-icons/md";
import { motion } from 'framer-motion'
import { FiUploadCloud } from "react-icons/fi";
import { useStore } from '../store/zustandHandler';

const Why = () => {

    const { isDarkMode } = useStore();

    return (<>
        <motion.div className={`relative min-h-screen py-16 px-4 sm:px-6 z-[1] overflow-hidden  bg-white text-black dark:bg-black dark:text-white`}>
            {/* Enhanced gradient background */}
            {!isDarkMode && <div className="z-[-2] absolute inset-0 bg-gradient-to-br from-sky-600/20 to-red-400/20 blur-3xl"></div>}

            {/* Animated gradient dots (subtle tech vibe) */}
            <div className="z-[-1] absolute top-0 left-0 w-full h-full overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-600/10 blur-3xl animate-float"></div>
                <div className="absolute top-3/4 left-3/4 w-40 h-40 rounded-full bg-blue-600/10 blur-3xl animate-float-delay"></div>
            </div>

            {/* Section header with animated underline */}
            <div className="max-w-4xl mx-auto text-center  mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl bai-jamjuree-semibold py-4 relative">
                    Why<span className="bg-clip-text text-transparent bg-gradient-to-r  from-purple-600 to-sky-600 font-bold"> EUREKA </span>?
                    <div></div>
                </h1>


                <p className="text-center  text-xs md:text-sm space-grotesk ">Reason for existence of such a tool , even though there are multiple ai knowledge based tools already in the market!</p>

            </div>


            {/* Feature cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto cursor-pointer transition-all duration-500 px-2 ">
                {/* Card 1: Purpose */}
                <motion.div initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }} transition={{ duration: 0.5 }} className={`"group relative py-8 px-6 ${isDarkMode ? "bg-gradient-to-br from-black to-white/20 text-gray-200" : "bg-white/90 text-black"} backdrop-blur-sm rounded-xl border border-gray-400 "`}>
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-purple-500/30 transition-all duration-500 pointer-events-none"></div>
                    <div className=" flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-gray-200 group-hover:bg-blue-100 transition-colors duration-300">
                            <FiZap color="blue" className="w-5 h-5   group-hover:rotate-360 transition-all duration-500" />
                        </div>


                        <div>
                            <h2 className="bai-jamjuree-semibold text-lg mb-3 ">Purpose <span className="text-xs">(Authenticity)</span></h2>

                            <p className="space-grotesk  text-sm">
                                Creating a means for authentic information sharing and gathering platform in the age of AI and misinformation for studies , research , curiosity and any other purpose .
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Card 2: Open Source */}
                <motion.div initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }} transition={{ duration: 0.5 }} className={`"group relative py-8 px-6 ${isDarkMode ? "bg-gradient-to-br from-black to-white/20 text-gray-200" : "bg-white/90 text-black"} backdrop-blur-sm rounded-xl border border-gray-400 "`}>
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-500/30 transition-all duration-500 pointer-events-none"></div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-gray-200 group-hover:bg-blue-100 transition-colors duration-300">
                            <FaGitAlt color="orange" className="w-6 h-6   group-hover:rotate-360 transition-all duration-500" />
                        </div>
                        <div>
                            <h2 className="bai-jamjuree-semibold text-lg mb-3 ">Problem we solve? <span className="text-xs">(Misinformation)</span></h2>
                            <p className="space-grotesk  text-sm">
                                Traditional knowledge sources are siloed and filled with all types of false information which makes the process of learning something 10x slower and new means like llm's suffer from hallucinations.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Card 3: Problem Solved */}
                <motion.div initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }} transition={{ duration: 0.5 }} className={`"group relative py-8 px-6 ${isDarkMode ? "bg-gradient-to-br from-black to-white/20 text-gray-200" : "bg-white/90 text-black"} backdrop-blur-sm rounded-xl border border-gray-400 "`}>
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-amber-500/30 transition-all duration-500 pointer-events-none"></div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-gray-200 group-hover:bg-amber-100 transition-colors duration-300">
                            <MdOutlineHourglassEmpty color="red" className="w-6 h-6   group-hover:rotate-360 transition-all duration-500" />
                        </div>
                        <div>
                            <h2 className="bai-jamjuree-semibold text-lg mb-3 ">How Eureka is different ? <span className="text-xs">(Differentiator)</span></h2>
                            <p className="space-grotesk  text-sm">
                                Eureka uses public contributions as knowledgebase for domain and subdomain specific knowledge and trusts YOU to verify that information by engaging with the voting system whenver asking any question from our AI making it a community verified information system , that not 100% but upto 89% reduces the chances of seeing any false information
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Card 4: How It Works */}
                <motion.div initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }} transition={{ duration: 0.5 }} className={`"group relative py-8 px-6 ${isDarkMode ? "bg-gradient-to-br from-black to-white/20 text-gray-200" : "bg-white/90 text-black"} backdrop-blur-sm rounded-xl border border-gray-400 "`}>
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-green-500/30 transition-all duration-500 pointer-events-none"></div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-gray-200 group-hover:bg-green-100 transition-colors duration-300">
                            <FiUploadCloud color="green" className="w-6 h-6   group-hover:rotate-360 transition-all duration-500" />
                        </div>
                        <div>
                            <h2 className="bai-jamjuree-semibold text-lg mb-3 ">How to use it ! <span className="text-xs">(Know-how)</span></h2>
                            <p className="space-grotesk  text-sm">
                                1. Choose a category 2.→Choose a subdomain → 3. Ask your question → 4.AI responds based on knowledge base contributed by the community → 5. Missing something?{' '}
                                <Link to="/Interface" className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-sky-600 underline">
                                    Upload a file
                                </Link>{' '}
                                to teach EUREKA and help in creating a strong and authentic knowledge hub.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>



    </>)
}

export default Why;
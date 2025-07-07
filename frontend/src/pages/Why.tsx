import { Link } from "react-router";

import { FiZap } from "react-icons/fi";
import { FaGitAlt } from "react-icons/fa";
import { MdOutlineHourglassEmpty } from "react-icons/md";
import { motion } from 'framer-motion'
import { FiUploadCloud } from "react-icons/fi";


const Why = () => {


    return (<>
        <div className="relative min-h-screen py-16 px-4 sm:px-6 z-[1] overflow-hidden">
            {/* Enhanced gradient background */}
            <div className="z-[-2] absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-blue-800/10 blur-3xl"></div>

            {/* Animated gradient dots (subtle tech vibe) */}
            <div className="z-[-1] absolute top-0 left-0 w-full h-full overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-600/10 blur-3xl animate-float"></div>
                <div className="absolute top-3/4 left-3/4 w-40 h-40 rounded-full bg-blue-600/10 blur-3xl animate-float-delay"></div>
            </div>

            {/* Section header with animated underline */}
            <div className="max-w-4xl mx-auto text-center mb-16 ">
                <h1 className="text-2xl sm:text-3xl md:text-4xl bai-jamjuree-regular py-4 relative">
                    HOW IT <span className="bg-clip-text text-transparent bg-gradient-to-r  from-purple-600 to-sky-600 font-bold">WORKS </span>?
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70"></div>
                </h1>


                <p className="text-center text-gray-700 text-xs md:text-sm ">Reason for existence of such a tool , even though there are multiple ai knowledge based tools already in the market!</p>

            </div>


            {/* Feature cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto cursor-pointer transition-all duration-500 px-2 ">
                    {/* Card 1: Purpose */}
                    <motion.div initial={{ opacity: 0 }} whileTap={{transform:"translateX(20px)",border:"1px solid purple"}}
                        whileInView={{ opacity: 1, scale: 1 }} whileHover={{ boxShadow: "2px 2px 2px purple", transform: "translateX(-10px)" }} transition={{ duration: 0.7 }} className="group relative py-8 px-2 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300  ">
                        <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-purple-500/30 transition-all duration-500 pointer-events-none"></div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-purple-100/80 group-hover:bg-purple-100 transition-colors duration-300">
                                <FiZap className="w-6 h-6   group-hover:rotate-360 transition-all duration-500" />
                            </div>
                            <div>
                                <h2 className="bai-jamjuree-semibold text-xl mb-3 text-purple-500">Purpose</h2>
                                <p className="space-grotesk text-gray-700">
                                    Break down knowledge barriers. Get instant, accurate answers across AI, Law, Finance, and more—without sifting through endless articles or paywalls.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Open Source */}
                    <motion.div initial={{ opacity: 0}} whileTap={{transform:"translateX(20px)",border:"1px solid blue"}}
                        whileInView={{ opacity: 1, scale: 1 }} whileHover={{ boxShadow: "2px 2px 2px purple", transform: "translateX(-10px)" }} transition={{ duration: 0.7 }} className="group relative py-8 px-2 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300 ">
                        <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-500/30 transition-all duration-500 pointer-events-none"></div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-blue-100/80 group-hover:bg-blue-100 transition-colors duration-300">
                                <FaGitAlt className="w-6 h-6   group-hover:rotate-360 transition-all duration-500" />
                            </div>
                            <div>
                                <h2 className="bai-jamjuree-semibold text-xl mb-3 text-blue-500">Why Open-Source?</h2>
                                <p className="space-grotesk text-gray-700">
                                    Traditional knowledge tools are siloed. Eureka evolves with community contributions—every upload makes the AI smarter for everyone.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: Problem Solved */}
                    <motion.div initial={{ opacity: 0 }} whileTap={{transform:"translateX(20px)",border:"1px solid yellow"}}
                        whileInView={{ opacity: 1, scale: 1 }} whileHover={{ boxShadow: "2px 2px 2px purple", transform: "translateX(-10px)" }} transition={{ duration: 0.7 }} className="group relative py-8 px-2 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300 ">
                        <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-amber-500/30 transition-all duration-500 pointer-events-none"></div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-amber-100/80 group-hover:bg-amber-100 transition-colors duration-300">
                                <MdOutlineHourglassEmpty className="w-6 h-6   group-hover:rotate-360 transition-all duration-500" />
                            </div>
                            <div>
                                <h2 className="bai-jamjuree-semibold text-xl mb-3 text-amber-500">The Problem We Solve</h2>
                                <p className="space-grotesk text-gray-700">
                                    87% of professionals waste time verifying outdated info. Eureka combines verified sources + community insights for reliable, up-to-date answers.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 4: How It Works */}
                    <motion.div initial={{ opacity: 0 }} whileTap={{transform:"translateX(20px)",border:"1px solid lime"}}
                        whileInView={{ opacity: 1, scale: 1 }} whileHover={{ boxShadow: "2px 2px 2px purple", transform: "translateX(-10px)" }} transition={{ duration: 0.7 }} className="group relative py-8 px-2 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300   ">
                        <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-green-500/30 transition-all duration-500 pointer-events-none"></div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-green-100/80 group-hover:bg-green-100 transition-colors duration-300">
                                <FiUploadCloud className="w-6 h-6   group-hover:rotate-360 transition-all duration-500" />
                            </div>
                            <div>
                                <h2 className="bai-jamjuree-semibold text-xl mb-3 text-green-500">How It Works</h2>
                                <p className="space-grotesk text-gray-700 ">
                                    1. Choose a category  → 2. Ask your doubts →3.AI responds based on knowledge base contributed by community → 4. Missing something?{' '}
                                    <Link to="/Interface" className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-sky-600 underline">
                                        Upload a file
                                    </Link>{' '}
                                    to teach Eureka.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>



    </>)
}

export default Why;
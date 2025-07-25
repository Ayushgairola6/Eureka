
import { FiArrowUpRight, FiUploadCloud, FiHelpCircle, FiMessageSquare, FiUsers } from 'react-icons/fi';
import { motion } from 'framer-motion'; // Assuming you're using Framer Motion
import { Link } from 'react-router';

const About = () => {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-gray-50 z-[1] p-4 sm:p-8">

            {/* Abstract 3D Background (Framer-like) - Replicated from Landing Page */}
            <div className='h-full w-full absolute top-0 left-0 z-[-1] bg-gradient-to-br from-red-400/20 to-emerald-600/20 blur-3xl'>
            </div>

            {/* Main Content Area */}
            <div className="max-w-4xl w-full bg-gray-50 bg-opacity-80 rounded-xl shadow-xl p-4 md:p-12 z-[1] my-10 ">

                <h1 className="space-grotesk text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">
                    Quick Start Guide to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-sky-600">EUREKA</span>
                </h1>

                <p className="bai-jamjuree-semibold text-sm  md:text-lg text-center text-gray-600 mb-12">
                    Get started with EUREKA in just a few simple steps and unlock a world of community-driven knowledge.
                </p>

                {/* Step-by-step Guide */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

                    {/* Step 1: Upload Your Notes/PDFs */}
                    <motion.div whileHover={{transform:"translateY(-30px)",boxShadow:"2px 2px 2px black"}} transition={{duration:0.7}} className="flex flex-col items-center text-center   py-8 px-2 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300 bg-gradient-to-br from-gray-50 to-green-500/10">
                        <motion.div // Using motion.div to apply animation to the icon container
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="mb-4 animate-float"
                        >
                            <FiUploadCloud className="text-emerald-600 text-6xl md:text-7xl" /> {/* Adjusted size and color */}
                        </motion.div>
                        <h3 className="space-grotesk text-xl font-semibold text-gray-800 mb-2">1. Upload Your Knowledge</h3>
                        <p className="bai-jamjuree-light text-gray-600">
                            Start by uploading your PDF documents or notes. EUREKA processes your data to make it searchable and queryable. Ensure your files are clear and text-based for best results.
                        </p>
                        <div className="mt-4 text-xs text-gray-500">
                            <p>Accepted formats: .pdf (more coming soon!)</p>
                            <p>Max file size: 25MB (for now)</p>
                        </div>
                    </motion.div>

                    {/* Step 2: Ask Your Questions */}
                    <motion.div whileHover={{transform:"translateY(-30px)",boxShadow:"2px 2px 2px black"}} transition={{duration:0.7}} className="flex flex-col items-center text-center  shadow-sm py-8 px-2 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300 bg-gradient-to-br from-gray-50 to-purple-500/10">
                        <motion.div // Using motion.div to apply animation to the icon container
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="mb-4 animate-float-delay"
                        >
                            <FiMessageSquare className="text-purple-600 text-6xl md:text-7xl" /> {/* Adjusted size and color */}
                        </motion.div>
                        <h3 className="space-grotesk text-xl font-semibold text-gray-800 mb-2">2. Ask Anything, Instantly</h3>
                        <p className="bai-jamjuree-light text-gray-600">
                            Once uploaded, simply type your questions related to the document's content. EUREKA's agent will provide accurate, context-aware answers pulled directly from your data.
                        </p>
                        <div className="mt-4 text-xs text-gray-500">
                            <p>Try: "Summarize this topic," or "What are the key points about X?"</p>
                        </div>
                    </motion.div>

                    {/* Step 3: Explore Community Knowledge (or your own private data) */}
                    <motion.div whileHover={{transform:"translateY(-30px)",boxShadow:"2px 2px 2px black"}} transition={{duration:0.7}} className="flex flex-col items-center text-center  shadow-sm py-8 px-2 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300 bg-gradient-to-br from-gray-50 to-blue-500/10">
                        <motion.div // Using motion.div to apply animation to the icon container
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="mb-4 animate-float"
                        >
                            <FiUsers className="text-blue-600 text-6xl md:text-7xl" /> {/* Adjusted size and color */}
                        </motion.div>
                        <h3 className="space-grotesk text-xl font-semibold text-gray-800 mb-2">3. Leverage Shared Insights</h3>
                        <p className="bai-jamjuree-light text-gray-600">
                            Beyond your own uploads, tap into the community's verified knowledge base. Ask questions on topics already contributed by others, extending your learning beyond personal notes.
                        </p>
                        <div className="mt-4 text-xs text-gray-500">
                            <p>Discover public knowledge bases on various subjects.</p>
                        </div>
                    </motion.div>

                    {/* Step 4: Get Precise Answers & Share */}
                    <motion.div whileHover={{transform:"translateY(-30px)",boxShadow:"2px 2px 2px black"}} transition={{duration:0.7}} className="flex flex-col items-center text-center  shadow-sm py-8 px-2 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300 bg-gradient-to-br from-gray-50 to-orange-500/10">
                        <motion.div // Using motion.div to apply animation to the icon container
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                            className="mb-4 animate-float-delay"
                        >
                            <FiHelpCircle className="text-orange-600 text-6xl md:text-7xl" /> {/* Adjusted size and color */}
                        </motion.div>
                        <h3 className="space-grotesk text-xl font-semibold text-gray-800 mb-2">4. Receive & Share Accurate Data</h3>
                        <p className="bai-jamjuree-light text-gray-600">
                            Get precise answers and context-driven insights. What's more, contribute your own verified notes to help the global community and make information sharing seamless.
                        </p>
                        <div className="mt-4 text-xs text-gray-500">
                            <p>Help us grow the collective intelligence!</p>
                        </div>
                    </motion.div>

                </div>

                {/* Call to Action Button */}
                <div className="flex justify-center mt-12">
                    <motion.div whileHover={{ scale: 1.05,transform:"translateX(50px)" }} transition={{ duration: 0.8,ease:"circInOut" }} whileTap={{ scale: 0.95 }}>
                        <Link
                            to="/Interface"
                            className='p-3 rounded-lg bg-black text-white space-grotesk flex items-center justify-center gap-2 text-lg CustPoint transition-all duration-300 shadow-lg hover:shadow-xl'
                        >
                            Dive into EUREKA <FiArrowUpRight className='text-xl' />
                        </Link>
                    </motion.div>
                </div>

                {/* Optional: More Resources */}
                <div className="mt-16 text-center text-gray-700">
                    <h3 className="space-grotesk text-2xl font-bold mb-4">Need More Help?</h3>
                    <p className="bai-jamjuree-light text-md mb-4">
                        Explore our comprehensive <Link to="/" className='text-purple-700 hover:underline'>User Manual</Link>, browse <Link to="/" className='text-purple-700 hover:underline'>FAQs</Link>, or join our <Link to="/" className='text-purple-700 hover:underline'>Community Forum</Link> for direct support and discussions.
                    </p>
                </div>

            </div>
        </div>
    );
};




export default About;
// why is light the fastest thing in the universe ? can something potentially be faster than it , that we have not discovered yet , As the universe itself is made of dark matter which is expanding faster than the speed of light! 
import { FaArrowRight } from "react-icons/fa";
import { MdRocket } from "react-icons/md";
import { Link } from "react-router";

const DocsPage2 = () => {
    return (<>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 p-8 w-full flex flex-col items-center gap-8 hover:shadow-2xl transition-shadow duration-300">
            {/* Header Section */}
            <div className="text-center space-y-3 w-full">
                <h1 className="text-4xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">
                    How Eureka Works
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Transforming documents into <span className="font-semibold text-blue-600">actionable knowledge</span> through AI
                </p>
                <div className="flex justify-center">
                    <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg className="w-2 h-2 fill-blue-500 animate-pulse" viewBox="0 0 6 6" aria-hidden="true">
                            <circle cx="3" cy="3" r="3" />
                        </svg>
                        Community-Powered
                    </span>
                </div>
            </div>

            {/* Core Process Teaser */}
            <div className="w-full p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100/60">
                <p className="text-center text-blue-800 bai-jamjuree-regular">
                    ✨ <span className="font-semibold">The Magic Formula:</span>
                    <span className="mx-2 font-mono text-lg font-bold">upload → embed → query</span> ✨
                </p>
            </div>

            {/* Three Pillars Section */}
            <div className="w-full space-y-6">
                {/* Category */}
                <div className="p-5 hover:bg-gray-50/50 rounded-xl transition-all duration-200 border border-gray-100 hover:border-blue-100">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-bold">1</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 space-grotesk">
                                Your Knowledge Universe
                            </h2>
                            <p className="mt-2 text-gray-600 bai-jamjuree-regular">
                                Start broad with fields like
                                <span className="mx-1.5 bg-blue-100/50 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">Physics</span>
                                or
                                <span className="mx-1.5 bg-purple-100/50 text-purple-800 px-2 py-1 rounded-md text-sm font-medium">Computer Science</span>.
                                We've mapped all major domains so you don't have to wander aimlessly.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Subcategory */}
                <div className="p-5 hover:bg-gray-50/50 rounded-xl transition-all duration-200 border border-gray-100 hover:border-green-100">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 font-bold">2</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 space-grotesk">
                                Laser-Focused Exploration
                            </h2>
                            <p className="mt-2 text-gray-600 bai-jamjuree-regular">
                                Dive deeper into
                                <span className="mx-1.5 bg-green-100/50 text-green-800 px-2 py-1 rounded-md text-sm font-medium">Quantum Mechanics</span>
                                or
                                <span className="mx-1.5 bg-emerald-100/50 text-emerald-800 px-2 py-1 rounded-md text-sm font-medium">Thermodynamics</span>.
                                Precision navigation means no more generic fluff - just what you need.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contribution */}
                <div className="p-5 hover:bg-gray-50/50 rounded-xl transition-all duration-200 border border-gray-100 hover:border-orange-100">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                            <span className="text-orange-600 font-bold">3</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 space-grotesk">
                                Community-Verified Truth
                            </h2>
                            <p className="mt-2 text-gray-600 bai-jamjuree-regular">
                                Our quality shield includes:
                                <ul className="list-disc pl-5 mt-2 space-y-1.5">
                                    <li className="marker:text-orange-500"><span className="font-semibold">Peer voting system</span> (wisdom of the crowd)</li>
                                    <li className="marker:text-orange-500">Full <span className="font-semibold">source provenance</span> tracking</li>
                                    <li className="marker:text-orange-500">AI-powered <span className="font-semibold">credibility alerts</span></li>
                                </ul>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Anti-Hallucination Feature */}
            <div className="w-full mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100/60">
                <p className="text-center text-purple-800 bai-jamjuree-regular">
                    🛡️ <span className="font-semibold">Secret Sauce:</span> Our proprietary anti-hallucination layer keeps AI responses grounded in reality (no made-up facts here!)
                </p>
            </div>

            {/* CTA */}
            <div className="mt-8 w-full text-center">
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-400/30 transition-all duration-300 inline-flex items-center gap-2">
                    <MdRocket className="w-5 h-5" />
                    Launch Your Knowledge Journey
                    <FaArrowRight className="w-4 h-4" />
                </button>
            </div>
            <div className="flex justify-end items-center flex-wrap">
                <Link 
                    className="flex items-center space-grotesk text-purple-600 gap-2 text-sm my-2"
                    to="/docs/page3"
                >
                    Next <FaArrowRight /> <span>Private Documents</span>
                </Link>
            </div>
        </div>
    </>)
}

export default DocsPage2;
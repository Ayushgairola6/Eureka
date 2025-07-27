import { useState } from "react";
import { Link } from "react-router";
// import { FaArrowRight } from "react-icons/fa";
import { FiArrowRight, FiDownload, FiHome, FiInfo } from "react-icons/fi";
const ApiDocs = () => {
    const [pack, setPackage] = useState<string>('npm');

    return (<>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 p-6 w-full">
            {/* Installation Header */}
            <div className="flex items-center gap-3 mb-6">
                <FiDownload className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900 space-grotesk">
                    Install the SDK
                </h2>
            </div>

            {/* Package Manager Selector */}
            <div className="mb-6">
                <div className="flex gap-2 mb-3">
                    {["npm", "yarn", "bun"].map((pkg) => (
                        <button
                            key={pkg}
                            onClick={() => setPackage(pkg)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${pack === pkg
                                    ? "bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            aria-pressed={pack === pkg}
                        >
                            {pkg}
                        </button>
                    ))}
                </div>

                {/* Code Block */}
                <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-gray-100 text-sm font-mono">
                        <code>
                            {pack === "npm" && "npm install eurekaV1"}
                            {pack === "yarn" && "yarn add eurekaV1"}
                            {pack === "bun" && "bun add eurekaV1"}
                        </code>
                    </pre>
                </div>
            </div>

            {/* SDK Introduction */}
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
                    <FiInfo className="w-5 h-5 text-blue-600" />
                    About Eureka SDK
                </h3>
                <p className="text-gray-600 bai-jamjuree-regular leading-relaxed">
                    Eureka is a <span className="font-semibold text-blue-600">community-powered</span>, open-source knowledgebase RAG agent.
                    It combines <span className="font-semibold text-emerald-600">AI</span>, <span className="font-semibold text-purple-600">vector databases</span>,
                    and <span className="font-semibold text-indigo-600">embeddings</span> to create a collaborative knowledge ecosystem.
                    Use it to:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                    <li>Query community-contributed knowledge</li>
                    <li>Build private research assistants</li>
                    <li>Create automated documentation systems</li>
                </ul>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <Link
                    to="/"
                    className="flex items-center text-gray-600 hover:text-blue-600 transition-colors gap-1"
                >
                    <FiHome className="w-4 h-4" />
                    Home
                </Link>
                <Link
                    to="/docs/page2"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-300 inline-flex items-center gap-2"
                >
                    How Eureka Works
                    <FiArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    </>)
}

export default ApiDocs;
import { Link } from "react-router"
import { FaCode, FaLock, FaKey, FaRocket } from 'react-icons/fa';
import { FiTool, FiArrowRight } from 'react-icons/fi';
// import { RiLockPasswordLine } from "react-icons/ri";
const API_functions = () => {
    return (<div className="bg-white backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 p-8 w-full flex flex-col items-center gap-8 hover:shadow-2xl transition-shadow duration-300">
        {/* Header Section */}
        <div className="text-center space-y-3 w-full">
            <h1 className="md:text-4xl text-2xl  bai-jamjuree-semibold">
                Eureka SDK
            </h1>
            <p className="md:text-lg text-sm text-gray-600 max-w-2xl mx-auto space-grotesk">
                Programmatic access to your <span className="font-semibold text-blue-600">private knowledge base</span> with just a few lines of code
            </p>
            <div className="flex justify-center gap-2 space-grotesk ">
                <span className="inline-flex items-center justify-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    <FaCode className="w-3 h-3" />
                    Developer Friendly
                </span>
                <span className="inline-flex items-center justify-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <FaLock className="w-3 h-3" />
                    End-to-End Secure
                </span>
            </div>
        </div>

        {/* Installation */}
        <div className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 bai-jamjuree-semibold">
                <FiTool className="w-5 h-5 " />
                Installation
            </h2>
            <div className="mt-3 bg-gray-800 rounded-lg p-4 overflow-x-auto">
                <pre className="text-gray-100 text-sm font-mono">
                    <code>npm install eurekaV1</code>
                </pre>
            </div>
        </div>

        {/* SDK Features */}
        <div className="px-4 ">
            {/* enabling the eureka client */}
            <div className="flex flex-col gap-2 items-center justify-center">
                <h1 className="bai-jamjuree-semibold text-lg flex items-center justify-center gap-2">Eureka sdk client</h1>
                <p className="bg-gray-900 text-white p-3 rounded-lg space-grotesk">
                    {`const client = new EurekaClient({
                        apiKey:'YOUR_API_KEY',
                    baseUrl:"https://eureka-7ks7.onrender.com"
                    })`}
                </p>
            </div>
            {/* Get all private document data */}
            <div className="flex flex-col gap-2 items-center justify-center">
                <h1 className="bai-jamjuree-semibold text-lg flex items-center justify-center gap-2">Data of all private documents</h1>
                <p className="bg-gray-900 text-white p-3 rounded-lg space-grotesk">
                    {`const client = new EurekaClient({
                        apiKey:'YOUR_API_KEY',
                    baseUrl:"https://eureka-7ks7.onrender.com"
                    })`}
                </p>
            </div>
            {/* Query any private document */}
            <div className="flex flex-col gap-2 items-center justify-center">
                <h1 className="bai-jamjuree-semibold text-lg flex items-center justify-center gap-2">Query any specific document</h1>
                <p className="bg-gray-900 text-white p-3 rounded-lg space-grotesk">
                    {`const client = new EurekaClient({
                        apiKey:'YOUR_API_KEY',
                    baseUrl:"https://eureka-7ks7.onrender.com"
                    })`}
                </p>
            </div>
            {/* Upload documents */}
            <div className="flex flex-col gap-2 items-center justify-center">
                <h1 className="bai-jamjuree-semibold text-lg flex items-center justify-center gap-2">Upload knowledgebase documents</h1>
                <p className="bg-gray-900 text-white p-3 rounded-lg space-grotesk">
                    {`const client = new EurekaClient({
                        apiKey:'YOUR_API_KEY',
                    baseUrl:"https://eureka-7ks7.onrender.com"
                    })`}
                </p>
            </div>
        </div>
        <template></template>
        {/* Authentication Info */}
        <div className="w-full mt-6 p-5 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FaKey className="w-5 h-5 text-blue-600" />
                Authentication
            </h3>
            <p className="mt-2 text-gray-600">
                All SDK methods require your API key. Get one from the <Link to="/API/featured" className="text-blue-600 hover:underline">API dashboard</Link>.
            </p>
        </div>

        {/* CTA */}
        <div className="w-full mt-8 text-center">
            <Link
                to="/API/featured"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-400/30 transition-all duration-300 inline-flex items-center gap-2"
            >
                <FaRocket className="w-5 h-5" />
                Get Your API Key
                <FiArrowRight className="w-4 h-4" />
            </Link>
        </div>
    </div>
    )
}

export default API_functions
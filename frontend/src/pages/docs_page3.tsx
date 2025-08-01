import { Link } from "react-router";

import {
    RiLock2Fill,
    RiFlashlightFill,
    RiFileTextFill,
    RiCodeBoxFill,
    RiArrowRightSLine,
    RiArrowDownSLine,
    RiShieldCheckFill,
    RiCheckDoubleFill,
    RiKey2Fill,
    RiUpload2Fill
} from "react-icons/ri";
import { FaArrowRight } from "react-icons/fa";

const Privacy = () => {
    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 px-4 py-6 w-full flex flex-col items-center gap-8 hover:shadow-2xl transition-shadow duration-300">
            {/* Header Section */}
            <div className="text-center space-y-3 w-full">
                <h1 className="bai-jamjuree-semibold text-2xl md:text-4xl  text-black ">
                    Private Documents
                </h1>
                <p className="text-sm md:text-lg space-grotesk text-gray-600 max-w-2xl mx-auto">
                    Your <span className="font-semibold text-indigo-600">confidential</span> knowledge base,
                    powered by <span className="font-semibold text-purple-600">secure RAG</span>
                </p>
                <div className="flex justify-center gap-2">
                    <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 text-xs space-grotesk">
                        <RiLock2Fill color="black" className="w-3 h-3" />
                        End-to-End Encrypted
                    </span>
                    <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-purple-100 text-purple-800 text-xs space-grotesk">
                        <RiFlashlightFill color="black" className="w-3 h-3" />
                        Instant Setup
                    </span>
                </div>
            </div>

            {/* Main Feature Showcase */}
            <div className="w-full grid md:grid-cols-2 gap-6">
                {/* Simple Workflow Card */}
                <div className="p-5 bg-indigo-50/50 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-colors">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <RiFileTextFill color="black" className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 space-grotesk">
                                One-Click Privacy
                            </h2>
                            <p className="mt-2 text-gray-600 bai-jamjuree-regular">
                                Just click <span className="font-mono bg-indigo-100/70 text-indigo-800 px-2 py-1 rounded-md">My Docs</span>
                                in the interface to see all your <span className="font-semibold">private uploads</span>.
                                Select any document and start querying immediately - no complex setup needed.
                            </p>
                        </div>
                    </div>
                </div>

                {/* API Power Card */}
                <div className="p-5 bg-purple-50/50 rounded-xl border border-purple-100 hover:border-purple-200 transition-colors">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <RiCodeBoxFill color="black" className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 space-grotesk">
                                RAG Without the Headache
                            </h2>
                            <p className="mt-2 text-gray-600 bai-jamjuree-regular">
                                Skip the pipeline engineering! Get an
                                <Link to="/API/featured" className="mx-1 font-mono bg-purple-100/70 text-purple-800 px-2 py-1 rounded-md hover:underline">
                                    API key
                                </Link>
                                and plug our <span className="font-semibold">pre-built document intelligence </span>
                                into any app.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Workflow */}
            <div className="w-full mt-4 p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 bai-jamjuree-regular">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                            <span className="text-indigo-600 font-bold">1</span>
                        </div>
                        <p className="font-medium text-sm">Upload Private<br />Documents</p>
                    </div>
                    <RiArrowRightSLine className="w-8 h-8 text-gray-400 hidden md:block" />
                    <RiArrowDownSLine className="w-8 h-8 text-gray-400 md:hidden" />
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-2">
                            <span className="text-purple-600 font-bold">2</span>
                        </div>
                        <p className="font-medium text-sm">Get API Key<br />(One-Time)</p>
                    </div>
                    <RiArrowRightSLine className="w-8 h-8 text-gray-400 hidden md:block" />
                    <RiArrowDownSLine className="w-8 h-8 text-gray-400 md:hidden" />
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                            <span className="text-blue-600 font-bold">3</span>
                        </div>
                        <p className="font-medium text-sm">Query Through<br />API/Interface</p>
                    </div>
                </div>
            </div>

            {/* Security Assurance */}
            <div className="w-full mt-6 p-5 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <RiShieldCheckFill className="w-5 h-5 text-indigo-600" />
                    Built for Sensitive Data
                </h3>
                <ul className="mt-3 space-y-2 pl-2">
                    <li className="flex items-start gap-2">
                        <RiCheckDoubleFill className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">Documents <span className="font-semibold">never</span> used for training other models</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <RiCheckDoubleFill className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">Enterprise-grade <span className="font-semibold">encryption</span> at rest and in transit</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <RiCheckDoubleFill className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">Optional <span className="font-semibold">self-hosting</span> for maximum control</span>
                    </li>
                </ul>
            </div>

            {/* CTA Section */}
            <div className="w-full mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Link
                    to="/API/featured"
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-400/30 transition-all duration-300 inline-flex items-center justify-center gap-2 text-center bai-jamjuree-regular"
                >
                    <RiKey2Fill className="w-5 h-5" />
                    Get Your API Key
                </Link>
                <Link to='/Interface' className="px-6 py-3 bg-black border border-gray-200 hover:border-indigo-300 text-white  rounded-xl font-medium  inline-flex items-center justify-center gap-2 CustPoint bai-jamjuree-regular">
                    <RiUpload2Fill className="w-5 h-5" />
                    Upload First Document
                </Link>
            </div>
            <div className="flex justify-end items-center flex-wrap">
                <Link
                    className="flex items-center space-grotesk text-purple-600 gap-2 text-sm my-2"
                    to="/docs/page4"
                >
                    Next <FaArrowRight /> <span>API functions</span>
                </Link>
            </div>
        </div>
    );
};

export default Privacy;
import { useState } from "react";
import { Link } from "react-router";
// import { FaArrowRight } from "react-icons/fa";
import { FiArrowRight, FiDownload, FiHome } from "react-icons/fi";
const ApiDocs = () => {
  const [pack, setPackage] = useState<string>("npm");

  return (
    <>
      {/* <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 px-2 w-full "> */}
      {/* Installation Header */}
      <div className="flex items-center gap-3 mb-6">
        <FiDownload size={20} color="black" />
        <h2 className="text-xl font-bold text-black dark:text-white bai-jamjuree-semibold">
          Install the SDK
        </h2>
      </div>

      {/* Package Manager Selector */}
      <div className="mb-6">
        <div className="flex gap-2 mb-3 space-grotesk">
          {["npm", "yarn", "bun"].map((pkg) => (
            <button
              key={pkg}
              onClick={() => setPackage(pkg)}
              className={`px-2 py-1 rounded-lg font-medium text-sm transition-all ${
                pack === pkg
                  ? "bg-indigo-600  text-white shadow-md"
                  : "bg-gray-100 text-black hover:bg-gray-200"
              }`}
              aria-pressed={pack === pkg}
            >
              {pkg}
            </button>
          ))}
        </div>

        {/* Code Block */}
        <div className="dark:bg-white/10 bg-black/10 border  rounded-lg p-4 overflow-x-auto">
          <pre className="text-gray-900 dark:text-gray-300   text-sm font-mono">
            <code>
              {pack === "npm" && "npm install AntiNodeV1"}
              {pack === "yarn" && "yarn add AntiNodeV1"}
              {pack === "bun" && "bun add AntiNodeV1"}
            </code>
          </pre>
        </div>
      </div>

      {/* SDK Introduction */}
      <div className="p-5 bg-gray-100 text-sm dark:bg-white/10  rounded-xl border mb-6 ">
        <h3 className="text-lg font-semibold text-black dark:text-gray-300  gap-2 mb-3 space-grotesk">
          About AntiNode SDK
        </h3>
        <p className="text-gray-900 dark:text-white space-grotesk leading-relaxed ">
          AntiNode==={" "}
          <span className=" text-blue-600">Community-powered {"> "}</span>
          <span className=" text-green-600">Collaborative {"> "}</span>
          <span className=" text-indigo-600">Knowledge Oriented {"> "}</span>
          <span className=" text-amber-600">Helper {"> "}</span>
          <span className=" text-pink-600">Rag-Agent {"> "}</span>
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1 dark:text-white text-gray-600 space-grotesk">
          <li>Query community-contributed knowledge</li>
          <li>Build private research assistants</li>
          <li>Upload private documents</li>
          <li>Search the whole web</li>
          <li>Create automated documentation systems</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200 bai-jamjuree-semibold">
        <Link
          to="/"
          className="flex items-center text-gray-800 dark:text-white hover:text-blue-600 transition-colors gap-1"
        >
          <FiHome className="w-4 h-4" />
          Home
        </Link>
        <Link
          to="/Api/AntiNodeKnow-How"
          className=" text-green-400 text-sm   inline-flex items-center gap-2"
        >
          How AntiNode Works
          <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
      {/* </div> */}
    </>
  );
};

export default ApiDocs;

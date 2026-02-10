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
  RiUpload2Fill,
} from "react-icons/ri";
import { FaArrowRight } from "react-icons/fa";

const Privacy = () => {
  return (
    <div className="bg-white/95 dark:bg-black   border  px-4 py-6 sm:px-6 sm:py-8 w-full flex flex-col items-center gap-6 md:gap-8  transition-all duration-300">
      {/* Header Section */}
      <div className="text-center space-y-3 w-full">
        <h1 className="bai-jamjuree-semibold text-2xl sm:text-3xl md:text-4xl text-black dark:text-white">
          Private Documents
        </h1>
        <p className="text-sm sm:text-base md:text-lg space-grotesk text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Your{" "}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            confidential
          </span>{" "}
          knowledge base, powered by{" "}
          <span className="font-semibold text-purple-600 dark:text-purple-400">
            secure RAG
          </span>
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-x-1.5 py-1 px-2 sm:py-1.5 sm:px-3 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 space-grotesk">
            <RiLock2Fill className="w-3 h-3 text-indigo-600 dark:text-indigo-300" />
            End-to-End Encrypted
          </span>
          <span className="inline-flex items-center gap-x-1.5 py-1 px-2 sm:py-1.5 sm:px-3 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 space-grotesk">
            <RiFlashlightFill className="w-3 h-3 text-purple-600 dark:text-purple-300" />
            Instant Setup
          </span>
        </div>
      </div>

      {/* Main Feature Showcase */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Simple Workflow Card */}
        <div className="p-4 sm:p-5 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 hover:border-indigo-200 dark:hover:border-indigo-600 transition-colors">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center">
              <RiFileTextFill className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 space-grotesk">
                One-Click Privacy
              </h2>
              <p className="mt-1 sm:mt-2 text-sm text-gray-600 dark:text-gray-300 bai-jamjuree-regular">
                Just click{" "}
                <span className="font-mono bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                  Private Docs or Dashboard
                </span>
                in the main interface to see all your{" "}
                <span className="font-semibold">private uploads</span>. Select
                any document and start querying immediately - no complex setup
                needed.
              </p>
            </div>
          </div>
        </div>

        {/* API Power Card */}
        <div className="p-4 sm:p-5 bg-purple-50/50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800 hover:border-purple-200 dark:hover:border-purple-600 transition-colors">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
              <RiCodeBoxFill className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 space-grotesk">
                RAG Without the Headache
              </h2>
              <p className="mt-1 sm:mt-2 text-sm text-gray-600 dark:text-gray-300 bai-jamjuree-regular">
                Skip the pipeline engineering! Get an
                <Link
                  to="/Api/introduction"
                  className="mx-1 font-mono bg-purple-100/70 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md hover:underline"
                >
                  API key
                </Link>
                and plug our{" "}
                <span className="font-semibold">
                  pre-built document intelligence{" "}
                </span>
                into any app.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Workflow */}
      <div className="w-full mt-4 p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-xl border border-gray-200 dark:border-gray-700 bai-jamjuree-regular">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-1 sm:mb-2">
              <span className="text-indigo-600 dark:text-indigo-300 font-bold">
                1
              </span>
            </div>
            <p className="font-medium text-xs sm:text-sm">
              Upload Private
              <br />
              Documents
            </p>
          </div>
          <RiArrowRightSLine className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500 hidden md:block" />
          <RiArrowDownSLine className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500 md:hidden" />
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-1 sm:mb-2">
              <span className="text-purple-600 dark:text-purple-300 font-bold">
                2
              </span>
            </div>
            <p className="font-medium text-xs sm:text-sm">
              Get API Key
              <br />
              (One-Time)
            </p>
          </div>
          <RiArrowRightSLine className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500 hidden md:block" />
          <RiArrowDownSLine className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500 md:hidden" />
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-1 sm:mb-2">
              <span className="text-blue-600 dark:text-blue-300 font-bold">
                3
              </span>
            </div>
            <p className="font-medium text-xs sm:text-sm">
              Query Through
              <br />
              API/Interface
            </p>
          </div>
        </div>
      </div>

      {/* Security Assurance */}
      <div className="w-full mt-4 sm:mt-6 p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-800/50 dark:to-indigo-900/20 rounded-xl border border-gray-200 dark:border-gray-700 space-grotesk">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <RiShieldCheckFill className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 bai-jamjuree-semibold" />
          Built for Sensitive Data
        </h3>
        <ul className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 pl-1 sm:pl-2">
          <li className="flex items-start gap-2">
            <RiCheckDoubleFill className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Documents <span className="font-semibold">never</span> used for
              training other models
            </span>
          </li>
          <li className="flex items-start gap-2">
            <RiCheckDoubleFill className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Enterprise-grade <span className="font-semibold">encryption</span>{" "}
              at rest and in transit (Not active at the moment)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <RiCheckDoubleFill className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Optional <span className="font-semibold">self-hosting</span> for
              maximum control (Not active at the moment)
            </span>
          </li>
        </ul>
      </div>

      {/* CTA Section */}
      <div className="w-full mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
        <Link
          to="/Api/introduction"
          className="px-4 py-2 sm:px-6 sm:py-3 bg-indigo-500 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-400/30 transition-all duration-300 inline-flex items-center justify-center gap-2 text-center bai-jamjuree-regular text-sm sm:text-base"
        >
          <RiKey2Fill className="w-4 h-4 sm:w-5 sm:h-5" />
          Get Your API Key
        </Link>
        <Link
          to="/Interface"
          className="px-4 py-2 sm:px-6 sm:py-3 bg-black dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 text-white rounded-xl font-medium inline-flex items-center justify-center gap-2 CustPoint bai-jamjuree-regular text-sm sm:text-base"
        >
          <RiUpload2Fill className="w-4 h-4 sm:w-5 sm:h-5" />
          Upload First Document
        </Link>
      </div>

      <div className="flex justify-end  text-green-400 items-center text-sm gap-3 w-full mt-4">
        <Link
          className=" space-grotesk     bai-jamjuree-semibold hover:underline"
          to="/Api/AntiNode/GettingAllDocuments"
        >
          API functions
        </Link>
        <FaArrowRight />
      </div>
    </div>
  );
};

export default Privacy;

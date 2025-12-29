import { FaArrowRight } from "react-icons/fa";
import { BiBrain } from "react-icons/bi";
import { Link } from "react-router";
import { RiCommunityLine, RiFocus3Fill } from "react-icons/ri";
import { LuArrowUpRight } from "react-icons/lu";
const DocsPage2 = () => {
  return (
    <>
      <div className="bg-white dark:bg-black dark:text-gray-100  border   p-4 w-full flex flex-col items-center gap-6 md:gap-8 hover:shadow-2xl transition-all duration-300">
        {/* Header Section */}
        <div className="text-center space-y-3 w-full">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            How AntiNode Works
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto space-grotesk">
            Transforming documents into{" "}
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Actionable knowledge
            </span>{" "}
            through AI
          </p>
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-x-1.5 py-1 px-2 sm:py-1.5 sm:px-3 rounded-full text-xs font-medium bg-black dark:bg-gray-700 text-white dark:text-gray-200 bai-jamjuree-regular">
              <svg
                className="w-2 h-2 fill-green-500 animate-pulse"
                viewBox="0 0 6 6"
                aria-hidden="true"
              >
                <circle cx="3" cy="3" r="3" />
              </svg>
              Community-Powered
            </span>
          </div>
        </div>

        {/* Core Process Teaser */}
        <div className="w-full p-2 bg-black  text-white rounded-xl border ">
          <p className="text-center bai-jamjuree-regular flex items-center justify-center flex-col">
            <span className="font-semibold ">✨ The Magic Formula:</span>
            <span className="mx-2 font-mono text-xs sm:text-sm font-bold flex items-center justify-center text-amber-600 dark:text-amber-400 my-2">
              Upload → Embed → Query
            </span>
          </p>
        </div>

        {/* Three Pillars Section */}
        <div className="w-full space-y-4 sm:space-y-6">
          {/* Category */}
          <div className="p-4 sm:p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 border  hover:border-blue-100 dark:hover:border-blue-900">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                <BiBrain size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 space-grotesk">
                  Your Knowledge Universe
                </h2>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 bai-jamjuree-regular">
                  Start broad with fields like
                  <span className="mx-1 bg-blue-100/50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm font-medium">
                    Physics
                  </span>
                  or
                  <span className="mx-1 bg-purple-100/50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm font-medium">
                    Computer Science
                  </span>
                  . We've mapped all major domains so you don't have to wander
                  aimlessly.
                </p>
              </div>
            </div>
          </div>

          {/* Subcategory */}
          <div className="p-4 sm:p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 border  hover:border-green-100 dark:hover:border-green-900">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400">
                <RiFocus3Fill size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 space-grotesk">
                  Laser-Focused Exploration
                </h2>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 bai-jamjuree-regular">
                  Dive deeper into
                  <span className="mx-1 bg-green-100/50 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm font-medium">
                    Quantum Mechanics
                  </span>
                  or
                  <span className="mx-1 bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm font-medium">
                    Thermodynamics
                  </span>
                  . Precision navigation means no more generic fluff - just what
                  you need.
                </p>
              </div>
            </div>
          </div>

          {/* Contribution */}
          <div className="p-4 sm:p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 border   hover:border-orange-100 dark:hover:border-orange-900">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400">
                <RiCommunityLine size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 space-grotesk">
                  Community-Verified Truth
                </h2>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 bai-jamjuree-regular">
                  Our quality shield includes:
                  <ul className="list-disc pl-4 sm:pl-5 mt-1 sm:mt-2 space-y-1">
                    <li className="marker:text-orange-500 dark:marker:text-orange-400">
                      <span className="font-semibold">Peer voting system</span>
                    </li>
                    <li className="marker:text-orange-500 dark:marker:text-orange-400">
                      Full{" "}
                      <span className="font-semibold">source provenance</span>{" "}
                      tracking
                    </li>
                    <li className="marker:text-orange-500 dark:marker:text-orange-400">
                      Authenticity{" "}
                      <span className="font-semibold">Voting systems</span>
                    </li>
                  </ul>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="w-full text-center flex items-center justify-between p-3 bai-jamjuree-semibold">
          <button className=" gap-2    flex items-center justify-center bg-gray-100 text-black dark:bg-white dark:text-black border  rounded-lg px-2 py-1">
            Try Now
            <LuArrowUpRight size={12} />
          </button>
          <Link
            className="flex items-center justify-end  text-green-400  gap-2   hover:underline"
            to="/Api/AntiNodeManagaging-PrivateDocs"
          >
            <span>Private Documents</span>
            <FaArrowRight size={12} />
          </Link>
        </div>
      </div>
    </>
  );
};

export default DocsPage2;

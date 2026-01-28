import React from "react";
import { IoClose } from "react-icons/io5";
import { Categories, SubCategories } from "../../utlis/Info.ts";
type FilterProps = {
  showFilters: boolean;
  SetShowFilters: any;
  filtercategory: string;
  setfiltercategory: any;
  subCategory: string;
  setSubCategory: any;
  HandleFilterApplication: any;
  ResetFilters: any;
};

const Filters: React.FC<FilterProps> = ({
  showFilters,
  SetShowFilters,
  filtercategory,
  setfiltercategory,
  subCategory,
  setSubCategory,
  HandleFilterApplication,
  ResetFilters,
}) => {
  return (
    <>
      <div
        className={`fixed top-0 left-0 h-screen w-full md:w-200 bg-white/95 dark:bg-black/95 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-600/50 z-50 ${showFilters === true
          ? "translate-x-0 opacity-100"
          : "opacity-0 -translate-x-full"
          } transition-all duration-300 ease-out p-5 overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold bai-jamjuree-semibold dark:text-white text-black">
              Filters
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Refine your search results
            </p>
          </div>
          <button
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 cursor-pointer group"
            onClick={() => SetShowFilters(!showFilters)}
          >
            <IoClose
              size={20}
              className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors"
            />
          </button>
        </div>

        {/* Category Section */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium bai-jamjuree-medium dark:text-gray-200 text-gray-700 uppercase tracking-wide">
              Category
            </span>
            {filtercategory && (
              <button
                onClick={() => setfiltercategory("")}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto scrollbar-thin pr-1">
              {Categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setfiltercategory(cat.name);
                    setSubCategory('')
                  }}
                  className={`px-3 py-1 text-[11px] border rounded-sm transition-all space-grotesk ${filtercategory === cat.name
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-900 dark:border-white font-bold"
                    : "bg-white dark:bg-black text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700 hover:border-neutral-500 dark:hover:border-neutral-500"
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Subcategory Section */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium bai-jamjuree-medium dark:text-gray-200 text-gray-700 uppercase tracking-wide">
              Subcategory
            </span>
            {subCategory && (
              <button
                onClick={() => setSubCategory("")}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {filtercategory ? (
            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-1.5 bg-neutral-50 dark:bg-neutral-900/30 p-2 border border-neutral-200 dark:border-neutral-800 rounded-sm">
                {SubCategories.find(
                  (cat) => cat.parent === filtercategory
                )?.subcategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSubCategory(sub)}
                    className={`px-2 py-0.5 text-[10px] uppercase tracking-wide border rounded-sm ${subCategory === sub
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-transparent border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300"
                      }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-gray-400 dark:text-gray-500 text-xs bai-jamjuree-regular">
                Select a category to see options
              </div>
            </div>
          )}
        </section>

        {/* Active Filters Badge */}
        {(filtercategory || subCategory) && (
          <div className="mb-6 p-3 dark:bg-neutral-950 bg-white  rounded-xl border border-gray-200/30 dark:border-gray-700/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Active Filters
              </span>
            </div>
            <div className="space-y-1">
              {filtercategory && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    Category
                  </span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
                    {filtercategory}
                  </span>
                </div>
              )}
              {subCategory && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    Subcategory
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                    {subCategory}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mt-auto">
          <button
            onClick={() => HandleFilterApplication()}
            className="w-full bg-gradient-to-r from-black to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-black py-2.5 px-4 spae-grotesk text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={!filtercategory && !subCategory}
          >
            Apply Filters
          </button>

          {(filtercategory || subCategory) && (
            <button
              className="w-full border border-gray-300/50 dark:border-gray-600/50 text-gray-600 dark:text-gray-400 py-2 text-xs rounded-xl transition-all duration-200 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 hover:border-gray-400/50 dark:hover:border-gray-500/50 space-grotesk"
              onClick={() => {
                setfiltercategory("");
                setSubCategory("");
                ResetFilters();
                SetShowFilters(!showFilters);
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Filters;

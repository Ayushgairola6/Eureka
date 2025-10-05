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
        className={`absolute top-0 left-0 h-screen w-full md:w-80 bg-white/95 dark:bg-black/95 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-600/50 z-50 ${
          showFilters === true
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
            {Categories.map((val, index) => (
              <button
                key={`category-${index}`}
                onClick={() => {
                  setfiltercategory(val.name);
                  setSubCategory("");
                }}
                className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 border ${
                  filtercategory === val.name
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg shadow-indigo-500/25"
                    : "bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-800 dark:hover:text-gray-200"
                } hover:scale-105 active:scale-95 backdrop-blur-sm`}
              >
                {val.name}
              </button>
            ))}
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
              {SubCategories.filter((cat) => cat.parent === filtercategory).map(
                (cat, index) => (
                  <div
                    key={`subcat-${index}`}
                    className="flex items-center justify-evenly flex-wrap "
                  >
                    {cat?.subcategories?.map((sub, subIndex) => (
                      <label
                        key={`sub-${subIndex}`}
                        className="flex items-center p-2.5 rounded-xl transition-all duration-200 cursor-pointer group hover:bg-gray-50/80 dark:hover:bg-gray-800/80 backdrop-blur-sm"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-3 transition-colors ${
                            subCategory === sub
                              ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/25"
                              : "bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-400 dark:group-hover:bg-gray-500"
                          }`}
                        />
                        <span className="text-sm bai-jamjuree-regular flex-1 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                          {sub}
                        </span>
                        <input
                          onChange={() => setSubCategory(sub)}
                          type="radio"
                          value={sub}
                          name="subcategory"
                          checked={subCategory === sub}
                          className="sr-only"
                        />
                      </label>
                    ))}
                  </div>
                )
              )}
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
          <div className="mb-6 p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200/30 dark:border-gray-700/30 backdrop-blur-sm">
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
            className="w-full bg-gradient-to-r from-black to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-black py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={!filtercategory && !subCategory}
          >
            Apply Filters
          </button>

          {(filtercategory || subCategory) && (
            <button
              className="w-full border border-gray-300/50 dark:border-gray-600/50 text-gray-600 dark:text-gray-400 py-2 text-xs rounded-xl transition-all duration-200 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 hover:border-gray-400/50 dark:hover:border-gray-500/50"
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

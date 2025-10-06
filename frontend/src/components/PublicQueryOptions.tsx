import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setCategory,
  setShowOptions,
  setSubCategory,
} from "../store/InterfaceSlice";
import { useState } from "react";
import { IoMdArrowDropright } from "react-icons/io";
import { Categories, SubCategories } from "../../utlis/Info";
const PublicQueryOptions = () => {
  const dispatch = useAppDispatch();
  const { shwoOptions, category, subCategory } = useAppSelector(
    (state) => state.interface
  );
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <>
      <div className="relative z-50">
        {/* Main Options Container */}
        <div
          className={`bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg p-3 absolute -bottom-30 left-8 min-w-[220px] ${
            shwoOptions
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-2 pointer-events-none"
          } transition-all duration-200 flex gap-3`}
        >
          {/* Categories Section */}
          <div className="">
            <div className="relative group">
              <div className="text-sm font-medium px-2 py-1 text-gray-700 dark:text-gray-300">
                Categories
              </div>
              <div className="mt-1 space-y-0.2 ">
                {Categories.map((cat, index) => (
                  <div
                    key={index}
                    className="relative group/item"
                    onMouseEnter={() => setHoveredCategory(cat.name)}
                  >
                    <div className="flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors">
                      <span className="flex items-center gap-2">
                        <input
                          onChange={(e) =>
                            dispatch(setCategory(e.target.value))
                          }
                          value={cat.name}
                          name="category"
                          type="radio"
                          checked={category === cat.name}
                          className="w-3 h-3"
                        />
                        {cat.name}
                      </span>
                      {SubCategories.some((sc) => sc.parent === cat.name) && (
                        <IoMdArrowDropright
                          size={14}
                          className="text-gray-400"
                        />
                      )}
                    </div>

                    {/* Subcategories appear on hover */}
                    {SubCategories.some((sc) => sc.parent === cat.name) &&
                      hoveredCategory === cat.name && (
                        <div className="absolute top-0 left-full ml-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg min-w-[180px] p-2 z-50 max-h-[300px] overflow-y-auto">
                          <div className="text-xs font-medium px-2 py-1 text-gray-500 dark:text-gray-400">
                            Subcategories
                          </div>
                          {SubCategories.find(
                            (sc) => sc.parent === cat.name
                          )?.subcategories.map((sub, subIndex) => (
                            <div
                              key={subIndex}
                              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                              onClick={() => {
                                dispatch(setSubCategory(sub));
                                const ParentCategory = SubCategories.filter(
                                  (e) => e.subcategories.includes(sub)
                                );
                                const category = ParentCategory[0].parent;
                                dispatch(setCategory(category));
                                dispatch(setShowOptions(!shwoOptions));
                                setHoveredCategory(null);
                              }}
                            >
                              <input
                                type="radio"
                                name="subcategory"
                                checked={subCategory === sub}
                                onChange={() => {}}
                                className="w-3 h-3"
                              />
                              {sub}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="w-px bg-gray-200 dark:bg-gray-700"></div>

          {/* Other Options (DropDown) */}
          {/* <div className="flex-1">
            <DropDown />
          </div> */}
        </div>
      </div>
    </>
  );
};
export default PublicQueryOptions;

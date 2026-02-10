import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCategory, setSubCategory } from "../store/InterfaceSlice";
import { useState } from "react";
import { Categories, SubCategories } from "../../utlis/Info";
const PublicQueryOptions = () => {
  const dispatch = useAppDispatch();
  const { shwoOptions, category, subCategory } = useAppSelector(
    (state) => state.interface
  );
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <>
      <div
        className={`${
          shwoOptions === true
            ? " opacity-100 pointer-events-auto"
            : "pointer-events-none opacity-0"
        } absolute bottom-20 left-12 z-[99] w-40 border rounded-lg transition-all duration-300 `}
      >
        <div className=" bg-black dark:bg-gray-100 space-grotesk  rounded-lg shadow-xl overflow-hidden ">
          <div className="p-3 dark:text-black text-white bai-jamjuree-semibold">
            <h3 className="text-sm">Select Category</h3>
          </div>

          <div className="max-h-60 h-60 overflow-y-auto scrollbar-thin  space-grotesk cursor-pointer relative">
            {Categories.map((e, i) => (
              <button
                onMouseOver={() => setHoveredCategory(e.name)}
                // onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => dispatch(setCategory(e.name))}
                key={i}
                className={`hover:bg-teal-400/20  w-full py-1 px-4  transition-colors duration-200 text-left     ${
                  category === e.name
                    ? "bg-green-400/15 text-green-500"
                    : "dark:text-black text-white"
                } text-xs md:text-sm`}
              >
                <span className="  ">{e.name}</span>
              </button>
            ))}
          </div>
          {hoveredCategory && (
            <div className="max-h-60 h-60 overflow-y-auto scrollbar-thin  bai-jamjuree-regular cursor-pointer absolute bg-black w-40 dark:bg-gray-100  -right-41 top-5 grid grid-cols-1 rounded-lg">
              <div className="p-3 dark:text-black text-white bai-jamjuree-semibold">
                <h3 className=" text-sm">Subcategory</h3>
              </div>
              {SubCategories.find(
                (elem) => elem.parent === hoveredCategory
              )?.subcategories.map((sub, ind) => {
                return (
                  <>
                    <button
                      onClick={() => {
                        dispatch(setSubCategory(sub));
                        const Parent = SubCategories.find((elem) =>
                          elem.subcategories.includes(sub)
                        );
                        setHoveredCategory(null);
                        dispatch(setCategory(Parent?.parent));
                      }}
                      onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`hover:bg-teal-400/20  w-full py-1 px-4  transition-colors duration-200 text-left  bai-jamjuree-regular    ${
                        subCategory === sub
                          ? "bg-purple-400/15 text-purple-500"
                          : "text-white dark:text-gray-900"
                      } text-xs md:text-sm `}
                      key={ind}
                    >
                      {sub}
                    </button>
                  </>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default PublicQueryOptions;

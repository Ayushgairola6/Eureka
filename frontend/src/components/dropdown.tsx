import React from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import {
  setIsVisible,
  setCategory,
  setShowSubcategory,
} from "../store/InterfaceSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

// type DropDownProps = {
//     isVisible: boolean;
//     category: string;
//     setCategory: React.Dispatch<React.SetStateAction<string>>;
//     setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
// };

const DropDown = () => {
  const dispatch = useAppDispatch();
  const { isVisible, category, showSubcategory } = useAppSelector(
    (state) => state.interface
  );

  function handleCategoryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedCategory = e.target.value;
    dispatch(setCategory(selectedCategory));
    // console.log(`Selected category: ${selectedCategory}`);
    dispatch(setIsVisible(false)); // Close the dropdown after selection
  }
  // top-10 left-10 md:right-10

  const Categories = [
    { name: "AI" },
    { name: "Law" },
    { name: "Finance" },
    { name: "Fashion" },
    { name: "Physics" },
    { name: "Chemistry" },
    { name: "Biology" },
    { name: "History" },
    { name: "Geography" },
    { name: "MatheMatics" },
    { name: "Programming" },
    { name: "Other" },
  ];

  return (
    <>
      {/* <ArrowDownAz/> */}
      <div className="  z-[1] space-grotesk w-auto md:w-fit  ">
        <label
          onClick={() => {
            if (showSubcategory === true) {
              dispatch(setShowSubcategory(false));
            }
            dispatch(setIsVisible(!isVisible));
          }}
          className={`cursor-pointer  text-sm flex items-center justify-center gap-1 ${
            category ? "text-green-600" : "text-black dark:text-white"
          }`}
          htmlFor="Category"
        >
          {category ? category : "Category"}{" "}
          <IoMdArrowDropdown
            size={24}
            className={`transition-all duration-500  font-semibold ${
              isVisible === true ? "rotate-90" : "rotate-0"
            } `}
          />
        </label>
        <section
          className={`absolute bottom-full right-0 ${
            isVisible
              ? "h-auto  py-4 flex items-center justify-center gap-2 opacity-100   overflow-y-auto px-3"
              : "h-0 opacity-0 py-0 px-0"
          } bg-white dark:bg-black text-black dark:text-white    overflow-hidden transition-all duration-500 rounded-lg  flex items-start justify-center gap-1  flex-col border border-black/40 dark:border-white/40  `}
        >
          {Categories.map((cat, index) => {
            return (
              <span
                key={index}
                className="flex items-center justify-between w-full    gap-3 flex-row-reverse cursor-pointer text-xs md:text-sm hover:text-lg transition-all duration-300"
              >
                <input
                  onClick={() => dispatch(setIsVisible(!isVisible))}
                  onChange={(e) => handleCategoryUpload(e)}
                  value={cat.name}
                  className="bg-purple-500 text-purple-400"
                  name="category"
                  type="radio"
                />
                <label
                  className="duration-500 cursor-pointer"
                  htmlFor="category"
                >
                  {cat.name}
                </label>
              </span>
            );
          })}
        </section>
      </div>
    </>
  );
};

export default DropDown;

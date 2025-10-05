import { IoMdArrowDropdown } from "react-icons/io";
import {
  setIsVisible,
  setShowSubcategory,
  setSubCategory,
} from "../store/InterfaceSlice.ts";

import { useAppSelector, useAppDispatch } from "../store/hooks";
import type React from "react";

type subcatProp = {
  hoveredCat: string;
};
const SubCategories: React.FC<subcatProp> = ({ hoveredCat }) => {
  const dispatch = useAppDispatch();
  const { subCategory, showSubcategory, isVisible } = useAppSelector(
    (state) => state.interface
  );

  const SubCategories = [
    {
      parent: "AI",
      subcategories: [
        "Machine Learning",
        "Deep Learning",
        "Natural Language Processing",
        "Computer Vision",
        "Reinforcement Learning",
        "Robotics",
        "Expert Systems",
        "Speech Recognition",
      ],
    },
    {
      parent: "Finance",
      subcategories: [
        "Corporate Finance",
        "Investment Banking",
        "Personal Finance",
        "Financial Markets",
        "Risk Management",
        "Quantitative Finance",
        "Accounting",
        "Fintech",
      ],
    },
    {
      parent: "Fashion",
      subcategories: [
        "Textile Design",
        "Fashion Marketing",
        "Apparel Production",
        "Fashion Merchandising",
        "Sustainable Fashion",
        "Fashion Illustration",
        "Costume Design",
      ],
    },
    {
      parent: "Physics",
      subcategories: [
        "Quantum Mechanics",
        "Classical Mechanics",
        "Thermodynamics",
        "Electromagnetism",
        "Optics",
        "Astrophysics",
        "Nuclear Physics",
        "Particle Physics",
      ],
    },
    {
      parent: "Chemistry",
      subcategories: [
        "Organic Chemistry",
        "Inorganic Chemistry",
        "Physical Chemistry",
        "Analytical Chemistry",
        "Biochemistry",
        "Theoretical Chemistry",
        "Materials Chemistry",
      ],
    },
    {
      parent: "Biology",
      subcategories: [
        "Molecular Biology",
        "Cell Biology",
        "Genetics",
        "Ecology",
        "Evolutionary Biology",
        "Microbiology",
        "Botany",
        "Zoology",
      ],
    },
    {
      parent: "History",
      subcategories: [
        "Ancient History",
        "Medieval History",
        "Modern History",
        "World War I",
        "World War II",
        "History of Science",
        "Cultural History",
      ],
    },
    {
      parent: "Geography",
      subcategories: [
        "Physical Geography",
        "Human Geography",
        "Cartography",
        "Geospatial Analysis",
        "Climatology",
        "Urban Geography",
        "Environmental Geography",
      ],
    },
    {
      parent: "Mathematics",
      subcategories: [
        "Algebra",
        "Calculus",
        "Geometry",
        "Statistics",
        "Number Theory",
        "Topology",
        "Discrete Mathematics",
        "Applied Mathematics",
      ],
    },
    {
      parent: "Other",
      subcategories: [
        "Linguistics",
        "Philosophy",
        "Psychology",
        "Sociology",
        "Political Science",
        "Anthropology",
        "Education",
      ],
    },
    {
      parent: "Programming",
      subcategories: [
        "Ruby on Rails",
        "Rust",
        "Typescript",
        "Javascript",
        "Python",
        "CUDA",
        "C#",
        "C",
        "C++",
        "Java",
      ],
    },
  ];

  //
  return (
    <>
      <div className="  z-[1] space-grotesk w-fit md:w-fit  ">
        <label
          onClick={() => {
            if (isVisible === true) {
              dispatch(setIsVisible(false));
            }
            dispatch(setShowSubcategory(!showSubcategory));
          }}
          className={`curosor-pointer  text-sm flex items-center justify-center gap-1 ${
            subCategory
              ? "text-pink-700"
              : "text-black dark:text-white cursor-pointer"
          }`}
          htmlFor="Category"
        >
          {subCategory ? subCategory : "Subcategory"}{" "}
          <IoMdArrowDropdown
            size={24}
            className={`transition-all duration-500  font-semibold ${
              showSubcategory === true ? "rotate-90" : "rotate-0"
            } `}
          />
        </label>
        <section
          className={`absolute bottom-full right-0 ${
            showSubcategory
              ? "h-auto  py-2 gap-2 opacity-100   overflow-y-auto px-3"
              : "h-0 opacity-0 py-0 px-0"
          } bg-white dark:bg-black text-black dark:text-white     overflow-hidden transition-all duration-500 rounded-lg border border-black/40 dark:border-white/40 `}
        >
          {hoveredCat ? (
            SubCategories.map((cat, index) => {
              return (
                <ul
                  className={`flex flex-col items-normal justify-center gap-2 `}
                  key={index}
                >
                  {cat.parent === hoveredCat
                    ? cat?.subcategories.map((sub, index) => {
                        return (
                          <span
                            className="flex items-center justify-between gap-3 space-grotesk text-xs "
                            key={index}
                          >
                            <label htmlFor="subcategory">{sub}</label>
                            <input
                              // onClick={() =>
                              //   dispatch(setShowSubcategory(false))
                              // }
                              onChange={() => {
                                dispatch(setSubCategory(sub));
                                dispatch(setShowSubcategory(!showSubcategory));
                              }}
                              type="radio"
                              value={sub}
                              name="subcategory"
                            />
                          </span>
                        );
                      })
                    : null}
                </ul>
              );
            })
          ) : (
            <ul className="text-red-500 text-sm bai-jamjuree-regular">
              Choose a category first
            </ul>
          )}
        </section>
      </div>
    </>
  );
};

export default SubCategories;

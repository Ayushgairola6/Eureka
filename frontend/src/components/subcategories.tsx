import React from "react";
import { IoMdArrowDropdown } from "react-icons/io";

type SubcategoryProps = {
    subCategory: string
    setSubCategory: React.Dispatch<React.SetStateAction<string>>
    showSubcategory: boolean
    setShowSubCategory: React.Dispatch<React.SetStateAction<boolean>>
    category: string
}

const SubCategories: React.FC<SubcategoryProps> = ({ subCategory, setSubCategory, showSubcategory, setShowSubCategory, category }) => {




    const SubCategories = [{
        parent: "AI", subcategories: [
            "RAG",
            "Neural Networks",
            "Neural Networks",
            "Neural Networks",
            "Neural Networks",
        ]
    }, {
        parent: "Finance", subcategories: [
            "RAG",
            "Neural Networks",
            "Neural Networks",
            "Neural Networks",
            "Neural Networks",
        ]
    }, {
        parent: "Fashion", subcategories: [
            "RAG",
            "Neural Networks",
            "Neural Networks",
            "Neural Networks",
            "Neural Networks",
        ]
    }, {
        parent: "Physics", subcategories: [
            "Quantum Mechanics",
            "Neural Networks",
            "Neural Networks",
            "Neural Networks",
            "Neural Networks",
        ]
    }, {
        parent: "Chemistry", subcategories: [
            "RAG",
            "Neural Networks",
            "Neural Networks",
            "Neural Networks",
            "Neural Networks",
        ]
    }, {
        parent: "Biology", subcategories: [
            "RAG",
            "Neural Networks",
            "Neural Networks",
            "Neural Networks",
            "Neural Networks",
        ]
    }, {
        parent: "History", subcategories: [
            "Ancient world",
            "Medieaval world",
            "Modern world",
            "World War 1",
            "World War 2",
        ]
    }, {
        parent: "Geography", subcategories: [
            "RAG",
            "Neural Networks",
            "Neural Networks",
            "Neural Networks",
            "Neural Networks",
        ]
    }, {
        parent: "MatheMatics", subcategories: [
            "RAG",
            "Neural Networks",
            "Neural Networks",
            "Neural Networks",
            "Neural Networks",
        ]
    },{
        parent: "Other", subcategories: [
            "Language",
            "Neural Networks",
            "Neural Networks",
            "Neural Networks",
            "Neural Networks",
        ]
    }]

    // 
    return (<>
        <div className="  z-[1] space-grotesk w-auto md:w-fit  ">
            <label onClick={() => setShowSubCategory(!showSubcategory)} className={`CustPoint  text-sm flex items-center justify-center gap-1 ${subCategory ? "text-indigo-700" : "text-black"}`} htmlFor="Category">{subCategory ? subCategory : "Subcategory"} <IoMdArrowDropdown color="black" size={24} className={`transition-all duration-500  font-semibold ${showSubcategory === true ? "rotate-90" : "rotate-0"} `} /></label>
            <section className={`${showSubcategory ? "h-auto  py-2 gap-2 opacity-100   overflow-y-auto px-3" : "h-0 opacity-0 py-0 px-0"} bg-gradient-to-br from-gray-50 to-gray-100 text-black    overflow-hidden transition-all duration-500 rounded-lg border border-black/40 relative`}>
                {category ? SubCategories.map((cat, index) => {
                    return (<ul className="flex flex-col items-normal justify-center gap-2" key={index}>{cat.parent === category ? cat?.subcategories.map((sub, index) => {
                        return (<span className="flex items-center justify-between gap-3 space-grotesk text-xs " key={index}>
                            <label htmlFor="subcategory">{sub}</label>
                            <input onChange={() => {
                                setSubCategory(sub)
                                setShowSubCategory(!showSubcategory)
                            }} type="radio" value={sub} name="subcategory" />
                        </span>)
                    }) : null}</ul>)
                }) : "Please choose a categor first"}

            </section>
        </div>
    </>)
}

export default SubCategories;
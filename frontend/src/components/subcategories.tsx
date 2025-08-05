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
                "Speech Recognition"
            ]
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
                "Fintech"
            ]
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
                "Costume Design"
            ]
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
                "Particle Physics"
            ]
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
                "Materials Chemistry"
            ]
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
                "Zoology"
            ]
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
                "Cultural History"
            ]
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
                "Environmental Geography"
            ]
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
                "Applied Mathematics"
            ]
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
                "Education"
            ]
        }
    ]

    // 
    return (<>
        <div className="  z-[1] space-grotesk w-auto md:w-fit  ">
            <label onClick={() => setShowSubCategory(!showSubcategory)} className={`CustPoint  text-sm flex items-center justify-center gap-1 ${subCategory ? "text-indigo-700" : "text-black dark:text-white"}`} htmlFor="Category">{subCategory ? subCategory : "Subcategory"} <IoMdArrowDropdown  size={24} className={`transition-all duration-500  font-semibold ${showSubcategory === true ? "rotate-90" : "rotate-0"} `} /></label>
            <section className={`${showSubcategory ? "h-auto  py-2 gap-2 opacity-100   overflow-y-auto px-3" : "h-0 opacity-0 py-0 px-0"} bg-gradient-to-br from-gray-50 to-gray-100  dark:from-black dark:to-gray-800 text-black dark:text-white     overflow-hidden transition-all duration-500 rounded-lg border border-black/40 dark:border-white/40 relative`}>
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
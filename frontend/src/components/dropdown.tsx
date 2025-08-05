import React from "react";
import { IoMdArrowDropdown } from "react-icons/io";

type DropDownProps = {
    isVisible: boolean;
    category: string;
    setCategory: React.Dispatch<React.SetStateAction<string>>;
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const DropDown: React.FC<DropDownProps> = ({ isVisible, setIsVisible, setCategory, category }) => {


    function handleCategoryUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedCategory = e.target.value;
        setCategory(selectedCategory);
        // console.log(`Selected category: ${selectedCategory}`);
        setIsVisible(false); // Close the dropdown after selection
    }
    // top-10 left-10 md:right-10 

    const Categories = [{ name: "AI" }, { name: "Law" }, { name: "Finance" }, { name: "Fashion" }, { name: "Physics" }, { name: "Chemistry" }, { name: "Biology" }, { name: "History" }, { name: "Geography" }, { name: "MatheMatics" },{name:"Other"}]
    return (<>
        {/* <ArrowDownAz/> */}
        <div className="  z-[1] space-grotesk w-auto md:w-fit  ">
            <label onClick={() => setIsVisible(!isVisible)} className={`CustPoint  text-sm flex items-center justify-center gap-1 ${category ? "text-purple-700" : "text-black dark:text-white"}`} htmlFor="Category">{category ? category : "Category"} <IoMdArrowDropdown  size={24} className={`transition-all duration-500  font-semibold ${isVisible === true ? "rotate-90" : "rotate-0"} `} /></label>
            <section className={`${isVisible ? "h-auto  py-4 flex items-center justify-center gap-2 opacity-100   overflow-y-auto px-3" : "h-0 opacity-0 py-0 px-0"} bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-800 text-black dark:text-white    overflow-hidden transition-all duration-500 rounded-lg  flex items-start justify-center gap-1  flex-col border border-black/40 dark:border-white/40 relative `}>
                {Categories.map((cat,index) => {
                    return (<span key={index} className='flex items-center justify-between w-full    gap-3 flex-row-reverse cursor-pointer text-xs md:text-sm hover:text-lg transition-all duration-300'>
                        <input onChange={(e) => handleCategoryUpload(e)} value={cat.name} className='bg-purple-500 text-purple-400' name='category' type="radio" />
                        <label className="duration-500 cursor-pointer" htmlFor="category">{cat.name}</label>
                    </span>)
                })}
                
            </section>
        </div>

    </>)
}

export default DropDown;
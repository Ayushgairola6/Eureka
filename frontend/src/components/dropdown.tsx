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
    return (<>
        {/* <ArrowDownAz/> */}
        <div className="absolute top-5 right-5  z-[1] space-grotesk w-auto md:w-fit  ">
            <label onClick={() => setIsVisible(!isVisible)} className={`cursor-pointer  text-sm flex items-center justify-center gap-1 ${category ? "text-purple-700" : "text-black"}`} htmlFor="Category">{category ? category : "Category"} <IoMdArrowDropdown size={24} className={`transition-all duration-300  font-semibold ${isVisible === true ? "rotate-90" : "rotate-0"} `} /></label>
            <section className={`${isVisible ? "h-50 flex items-center justify-center gap-2 opacity-100 py-3 pt-10 overflow-y-auto px-3" : "h-0 opacity-0 py-0 px-0"} bg-gradient-to-br from-gray-50 to-gray-100 text-black    overflow-hidden transition-all duration-300 rounded-lg mt-3 flex items-start justify-center gap-1  flex-col border border-black/40 relative `}>
                <span className='flex items-center justify-between w-full hover:py-1 hover:px-1   gap-3 flex-row-reverse cursor-pointer text-xs md:text-sm hover:text-lg transition-all duration-300'>
                    <input onChange={(e) => handleCategoryUpload(e)} value="AI" className='bg-purple-500 text-purple-400' name='category' type="radio" />
                    <label className="duration-300 cursor-pointer" htmlFor="category">AI</label>
                </span>
                <span className='flex items-center justify-between w-full hover:py-1 hover:px-1   gap-3 flex-row-reverse cursor-pointer text-xs md:text-sm hover:text-lg transition-all duration-300'>
                    <input onChange={(e) => handleCategoryUpload(e)} value="Law" className='' name='category' type="radio" />
                    <label htmlFor="category" className="curosor-pointer">
                        Law
                    </label>
                </span>
                <span className='flex items-center justify-between w-full hover:py-1 hover:px-1   gap-3 flex-row-reverse cursor-pointer text-xs md:text-sm hover:text-lg transition-all duration-300'>
                    <input onChange={(e) => handleCategoryUpload(e)} value="Finance" className='bg-purple-500 text-purple-400' name='category' type="radio" />
                    <label className=" cursor-pointer" htmlFor="category">Finance</label>
                </span>
                <span className='flex items-center justify-between w-full hover:py-1 hover:px-1   gap-3 flex-row-reverse cursor-pointer text-xs md:text-sm hover:text-lg transition-all duration-300'>
                    <input onChange={(e) => handleCategoryUpload(e)} value="Physics" className='bg-purple-500 text-purple-400' name='category' type="radio" />
                    <label className=" duration-300 cursor-pointer" htmlFor="category">Physics</label>
                </span>
                <span className='flex items-center justify-between w-full hover:py-1 hover:px-1   gap-3 flex-row-reverse cursor-pointer text-xs md:text-sm hover:text-lg transition-all duration-300'>
                    <input onChange={(e) => handleCategoryUpload(e)} value="Chemistry" className='bg-purple-500 text-purple-400' name='category' type="radio" />
                    <label className=" duration-300 cursor-pointer" htmlFor="category">Chemistry</label>
                </span>
                <span className='flex items-center justify-between w-full hover:py-1 hover:px-1   gap-3 flex-row-reverse cursor-pointer text-xs md:text-sm hover:text-lg transition-all duration-300'>
                    <input onChange={(e) => handleCategoryUpload(e)} value="History" className='bg-purple-500 text-purple-400' name='category' type="radio" />
                    <label className=" cursor-pointer" htmlFor="category">History</label>
                </span>
                <span className='flex items-center justify-between w-full hover:py-1 hover:px-1   gap-3 flex-row-reverse cursor-pointer text-xs md:text-sm hover:text-lg transition-all duration-300'>
                    <input onChange={(e) => handleCategoryUpload(e)} value="Geography" className='bg-purple-500 text-purple-400' name='category' type="radio" />
                    <label className="duration-300 cursor-pointer" htmlFor="category">Geography</label>
                </span>
                <span className='flex items-center justify-between w-full hover:py-1 hover:px-1   gap-3 flex-row-reverse cursor-pointer text-xs md:text-sm hover:text-lg transition-all duration-300'>
                    <input onChange={(e) => handleCategoryUpload(e)} value="Math" className='bg-purple-500 text-purple-400' name='category' type="radio" />
                    <label className="duration-300 cursor-pointer" htmlFor="category">Math</label>
                </span> <span className='flex items-center justify-between w-full hover:py-1 hover:px-1   gap-3 flex-row-reverse cursor-pointer text-xs md:text-sm hover:text-lg transition-all duration-300'>
                    <input onChange={(e) => handleCategoryUpload(e)} value="Astrology" className='bg-purple-500 text-purple-400' name='category' type="radio" />
                    <label className="duration-300 cursor-pointer" htmlFor="category">Astrology</label>
                </span> 
                {/* <span className='flex items-center justify-between w-full hover:py-1 hover:px-1   gap-3 flex-row-reverse cursor-pointer text-xs md:text-sm hover:text-lg transition-all duration-300'>
                    <input onChange={(e) => handleCategoryUpload(e)} value="AI" className='bg-purple-500 text-purple-400' name='category' type="radio" />
                    <label className="duration-300 cursor-pointer" htmlFor="category">AI</label>
                </span> <span className='flex items-center justify-between w-full hover:py-1 hover:px-1   gap-3 flex-row-reverse cursor-pointer text-xs md:text-sm hover:text-lg transition-all duration-300'>
                    <input onChange={(e) => handleCategoryUpload(e)} value="AI" className='bg-purple-500 text-purple-400' name='category' type="radio" />
                    <label className="duration-300 cursor-pointer" htmlFor="category">AI</label>
                </span> <span className='flex items-center justify-between w-full hover:py-1 hover:px-1   gap-3 flex-row-reverse cursor-pointer text-xs md:text-sm hover:text-lg transition-all duration-300'>
                    <input onChange={(e) => handleCategoryUpload(e)} value="AI" className='bg-purple-500 text-purple-400' name='category' type="radio" />
                    <label className="duration-300 cursor-pointer" htmlFor="category">AI</label>
                </span> <span className='flex items-center justify-between w-full hover:py-1 hover:px-1   gap-3 flex-row-reverse cursor-pointer text-xs md:text-sm hover:text-lg transition-all duration-300'>
                    <input onChange={(e) => handleCategoryUpload(e)} value="AI" className='bg-purple-500 text-purple-400' name='category' type="radio" />
                    <label className="duration-300 cursor-pointer" htmlFor="category">AI</label>
                </span> */}
            </section>
        </div>

    </>)
}

export default DropDown;
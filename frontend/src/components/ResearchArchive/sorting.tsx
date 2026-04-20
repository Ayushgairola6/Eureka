import { useState } from 'react';
import { BiSortAlt2 } from "react-icons/bi"

export const Sort = () => {
    const [toggle, setToggle] = useState(false);
    const [filter, setFilter] = useState<string>("");
    return (<>
        <div className='relative'>
            <button onClick={() => setToggle(!toggle)} className="bai-jamjuree-semibold text-xs flex items-center justify-center gap-3 bg-neutral-200 dark:bg-neutral-900 rounded-sm p-2 cursor-pointer  ">
                Sort <BiSortAlt2 />
            </button>
            <section className={`space-grotesk text-xs absolute ${toggle === true ? "block" : "hidden"} grid grid-cols-1  top-2 -left-15 z-20 bg-neutral-900 text-white dark:text-black dark:bg-gray-100 rounded-sm`} >
                {["Created", "Title", "Source count", "Status"].map((item, index) => {
                    return (<>
                        <ul onClick={() => {
                            setFilter(item)
                            setToggle(!toggle)
                        }} className={`px-1 py-1 ${filter === item ? "bg-green-600/40" : ""} cursor-pointer`} key={index}>{item}</ul>
                    </>)
                })}

            </section>
        </div>
    </>)
}
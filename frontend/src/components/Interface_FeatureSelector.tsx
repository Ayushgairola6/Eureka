import { CheckCheck, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react"
import { SetMode, setQueryType, setSearchDepth, setSelectedDoc, setShowOptions } from "../store/InterfaceSlice";
import { useAppDispatch, useAppSelector } from '../store/hooks';
// import { toast } from "sonner";

export const InterfaceFeatureSelector = ({ showFeatures, setShowFeatures }: any) => {
    // const { user } = useAppSelector(s => s.auth);

    const [selected, setSelected] = useState<string>('Web Search');
    return (<>
        <section className={` flex flex-col space-grotesk dark:bg-neutral-950 bg-white fixed bottom-0 left-0 ${showFeatures === true ? "translate-x-0" : "-translate-x-400"}  z-[10] transition-all duration-500 w-full md:w-3/5 p-1 border rounded-sm`}>
            <section className="flex items-center justify-between px-4 ">
                <h2 className="space-grotesk text-md border-b text-black dark:text-white mb-2">Features with dedicated scope</h2>
                <button onClick={() => setShowFeatures(false)} className={`dark:bg-neutral-900 p-2 bg-white text-black dark:text-white rounded-md  transition-all duration-300 ${showFeatures === true ? "-rotate-180" : "-rotate-180"}`}> <ChevronRight size={17} /> </button>
            </section>
            <div className={`h-fit   left-0  p-2  w-full    `}>


                <ul className='flex items-center justify-between px-2 py-1 '>
                    <section className='flex flex-col'>
                        <label className='text-sm' htmlFor="">Basic Search</label>
                        <span className='font-sans text-[11px] text-gray-500'>
                            Perform basic low depth web-search
                        </span>
                    </section>

                    {ToggleButton('Web Search', selected, setSelected)}

                </ul>
                <ul className='flex items-center justify-between px-2 py-1 '>
                    <section className='flex flex-col'>
                        <label className='text-sm' htmlFor="">Turbo Search</label>
                        <span className='font-sans text-[11px] text-gray-500'>
                            Get results from vast and variety of sources
                        </span>
                    </section>

                    <div className='flex items-center justify-center gap-2'>
                        {ToggleButton('deep_web', selected, setSelected)}
                        {/* {user?.IsPremiumUser === false && <LockIcon size={14} />} */}

                    </div>

                </ul>
                <ul className='flex items-center justify-between px-2 py-1'>
                    <section className='flex flex-col'>
                        <label className='text-sm' htmlFor="">Analyst Research</label>
                        <span className='font-sans text-[11px] text-gray-500'>
                            Fully controlled agentic research
                        </span>
                    </section>
                    <div className='flex items-center justify-center gap-2'>

                        {ToggleButton('Analyst', selected, setSelected)}
                        {/* {user?.IsPremiumUser === false && <LockIcon size={14} />} */}
                    </div >
                </ul>
                <ul className='flex items-center justify-between px-2 py-1'>
                    <section className='flex flex-col'>
                        <label className='text-sm' htmlFor="">Synthesis Mode</label>
                        <span className='font-sans text-[11px] text-gray-500'>
                            Agentic document and research reasoning
                        </span>
                    </section>
                    <div className='flex items-center justify-center gap-2'>

                        {ToggleButton('Synthesis', selected, setSelected)}
                        {/* {user?.IsPremiumUser === false && <LockIcon size={14} />} */}
                    </div >
                </ul>


            </div>
        </section>

    </>)
}

function ToggleButton(value: string, selected: string, setSelected: any) {

    const { selectedDoc, shwoOptions } = useAppSelector(s => s.interface)

    useEffect(() => {
        if (!selected) return;



        // Reset doc selection for all modes
        if (selectedDoc) dispatch(setSelectedDoc(""));

        // Reset options menu if open
        if (shwoOptions === true) dispatch(setShowOptions(false));

        switch (selected) {
            case 'Web Search':
                dispatch(SetMode("Web Search"));
                dispatch(setSearchDepth("surface_web"));
                dispatch(setQueryType("Web Search"))

                break;

            case 'deep_web':
                dispatch(SetMode
                    ("Web Search"));
                dispatch(setSearchDepth("deep_web"));
                dispatch(setQueryType("Web Search"))

                break;

            case 'Analyst':
                dispatch(SetMode("Analyst"));
                dispatch(setSearchDepth("surface_web"));
                dispatch(setQueryType("Analyst"))

                break;

            case 'Synthesis':
                dispatch(SetMode("Synthesis"));
                dispatch(setQueryType("Synthesis"))
                break;
        }
    }, [selected]);


    const dispatch = useAppDispatch();
    return (<>
        <div onClick={() => {
            // if (user?.IsPremiumUser === false && (value === 'deep_web' || value === "Synthesis" || value === "Analyst")) {
            //     toast.info("Upgrade your plan to access these features")
            //     return;
            // }
            setSelected(value)
        }} className={`border h-5 w-10 rounded-xl relative cursor-pointer   ${value === selected ? "bg-green-600/10 border-green-500" : "dark:bg-neutral-900 bg-gray-100 border-gray-500 "}`}>
            <ul role='button'
                onClick={() => {
                    // if the mode is web-search
                    if (setSelectedDoc) dispatch(setSelectedDoc(""));


                }}
                className={`${selected === value ? "translate-x-[100%] bg-emerald-500" : "-translate-x-0 dark:bg-white bg-black"} rounded-full absolute  text-white dark:text-black h-full w-1/2 transition-all duration-300 flex items-center justify-center`}>
                {selected === value && <CheckCheck size={10} />}
            </ul>
        </div>

    </>)
}

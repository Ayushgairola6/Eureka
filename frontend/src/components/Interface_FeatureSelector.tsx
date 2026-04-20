import { CheckCheck, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react"
import { setIsVerificationMode, setQueryType, setSearchDepth, setSelectedDoc, setShowOptions } from "../store/InterfaceSlice";
import { useAppDispatch, useAppSelector } from '../store/hooks';

export const InterfaceFeatureSelector = ({ showFeatures, setShowFeatures }: any) => {

    const [selected, setSelected] = useState<string>('Web Search');
    return (<>
        <section className={` flex flex-col space-grotesk dark:bg-neutral-950 bg-white fixed ${showFeatures === true ? "translate-y-118" : "translate-y-400"} z-[10] transition-all duration-500 w-full md:w-3/5 p-1 border rounded-sm`}>
            <section className="flex items-center justify-between px-4">
                <h2 className="space-grotesk text-md border-b text-black dark:text-white mb-2">Features with dedicated scope</h2>
                <button onClick={() => setShowFeatures(false)} className='dark:bg-neutral-900 p-2 bg-white text-black dark:text-white rounded-md'><ChevronDown size={13} /></button>
            </section>
            <div className={`h-fit   left-0  p-2  w-full  mx-auto  `}>


                <ul className='flex items-center justify-between px-2 py-1 '>
                    <section className='flex flex-col'>
                        <label className='text-sm' htmlFor="">Basic Search</label>
                        <span className='font-sans text-[11px] text-gray-500'>
                            Perform basic web search
                        </span>
                    </section>

                    {ToggleButton('Web Search', selected, setSelected)}

                </ul>
                <ul className='flex items-center justify-between px-2 py-1 '>
                    <section className='flex flex-col'>
                        <label className='text-sm' htmlFor="">Deep Search</label>
                        <span className='font-sans text-[11px] text-gray-500'>
                            Get results from vast sources
                        </span>
                    </section>

                    {ToggleButton('deep_web', selected, setSelected)}

                </ul>
                <ul className='flex items-center justify-between px-2 py-1'>
                    <section className='flex flex-col'>
                        <label className='text-sm' htmlFor="">Analyst Research</label>
                        <span className='font-sans text-[11px] text-gray-500'>
                            Fully controlled agentic research
                        </span>
                    </section>

                    {ToggleButton('Analyst', selected, setSelected)}

                </ul>
                <ul className='flex items-center justify-between px-2 py-1'>
                    <section className='flex flex-col'>
                        <label className='text-sm' htmlFor="">Synthesis Mode</label>
                        <span className='font-sans text-[11px] text-gray-500'>
                            Agentic document and research reasoning
                        </span>
                    </section>

                    {ToggleButton('Synthesis', selected, setSelected)}

                </ul>


            </div>
        </section>

    </>)
}

function ToggleButton(value: string, selected: string, setSelected: any) {

    const { selectedDoc, shwoOptions, isVerificatioMode } = useAppSelector(s => s.interface)
    useEffect(() => {
        if (!selected) return;

        if (selected === 'Web Search' || selected === 'Analyst' || selected === 'deep_web') {
            dispatch(setQueryType("Web Search"))
            dispatch(setSearchDepth("surface_web"));

            if (selectedDoc) dispatch(setSelectedDoc(""));
        }
        // if deep search request 
        else if (selected === 'deep_web') {
            dispatch(setSearchDepth("deep_web"));
            if (isVerificatioMode === true) dispatch(setIsVerificationMode())

        }

        if (selected === "Synthesis") {
            dispatch(setQueryType("Synthesis"));
            if (selectedDoc) dispatch(setSelectedDoc(""));
            if (shwoOptions === true) dispatch(setShowOptions(!shwoOptions));
            if (isVerificatioMode === true) dispatch(setIsVerificationMode())

        }


        else if (selected === 'Analyst') {
            dispatch(setQueryType("Web Search"))
            dispatch(setIsVerificationMode())

        }



    }, [selected])


    const dispatch = useAppDispatch();
    return (<>
        <div onClick={() => setSelected(value)} className={`border h-5 w-10 rounded-xl relative cursor-pointer   ${value === selected ? "bg-green-600/10 border-green-500" : "dark:bg-neutral-900 bg-gray-100 border-gray-500 "}`}>
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

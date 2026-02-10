import React from "react";
import WebSearch from "./webSearch";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import {
  setSelectedDoc,
  setQueryType,
  setShowOptions,
} from "../store/InterfaceSlice";
import { MdOutlineScience } from "react-icons/md";

type props = {
  Showfeatures: boolean;
  SetShowFeatures: React.Dispatch<React.SetStateAction<boolean>>;
};
const AccessBar: React.FC<props> = ({ Showfeatures }) => {
  const dispatch = useAppDispatch();
  const { selectedDoc, queryType, shwoOptions } = useAppSelector(
    (state) => state.interface
  );
  return (
    <>
      <div
        className={`absolute bottom-10 
    ${
      Showfeatures
        ? "opacity-100 pointer-events-auto"
        : "opacity-0 pointer-events-none"
    } 
    dark:bg-gray-100 dark:text-black text-white bg-black 
    space-grotesk p-1 
    text-sm md:text-base 
    w-40  
    rounded-md shadow-lg 
    space-y-2 
    z-[99] transition-all duration-300 
    flex flex-col items-normal justify-start`}
      >
        {/* Web Search Component */}
        <WebSearch selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} />

        {/* Synthesis Button */}
        <button
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 
      ${
        queryType === "Synthesis"
          ? "text-green-500 bg-green-100 dark:bg-green-200"
          : "hover:text-green-400 hover:bg-teal-400/20"
      }`}
          onClick={() => {
            if (queryType === "Synthesis") {
              dispatch(setQueryType(""));
              return;
            }
            dispatch(setQueryType("Synthesis"));
            if (selectedDoc) dispatch(setSelectedDoc(""));
            if (shwoOptions === true) dispatch(setShowOptions(!shwoOptions));
          }}
        >
          <MdOutlineScience size={18} />
          <span>Synthesis</span>
        </button>
      </div>
    </>
  );
};

export default AccessBar;

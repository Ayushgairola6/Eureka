// import { BiLogoInternetExplorer } from "react-icons/bi";
// import { useAppDispatch, useAppSelector } from "../store/hooks";
// import {
//   setQueryType,
//   setShowOptions,
//   setShowType,
// } from "../store/InterfaceSlice";
// import type React from "react";
// type WebSearchProps = {
//   selectedDoc: any;
//   setSelectedDoc: any;
// };
// const WebSearch: React.FC<WebSearchProps> = ({
//   selectedDoc,
//   setSelectedDoc,
// }) => {
//   const dispatch = useAppDispatch();

//   const { queryType, shwoOptions, showType } = useAppSelector(
//     (state) => state.interface
//   );
//   return (
//     <>
//       <button
//         onClick={() => {
//           if (queryType === "Web Search") {
//             dispatch(setQueryType(""));
//             return;
//           }
//           dispatch(setQueryType("Web Search"));
//           if (selectedDoc) dispatch(setSelectedDoc(""));
//           if (shwoOptions === true) dispatch(setShowOptions(!shwoOptions));
//           if (showType === true) dispatch(setShowType(false));
//         }}
//         className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors duration-200  ${
//           queryType === "Web Search"
//             ? "text-green-500 bg-green-100 dark:bg-green-200"
//             : "hover:text-green-400 hover:bg-teal-400/20"
//         }`}
//       >
//         <BiLogoInternetExplorer size={18} />
//         <span>Web Search</span>
//       </button>
//     </>
//   );
// };

// export default WebSearch;
import { BiLayer, BiLogoInternetExplorer } from "react-icons/bi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setQueryType,
  setShowOptions,
  setShowType, setSearchDepth
} from "../store/InterfaceSlice";
import React from "react";
type WebSearchProps = {
  selectedDoc: any;
  setSelectedDoc: any;
};
const WebSearch: React.FC<WebSearchProps> = ({
  selectedDoc,
  setSelectedDoc,
}) => {
  const dispatch = useAppDispatch();

  const { queryType, shwoOptions, showType, search_depth } = useAppSelector(
    (state) => state.interface
  );
  const [showWebMenu, setShowWebMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null); // To handle clicking outside to close

  // Helper to check if any web search is active
  const isWebActive = ["surface_web", "deep_web"].includes(queryType);
  React.useEffect(() => {
    function handleClickOutside(event: any) {
      if (menuRef.current && !menuRef.current?.contains(event?.target)) {
        setShowWebMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <>
      <div className="relative inline-block" ref={menuRef}>
        {/* --- Main Trigger Button --- */}
        <button
          onClick={() => {
            // If web search is already active, just toggle the menu so user can switch types
            // If it's NOT active, open the menu so they can choose one
            setShowWebMenu(!showWebMenu);
            if (queryType === "Web Search") {
              dispatch(setQueryType(""));
              return;
            }
            dispatch(setQueryType("Web Search"));
            if (selectedDoc) dispatch(setSelectedDoc(""));
            if (shwoOptions === true) dispatch(setShowOptions(!shwoOptions));
            if (showType === true) dispatch(setShowType(false));

          }}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${isWebActive
            ? "text-green-600 bg-green-100 dark:bg-green-500/20  "
            : "hover:text-green-500 hover:bg-teal-400/10 text-white dark:text-black"
            }`}
        >
          <BiLogoInternetExplorer size={18} />
          <span>
            {search_depth === "deep_web" ? "Deep Web" : search_depth === "surface_web" ? "Surface Web" : "Web Search"}
          </span>
        </button>

        {/* --- Sub-Options Dropdown --- */}
        {showWebMenu && (
          <div className="absolute left-15 top-6  w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-1 z-50 flex flex-col gap-1 overflow-hidden animate-in fade-in zoom-in duration-200">

            {/* Option 1: Surface Web */}
            <button
              onClick={() => {
                dispatch(setSearchDepth("surface_web"));
                if (selectedDoc) dispatch(setSelectedDoc(""));
                setShowWebMenu(false); // Close menu after selection
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${search_depth === "surface_web"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                }`}
            >
              <BiLogoInternetExplorer size={16} /> {/* Standard Web Icon */}
              <div className="flex flex-col items-start">
                <span className="font-medium">Surface Web</span>
                <span className="text-[10px] opacity-60">Standard web Search</span>
              </div>
            </button>

            {/* Option 2: Deep Web */}
            <button
              onClick={() => {
                dispatch(setSearchDepth("deep_web"));
                if (selectedDoc) dispatch(setSelectedDoc(""));
                setShowWebMenu(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors w-full ${search_depth === "deep_web"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                }`}
            >
              <BiLayer size={16} /> {/* Layer Icon for "Deep" */}
              <div className="flex flex-col items-start">
                <span className="font-medium">Deep Web</span>
                <span className="text-[10px] opacity-60">Dorking, PDF & Reports</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default WebSearch;

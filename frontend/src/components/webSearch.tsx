import { BiLogoInternetExplorer } from "react-icons/bi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setQueryType,
  setShowOptions,
  setShowType,
} from "../store/InterfaceSlice";
import type React from "react";
type WebSearchProps = {
  selectedDoc: any;
  setSelectedDoc: any;
};
const WebSearch: React.FC<WebSearchProps> = ({
  selectedDoc,
  setSelectedDoc,
}) => {
  const dispatch = useAppDispatch();

  const { queryType, shwoOptions, showType } = useAppSelector(
    (state) => state.interface
  );
  return (
    <>
      <button
        onClick={() => {
          if (queryType === "Web Search") {
            dispatch(setQueryType(""));
            return;
          }
          dispatch(setQueryType("Web Search"));
          if (selectedDoc) dispatch(setSelectedDoc(""));
          if (shwoOptions === true) dispatch(setShowOptions(!shwoOptions));
          if (showType === true) dispatch(setShowType(false));
        }}
        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors duration-200  ${
          queryType === "Web Search"
            ? "text-green-500 bg-green-100 dark:bg-green-200"
            : "hover:text-green-400 hover:bg-teal-400/20"
        }`}
      >
        <BiLogoInternetExplorer size={18} />
        <span>Web Search</span>
      </button>
    </>
  );
};

export default WebSearch;

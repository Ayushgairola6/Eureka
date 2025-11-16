import { LiaInternetExplorer } from "react-icons/lia";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setQueryType, setShowOptions } from "../store/InterfaceSlice";
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

  const { queryType, shwoOptions } = useAppSelector((state) => state.interface);
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
        }}
        className={` rounded-full p-2 ${
          queryType === "Web Search"
            ? "bg-amber-700 "
            : "dark:bg-white/15 bg-black/15"
        } cursor-pointer`}
      >
        <LiaInternetExplorer />
      </button>
    </>
  );
};

export default WebSearch;

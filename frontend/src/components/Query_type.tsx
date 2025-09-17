import { MdSummarize, MdQuestionAnswer } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../store/hooks.tsx";
import { setQueryType, setShowType } from "../store/InterfaceSlice.ts";

const QueryType = () => {
  const dispatch = useAppDispatch();
  const { queryType, showType } = useAppSelector((state) => state.interface);
  return (
    <>
      <div
        onClick={(e) => {
          dispatch(setShowType(!showType));
          e.stopPropagation();
        }}
        className={`absolute z-10  w-48 rounded-md shadow-lg bg-gray-900 border border-gray-700 overflow-hidden transition-all duration-300 bottom-10 left-4 ${
          showType
            ? "opacity-100 scale-y-100"
            : "opacity-0 scale-y-95 pointer-events-none"
        }`}
      >
        <div className="p-2 space-y-2">
          <button
            onClick={() => {
              const value = queryType === "Summary" ? "" : "Summary";
              dispatch(setQueryType(value));
              dispatch(setShowType(false));
            }}
            className={`flex items-center w-full px-4 py-2 text-sm space-grotesk transition-colors rounded-lg ${
              queryType === "Summary"
                ? "bg-indigo-400 text-black"
                : "text-gray-300 hover:bg-gray-300 hover:text-black"
            }`}
          >
            <MdSummarize className="mr-2" />
            Summary (beta)
          </button>
          <button
            onClick={() => {
              const value = queryType === "QNA" ? "" : "QNA";
              dispatch(setQueryType(value));
              dispatch(setShowType(false));
            }}
            className={`flex items-center w-full px-4 py-2 text-sm space-grotesk transition-colors rounded-lg ${
              queryType === "QNA"
                ? "bg-indigo-400 text-black"
                : "text-gray-300 hover:bg-gray-300 hover:text-black"
            }`}
          >
            <MdQuestionAnswer className="mr-2" />
            Q&A Mode
          </button>
          {/* <button
            onClick={() => {
              const value = queryType === "WebSearch" ? "" : "WebSearch";
              dispatch(setQueryType(value));
              dispatch(setShowType(false));
            }}
            className={`flex items-center w-full px-4 py-2 text-sm space-grotesk transition-colors rounded-lg ${
              queryType === "Live"
                ? "bg-indigo-400 text-black"
                : "text-gray-300 hover:bg-gray-300 hover:text-black"
            }`}
          >
            <MdQuestionAnswer className="mr-2" />
            WebSearch
          </button> */}
        </div>
      </div>
    </>
  );
};

export default QueryType;

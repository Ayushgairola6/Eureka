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
        className={`absolute z-10  w-48 rounded-md shadow-lg dark:bg-gray-50 bg-black text-white  dark:text-black border border-gray-700 overflow-hidden transition-all duration-300 bottom-10 left-4 ${
          showType === true
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
                ? "bg-green-400 "
                : "  hover:text-black hover:bg-teal-400/20"
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
              queryType === "QNA" ? "bg-green-400 " : " hover:bg-teal-400/20 "
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

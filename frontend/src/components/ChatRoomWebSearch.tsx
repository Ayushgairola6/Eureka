import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { FiSearch } from "react-icons/fi";
import { whoIsTyping } from "../store/websockteSlice";
import { setRoomWebSearchDepth } from '../store/chatRoomSlice';
import { ChevronDown } from "lucide-react";

type QuerySectionProps = {
  isQuerying: boolean;
  handleRoomWebSearch: any;
  aiQuery: string;
  setAiQuery: any;
  showWebSearchPanel: any;
};

const WebSearchPanel: React.FC<QuerySectionProps> = ({
  setAiQuery,
  isQuerying,
  aiQuery,
  handleRoomWebSearch,
  showWebSearchPanel,
}) => {
  const dispatch = useAppDispatch();
  const { roomWebSearchDepth } = useAppSelector(state => state.chats);
  const [showFull, setShowFull] = React.useState(false);
  return (
    <>
      {showWebSearchPanel && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 border-b border-gray-200 dark:border-gray-700 bai-jamjuree-regular mt-1">
          <div className="max-w-6xl mx-auto">

            <h1 className="text-start bai-jamjuree-semibold text-md  dark:text-white text-gray-800  mb-2">
              Pick a depth and find what you are looking for
            </h1>
            <ul onClick={() => setShowFull(!showFull)} className="flex items-center justify-start gap-2 cursor-pointer text-green-500">
              {roomWebSearchDepth || "searchDepth"}
              <button className={`${showFull === false ? "rotate-0" : "rotate-180"} transition-all duration-300`}> <ChevronDown size={15} /> </button>
            </ul>
            {/* search depth selector */}
            <div className={`${showFull === false ? "h-0 w-0 overflow-hidden" : "h-fit w-30"} rounded-xs bg-black text-white dark:text-black dark:bg-gray-200 bai-jamjuree-semibold flex flex-col items-center justify-center   transition-all duration-300`}>
              {['deep_web', 'surface_web'].map((item, index) => {
                return (<ul onClick={() => dispatch(setRoomWebSearchDepth(item))} key={index} className={`w-full p-1 ${roomWebSearchDepth === item ? "bg-cyan-600/40" : ""} uppercase text-sm`}>{item}</ul>)
              })}

            </div>
            <div className="flex items-center gap-2 my-2">
              <FiSearch className="text-gray-500" />
              <input
                onFocus={() => dispatch(whoIsTyping(""))}
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder={`Search something from the web`}
                className="flex-1 bg-transparent border-none focus:outline-none"
                onKeyUp={(e) => e.key === "Enter" && handleRoomWebSearch()}
              />
              <button
                onClick={handleRoomWebSearch}
                disabled={isQuerying === true}
                className="bg-black dark:bg-white dark:text-black text-white px-3 py-1 rounded text-sm disabled:opacity-50 bai-jamjuree-bold"
              >
                {isQuerying ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default WebSearchPanel;

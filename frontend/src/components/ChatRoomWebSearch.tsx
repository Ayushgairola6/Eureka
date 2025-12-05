import React from "react";
import { useAppDispatch } from "../store/hooks";
import { FiSearch } from "react-icons/fi";
import { whoIsTyping } from "../store/websockteSlice";

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
  return (
    <>
      {showWebSearchPanel && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 border-b border-gray-200 dark:border-gray-700 bai-jamjuree-regular mt-1">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-start bai-jamjuree-semibold text-md  text-sky-400 mb-2">
              Ask Anything from the Web
            </h1>
            <div className="flex items-center gap-2">
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                {isQuerying ? "Analyzing..." : "Ask"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default WebSearchPanel;

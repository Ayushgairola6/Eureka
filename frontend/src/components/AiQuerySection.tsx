import React from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { FiSearch } from "react-icons/fi";
import { whoIsTyping } from "../store/websockteSlice";

type QuerySectionProps = {
  isQuerying: boolean;
  handleQueryDocument: any;
  aiQuery: string;
  setAiQuery: any;
};

const AiQuerySection: React.FC<QuerySectionProps> = ({
  setAiQuery,
  isQuerying,
  handleQueryDocument,
  aiQuery,
}) => {
  const dispatch = useAppDispatch();
  const { chatRoomFile } = useAppSelector((state) => state.socket);
  return (
    <>
      {chatRoomFile !== null && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 border-b border-gray-200 dark:border-gray-700 bai-jamjuree-regular">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2">
              <FiSearch className="text-gray-500" />
              <input
                onFocus={() => dispatch(whoIsTyping(""))}
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder={`Ask anything about ${chatRoomFile.feedback}...`}
                className="flex-1 bg-transparent border-none focus:outline-none"
                onKeyUp={(e) => e.key === "Enter" && handleQueryDocument()}
              />
              <button
                onClick={handleQueryDocument}
                disabled={isQuerying}
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
export default AiQuerySection;

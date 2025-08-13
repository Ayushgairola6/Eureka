import type React from "react";
import { MdSummarize, MdQuestionAnswer } from "react-icons/md";
type QueryTypeProps = {
    queryType: string;
    setQueryType: React.Dispatch<React.SetStateAction<string>>;
    showType: boolean;
    setShowType: React.Dispatch<React.SetStateAction<boolean>>;
}
const QueryType: React.FC<QueryTypeProps> = ({ queryType, setQueryType, showType, setShowType }) => {

    return (<>

        <div onClick={(e) => {
            setShowType(!showType)
            e.stopPropagation()
        }}
            className={`absolute z-10  w-48 rounded-md shadow-lg bg-gray-900 border border-gray-700 overflow-hidden transition-all duration-300 bottom-10 left-4 ${showType
                ? "opacity-100 scale-y-100"
                : "opacity-0 scale-y-95 pointer-events-none"
                }`}
        >
            <div className="p-2 space-y-2">
                <button
                    onClick={() => {
                        setQueryType(prev => prev === "Summary" ? "" : "Summary");
                        setShowType(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm space-grotesk transition-colors rounded-lg ${queryType === "Summary"
                        ? "bg-indigo-400 text-black"
                        : "text-gray-300 hover:bg-gray-300 hover:text-black"
                        }`}
                >
                    <MdSummarize className="mr-2" />
                    Summary (beta)
                </button>
                <button
                    onClick={() => {
                        setQueryType(prev => prev === "QNA" ? "" : "QNA");
                        setShowType(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm space-grotesk transition-colors rounded-lg ${queryType === "QNA"
                        ? "bg-indigo-400 text-black"
                        : "text-gray-300 hover:bg-gray-300 hover:text-black"
                        }`}
                >
                    <MdQuestionAnswer className="mr-2" />
                    Q&A Mode
                </button>
            </div>
        </div>
    </>)
}

export default QueryType;
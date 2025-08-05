import type React from "react";
type QueryTypeProps = {
    queryType: string;
    setQueryType: React.Dispatch<React.SetStateAction<string>>;
    showType: boolean;
    setShowType: React.Dispatch<React.SetStateAction<boolean>>;
}
const QueryType: React.FC<QueryTypeProps> = ({ setQueryType, showType, setShowType }) => {

    return (<>
        <div onClick={() => setShowType(!showType)} className={`absolute bg-black bottom-10 left-5 p-2 rounded-lg space-grotesk text-white text-sm ${showType ? "opacity-100 h-auto" : "opacity-0 h-0"} transition-all duration-300`}>
            <ul onClick={() => setQueryType((prev) => prev === "Summary" ? "" : "Summary")} className="border-b border-white">Summary</ul>
            <ul onClick={() => setQueryType((prev) => prev === "QNA" ? "" : "QNA")} className="">QnA</ul>

        </div>
    </>)
}

export default QueryType;
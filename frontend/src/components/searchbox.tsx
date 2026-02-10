import React from "react";

type SearchBoxProps = {
  SearchResult: SearchResultData[];
};

const SearchBox: React.FC<SearchBoxProps> = ({ SearchResult }) => {
  return (
    <>
      <div className="bg-gray-200 dark:bg-gray-900 absolute -bottom-42 left-0 w-full h-40  z-[2] opacity-100 border border-gray-400 rounded-sm overflow-scroll">
        {SearchResult.map((res) => {
          return (
            <>
              <ul
                key={`rers=${res}`}
                className="space-grotesk dark:bg-white/5 bg-black/5 text-black dark:text-white text-sm px-1 py-1 line-clamp-1"
              >
                {res.question}
              </ul>
            </>
          );
        })}
      </div>
    </>
  );
};

export default SearchBox;
interface SearchResultData {
  created_at: string;
  question: string;
  AI_response: string;
}

import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router";

const Query_Doc = () => {
  return (
    <>
      {/* Query Document */}
      <div className="bg-white dark:bg-black border p-6 sm:p-8 w-full flex flex-col items-center gap-6 md:gap-8 ">
        <div className="m-auto flex flex-col gap-2 items-center justify-center w-full">
          <h1 className="bai-jamjuree-semibold text-base sm:text-lg flex items-center justify-center gap-2 text-gray-800 dark:text-gray-100">
            Query Document
          </h1>
          <div className="w-full bg-gray-900 text-white dark:bg-white/10 dark:text-sky-300 p-3 rounded-lg overflow-x-auto">
            <pre className="font-mono text-xs sm:text-sm">
              {`const response = await AntiNode.queryDocument(document_id, query , query_type);`}
            </pre>
          </div>
          <p className="bai-jamjuree-regular text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
            Use this method to query document of your choice.
            <br />
            <br />
            <span className="font-semibold text-gray-900 dark:text-white">
              Parameters:
            </span>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  document_id
                </span>{" "}
                - The specific document you want to query
              </li>
              <li>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  query
                </span>{" "}
                - The specific question to ask about the document
              </li>
              <li>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  query_type
                </span>{" "}
                - Accepts two values:
                <ul className="list-[circle] pl-5 mt-1.5 space-y-1.5">
                  <li>
                    <span className="font-mono bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                      "Summary"
                    </span>{" "}
                    - Summarizes the document
                  </li>
                  <li>
                    <span className="font-mono bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">
                      "QNA"
                    </span>{" "}
                    - Enables chat with the document
                  </li>
                </ul>
              </li>
            </ul>
          </p>
          <h2 className="bai-jamjuree-semibold text-base sm:text-lg flex items-center justify-center gap-2 text-gray-800 dark:text-gray-100">
            Response
          </h2>
          <div className="w-full bg-gray-900 text-white dark:bg-white/10 dark:text-sky-300 p-3 rounded-lg overflow-x-auto">
            <pre className="font-mono text-xs sm:text-sm mt-3">
              {`{message:"generated"},answer:"AI generated response based on the query_type"`}
            </pre>
          </div>
        </div>
        <Link
          to="/Api/AntiNodeUploading_Documents"
          className="px-5 py-2.5 sm:px-6 sm:py-3  text-green-400 rounded-xl bai-jamjuree-semibold transition-all duration-300 inline-flex items-center gap-2 text-sm sm:text-base"
        >
          Upload Documents
          <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </Link>
      </div>
    </>
  );
};

export default Query_Doc;

import { Link } from "react-router";
import { FaCode, FaLock, FaKey, FaRocket } from "react-icons/fa";
import { FiTool, FiArrowRight } from "react-icons/fi";
// import { RiLockPasswordLine } from "react-icons/ri";
const API_functions = () => {
  return (
    <div className="bg-white dark:bg-black  border  p-6 sm:p-8 w-full flex flex-col items-center gap-6 md:gap-8 ">
      {/* Header Section */}
      <div className="text-center space-y-3 w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl bai-jamjuree-semibold text-gray-900 dark:text-white">
          AntiNode SDK
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto space-grotesk">
          Programmatic access to your{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            private knowledge base
          </span>{" "}
          with just a few lines of code
        </p>
        <div className="flex justify-center gap-2 space-grotesk flex-wrap">
          <span className="inline-flex items-center justify-center gap-x-1.5 py-1 px-2 sm:py-1.5 sm:px-3 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">
            <FaCode className="w-3 h-3 text-indigo-600 dark:text-indigo-300" />
            Developer Friendly
          </span>
          <span className="inline-flex items-center justify-center gap-x-1.5 py-1 px-2 sm:py-1.5 sm:px-3 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
            <FaLock className="w-3 h-3 text-purple-600 dark:text-purple-300" />
            End-to-End Secure
          </span>
        </div>
      </div>

      {/* Installation */}
      <div className="w-full p-4 bg-gray-50 dark:bg-white/10 rounded-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 bai-jamjuree-semibold">
          <FiTool className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
          Installation
        </h2>
        <div className="mt-3 bg-gray-900 text-white dark:bg-white/10   rounded-lg p-4 overflow-x-auto">
          <pre className="text-gray-100 text-sm font-mono">
            <code>npm install AntiNode1</code>
          </pre>
        </div>
      </div>

      {/* SDK Features */}
      <div className="w-full px-2 sm:px-4 space-y-6">
        {/* AntiNodeClient */}
        <div className="flex flex-col gap-2 items-center justify-center">
          <h1 className="bai-jamjuree-semibold text-base sm:text-lg flex items-center justify-center gap-2 text-gray-800 dark:text-gray-100">
            AntiNodeSDK Client
          </h1>
          <div className="w-full bg-gray-900 text-white dark:bg-white/10 dark:text-sky-300 p-3 rounded-lg overflow-x-auto">
            <pre className="font-mono text-xs sm:text-sm">
              {`const AntiNode= newAntiNodeNodeient({
  apiKey: 'YOUR_API_KEY'
})`}
            </pre>
          </div>
        </div>

        {/* Get Documents */}
        <div className="flex flex-col gap-2 items-center justify-center">
          <h1 className="bai-jamjuree-semibold text-base sm:text-lg flex items-center justify-center gap-2 text-gray-800 dark:text-gray-100">
            1. Get All Documents
          </h1>
          <div className="w-full bg-gray-900 text-white dark:bg-white/10 dark:text-sky-300 p-3 rounded-lg overflow-x-auto">
            <pre className="font-mono text-xs sm:text-sm">
              {`const documents = await AntiNodeGetDocumentList();`}
            </pre>
          </div>
          {/* here willl be the description */}
          <p className="bai-jamjuree-regular text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
            This method will return all the information of private documents
            uploaded by you in the following format:
          </p>

          <div className="bg-gray-900 dark:bg-white/10 rounded-lg p-4 overflow-x-auto mb-6 w-full">
            <pre className="text-gray-100 text-xs sm:text-sm font-mono">
              <code>{`{
  "documents": [
    {
      "document_id": "doc_12345",
      "chunk_count:"Number of chunks stored"
      "title": "Research Paper on Quantum Computing",
      "upload_date": "2023-11-15T08:30:00Z",
      "tags": ["quantum", "research", "physics"]
    },
    {
      "document_id": "doc_67890",
      "title": "Project Requirements Document",
      "upload_date": "2023-11-18T14:45:00Z",
      "tags": ["project", "requirements", "planning"]
    }
  ]
}`}</code>
            </pre>
          </div>

          <p className="bai-jamjuree-regular text-gray-700 dark:text-gray-300 text-xs sm:text-sm italic">
            Note: The response will include all documents you have uploaded,
            with metadata about each document.
          </p>
        </div>
      </div>

      {/* Authentication Info */}
      <div className="w-full mt-4 sm:mt-6 p-4 sm:p-5 bg-indigo-100 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <FaKey className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-blue-400" />
          Authentication
        </h3>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
          All SDK methods require your API key. Get one from the{" "}
          <Link
            to="/Api/introduction"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            API dashboard
          </Link>
          .
        </p>
      </div>

      {/* CTA */}
      <div className="w-full flex items-center justify-between px-2 py-4">
        <Link
          to="/Api/introduction"
          className="px-5 py-2.5 sm:px-6 sm:py-3 bg-indigo-500 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-400/30 transition-all duration-300 inline-flex items-center gap-2 text-sm sm:text-base"
        >
          <FaRocket className="w-4 h-4 sm:w-5 sm:h-5" />
          Get Your API Key
          <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </Link>
        <Link
          to="/Api/AntiNodeQueryIng-Documents"
          className="px-5 py-2.5 sm:px-6 sm:py-3  text-green-400 rounded-xl bai-jamjuree-semibold   transition-all duration-300 inline-flex items-center gap-2 text-sm sm:text-base"
        >
          Query Documents
          <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </Link>
      </div>
    </div>
  );
};

export default API_functions;

import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router";

const UploadDocuments = () => {
  return (
    <>
      {/* Upload Document */}
      <div className="bg-white dark:bg-black border p-6 sm:p-8 w-full flex flex-col items-center gap-6 md:gap-8 hover:shadow-2xl transition-all duration-300">
        <div className="flex flex-col gap-2 items-center justify-center w-full">
          <h1 className="bai-jamjuree-semibold text-base sm:text-lg flex items-center justify-center gap-2 text-gray-800 dark:text-gray-100">
            Upload Document
          </h1>
          <div className="w-full bg-gray-900 text-white dark:bg-white/10 dark:text-sky-300 p-3 rounded-lg overflow-x-auto">
            <pre className="font-mono text-xs sm:text-sm">
              {`const response = await AntiNode.uploadDocument(file, category, subCategory, visibility, title, name);`}
            </pre>
          </div>
          <p className="bai-jamjuree-regular text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
            Use this method to upload documents to your private knowledge base.
            <br />
            <br />
            <span className="font-semibold text-gray-900 dark:text-white">
              Parameters:
            </span>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  file
                </span>{" "}
                - The file object to upload (currently PDF support only)
              </li>
              <li>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  category
                </span>{" "}
                - Main category for organization (e.g., "Physics",
                "Law","Fashion")
              </li>
              <li>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  subCategory
                </span>{" "}
                - Sub-category for faster and indexed response
              </li>
              <li>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  visibility
                </span>{" "}
                - Document visibility setting ("Private" or "Public") (Case
                sensitive)
              </li>
              <li>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  title
                </span>{" "}
                - Display title for the document
              </li>
              <li>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  name
                </span>{" "}
                - Your name that will be shown to users when the public
                visibility type documents uploaded by you are going to be used
                for query response
              </li>
            </ul>
            <br />
            <span className="font-semibold text-gray-900 dark:text-white">
              Requirements:
            </span>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>All parameters are required</li>
              <li>All text parameters must be strings</li>
              <li>
                Valid API key must be provided in the client initialization
              </li>
            </ul>
          </p>
          <h2 className="bai-jamjuree-semibold text-base sm:text-lg flex items-center justify-center gap-2 text-gray-800 dark:text-gray-100">
            Response
          </h2>
          <div className="w-full bg-gray-900 text-white dark:bg-white/10 dark:text-sky-300 p-3 rounded-lg overflow-x-auto">
            <pre className="font-mono text-xs sm:text-sm">
              {`{
  "success": true,
  "document": {
    "document_id": "doc_12345",
    "title": "Uploaded Document Title",
    "category": "Research",
    "subCategory": "Quantum Physics",
    "upload_date": "2023-11-15T08:30:00Z"
  },
  "message": "Document uploaded successfully"
}`}
            </pre>
          </div>
          <h2 className="bai-jamjuree-semibold text-base sm:text-lg flex items-center justify-center gap-2 text-gray-800 dark:text-gray-100">
            Error Handling
          </h2>
          <div className="w-full bg-gray-900 text-white dark:bg-white/10 dark:text-sky-300 p-3 rounded-lg overflow-x-auto">
            <pre className="font-mono text-xs sm:text-sm">
              {`{
  "success": false,
  "error": "Error message describing the failure",
  "code": 400 // HTTP status code
}`}
            </pre>
          </div>
        </div>
        <Link
          to="/Api/introduction"
          className="px-5 py-2.5 sm:px-6 sm:py-3 text-green-400 bai-jamjuree-regular rounded-xl font-medium transition-all duration-300 inline-flex items-center gap-2 text-sm sm:text-base"
        >
          Get API key
          <FiArrowRight className="w-3 h-3 sm:w-4 " />
        </Link>
      </div>
    </>
  );
};

export default UploadDocuments;

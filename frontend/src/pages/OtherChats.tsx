import { useState, useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { motion } from "framer-motion";
import { GetMisallaneousChatHistory } from "../store/chatRoomSlice";
import { FiArrowLeft, FiCopy, FiMessageCircle, FiShare2 } from "react-icons/fi";
import { useNavigate } from "react-router";
import { toast, Toaster } from "sonner";
import { FaArrowDown, FaArrowUp, FaBolt } from "react-icons/fa";
import SearchBox from "@/components/searchbox";
import Filters from "@/components/Filters";
import { Streamdown } from "streamdown";
import { CiSettings } from "react-icons/ci";
import { BiHourglass } from "react-icons/bi";

const OtherChats = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showFilters, SetShowFilters] = useState(false);
  const { Misallaneouschats, cursor, gettingChats } = useAppSelector(
    (state) => state.chats
  );
  const [SearchResult, SetSearchResult] = useState<SearchResultData[]>([]);
  const [filtercategory, setfiltercategory] = useState<string>("");
  const [subCategory, setSubCategory] = useState<string>("");

  // const [FilterResult, setFilterResult] = useState<string[]>([]);
  const apiCallRef = useRef(false);

  useEffect(() => {
    if (Misallaneouschats.length === 0 && !apiCallRef.current) {
      apiCallRef.current = true;
      dispatch(GetMisallaneousChatHistory(cursor))
        .unwrap()
        .catch((err) => toast.error(err.message));
    }
  }, [dispatch]);

  useEffect(() => {
    if (Misallaneouschats.length > 0) {
      console.log("Updated the searchResult array");

      SetSearchResult(() => [...Misallaneouschats]);
    }
  }, [Misallaneouschats]);
  const [current, setCurrent] = useState<string>("");
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info("Copied to clipboard");
    // Add toast notification in your actual implementation
  };

  // filtering the questions with debouncing
  const handleSearchResults = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchValue = e.target.value.toLowerCase().trim();

      if (!searchValue) {
        SetSearchResult(Misallaneouschats); // ← Show OG data when cleared!
        return;
      }

      const filteredResults = searchValue
        ? Misallaneouschats.filter((obj) =>
            obj.question.toLowerCase().includes(searchValue)
          )
        : Misallaneouschats;

      SetSearchResult(filteredResults);
    },
    [Misallaneouschats]
  );

  const HandleFilterApplication = () => {
    SetShowFilters(!showFilters);
    const filteredValue = SearchResult.filter(
      (elem) =>
        elem.metadata.category.toLowerCase() === filtercategory.toLowerCase() &&
        elem.metadata.subcategory.toLowerCase() === subCategory.toLowerCase()
    );

    SetSearchResult(filteredValue);
  };

  function ResetFilters() {
    SetSearchResult([...Misallaneouschats]);
  }
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black transition-all duration-300">
        <Filters
          showFilters={showFilters}
          SetShowFilters={SetShowFilters}
          filtercategory={filtercategory}
          setfiltercategory={setfiltercategory}
          subCategory={subCategory}
          setSubCategory={setSubCategory}
          HandleFilterApplication={HandleFilterApplication}
          ResetFilters={ResetFilters}
        />

        <Toaster />

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Enhanced Header */}
          <header className="flex items-center justify-between mb-8 p-4 bg-white/70 dark:bg-black/40 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-black hover:bg-white  transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200/50 dark:border-gray-600/50 group"
            >
              <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium text-sm">Back to conversations</span>
            </button>

            <div className="flex gap-3">
              <button
                className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200/50 dark:border-gray-600/50"
                title="Share conversation"
              >
                <FiShare2 className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Enhanced Title Section */}
          <div className="mb-8 p-6 bg-white/70 dark:bg-black/40 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <section className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                  Other conversations with Eureka
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Browse through your previous conversations and insights
                </p>
              </section>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="bai-jamjuree-semibold text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Find a question
                </label>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-sky-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <input
                    onChange={handleSearchResults}
                    type="text"
                    placeholder="Search your knowledge..."
                    className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm space-grotesk rounded-xl px-4 py-3 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-gray-300/50 dark:border-gray-600/50"
                  />
                  <div className="absolute top-full left-0 opacity-0 focus-within:opacity-100 pointer-events-none focus-within:pointer-events-auto transition-all duration-300 z-50 w-full mt-2">
                    <SearchBox SearchResult={SearchResult} />
                  </div>
                </div>

                <button
                  onClick={() => SetShowFilters(!showFilters)}
                  className="p-3 rounded-xl bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white text-white dark:text-black hover:shadow-lg transform hover:scale-105 transition-all duration-200 shadow-md"
                >
                  <CiSettings size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Messages List */}
          {SearchResult.length > 0 ? (
            <div className="max-w-6xl mx-auto space-y-6">
              {SearchResult.map((message, index) => (
                <motion.div
                  key={`${message.created_at}_at_index${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative group"
                >
                  {/* Message Card Container */}
                  <div
                    className={`relative bg-white/80 dark:bg-black backdrop-blur-lg rounded-2xl border-2 transition-all duration-500 ease-out ${
                      current ===
                      `sent_at=${message.created_at}_question=${message.question}`
                        ? "border-green-500/30  "
                        : "border-gray-200/50 dark:border-gray-700/50 "
                    }`}
                  >
                    {/* Action Buttons */}
                    <div className="absolute -top-3 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => copyToClipboard(message.AI_response)}
                        className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50"
                        title="Copy response"
                      >
                        <FiCopy className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                      </button>

                      <motion.button
                        onClick={() => {
                          setCurrent((prev) =>
                            prev ===
                            `sent_at=${message.created_at}_question=${message.question}`
                              ? ""
                              : `sent_at=${message.created_at}_question=${message.question}`
                          );
                        }}
                        className="p-2 bg-white dark:bg-white/15 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50"
                        animate={{
                          rotate:
                            current ===
                            `sent_at=${message.created_at}_question=${message.question}`
                              ? 180
                              : 0,
                        }}
                        transition={{ duration: 0.5, type: "spring" }}
                        title={
                          current ===
                          `sent_at=${message.created_at}_question=${message.question}`
                            ? "Collapse"
                            : "Expand"
                        }
                      >
                        {current ===
                        `sent_at=${message.created_at}_question=${message.question}` ? (
                          <FaArrowUp className="w-3 h-3 text-red-500" />
                        ) : (
                          <FaArrowDown className="w-3 h-3 text-green-500" />
                        )}
                      </motion.button>
                    </div>

                    {/* Question Section */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-sm font-bold">
                            Q
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                              You asked
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(
                                message.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                            {message.question}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Answer Section */}
                    <div
                      className={`px-6 pb-6 transition-all duration-500 ${
                        current ===
                        `sent_at=${message.created_at}_question=${message.question}`
                          ? "opacity-100 max-h-full"
                          : "opacity-90 max-h-32 overflow-hidden"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-sm font-bold">
                            A
                          </span>
                        </div>
                        {/* <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2"> */}
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Eureka answered
                        </span>
                      </div>
                      {/* <div className="prose prose-sm max-w-none dark:prose-invert">
                            <div className="text-gray-700 dark:text-gray-300 leading-relaxed"> */}
                      <Streamdown>{message.AI_response}</Streamdown>
                      {/* </div>
                          </div> */}
                      {/* </div>
                      </div> */}
                    </div>

                    {/* Gradient Bottom Border */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent transition-opacity duration-500 ${
                        current ===
                        `sent_at=${message.created_at}_question=${message.question}`
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-4">
                <FiMessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No conversations found
              </h3>
              <p className="text-gray-500 dark:text-gray-500 max-w-md">
                {SearchResult.length === 0
                  ? "Start a conversation with Eureka to see your history here."
                  : "No results match your search criteria."}
              </p>
            </motion.div>
          )}
        </div>
        {apiCallRef.current === true && (
          <div className="w-full p-3 flex">
            <button
              onClick={() => {
                dispatch(GetMisallaneousChatHistory(cursor));
              }}
              className={`justify-self-end ${
                gettingChats === true
                  ? "bg-green-600 text-black"
                  : "bg-black text-white dark:bg-white dark:text-black"
              }  px-3 py-2 rounded-sm bai-jamjuree-semibold flex items-center justify-center gap-2`}
            >
              {gettingChats === false ? (
                <>
                  Load More <FaBolt />
                </>
              ) : (
                <>
                  Loading <BiHourglass className="animate-spin" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default OtherChats;
interface metadata {
  category: string;
  subcategory: string;
}

interface SearchResultData {
  created_at: string;
  question: string;
  AI_response: string;
  metadata: metadata;
}

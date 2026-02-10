import { useState, useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { GetMisallaneousChatHistory, setCursor } from "../store/chatRoomSlice";
import {
  FiArrowLeft,
  FiCopy,
  FiMessageCircle,
  FiSearch,
  FiFilter,
} from "react-icons/fi";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  FaArrowDown,
  FaArrowUp,
  FaBolt,
  FaRobot,
  FaUser,
} from "react-icons/fa";
// import SearchBox from "@/components/searchbox";
import Filters from "@/components/Filters";
import { Streamdown } from "streamdown";
// import { CiSettings } from "react-icons/ci";
import { BiHourglass } from "react-icons/bi";

const OtherChats = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showFilters, SetShowFilters] = useState(false);
  const { Misallaneouschats, cursor, gettingChats } = useAppSelector(
    (state) => state.chats
  );
  // const { user } = useAppSelector((state) => state.auth);
  const [SearchResult, SetSearchResult] = useState<SearchResultData[]>([]);
  const [filtercategory, setfiltercategory] = useState<string>("");
  const [subCategory, setSubCategory] = useState<string>("");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const apiCallRef = useRef(false);

  useEffect(() => {
    if (Misallaneouschats.length === 0 && !apiCallRef.current) {
      apiCallRef.current = true;
      dispatch(GetMisallaneousChatHistory(cursor))
        .unwrap().then((res) => toast.message(res.message))
        .catch((err) => toast.error(err.message));
    }
  }, [dispatch]);

  useEffect(() => {
    if (Misallaneouschats.length > 0) {
      SetSearchResult(() => [...Misallaneouschats]);
    }
  }, [Misallaneouschats]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // search results handler
  const handleSearchResults = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchValue = e.target.value.toLowerCase().trim();
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
    const filteredValue = SearchResult.filter(
      (elem) =>
        elem.metadata.category.toLowerCase() === filtercategory.toLowerCase() &&
        elem.metadata.subcategory.toLowerCase() === subCategory.toLowerCase()
    );
    SetSearchResult(filteredValue);
    SetShowFilters(false);
  };

  function ResetFilters() {
    SetSearchResult([...Misallaneouschats]);
    setfiltercategory("");
    setSubCategory("");
  }

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  function HandleFetchMoreHistory() {
    const lastMessageCreatedAt = Misallaneouschats[Misallaneouschats.length - 1]?.created_at;
    if (!lastMessageCreatedAt) {
      return
    }
    dispatch(setCursor(lastMessageCreatedAt))
    dispatch(GetMisallaneousChatHistory(cursor)).unwrap().then((res: any) => toast.message(res.message)).catch(err => toast.error(err));

  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-neutral-950 dark:to-black transition-all duration-300">
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

      {/* Header */}
      <div className="sticky top-0  bg-white/80 dark:bg-gray-950 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
              <span className="font-medium text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                Back
              </span>
            </button>

            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <FiSearch className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  onChange={handleSearchResults}
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full bg-white/50 dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-sm pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm"
                />
              </div>
            </div>

            <button
              onClick={() => SetShowFilters(true)}
              className="p-3 rounded-xl bg-black dark:bg-white dark:text-black text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 shadow-md"
            >
              <FiFilter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
            Conversation History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">
            Browse through your previous conversations and insights with AI
          </p>
        </motion.div>

        {/* Chat List */}
        <div className="space-y-4">
          <AnimatePresence>
            {SearchResult.length > 0 ? (
              SearchResult.map((message, index) => (
                <motion.div
                  key={`${message.created_at}_${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05, ease: "backInOut" }}
                  className="group"
                >
                  <div className="bg-gray-100 dark:bg-neutral-950 backdrop-blur-lg rounded-sm border-2 shadow-xl b transition-all duration-300 overflow-hidden">
                    {/* Question Header */}
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => toggleCardExpansion(message.created_at)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-black dark:bg-white dark:text-black text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <FaUser className="w-3 h-3 " />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                              Your question
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(message.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <p className="text-gray-800 dark:text-gray-100 text-sm leading-relaxed line-clamp-2 bai-jamjuree-semibold">
                            {message.question}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Answer Section */}
                    <AnimatePresence>
                      {expandedCard === message.created_at && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-100 dark:border-gray-700/50"
                        >
                          <div className="p-4 ">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-8 h-8 bg-black dark:bg-white dark:text-black text-white rounded-full flex items-center justify-center flex-shrink-0">
                                <FaRobot className="w-3 h-3 " />
                              </div>
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                AntiNode
                              </span>
                            </div>

                            <div className="pl-11">
                              <div className="  max-w-none dark:prose-invert space-grotesk">
                                {/* <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed"> */}
                                <Streamdown>{message.AI_response}</Streamdown>
                                {/* </div> */}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(message.AI_response);
                                  }}
                                  className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                  <FiCopy className="w-3 h-3" />
                                  Copy
                                </button>
                                <button
                                  onClick={() => setExpandedCard(null)}
                                  className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                  <FaArrowUp className="w-3 h-3" />
                                  Collapse
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Quick Actions Footer */}
                    {expandedCard !== message.created_at && (
                      <div className="px-4 py-3 bg-gray-50/30 dark:bg-gray-700/10 border-t border-gray-100 dark:border-gray-700/30">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() =>
                              toggleCardExpansion(message.created_at)
                            }
                            className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          >
                            <FaArrowDown className="w-3 h-3" />
                            Expand
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(message.AI_response);
                            }}
                            className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <FiCopy className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-4">
                  <FiMessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No conversations found
                </h3>
                <p className="text-gray-500 dark:text-gray-500 text-sm max-w-xs">
                  {SearchResult.length === 0
                    ? "Start a conversation to see your history here."
                    : "No results match your search criteria."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Load More Button */}
        {apiCallRef.current && Misallaneouschats.length > 0 && (
          <div className="flex justify-center mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => HandleFetchMoreHistory()}
              disabled={gettingChats}
              className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${gettingChats
                ? "bg-indigo-500 text-white"
                : "bg-black text-white dark:bg-white dark:text-black shadow-lg hover:shadow-xl"
                } flex items-center gap-2`}
            >
              {gettingChats ? (
                <>
                  <BiHourglass className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <FaBolt className="w-4 h-4" />
                  Load More Conversations
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>
    </div>
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

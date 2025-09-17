import { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { motion } from "framer-motion";
import { GetMisallaneousChatHistory } from "../store/chatRoomSlice";
import { FiArrowLeft, FiCopy, FiShare2 } from "react-icons/fi";
import { useNavigate } from "react-router";
import { toast, Toaster } from "sonner";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import SearchBox from "@/components/searchbox";
import { Streamdown } from "streamdown";

const OtherChats = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { Misallaneouschats } = useAppSelector((state) => state.chats);
  const [SearchResult, SetSearchResult] = useState<SearchResultData[]>([]);
  // const [FilterResult, setFilterResult] = useState<string[]>([]);

  useEffect(() => {
    if (Misallaneouschats.length === 0) {
      dispatch(GetMisallaneousChatHistory())
        .unwrap()
        .catch((err) => toast.error(err.message));
    }
  }, [Misallaneouschats, dispatch]);

  useEffect(() => {
    if (Misallaneouschats.length > 0) {
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

  return (
    <>
      {" "}
      <div className="dark:bg-black dark:text-white bg-white text-black min-h-screen p-4 md:p-8">
        <Toaster></Toaster>
        {/* Header with back button */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to conversations</span>
          </button>

          {/* other options */}
          <div className="flex gap-2">
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Share conversation"
            >
              <FiShare2 className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Conversation title */}
        <div className="mb-8 flex items-center justify-between p-2 gap-8 flex-wrap">
          <section>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Other conversations with Eureka
            </h1>
          </section>

          <span className="flex items-center justify-center gap-6 bai-jamjuree-regular ">
            <label htmlFor="QuerySearch">Find a question</label>
            <div className="bg-gradient-to-r from-purple-600 to-sky-600 p-0.5 rounded-lg relative">
              <input
                onChange={handleSearchResults}
                type="text"
                placeholder="Search your knowledge..."
                className="bg-white dark:bg-black rounded-md px-4 py-2 w-full md:w-64 focus:outline-none peer"
              />
              <div className="absolute top-full left-0 opacity-0 peer-focus:opacity-100 pointer-events-none peer-focus:pointer-events-auto transition-opacity z-50 w-full">
                <SearchBox SearchResult={SearchResult} />
              </div>
            </div>
          </span>
        </div>

        {/* Messages list */}
        {SearchResult.length > 0 ? (
          <div className=" md:w-4/5 w-full mx-auto mt-10 ">
            {SearchResult.map((message, index) => (
              <motion.div
                key={`${message.created_at}_at_index${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
                  current ===
                  `sent_at=${message.created_at}_question=${message.question}`
                    ? "max-h-auto scale-100 opacity-100"
                    : "max-h-50 scale-98 opacity-90"
                }`}
              >
                {/* copy button */}
                <button
                  onClick={() => copyToClipboard(message.AI_response)}
                  className="absolute -top-2 right-3 mt-2 text-xs flex items-center gap-1 text-black dark:text-white cursor-pointer  hover:text-gray-700 dark:hover:text-white transition-colors"
                >
                  <FiCopy className="w-3 h-3" />
                  Copy
                </button>
                {/* collapse or reverse buttons */}
                <button
                  onClick={() => {
                    setCurrent((prev) =>
                      prev ===
                      `sent_at=${message.created_at}_question=${message.question}`
                        ? ""
                        : `sent_at=${message.created_at}_question=${message.question}`
                    );
                  }}
                  className="absolute bottom-3 right-5 mt-2 text-sm flex items-center gap-1 text-green-600 transition-colors cursor-pointer"
                >
                  {current ===
                  `sent_at=${message.created_at}_question=${message.question} ` ? (
                    <>
                      <FaArrowUp className="w-3 h-3" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <FaArrowDown className="w-3 h-3" />
                      Extend
                    </>
                  )}
                </button>

                <p
                  className={`border whitespace-pre-wrap ml-auto my-4 max-w-3xl p-4 rounded-2xl ${
                    SearchResult.some(
                      (data) => data.question === message.question
                    )
                      ? "border-green-500 "
                      : "border-gray-400"
                  }dark:bg-white/20  bg-black/20 dark:text-white text-black`}
                >
                  <span className="font-medium">You -</span> {message.question}
                </p>
                <Streamdown>{message.AI_response}</Streamdown>
              </motion.div>
            ))}
          </div>
        ) : (
          <div>No chats found</div>
        )}
      </div>
    </>
  );
};

export default OtherChats;
interface SearchResultData {
  created_at: string;
  question: string;
  AI_response: string;
}

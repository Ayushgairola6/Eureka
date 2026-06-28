import { useState, useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { GetMisallaneousChatHistory, setCursor } from "../store/chatRoomSlice";

import {
  ChevronDown,
  ChevronUp,
  Copy,
  Trash2,
  Zap,
  MessageSquare,
  Bot,
  User,
  ArrowLeft,
  Search,
  PlusIcon,
} from "lucide-react";
import { DeleteChat } from "../store/chatRoomSlice.ts"
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Streamdown } from "streamdown";
import { AudioPlayer } from "../components/audio/AudioPlayer";
import { TTSRequest } from "../components/popups/text_toSpeech";

const OtherChats = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { Misallaneouschats, gettingChats } = useAppSelector(
    (state) => state.chats
  );
  // const { user } = useAppSelector((state) => state.auth);
  const [SearchResult, SetSearchResult] = useState<SearchResultData[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const apiCallRef = useRef(false);

  useEffect(() => {
    if (Misallaneouschats.length === 0 && !apiCallRef.current) {
      apiCallRef.current = true;
      dispatch(GetMisallaneousChatHistory(null))
        .unwrap().then((res) => toast.message(res.message))
        .catch((err) => toast.error(err.message));
    }
  }, [dispatch]);

  useEffect(() => {
    if (Misallaneouschats.length > 0) {
      SetSearchResult(() => [...Misallaneouschats]);
    }
  }, [Misallaneouschats]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
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






  function HandleFetchMoreHistory() {
    const lastMessageCreatedAt = Misallaneouschats[Misallaneouschats.length - 1]?.created_at;
    if (!lastMessageCreatedAt) {
      return
    }
    dispatch(setCursor(lastMessageCreatedAt))
    dispatch(GetMisallaneousChatHistory(lastMessageCreatedAt)).unwrap().then((res: any) => toast.message(res.message)).catch(err => toast.error(err));

  }
  // const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleCardExpansion = (id: string) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  };



  const handleDelete = async (e: React.MouseEvent, chat: any) => {
    e.stopPropagation();
    setDeletingId(chat.created_at);
    dispatch(DeleteChat({ message_id: chat.id }))
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-200">
      <AudioPlayer />

      {/* <Filters
        showFilters={showFilters}
        SetShowFilters={SetShowFilters}
        filtercategory={filtercategory}
        setfiltercategory={setfiltercategory}
        subCategory={subCategory}
        setSubCategory={setSubCategory}
        HandleFilterApplication={HandleFilterApplication}
        ResetFilters={ResetFilters}
      /> */}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm border-b border-gray-200 dark:border-neutral-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              onChange={handleSearchResults}
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-gray-100 dark:bg-neutral-900 border-0 rounded-lg pl-8 pr-4 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-neutral-700"
            />
          </div>

          <button
            onClick={() => HandleFetchMoreHistory()}
            className="p-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
          >
            <PlusIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Conversation History
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
            {SearchResult.length} conversation{SearchResult.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Chat List */}
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {SearchResult.length > 0 ? (
              SearchResult.map((message: any, index: number) => {
                const isExpanded = expandedCard === message.created_at;
                const isDeleting = deletingId === message.created_at;

                return (
                  <motion.div
                    key={message.created_at}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: isDeleting ? 0.4 : 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2, delay: index < 10 ? index * 0.03 : 0 }}
                  >
                    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                      {/* Question row */}
                      <div
                        className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/60 transition-colors"
                        onClick={() => toggleCardExpansion(message.created_at)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                            <User className="w-3 h-3 text-white dark:text-black" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                You
                              </span>
                              <span className="text-[11px] text-gray-400 dark:text-gray-600 flex-shrink-0">
                                {new Date(message.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug line-clamp-2 bai-jamjuree-semibold">
                              {message.question}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Expanded answer */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-4 py-3 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-950/50">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0">
                                  <Bot className="w-3 h-3 text-white dark:text-black" />
                                </div>
                                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  AntiNode
                                </span>
                              </div>
                              <div className="pl-9 text-sm space-grotesk">
                                <Streamdown>{message.AI_response}</Streamdown>
                              </div>

                              {/* Action row */}
                              <div className="flex items-center gap-2 mt-3 pl-9">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(message.AI_response, message?.created_at);
                                  }}
                                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                                >
                                  <Copy className="w-3 h-3" />
                                  {copiedId === message.created_at ? "Copied" : "Copy"}
                                </button>
                                <button
                                  onClick={() => setExpandedCard(null)}
                                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                  Collapse
                                </button>
                                <TTSRequest text={message.AI_response} />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Footer */}
                      <div className="px-4 py-2 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                        <button
                          onClick={() => toggleCardExpansion(message.created_at)}
                          className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                          {isExpanded ? "Collapse" : "Expand"}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(message.AI_response, message.created_at);
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, message)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-neutral-900 flex items-center justify-center mb-3">
                  <MessageSquare className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  No conversations found
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                  Start a conversation to see history here.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Load more */}
        {apiCallRef.current && Misallaneouschats.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={HandleFetchMoreHistory}
              disabled={gettingChats}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Zap className="w-3.5 h-3.5" />
              {gettingChats ? "Loading..." : "Load More"}
            </button>
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

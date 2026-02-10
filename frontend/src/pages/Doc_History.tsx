import { useParams, useNavigate } from "react-router";
import { FiArrowLeft, FiCopy, FiShare2 } from "react-icons/fi";
import { motion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { GetDocumentChatHistory } from "../store/chatRoomSlice.ts";
import { lazy, useEffect, useState } from "react";
import { FaArrowDown, FaArrowRight, FaArrowUp } from "react-icons/fa";
import { Link } from "react-router";
import { Streamdown } from "streamdown";
const SearchBox = lazy(() => import("@/components/searchbox.tsx"));
import { setSelectedDoc } from "../store/InterfaceSlice.ts";
import { toast } from 'sonner';

const ConversationDetail = () => {

  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { DocChats } = useAppSelector((state) => state.chats);
  // const { selectedFile } = useAppSelector((state) => state.interface);
  const [current, setCurrent] = useState<string>("");
  const [SearchResult, SetSearchResult] = useState<searchresult[]>([]);

  // const [value, setValue] = useState('')
  const navigate = useNavigate();
  useEffect(() => {
    if (id) {
      dispatch(GetDocumentChatHistory(id)).unwrap().then((res) => {
        if (res.message) {
          toast.message(res.message)
        }
      }).catch(err => toast.error(err));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (DocChats.length > 0) {
      SetSearchResult(DocChats);
    }
  }, [DocChats]);
  // Mock conversation data - replace with your actual data fetching

  const currentDocument = user?.Contributions_user_id_fkey.find(
    (doc) => doc.document_id === id
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add toast notification in your actual implementation
  };

  const handleQuestionSearch = (e: any) => {
    const searchvalue = e.target.value.trim();

    if (!searchvalue) {
      SetSearchResult(DocChats);
    }
    const filteredResults = searchvalue
      ? DocChats.filter((obj: any) =>
        obj.question.toLowerCase().includes(searchvalue)
      )
      : DocChats;

    SetSearchResult(filteredResults);
  };

  return (
    <div className="dark:bg-black dark:text-white bg-white text-black min-h-screen p-4 md:p-8">
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
            onClick={() => copyToClipboard(window.location.href)}
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
            {currentDocument ? currentDocument.feedback : "Not specified"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {currentDocument ? currentDocument.created_at.split("T")[0] : null}
          </p>
        </section>

        <span className="flex items-center justify-center gap-6 bai-jamjuree-regular">
          <label htmlFor="QuerySearch">Find a question</label>
          <div className="bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 p-0.5 rounded-lg relative">
            <input
              onChange={handleQuestionSearch}
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
        <div className=" w-4/5 m-auto">
          {SearchResult.map((message, index) => (
            <motion.div
              key={`${message.created_at}_at_index${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`relative overflow-hidden transition-all duration-300 ease-in-out ${current ===
                `sent_at=${message.created_at}_question=${message.question}`
                ? "max-h-auto scale-100 opacity-100"
                : "max-h-90 scale-98 opacity-90"
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
              <motion.button
                onClick={() => {
                  setCurrent((prev) =>
                    prev ===
                      `sent_at=${message.created_at}_question=${message.question}`
                      ? ""
                      : `sent_at=${message.created_at}_question=${message.question}`
                  );
                }}
                className={`absolute bottom-3 right-5 mt-2 text-sm flex items-center gap-1 cursor-pointer dark:bg-gray-100 bg-black p-1 rounded-full ${current ===
                  `sent_at=${message.created_at}_question=${message.question}`
                  ? "text-red-600"
                  : "text-green-600"
                  }`}
                animate={{
                  rotate:
                    current ===
                      `sent_at=${message.created_at}_question=${message.question}`
                      ? 180
                      : 0,
                }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              >
                {current ===
                  `sent_at=${message.created_at}_question=${message.question}` ? (
                  <>
                    <FaArrowUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    <FaArrowDown className="w-3 h-3" />
                  </>
                )}
              </motion.button>
              {/* main content */}
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {message.created_at ? user?.created_at.split("T")[0] : null}
                </span>
              </div>

              <p
                className={`border whitespace-pre-wrap ml-auto my-4 max-w-3xl p-4 rounded-2xl 
                    dark:bg-sky-500/70  bg-sky-500/40 dark:text-white text-black bai-jamjuree-semibold`}
              >
                <span className="">You -</span> {message.question}
              </p>
              <p className="dark:bg-white/10 bg-black/20 rounded-lg p-2 space-grotesk">
                <Streamdown>{message.AI_response}</Streamdown>
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <h1 className="m-auto text-xl md:text-2xl bai-jamjuree-semibold">
            No chats history
          </h1>
          <Link to="/Interface">
            <motion.button
              onClick={() => {
                const Doc = user?.Contributions_user_id_fkey.find(
                  (e) => e.document_id === id
                );
                if (Doc) {
                  dispatch(setSelectedDoc(Doc.document_id));
                }
              }}
              whileTap={{ scale: 1.06 }}
              className="cursor-pointer m-auto text-sm  space-grotesk text-green-500 flex items-center justify-center gap-3"
            >
              <FaArrowRight /> Start Asking
            </motion.button>
          </Link>
        </div>
      )}

      {/* Related documents section (optional) */}
      {user?.Contributions_user_id_fkey ? (
        user.Contributions_user_id_fkey.filter((doc) => doc.document_id !== id)
          .length > 0 && (
          <div className="mt-12 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Related Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user.Contributions_user_id_fkey.filter(
                (doc) => doc.document_id !== id
              ).map((doc) => (
                <Link to={`/User/document_chat_history/${doc.document_id}`}>
                  <motion.div
                    key={`${doc.id}_${doc.created_at}`}
                    whileHover={{ y: -2 }}
                    className="p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  >
                    <h3 className="font-medium">{doc.feedback}.pdf</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Uploaded {doc.created_at.split("T")[0]}
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4">No other documents</h2>
        </div>
      )}
    </div>
  );
};

export default ConversationDetail;
interface searchresult {
  created_at: string;
  question: string;
  AI_response: string;
  user_id: string;
}

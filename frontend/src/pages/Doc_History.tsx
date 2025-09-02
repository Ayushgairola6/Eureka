import { useParams, useNavigate } from 'react-router';
import { FiArrowLeft, FiCopy, FiShare2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { GetDocumentChatHistory } from '../store/chatRoomSlice.ts';
import { useEffect, useState } from 'react';
import MarkdownRenderer from '@/components/safeHtml.tsx';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

const ConversationDetail = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth)
  const { DocChats } = useAppSelector(state => state.chats);
  const [current, setCurrent] = useState<string>('');
  // const [value, setValue] = useState('')
  const navigate = useNavigate();
  useEffect(() => {
    if (id) {
      dispatch(GetDocumentChatHistory(id))
    }
  }, [id, dispatch])
  // Mock conversation data - replace with your actual data fetching

  const currentDocument = user?.Contributions_user_id_fkey.find((doc) => doc.document_id === id)


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add toast notification in your actual implementation
  };


  // const FindMatchingQuestion = (e: any) => {

  //   let isValid = false;
  //   const EachQuestion = DocChats.some((elem) => {
  //     const isLetter = elem.question.trim().split("").some((letter) => letter === e.target.value);

  //     if (isLetter) {
  //       isValid = true;
  //     }
  //   });

  //   console.log(EachQuestion)
  //   setValue(e.target.value)
  // }

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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{currentDocument ? currentDocument.feedback : "Not specified"}</h1>
          <p className="text-gray-500 dark:text-gray-400">{currentDocument ? currentDocument.created_at.split("T")[0] : null}</p>
        </section>

        <span className='flex items-center justify-center gap-6 bai-jamjuree-regular'>
          <label htmlFor="QuerySearch">Find a question</label>
          <div className="bg-gradient-to-r from-purple-600 to-sky-600 p-0.5 animate-pulse rounded-lg">
            <input
              type="text"
              placeholder="Search your knowledge..."
              className="bg-white dark:bg-black rounded-md px-4 py-2 w-full md:w-64 focus:outline-none"
            />
          </div>
        </span>
      </div>

      {/* Messages list */}
      {DocChats.length > 0 ? <div className=" w-4/5 m-auto">
        {DocChats.map((message, index) => (
          <motion.div
            key={`${message.created_at}_at_index${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`relative overflow-hidden transition-all duration-300 ease-in-out ${current === `sent_at=${message.created_at}_question=${message.question}`
              ? 'max-h-auto scale-100 opacity-100'
              : 'max-h-90 scale-98 opacity-90'
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
                setCurrent((prev) => prev === `sent_at=${message.created_at}_question=${message.question}` ? "" : `sent_at=${message.created_at}_question=${message.question}`)
              }}
              className="absolute bottom-3 right-5 mt-2 text-sm flex items-center gap-1 text-green-600 transition-colors cursor-pointer"
            >

              {current === `sent_at=${message.created_at}_question=${message.question}` ? (<>
                <FaArrowUp className="w-3 h-3" />
                Collapse
              </>) : (<>
                <FaArrowDown className="w-3 h-3" />
                Extend
              </>)}
            </button>
            {/* main content */}
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {message.created_at ? user?.created_at.split("T")[0] : null}
              </span>
            </div>

            <p className="whitespace-pre-wrap bg-blue-500 ml-auto max-w-3xl p-4 rounded-2xl"><span className="font-medium">
              You -
            </span> {message.question}</p>
            <MarkdownRenderer content={message.AI_response}
              className="text-sm text-gray-800 dark:text-gray-200 darj h-full bai-jamjuree-regular leading-loose dark:bg-gray-900 bg-gray-300 mr-auto max-w-3xl rounded-lg px-3 py-4" />


          </motion.div>
        ))}
      </div> : <div>No chats found</div>}

      {/* Related documents section (optional) */}
      {user?.Contributions_user_id_fkey ?
        user.Contributions_user_id_fkey.filter(doc => doc.document_id !== id).length > 0 &&
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Related Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {user.Contributions_user_id_fkey
              .filter(doc => doc.document_id !== id)
              .map(doc => (
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
              ))}
          </div>
        </div>
        : <div>
          <h2 className="text-xl font-bold mb-4">No other documents</h2>
        </div>}
    </div>
  );
};

export default ConversationDetail;


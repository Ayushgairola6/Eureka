import { useParams, useNavigate } from 'react-router';
import { FiArrowLeft, FiCopy, FiShare2 } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ConversationDetail = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  // Mock conversation data - replace with your actual data fetching
  const conversation = {
    id: conversationId,
    title: "Patent Law Q&A",
    date: "November 20, 2023",
    messages: [
      {
        id: 1,
        sender: 'user',
        text: "How does prior art affect patent applications in the US?",
        timestamp: "10:30 AM"
      },
      {
        id: 2,
        sender: 'ai',
        text: "Prior art refers to any evidence that your invention is already known. In the US patent system, prior art can invalidate patent claims if it demonstrates the invention wasn't novel or non-obvious. The USPTO examiners will search for prior art during prosecution.",
        timestamp: "10:31 AM"
      },
      {
        id: 3,
        sender: 'user',
        text: "What's the 1-year grace period rule?",
        timestamp: "10:33 AM"
      },
      {
        id: 4,
        sender: 'ai',
        text: "The America Invents Act provides a 1-year grace period where disclosures by the inventor (publications, sales, etc.) won't count as prior art against their own patent application. However, third-party disclosures during this period can still invalidate the patent.",
        timestamp: "10:34 AM"
      }
    ]
  };

  const copyToClipboard = (text:string) => {
    navigator.clipboard.writeText(text);
    // Add toast notification in your actual implementation
  };

  return (
    <div className="dark:bg-gray-900 dark:text-white bg-white text-black min-h-screen p-4 md:p-8">
      {/* Header with back button */}
      <header className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Back to conversations</span>
        </button>
        
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
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{conversation.title}</h1>
        <p className="text-gray-500 dark:text-gray-400">{conversation.date}</p>
      </div>

      {/* Messages list */}
      <div className="space-y-6 max-w-4xl mx-auto">
        {conversation.messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-4 rounded-2xl ${message.sender === 'user' 
              ? 'bg-blue-50 dark:bg-blue-900/30 ml-auto max-w-3xl' 
              : 'bg-gray-50 dark:bg-gray-800 mr-auto max-w-3xl'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium">
                {message.sender === 'user' ? 'You' : 'EUREKA AI'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {message.timestamp}
              </span>
            </div>
            
            <p className="whitespace-pre-wrap">{message.text}</p>
            
            {message.sender === 'ai' && (
              <button 
                onClick={() => copyToClipboard(message.text)}
                className="mt-2 text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <FiCopy className="w-3 h-3" />
                Copy
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Related documents section (optional) */}
      <div className="mt-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Related Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2].map(doc => (
            <motion.div
              key={doc}
              whileHover={{ y: -2 }}
              className="p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
            >
              <h3 className="font-medium">Patent_Law_Reference_{doc}.pdf</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Uploaded Nov 15, 2023</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConversationDetail;
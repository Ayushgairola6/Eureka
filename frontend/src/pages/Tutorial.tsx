
const featuresList = [
  { id: "Shards", icon: <BsCurrencyExchange />, featureName: "Shards", description: "We track every user's quota with shards each mode has different shard value to track AntiNode's performance.", howToUse: ['Choose any mode and simply ask anything the shard value will deduct automatically.', 'You can keep track of your leftover quota from the Control Center by clicking the Username icon on top right or via the navigation links.', 'Each mode costs different amount of shards, basic web search and document based chat modes cost 1 shard but advanced modes like summarization, Synthesis and deep-web search cost 5 shards/query because of their compute cost.'] },
  {
    id: "upload",
    icon: <FileUp />,
    featureName: "Uploading Documents",
    description: "AntiNode keeps your documents secure. Click the upload icon in the interface to open the upload form. All fields are required to maximize performance and efficiency in synthesis mode.",
    howToUse: [
      "Name your document without extension (e.g., 'tuberculosis-research-2024')",
      "Fill metadata fields with relevant keywords: 'TUBERCULOSIS TREATMENT', 'NEW MEDICINE DEVELOPMENT', etc.",
      "Select your file manually or drag and drop",
      "Choose privacy: Contribute to public knowledge base or keep private",
    ],
    tips: "Better metadata = more accurate synthesis results"
  },
  {
    id: "knowledge",
    icon: <Database />,
    featureName: "Public Knowledge Base",
    description: "A community-powered collection of verified documents across various domains. Built on a 'for the people, by the people' philosophy to create an authentic information hub for students, researchers, and truth-seekers.",
    howToUse: [
      "Click the filter/settings button in the input section",
      "Browse available domains (e.g., Programming, Medicine, Science)",
      "Select a subdomain from the popup list",
      "AI automatically uses relevant verified documents for your query",
    ],
    tips: "Each response shows upvotes/downvotes from the community to flag misinformation"
  },
  {
    id: "research",
    icon: <Globe />,
    featureName: "Web Search Mode",
    description: "Access the web search tab by clicking the + icon in the input section. Choose your search depth based on how comprehensive you need the results.",
    howToUse: [
      "Surface Web: Quick results from public sources (blogs, Reddit, news)",
      "Deep Search: Autonomous AI creates sub-queries and scans specialized sources in parallel",
      "Track every step in real-time through the interface",
    ],
    tips: "Deep search takes longer but finds sources others miss"
  },
  {
    id: "summary",
    icon: <FileText />,
    featureName: "Document Summary & Q&A",
    description: "Summarize your uploaded documents or ask questions about their content. Perfect for quick insights from long research papers or reports.",
    howToUse: [
      "Click 'My Docs' in the input interface",
      "Select a document from your cloud storage",
      "Click the new icon that appears",
      "Choose: Summarize or Q&A mode",
    ],
    tips: "Large document summarization coming soon"
  },
  {
    id: "rooms",
    icon: <Users />,
    featureName: "Collaboration Rooms",
    description: "Shared workspaces where teams research together in real-time. Perfect for collaborative report writing, deep web research, or prompt optimization with colleagues.",
    howToUse: [
      "Join existing room: Use room code (admin may need to approve)",
      "Create new room: Set member limit, privacy level, description, and name",
      "Invite team: Share room code with collaborators",
      "All features available: Research, synthesis, documents—everything works in real-time",
    ],
    tips: "Room admin controls privacy and member permissions"
  },
  {
    id: "synthesis",
    icon: <GitMerge />,
    featureName: "Multi-Source Synthesis",
    description: "Our most powerful feature. Cross-reference multiple private documents, compare with web data, and generate unified insights—all in one request. Powered by proprietary self-correcting orchestration.",
    howToUse: [
      "Click the + icon in input interface (works in solo or rooms)",
      "Option 1: Manually select multiple documents from your list",
      "Option 2: Name documents with extensions in your request (e.g., 'Compare sales-Q3.pdf with market-data.xlsx')",
      "Send request and watch the transparent process unfold",
      "Receive synthesized report with all sources cited",
    ],
    tips: "Be specific in your request for best results. Example: 'Compare my Q3 sales data with competitor projections from the web and create a strategy report'"
  },
];

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, FileUp, Database, Globe,
  FileText, Users, GitMerge, CheckCircle, Terminal, Cpu
} from "lucide-react";
import { BsCurrencyExchange } from "react-icons/bs";

const Tutorial = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeId, setActiveId] = useState("Shards");

  const filteredFeatures = featuresList.filter(
    (f) =>
      f.featureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeFeature = featuresList.find(f => f.id === activeId) || featuresList[0];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">

        {/* 1. Header & System Status */}
        <header className="mb-12 border-l-2 border-orange-600 pl-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-orange-600 font-bold">
              System_Manual_v1.0
            </span>
            <div className="h-[1px] w-12 bg-neutral-200 dark:bg-neutral-800" />
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-tighter">
              Status: Documentation_Online
            </span>
          </div>
          <h1 className="bai-jamjuree-bold text-4xl md:text-5xl tracking-tight uppercase">
            Feature <span className="text-orange-600">Protocols</span>
          </h1>
        </header>

        {/* 2. Main Terminal Interface */}
        <div className="grid grid-cols-12 border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden bg-white dark:bg-[#080808] shadow-2xl">

          {/* LEFT: Directory Sidebar */}
          <div className="col-span-12 lg:col-span-4 border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-[600px]">
            {/* Search Input */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black/40">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-orange-600">$</span>
                <input
                  type="text"
                  placeholder="SEARCH_FILES..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 bg-transparent border-none text-xs font-mono focus:outline-none placeholder:text-neutral-500 uppercase"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {filteredFeatures.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveId(feature.id)}
                  className={`w-full flex items-center justify-between p-5 text-left transition-all border-b border-neutral-100 dark:border-neutral-900 group relative
                    ${activeId === feature.id ? "bg-orange-600/5 dark:bg-orange-600/10" : "hover:bg-neutral-50 dark:hover:bg-white/[0.02]"}`}
                >
                  {activeId === feature.id && (
                    <motion.div layoutId="manualActive" className="absolute left-0 top-0 bottom-0 w-1 bg-orange-600" />
                  )}

                  <div className="flex items-center gap-4">
                    <div className={`transition-colors ${activeId === feature.id ? "text-orange-600" : "text-neutral-400"}`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className={`text-xs font-bold uppercase tracking-wider space-grotesk ${activeId === feature.id ? "text-black dark:text-white" : "text-neutral-500"}`}>
                        {feature.featureName}
                      </h3>
                      <p className="font-mono text-[9px] text-neutral-400 mt-1">ID: {feature.id.toUpperCase()}_LOG</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className={`transition-transform ${activeId === feature.id ? "translate-x-1 text-orange-600" : "text-neutral-300 opacity-0 group-hover:opacity-100"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Detail View Area */}
          <div className="col-span-12 lg:col-span-8 h-[600px] overflow-y-auto p-8 md:p-12 relative bg-[#fafafa] dark:bg-[#060606]">

            {/* Background Tech Detail */}
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Cpu size={120} className="text-orange-600" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="relative "
              >
                {/* 1. Header Meta */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-orange-600 text-white rounded-sm shadow-lg shadow-orange-600/20">
                    {activeFeature.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl bai-jamjuree-bold tracking-tight uppercase">
                      {activeFeature.featureName}
                    </h2>
                    <span className="font-mono text-[10px] text-orange-600 font-bold uppercase tracking-widest">
                      Protocol // 0{featuresList.findIndex(f => f.id === activeId) + 1}
                    </span>
                  </div>
                </div>

                {/* 2. Description Block */}
                <div className="mb-10 p-6 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-sm">
                  <h4 className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-3 border-b border-neutral-100 dark:border-neutral-900 pb-2">
                    System_Objective
                  </h4>
                  <p className="space-grotesk text-sm md:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {activeFeature.description}
                  </p>
                </div>

                {/* 3. Execution Sequence */}
                <div className="mb-10">
                  <h4 className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-6 flex items-center gap-2">
                    <Terminal size={10} /> Execution_Steps
                  </h4>
                  <div className="grid gap-4">
                    {activeFeature.howToUse.map((step, idx) => (
                      <div key={idx} className="flex gap-4 group">
                        <span className="font-mono text-xs text-orange-600 font-bold opacity-50 group-hover:opacity-100 transition-opacity pt-1">
                          0{idx + 1}
                        </span>
                        <p className="text-sm space-grotesk text-neutral-700 dark:text-neutral-300 bg-neutral-100/50 dark:bg-white/[0.03] p-3 rounded-sm w-full border border-transparent group-hover:border-neutral-200 dark:group-hover:border-neutral-800 transition-all">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Tips Footer */}
                {activeFeature.tips && (
                  <div className="flex items-start gap-4 p-4 bg-orange-600/5 border border-orange-600/20 rounded-sm">
                    <CheckCircle className="text-orange-600 mt-0.5 shrink-0" size={16} />
                    <div>
                      <h5 className="font-mono text-[9px] font-bold uppercase text-orange-600 tracking-tighter">Optimization_Tip</h5>
                      <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-1 uppercase tracking-tight">
                        {activeFeature.tips}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Support Section */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between p-8 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0A0A0A] rounded-sm gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="bai-jamjuree-bold text-xl">Technical Support Needed?</h3>
            <p className="space-grotesk text-xs text-neutral-500 uppercase tracking-wider">Our architects are available for direct consultation.</p>
          </div>
          <a
            href="mailto:support@antinodeai.space"
            className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-orange-600 dark:hover:bg-orange-600 hover:text-white transition-all rounded-sm shadow-xl"
          >
            Open_Ticket
          </a>
        </div>
      </div>
    </div>
  );
};

export default Tutorial
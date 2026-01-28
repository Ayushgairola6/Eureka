import React, { useState } from "react";
import {
  Loader2,
  BrainCircuit,
  Code2,
  Workflow,
  Globe,
  FileText,
  Search,
  Database,
  Files,
  ScanSearch,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useAppSelector } from "../store/hooks";

type WebSearchStatusProps = {
  chat: any;
  lastMessageId?: string | number;
};

// --- Helper: Domain Favicon & Name (Full Visibility) ---
const LinkChip = ({ url }: { url: string }) => {
  if (typeof url !== 'string') return null;

  try {
    const domain = new URL(url).hostname;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-md hover:border-zinc-400 dark:hover:border-zinc-500 transition-all shadow-sm group"
      >
        <img
          className="h-4 w-4 rounded-sm opacity-80 group-hover:opacity-100 transition-opacity"
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt=""
        />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 space-grotesk break-all">
          {domain}
        </span>
      </a>
    );
  } catch (e) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 break-all">
        {url}
      </span>
    );
  }
};

// --- Configuration Map (The Logic Engine) ---
const STATUS_HANDLERS: Record<string, any> = {
  "reading_links": {
    icon: BrainCircuit,
    title: "Consuming Content",
    color: "text-purple-600 dark:text-purple-400",
    render: (data: any) => {
      const links = Array.isArray(data) ? data : [data];
      return (
        <div className="flex flex-wrap gap-2 mt-2 w-full">
          {links.map((link, idx) => (
            <LinkChip key={idx} url={typeof link === 'string' ? link : link?.url} />
          ))}
        </div>
      );
    },
  },
  "Understanding_Intent": {
    icon: BrainCircuit,
    title: "Deconstructing Intent",
    color: "text-fuchsia-600 dark:text-fuchsia-400",
    render: (data: any) => (
      <div className="mt-1 p-3 bg-fuchsia-50 dark:bg-fuchsia-950/20 border border-fuchsia-100 dark:border-fuchsia-900/50 rounded-md">
        <p className="text-sm text-zinc-700 dark:text-zinc-300 bai-jamjuree-regular leading-relaxed">
          {Array.isArray(data) ? data[0] : data}
        </p>
      </div>
    ),
  },
  "Crawling_deep_web": {
    icon: Globe,
    title: "Deep Web Traversal",
    color: "text-indigo-600 dark:text-indigo-400",
    render: (data: any) => (
      <div className="mt-2 flex flex-col gap-2">
        <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider space-grotesk">Targeting Node:</span>
        <LinkChip url={Array.isArray(data) ? data[0] : data} />
      </div>
    ),
  },
  "processing_links": {
    icon: Search,
    title: "Source Verification",
    color: "text-emerald-600 dark:text-emerald-400",
    render: (data: any) => {
      const links = Array.isArray(data) ? data : [];
      return (
        <div className="flex flex-col gap-2 mt-2 w-full">
          <span className="text-xs text-zinc-400 uppercase tracking-widest font-semibold space-grotesk">
            {links.length} Valid Sources Found
          </span>
          <div className="flex flex-wrap gap-2">
            {links.map((link: string, i: number) => (
              <LinkChip key={i} url={link} />
            ))}
          </div>
        </div>
      );
    },
  },
  "fetching_url": {
    icon: Loader2,
    title: "Data Extraction",
    color: "text-blue-600 dark:text-blue-400",
    render: (data: any) => {
      const links = Array.isArray(data) ? data : [];
      return (
        <div className="mt-2 w-full">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs text-blue-500 font-bold uppercase tracking-wider space-grotesk">Active Stream</span>
          </div>
          <div className="flex flex-col gap-2 pl-4 border-l-2 border-blue-100 dark:border-blue-900/30">
            {links.map((link, idx) => (
              <div key={idx} className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <ArrowRight size={12} className="text-blue-400" />
                <span className="text-sm break-all font-mono">
                  {typeof link === 'string' ? link : link?.url}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    },
  },
  "Understanding Request": {
    icon: BrainCircuit,
    title: "Strategic Analysis",
    color: "text-rose-600 dark:text-rose-400",
    render: (data: any) => (
      <div className="mt-2 flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
        <Activity className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-rose-500 uppercase tracking-wide space-grotesk">Orchestrator</span>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 bai-jamjuree-regular leading-relaxed">
            {data}
          </p>
        </div>
      </div>
    ),
  },
  "Creating functions": {
    icon: Code2,
    title: "Generating Logic Functions",
    color: "text-amber-600 dark:text-amber-400",
    render: (data: any) => {
      let funcCount = 0;
      try {
        const parsed = JSON.parse(Array.isArray(data) ? data[0] : data);
        funcCount = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
      } catch { funcCount = 1; }
      return (
        <div className="mt-2 flex items-center gap-3">
          <span className="flex items-center justify-center h-8 w-8 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold rounded-md border border-amber-200 dark:border-amber-800 space-grotesk">
            {funcCount}
          </span>
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Tools Mapped</span>
            <span className="text-sm text-zinc-700 dark:text-zinc-300 font-mono break-all">{String(data).slice(0, 100)}...</span>
          </div>
        </div>
      );
    },
  },
  "Creating phases": {
    icon: Workflow,
    title: "Execution Plan",
    color: "text-indigo-600 dark:text-indigo-400",
    render: (data: any) => (
      <div className="mt-2 w-full">
        <div className="relative w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500 animate-[shimmer_2s_infinite] bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px]" />
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 bai-jamjuree-regular">{data}</p>
      </div>
    ),
  },
  "Searching web": {
    icon: Globe,
    title: "Global Query Execution",
    color: "text-sky-600 dark:text-sky-400",
    render: (data: any) => {
      const text = (Array.isArray(data) ? data[0] : data) || "";
      const query = text.replace(/Searced web for|"/g, "");
      return (
        <div className="mt-2 flex items-start gap-3 bg-sky-50 dark:bg-sky-900/10 p-3 rounded-md border border-sky-100 dark:border-sky-900/20">
          <Search className="w-4 h-4 text-sky-500 mt-1 shrink-0" />
          <span className="text-base font-medium text-sky-900 dark:text-sky-200 bai-jamjuree-regular leading-snug">
            "{query}"
          </span>
        </div>
      );
    },
  },
  "Reading docs": {
    icon: FileText,
    title: "Contextual Extraction",
    color: "text-emerald-600 dark:text-emerald-500",
    render: (data: any) => (
      <div className="mt-2 pl-4 border-l-2 border-emerald-200 dark:border-emerald-800">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 bai-jamjuree-regular leading-relaxed">{data}</p>
      </div>
    ),
  },
  "Scanning memories": {
    icon: ScanSearch,
    title: "Long-term Recall",
    color: "text-rose-600 dark:text-rose-400",
    render: (data: any) => (
      <div className="mt-2 flex gap-3 items-center p-2 rounded-md bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
        <div className="flex space-x-1">
          {[0, 150, 300].map(d => <div key={d} className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
        </div>
        <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">{data}</span>
      </div>
    ),
  },
  "found-documents-by-name": {
    icon: Files,
    title: "Document Retrieval",
    color: "text-teal-600 dark:text-teal-400",
    render: (data: any) => (
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs font-bold text-teal-600 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded border border-teal-200 dark:border-teal-800 space-grotesk">INTERNAL DOCS</span>
        <span className="text-sm text-zinc-700 dark:text-zinc-300">{data}</span>
      </div>
    ),
  },
  "Reading public knowledgebase": {
    icon: Database,
    title: "Knowledge Base Query",
    color: "text-blue-600 dark:text-blue-500",
    render: (data: any) => (
      <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 bai-jamjuree-regular bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded">
        Querying base... <span className="font-semibold text-zinc-800 dark:text-zinc-200">{data}</span>
      </div>
    ),
  },
  "Gathered DocumentInformation": {
    icon: CheckCircle2,
    title: "Context Synthesis Complete",
    color: "text-green-600 dark:text-green-500",
    render: () => <span className="mt-1 block text-sm text-green-600 dark:text-green-400 font-medium">Ready to generate response.</span>
  },
  "Metadata_analysis": {
    icon: Activity,
    title: "Metadata Analysis",
    color: "text-pink-600 dark:text-pink-500",
    render: (data: any) => <span className="mt-1 block text-sm text-zinc-500">Processing tags: {data}</span>
  },
  "Cleaning_Context": {
    icon: Loader2,
    title: "Refining Data Context",
    color: "text-blue-500",
    render: (data: any) => <span className="mt-1 block text-sm text-zinc-500 italic">{data}</span>
  },
  "new_thread": {
    icon: BrainCircuit,
    title: "Thread Initialization",
    color: "text-cyan-500",
    render: (data: any) => <span className="mt-1 block text-sm text-zinc-500">Spawning new thread ID: {data}</span>
  },
};

const WebSearchStatus: React.FC<WebSearchStatusProps> = ({ chat, lastMessageId }) => {
  const { web_search_status, showProcess } = useAppSelector((s) => s.socket || {});
  const [isOpen, setIsOpen] = useState(true);

  // Logic to determine if this component should even show
  const isActive = (!lastMessageId) || (chat?.id || chat?.message_id) === lastMessageId;
  if (!isActive) return null;

  const isProcessActive = showProcess?.status === false && showProcess.message_id !== (chat?.id || chat?.message_id);
  // if (!isActive || !web_search_status || web_search_status.length === 0) return null;

  const currentMessageStatus = web_search_status.find(
    e => String(e.MessageId) === String(chat.id || chat.message_id)
  );

  return (
    <div className={`my-6 w-full border rounded-xl overflow-hidden transition-all duration-300 
      ${isProcessActive
        ? "border-zinc-200 dark:border-zinc-800 opacity-70 bg-zinc-50 dark:bg-black"
        : "border-zinc-300 dark:border-zinc-700 shadow-lg bg-white dark:bg-zinc-950"
      }`}>

      {/* --- Transparency Header --- */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-3 cursor-pointer bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            {/* Blinking indicator for active process */}
            {!isProcessActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${!isProcessActive ? "bg-emerald-500" : "bg-zinc-400"}`}></span>
          </div>

          <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-widest space-grotesk">
            Process Logs <span className="text-zinc-400 font-normal ml-2 normal-case">({web_search_status.length} ops)</span>
          </span>
        </div>
        <button className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* --- Full Transparency Log --- */}
      <div className={`transition-all duration-500 ease-in-out ${isOpen ? "h-auto opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="flex flex-col gap-0 px-6 py-6">
          {currentMessageStatus && currentMessageStatus?.status.length > 0 &&
            currentMessageStatus.status.map((status, index) => {
              const isLast = index === currentMessageStatus.status.length - 1;;

              // Normalize key for lookup
              let configKey = status?.message;
              if (configKey && configKey.includes("Searching web")) configKey = "Searching web";

              const config = STATUS_HANDLERS[configKey] || {
                icon: Activity,
                title: status?.message,
                color: "text-zinc-500",
                render: (d: any) => <span className="text-sm text-zinc-500">{String(d)}</span>
              };

              const Icon = config.icon;

              return (
                <div key={index} className="flex gap-4 relative pb-8 last:pb-0 group">
                  {/* Timeline Connector */}
                  {!isLast && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-800 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700 transition-colors" />
                  )}

                  {/* Icon Node */}
                  <div className={`relative  shrink-0 h-8 w-8 rounded-lg flex items-center justify-center bg-white dark:bg-zinc-900 border transition-all duration-300
                    ${isLast
                      ? "border-zinc-400 dark:border-zinc-500 ring-4 ring-zinc-100 dark:ring-zinc-800 shadow-md scale-110"
                      : "border-zinc-200 dark:border-zinc-800 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100"
                    }`}>
                    <Icon size={16} className={config.color} />
                  </div>

                  {/* Step Content */}
                  <div className={`flex flex-col min-w-0 w-full pt-1 ${!isLast ? "opacity-80" : "opacity-100"}`}>
                    <span className="text-base font-bold text-zinc-800 dark:text-zinc-100 leading-none mb-1 bai-jamjuree-bold">
                      {config.title}
                    </span>
                    <div className="w-full">
                      {config.render(status.data)}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default WebSearchStatus;
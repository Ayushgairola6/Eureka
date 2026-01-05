import React from "react";
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
} from "lucide-react";
import { useAppSelector } from "../store/hooks";

type WebSearchStatusProps = {
  chat: any;
  lastMessageId?: string | number;
};

const WebSearchStatus: React.FC<WebSearchStatusProps> = ({
  chat,
  lastMessageId,
}) => {
  const { web_search_status } = useAppSelector((s) => s.socket || {});

  // Only render when this chat is the latest message for streaming/status display
  const isActive = !lastMessageId || chat?.id === lastMessageId;

  if (!isActive) return null;

  return (
    <div className="flex flex-col gap-3 my-2 w-full max-w-full overflow-hidden">
      {web_search_status.map((status, index) => {
        const isLast = index === web_search_status.length - 1;
        const msg = status?.message;
        const data = status?.data;

        // Common wrapper for all status types to ensure consistent spacing
        const StatusWrapper = ({
          icon: Icon,
          title,
          children,
          colorClass = "text-blue-500",
        }: any) => (
          <div
            className={`flex flex-col gap-1 transition-all  ${
              !isLast ? "opacity-70" : "opacity-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 ${
                  isLast ? " ring-1 ring-blue-400/30" : ""
                } `}
              >
                <Icon
                  size={14}
                  className={`${isLast ? colorClass : "text-gray-500"}`}
                />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider bai-jamjuree-semibold">
                {title}
              </span>
              {isLast && (
                <div className="signal">
                  <div className="bar" style={{ ["--i" as any]: 0 }}></div>
                  <div className="bar" style={{ ["--i" as any]: 1 }}></div>
                  <div className="bar" style={{ ["--i" as any]: 2 }}></div>
                  <div className="bar" style={{ ["--i" as any]: 3 }}></div>
                </div>
              )}
            </div>
            <div className="ml-8 border-l-2 border-gray-100 dark:border-zinc-800 pl-4 py-1">
              {children}
            </div>
          </div>
        );

        if (msg === "reading_links") {
          return (
            <StatusWrapper
              key={index}
              icon={BrainCircuit}
              title="Reading"
              colorClass="text-purple-500"
            >
              <span className="flex items-center justify-start gap-2">
                <img
                  className="h-5 w-5 rounded-full"
                  src={`https://www.google.com/s2/favicons?domain=${
                    new URL(data).hostname
                  }&sz=64`}
                  alt=""
                />
                <a
                  className="text-sm text-gray-900 dark:text-gray-300 truncate max-w-[200px] sm:max-w-md cursor-pointer bai-jamjuree-regular"
                  href={data}
                >
                  {Array.isArray(data) ? data[0] : data}
                </a>
              </span>
            </StatusWrapper>
          );
        }

        if (msg === "processing_links") {
          const links = Array.isArray(data) ? data : [];
          return (
            <StatusWrapper
              key={index}
              icon={Search}
              title={`Sources Found (${links.length})`}
              colorClass="text-emerald-500"
            >
              <div className="flex flex-wrap gap-2 mt-1">
                {links.slice(0, 3).map((link: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-2 py-1 rounded text-md dark:text-gray-300 text-gray-900 max-w-[120px] sm:max-w-[180px] space-grotesk"
                  >
                    {/* <ExternalLink size={10} className="shrink-0" /> */}
                    <img
                      className="h-5 w-5 rounded-full"
                      src={`https://www.google.com/s2/favicons?domain=${
                        new URL(link).hostname
                      }&sz=64`}
                      alt=""
                    />
                    <a href={link} className="truncate cursor-pointer">
                      {new URL(link).hostname}
                    </a>
                  </div>
                ))}
                {links.length > 3 && (
                  <span className="text-[10px] text-gray-400 self-center">
                    +{links.length - 3} more
                  </span>
                )}
              </div>
            </StatusWrapper>
          );
        }

        if (msg === "fetching_url") {
          const url = Array.isArray(data) ? data[0] : data;
          return (
            <StatusWrapper
              key={index}
              icon={Loader2}
              title="Extracting Content"
              colorClass="text-blue-500"
            >
              <div className="flex items-center gap-2">
                <div className="h-1 w-24 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 animate-progress-loading" />
                </div>
                <p className="text-[11px] text-green-500 font-mono truncate max-w-[150px] sm:max-w-xs">
                  {url}
                </p>
              </div>
            </StatusWrapper>
          );
        }
        if (msg === "Cleaning_Context") {
          const chunk = Array.isArray(data) ? data[0] : data;
          return (
            <StatusWrapper
              key={index}
              icon={Loader2}
              title="Analyzing..."
              colorClass="text-blue-500"
            >
              <div className="flex items-center gap-2">
                <p className="text-xs space-grotesk dark:text-gray-400 text-gray-600  ">
                  {chunk}
                </p>
              </div>
            </StatusWrapper>
          );
        }
        if (msg === "Understanding Request") {
          return (
            <StatusWrapper
              key={index}
              icon={BrainCircuit}
              title="Analyzing Intent"
              colorClass="text-purple-500"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                <p className="text-[11px] text-zinc-500 font-medium">
                  Orchestrating tools...
                </p>
              </div>
            </StatusWrapper>
          );
        }

        // 2. PHASE: FUNCTION GENERATION
        if (msg === "Creating functions") {
          // Try to parse to show a count, fallback to raw string
          let funcCount = 0;
          try {
            const parsed = JSON.parse(data[0]);
            // Assuming ExtractedFunctions is an object or array
            funcCount = Array.isArray(parsed)
              ? parsed.length
              : Object.keys(parsed).length;
          } catch (e) {
            funcCount = 1;
          }

          return (
            <StatusWrapper
              key={index}
              icon={Code2}
              title="Generating Logic"
              colorClass="text-amber-500"
            >
              <div className="flex items-center gap-2">
                <div className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded border border-amber-200 dark:border-amber-800">
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                    {funcCount} Functions
                  </p>
                </div>
                <p className="text-[11px] text-zinc-400">mapped</p>
              </div>
            </StatusWrapper>
          );
        }

        // 3. PHASE: STRATEGIC PHASES
        if (msg === "Creating phases") {
          return (
            <StatusWrapper
              key={index}
              icon={Workflow}
              title="Building Execution Plan"
              colorClass="text-indigo-500"
            >
              <div className="h-1 w-24 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                {/* Striped progress bar for "planning" feel */}
                <div className="h-full w-full bg-indigo-400 opacity-50 bg-[length:10px_10px] bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] animate-[progress-loading_1s_linear_infinite]" />
              </div>
            </StatusWrapper>
          );
        }

        // 4. PHASE: WEB SEARCH
        if (msg === "Searching web" || msg.includes("Searching web")) {
          const cleanData = Array.isArray(data) ? data[0] : data;
          // Extract just the query if the string is messy
          const displaySafe = cleanData
            .replace("Searced web for", "")
            .replace(/"/g, "")
            .slice(0, 25);

          return (
            <StatusWrapper
              key={index}
              icon={Globe}
              title="Browsing External Data"
              colorClass="text-sky-500"
            >
              <div className="flex items-center gap-2 max-w-full">
                <Search className="w-3 h-3 text-sky-400" />
                <p className="text-[11px] text-sky-600 dark:text-sky-400 truncate max-w-[140px]">
                  {displaySafe}...
                </p>
              </div>
            </StatusWrapper>
          );
        }

        // 5. PHASE: READING DOCUMENTS (Private)
        if (msg === "Reading docs") {
          return (
            <StatusWrapper
              key={index}
              icon={FileText}
              title="Analyzing Documents"
              colorClass="text-emerald-600"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold">
                  RAG
                </span>
                <div className="h-1 w-1 rounded-full bg-emerald-400" />
                <p className="text-[11px] text-zinc-500 truncate">
                  Contextual extraction
                </p>
              </div>
            </StatusWrapper>
          );
        }

        // 6. PHASE: MEMORY SCAN
        if (msg === "Scanning memories") {
          return (
            <StatusWrapper
              key={index}
              icon={ScanSearch} // or History
              title="Recalling Preferences"
              colorClass="text-rose-500"
            >
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1 h-1 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1 h-1 bg-rose-400 rounded-full animate-bounce"></div>
                </div>
                <span className="text-[11px] text-rose-400/80">
                  Querying long-term memory
                </span>
              </div>
            </StatusWrapper>
          );
        }

        // 7. PHASE: FOUND DOCUMENTS (Metadata)
        if (msg === "found-documents-by-name") {
          // Extract number if possible, e.g. "Found 3 documents..."
          const text = Array.isArray(data) ? data[0] : data;
          const match = text.match(/\d+/);
          const count = match ? match[0] : "?";

          return (
            <StatusWrapper
              key={index}
              icon={Files}
              title="Locating Files"
              colorClass="text-teal-500"
            >
              <div className="flex items-center gap-2">
                <span className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-[10px] font-bold px-1.5 rounded">
                  {count}
                </span>
                <span className="text-[11px] text-zinc-500">
                  files identified
                </span>
              </div>
            </StatusWrapper>
          );
        }

        // 8. PHASE: KNOWLEDGE BASE (Public/Static)
        if (msg === "Reading public knowledgebase") {
          return (
            <StatusWrapper
              key={index}
              icon={Database}
              title="Consulting Knowledge"
              colorClass="text-blue-600"
            >
              <div className="w-full h-1 bg-gray-200 dark:bg-zinc-700 rounded overflow-hidden">
                <div className="h-full bg-blue-500 w-1/2 animate-[shimmer_1.5s_infinite]" />
              </div>
            </StatusWrapper>
          );
        }

        // 9. PHASE: GATHERED INFO (Completion of a step)
        if (msg === "Gathered DocumentInformation") {
          return (
            <StatusWrapper
              key={index}
              icon={FileText} // Or CheckCircle
              title="Context Secured"
              colorClass="text-green-600"
            >
              <p className="text-[11px] text-zinc-500">Ready to synthesize</p>
            </StatusWrapper>
          );
        }
        return null;
      })}
    </div>
  );
};

export default WebSearchStatus;

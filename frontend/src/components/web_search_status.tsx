import React, { useState, useEffect, useRef } from "react";
import {
  Loader2, BrainCircuit, Code2, Workflow, Globe, FileText, Search,
  Database, Files, ScanSearch, ChevronDown, ChevronUp, Activity,
  CheckCircle2, Monitor, Calculator, AlertCircle, Cpu, Zap, BookOpen,
  MemoryStick, RefreshCw, FileArchive, CreditCard, LucideGitGraph, Unlink2Icon,
  BookCheck,
  ChartColumnStacked,
  LucideMonitor
} from "lucide-react";
import { useAppSelector } from "../store/hooks";
import { RiNodeTree } from "react-icons/ri";
import { MdCached, MdScoreboard } from "react-icons/md";

// ─── Types ────────────────────────────────────────────────────────────────────
type WebSearchStatusProps = {
  chat: any;
  lastMessageId?: string | number;
};

type StepConfig = {
  icon: React.ElementType;
  label: string;
  accent: string;
};

// ─── LinkChip (Enhanced with hover-lift) ──────────────────────────────────────
const LinkChip = ({ url }: { url: string }) => {
  let domain = "";
  try {
    const cleaned = url?.includes("://") ? url.trim() : url?.split(":").slice(1).join(":").trim();
    domain = new URL(cleaned).hostname;
  } catch {
    domain = url?.trim() || "";
  }

  if (!domain) return null;

  return (
    <a
      href={`https://${domain}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 
                 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <img
        className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
        alt=""
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        {domain}
      </span>
    </a>
  );
};

// ─── Step config map ──────────────────────────────────────────────────────────
const STEP_CONFIG: Record<string, StepConfig> = {
  "reading_source": { icon: BookOpen, label: "Reading Source", accent: "purple" },
  "Understanding_Intent": { icon: BrainCircuit, label: "Understanding Intent", accent: "fuchsia" },
  "Crawling_deep_web": { icon: Globe, label: "Deep Web Crawl", accent: "indigo" },
  "processing_links": { icon: Search, label: "Source Verification", accent: "emerald" },
  "fetching_url": { icon: Loader2, label: "Fetching URL", accent: "blue" },
  "Understanding Request": { icon: BrainCircuit, label: "Analysing Request", accent: "rose" },
  "Creating functions": { icon: Code2, label: "Generating Tools", accent: "amber" },
  "Creating phases": { icon: Workflow, label: "Building Execution Plan", accent: "indigo" },
  "Searching web": { icon: Globe, label: "Web Search", accent: "sky" },
  "Reading docs": { icon: FileText, label: "Reading Document", accent: "emerald" },
  "Scanning memories": { icon: ScanSearch, label: "Memory Scan", accent: "rose" },
  "found-documents-by-name": { icon: Files, label: "Document Retrieved", accent: "teal" },
  "Reading public knowledgebase": { icon: Database, label: "Knowledge Base Query", accent: "blue" },
  "Gathered DocumentInformation": { icon: CheckCircle2, label: "Context Ready", accent: "green" },
  "Metadata_analysis": { icon: Activity, label: "Metadata Analysis", accent: "pink" },
  "Cleaning_Context": { icon: RefreshCw, label: "Creating Context", accent: "blue" },
  "Done_Scraping": { icon: CheckCircle2, label: "Done reading", accent: "sky" },
  "Unable_to_read_link": { icon: AlertCircle, label: "Could Not Read Source", accent: "red" },
  "new_thread": { icon: Cpu, label: "Thread Initialized", accent: "cyan" },
  "Found_Chunk_Count": { icon: Calculator, label: "Vectors Quantified", accent: "cyan" },
  "Searching_Records": { icon: BrainCircuit, label: "Index Lookup", accent: "violet" },
  "Checking_Quota": { icon: Monitor, label: "Checking Usage", accent: "amber" },
  "Checking_Plan": { icon: CreditCard, label: "Verifying Plan", accent: "teal" },
  "understanding_query": { icon: LucideGitGraph, label: "Generating embeddings", accent: "green" },
  "Reading_dynamically": { icon: MemoryStick, label: "Reading dynamically", accent: "teal" },
  "Reading_document": { icon: FileArchive, label: "Reading Document", accent: "sky" },
  "Unknown_Event": { icon: Unlink2Icon, label: "Unable to create event", accent: "red" },
  "source_processed": { icon: RefreshCw, label: "Creating Context", accent: "blue" },
  "research_complete": { icon: CheckCircle2, label: "Done Reading", accent: "sky" },
  "source_unavailable": { icon: AlertCircle, label: "Could Not Read Source", accent: "red" },
  "analyzing_images": { icon: ScanSearch, label: "Analysing Images", accent: "violet" },
  "diving_deeper": { icon: Workflow, label: "Going Deeper", accent: "indigo" },
  "Agent Thought": { icon: BrainCircuit, label: "Agent Thought", accent: "fuchsia" }, // Added for your new backend logic
  'started_reading': { icon: BookCheck, label: "Started reading sources", accent: "sky" },
  "extracting_content": { icon: RiNodeTree, label: "Extracting more data", accent: "purple" },
  "chunks_processed": { icon: ChartColumnStacked, label: "Extracting more data", accent: "purple" },
  "checking_compatibility": { icon: MdScoreboard, label: "Scoring chunks", accent: "green" },
  "research_stored": { icon: MdCached, label: "Context secured", accent: "green" },
  "max_nodes": { icon: LucideMonitor, label: "Reached maximum context limit", accent: "amber" }

};

const FALLBACK_CONFIG: StepConfig = { icon: Zap, label: "Processing", accent: "neutral" };

// ─── Accent helpers ───────────────────────────────────────────────────────────
const accentIcon: Record<string, string> = {
  purple: "text-purple-500", fuchsia: "text-fuchsia-500", indigo: "text-indigo-500",
  emerald: "text-emerald-500", blue: "text-blue-500", rose: "text-rose-500",
  amber: "text-amber-500", sky: "text-sky-500", teal: "text-teal-500",
  green: "text-green-500", pink: "text-pink-500", cyan: "text-cyan-500",
  violet: "text-violet-500", red: "text-red-500", neutral: "text-neutral-400",
};

const accentBg: Record<string, string> = {
  purple: "bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30",
  fuchsia: "bg-fuchsia-50 dark:bg-fuchsia-950/20 border-fuchsia-100 dark:border-fuchsia-900/30",
  indigo: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30",
  emerald: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30",
  blue: "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30",
  rose: "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30",
  amber: "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30",
  sky: "bg-sky-50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/30",
  teal: "bg-teal-50 dark:bg-teal-950/20 border-teal-100 dark:border-teal-900/30",
  green: "bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30",
  pink: "bg-pink-50 dark:bg-pink-950/20 border-pink-100 dark:border-pink-900/30",
  cyan: "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-100 dark:border-cyan-900/30",
  violet: "bg-violet-50 dark:bg-violet-950/20 border-violet-100 dark:border-violet-900/30",
  red: "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30",
  neutral: "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800",
};

const accentDot: Record<string, string> = {
  purple: "bg-purple-500", fuchsia: "bg-fuchsia-500", indigo: "bg-indigo-500",
  emerald: "bg-emerald-500", blue: "bg-blue-500", rose: "bg-rose-500",
  amber: "bg-amber-500", sky: "bg-sky-500", teal: "bg-teal-500",
  green: "bg-green-500", pink: "bg-pink-500", cyan: "bg-cyan-500",
  violet: "bg-violet-500", red: "bg-red-500", neutral: "bg-neutral-400",
};

// ─── Unified step data renderer (NO TRUNCATION) ───────────────────────────────
const StepData = ({ message, data, accent }: { message: string; data: any; accent: string }) => {
  const bg = accentBg[accent] || accentBg.neutral;
  const dot = accentDot[accent] || accentDot.neutral;
  const iconText = accentIcon[accent] || accentIcon.neutral;

  const toString = (d: any): string => {
    if (!d && d !== 0) return "";
    if (typeof d === "string") return d;
    if (Array.isArray(d)) return d.map(toString).filter(Boolean).join(", ");
    return String(d);
  };

  // ── URL-type handlers (show LinkChips) ──
  if (["reading_links", "Crawling_deep_web", "processing_links", "fetching_url"].includes(message)) {
    const urls = Array.isArray(data) ? data : [data];

    // Flatten in case of comma-separated strings
    const flatUrls = urls.flatMap((u: any) => typeof u === 'string' ? u.split(',') : [u]).map((u: string) => u.trim()).filter(Boolean);

    return (
      <div className="mt-2 space-y-2">
        {message === "fetching_url" && (
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
            <span className={`text-[10px] uppercase tracking-widest font-semibold ${iconText} font-mono`}>
              Active Stream
            </span>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {flatUrls.map((u: string, i: number) => <LinkChip key={i} url={u} />)}
        </div>
        {message === "processing_links" && (
          <p className={`text-[10px] ${iconText} font-mono mt-1`}>
            {flatUrls.length} source{flatUrls.length !== 1 ? "s" : ""} verified
          </p>
        )}
      </div>
    );
  }

  // ── Search query ──
  if (message === "Searching web") {
    const raw = toString(data);
    const query = raw.replace(/Searched web for|"/g, "").trim();
    return (
      <div className={`mt-2 flex items-start gap-2 px-3 py-2 rounded-lg border ${bg}`}>
        <Search className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${iconText}`} />
        <span className="text-xs text-neutral-800 dark:text-neutral-200 font-mono leading-snug italic">
          "{query}"
        </span>
      </div>
    );
  }

  // ── Smart Rendering for Arrays of Strings (e.g., Agent Thoughts) ──
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
    return (
      <div className="mt-2 space-y-1.5 border-l-2 border-neutral-200 dark:border-neutral-800 pl-3">
        {data.map((item, i) => (
          <p key={i} className="text-xs text-neutral-600 dark:text-neutral-400 font-mono leading-relaxed italic">
            "{item}"
          </p>
        ))}
      </div>
    );
  }

  // ── Smart Rendering for Objects/JSON ──
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return (
      <pre className="mt-2 p-2 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  }

  // ── Generic text fallback (NO TRUNCATION) ──
  const text = toString(data);
  if (!text) return null;

  return (
    <div className="mt-1.5 p-2 rounded-md bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/50">
      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono leading-relaxed whitespace-pre-wrap break-words">
        {text}
      </p>
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
const WebSearchStatus: React.FC<WebSearchStatusProps> = ({ chat, lastMessageId }) => {
  const { web_search_status, showProcess } = useAppSelector((s) => s.socket || {});
  const [isOpen, setIsOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isActive = !lastMessageId || (chat?.id || chat?.message_id) === lastMessageId;
  if (!isActive) return null;

  const isDone = showProcess?.status === false &&
    showProcess.message_id !== (chat?.id || chat?.message_id);

  const currentMessageStatus = web_search_status?.find(
    (e: any) => String(e.MessageId) === String(chat?.id || chat?.message_id)
  );

  if (!currentMessageStatus) return null;

  const steps = currentMessageStatus.status || [];
  const lastStep = steps[steps.length - 1];

  // Auto-scroll to bottom when new steps arrive
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [steps.length, isOpen]);

  const normaliseKey = (msg: string) => {
    if (!msg) return msg;
    if (msg.startsWith("Searching web")) return "Searching web";
    return msg;
  };

  const getConfig = (msg: string): StepConfig & { resolvedLabel: string } => {
    const key = normaliseKey(msg);
    const cfg = STEP_CONFIG[key] || FALLBACK_CONFIG;
    return { ...cfg, resolvedLabel: cfg.label || msg };
  };

  const lastConfig = getConfig(lastStep?.message || "");

  return (
    <div className={`my-4 w-full rounded-xl border overflow-hidden transition-all duration-500 ${isDone
      ? "border-neutral-200 dark:border-neutral-800 opacity-70"
      : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg shadow-neutral-200/50 dark:shadow-none"
      }`}>

      {/* ── Header ── */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 hover:from-neutral-100 dark:hover:from-neutral-800 transition-all border-b border-neutral-200 dark:border-neutral-800"
      >
        <div className="flex items-center gap-3">
          {/* live/done dot */}
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            {!isDone && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${!isDone ? "bg-emerald-500" : "bg-neutral-400"}`} />
          </span>

          <div className="flex flex-col items-start">
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-100 space-grotesk tracking-tight">
              {lastConfig.resolvedLabel || "Process Logs"}
            </span>
            {!isDone && (
              <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-mono">
                Live
              </span>
            )}
          </div>

          <span className="text-[10px] text-neutral-400 dark:text-neutral-600 font-mono ml-2">
            {steps.length} step{steps.length !== 1 ? "s" : ""}
          </span>
        </div>

        <span className="text-neutral-400 dark:text-neutral-500 flex-shrink-0 transition-transform duration-200">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* ── Log feed (Terminal Style Scroll) ── */}
      {isOpen && (
        <div
          ref={scrollRef}
          className="px-4 py-4 space-y-0 bg-white dark:bg-neutral-950 max-h-[500px] overflow-y-auto scroll-smooth"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#525252 transparent' }}
        >
          {steps.map((status: any, index: number) => {
            const isLast = index === steps.length - 1;
            const cfg = getConfig(status?.message || "");
            const Icon = cfg.icon;
            const iconColor = accentIcon[cfg.accent] || accentIcon.neutral;

            return (
              <div key={index} className="flex gap-3 relative pb-6 last:pb-0 group">
                {/* connector line */}
                {!isLast && (
                  <div className="absolute left-[13px] top-8 bottom-0 w-px bg-gradient-to-b from-neutral-300 to-transparent dark:from-neutral-700 dark:to-transparent" />
                )}

                {/* icon node */}
                <div className={`relative flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-500 ${isLast
                  ? "bg-white dark:bg-neutral-900 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] dark:shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 opacity-60 group-hover:opacity-100"
                  }`}>
                  <Icon
                    size={14}
                    className={`${iconColor} ${isLast && cfg.icon === Loader2 ? "animate-spin" : ""} transition-transform duration-300`}
                  />
                </div>

                {/* content */}
                <div className={`flex-1 min-w-0 pt-0.5 transition-all duration-300 ${isLast ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold space-grotesk leading-none ${isLast ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'}`}>
                      {cfg.resolvedLabel || status?.message}
                    </span>
                    {isLast && !isDone && (
                      <span className="flex h-1.5 w-1.5">
                        <span className={`animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full ${accentDot[cfg.accent]} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${accentDot[cfg.accent]}`}></span>
                      </span>
                    )}
                  </div>

                  <StepData
                    message={normaliseKey(status?.message || "")}
                    data={status?.data}
                    accent={cfg.accent}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WebSearchStatus;
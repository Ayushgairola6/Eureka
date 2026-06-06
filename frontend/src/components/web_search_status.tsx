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
  // ArrowRight,
  Monitor,
  Calculator,
  AlertCircle,
  Cpu,
  Zap,
  BookOpen,
  // MemoryStick,
  RefreshCw,
  // ClipboardCheck,
  CreditCard,
} from "lucide-react";
import { useAppSelector } from "../store/hooks";

// ─── Types ────────────────────────────────────────────────────────────────────

type WebSearchStatusProps = {
  chat: any;
  lastMessageId?: string | number;
};

type StepConfig = {
  icon: React.ElementType;
  label: string;
  accent: string; // single tailwind color token e.g. "sky"
};

// ─── LinkChip ─────────────────────────────────────────────────────────────────

const LinkChip = ({ url }: { url: string }) => {
  let domain = "";
  try {
    // Handle both "https://domain.com" and "URL: https://domain.com" formats
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
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors group max-w-xs"
    >
      <img
        className="w-3.5 h-3.5 rounded-xs flex-shrink-0"
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
        alt=""
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <span className="text-[11px] space-grotesk text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200 truncate">
        {domain}
      </span>
    </a>
  );
};

// ─── Step config map ──────────────────────────────────────────────────────────
// Each entry defines the icon, human label, and one accent color.
// Rendering logic is separate and unified — no per-handler wildly different markup.

const STEP_CONFIG: Record<string, StepConfig> = {
  "reading_links": { icon: BookOpen, label: "Reading Source", accent: "purple" },
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
  "Cleaning_Context": { icon: RefreshCw, label: "Cleaning Context", accent: "blue" },
  "Done_Scraping": { icon: CheckCircle2, label: "Source Read", accent: "sky" },
  "Unable_to_read_link": { icon: AlertCircle, label: "Could Not Read Source", accent: "red" },
  "new_thread": { icon: Cpu, label: "Thread Initialized", accent: "cyan" },
  "Found_Chunk_Count": { icon: Calculator, label: "Vectors Quantified", accent: "cyan" },
  "Searching_Records": { icon: BrainCircuit, label: "Index Lookup", accent: "violet" },
  "Checking_Quota": { icon: Monitor, label: "Checking Usage", accent: "amber" },
  "Checking_Plan": { icon: CreditCard, label: "Verifying Plan", accent: "teal" },
};

const FALLBACK_CONFIG: StepConfig = {
  icon: Zap,
  label: "",
  accent: "neutral",
};

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

// ─── Unified step data renderer ───────────────────────────────────────────────

const StepData = ({ message, data, accent }: { message: string; data: any; accent: string }) => {
  const bg = accentBg[accent] || accentBg.neutral;
  const dot = accentDot[accent] || accentDot.neutral;
  const iconText = accentIcon[accent] || accentIcon.neutral;

  // Normalise data to a display string
  const toString = (d: any): string => {
    if (!d && d !== 0) return "";
    if (typeof d === "string") return d;
    if (Array.isArray(d)) return d.map(toString).filter(Boolean).join(", ");
    return String(d);
  };

  // ── URL-type handlers (show LinkChips) ──
  if (["reading_links", "Crawling_deep_web"].includes(message)) {
    const urls = Array.isArray(data) ? data : [data];
    return (
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {urls.map((u: string, i: number) => <LinkChip key={i} url={u} />)}
      </div>
    );
  }

  if (message === "processing_links" || message === "fetching_url") {
    const urls = Array.isArray(data) ? data : [data];
    return (
      <div className="mt-1.5 space-y-1">
        {message === "fetching_url" && (
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
            <span className={`text-[10px] uppercase tracking-widest font-semibold ${iconText} space-grotesk`}>
              Active Stream
            </span>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {urls.map((u: string, i: number) => {
            // fetching_url sometimes sends comma-separated strings
            const parts = typeof u === "string" ? u.split(",") : [u];
            return parts.map((p: string, j: number) => <LinkChip key={`${i}-${j}`} url={p.trim()} />);
          })}
        </div>
        {message === "processing_links" && (
          <p className={`text-[10px] ${iconText} space-grotesk mt-1`}>
            {urls.length} source{urls.length !== 1 ? "s" : ""} verified
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
      <div className={`mt-1.5 flex items-start gap-2 px-3 py-2 rounded-lg border ${bg}`}>
        <Search className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${iconText}`} />
        <span className="text-sm text-neutral-800 dark:text-neutral-200 bai-jamjuree-regular leading-snug">
          "{query}"
        </span>
      </div>
    );
  }

  // ── Tool / function count ──
  if (message === "Creating functions") {
    let funcCount = 1;
    try {
      const parsed = JSON.parse(Array.isArray(data) ? data[0] : data);
      funcCount = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
    } catch { /* keep 1 */ }
    return (
      <div className="flex items-center gap-2 mt-1.5">
        <span className={`px-2 py-0.5 rounded-md text-xs font-bold space-grotesk ${iconText} ${bg} border`}>
          {funcCount} tools
        </span>
        <span className="text-[11px] text-neutral-400 space-grotesk">mapped to agent</span>
      </div>
    );
  }

  // ── Vector count ──
  if (message === "Found_Chunk_Count") {
    return (
      <div className="flex items-center gap-2 mt-1.5">
        <span className={`px-2 py-0.5 rounded-md text-xs font-bold font-mono ${iconText} ${bg} border`}>
          {toString(data)}
        </span>
        <span className="text-[11px] text-neutral-400 space-grotesk">vectors identified</span>
      </div>
    );
  }

  // ── Thread ID ──
  if (message === "new_thread") {
    return (
      <div className="flex items-center gap-2 mt-1.5">
        <span className="text-[10px] text-neutral-400 space-grotesk uppercase tracking-wider">ID</span>
        <code className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
          {toString(data)}
        </code>
      </div>
    );
  }

  // ── Plan check ──
  if (message === "Checking_Plan") {
    return (
      <div className="flex items-center gap-2 mt-1.5">
        <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Status</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${iconText} ${bg} border`}>
          {toString(data)}
        </span>
      </div>
    );
  }

  // ── Success / complete — no data body needed ──
  if (message === "Gathered DocumentInformation") {
    return (
      <div className="flex items-center gap-1.5 mt-1">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className="text-xs text-green-600 dark:text-green-400 space-grotesk">Ready to generate response</span>
      </div>
    );
  }

  // ── Error state ──
  if (message === "Unable_to_read_link") {
    const text = toString(data);
    return (
      <div className={`mt-1.5 flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${bg}`}>
        <AlertCircle className={`w-3.5 h-3.5 flex-shrink-0 ${iconText}`} />
        <span className="text-xs text-neutral-600 dark:text-neutral-400 space-grotesk truncate">{text}</span>
      </div>
    );
  }

  // ── Generic text fallback ──
  const text = toString(data);
  if (!text) return null;

  return (
    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 bai-jamjuree-regular leading-relaxed">
      {text.length > 180 ? text.slice(0, 180) + "…" : text}
    </p>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────

const WebSearchStatus: React.FC<WebSearchStatusProps> = ({ chat, lastMessageId }) => {
  const { web_search_status, showProcess } = useAppSelector((s) => s.socket || {});
  const [isOpen, setIsOpen] = useState(true);

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

  // Normalise key (handles "Searching web for X" → "Searching web")
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
    <div className={`my-4 w-full rounded-xl border overflow-hidden transition-opacity duration-300 ${isDone
      ? "border-neutral-200 dark:border-neutral-800 opacity-60"
      : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
      }`}>

      {/* ── Header ── */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-200 dark:border-neutral-800"
      >
        <div className="flex items-center gap-2.5">
          {/* live/done dot */}
          <span className="relative flex h-2 w-2 flex-shrink-0">
            {!isDone && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${!isDone ? "bg-emerald-500" : "bg-neutral-400"}`} />
          </span>

          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 space-grotesk truncate max-w-[220px]">
            {lastConfig.resolvedLabel || "Process Logs"}
          </span>

          <span className="text-[10px] text-neutral-400 dark:text-neutral-600 space-grotesk">
            {steps.length} step{steps.length !== 1 ? "s" : ""}
          </span>
        </div>

        <span className="text-neutral-400 dark:text-neutral-500 flex-shrink-0">
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {/* ── Log feed ── */}
      {isOpen && (
        <div className="px-4 py-3 space-y-0 bg-white dark:bg-neutral-950">
          {steps.map((status: any, index: number) => {
            const isLast = index === steps.length - 1;
            const cfg = getConfig(status?.message || "");
            const Icon = cfg.icon;
            const iconColor = accentIcon[cfg.accent] || accentIcon.neutral;

            return (
              <div key={index} className="flex gap-3 relative pb-5 last:pb-0">
                {/* connector line */}
                {!isLast && (
                  <div className="absolute left-[13px] top-7 bottom-0 w-px bg-neutral-100 dark:bg-neutral-800" />
                )}

                {/* icon node */}
                <div className={`relative flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${isLast
                  ? "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 shadow-sm"
                  : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 opacity-50"
                  }`}>
                  <Icon
                    size={13}
                    className={`${iconColor} ${isLast && cfg.icon === Loader2 ? "animate-spin" : ""}`}
                  />
                </div>

                {/* content */}
                <div className={`flex-1 min-w-0 pt-0.5 transition-opacity ${!isLast ? "opacity-50" : "opacity-100"}`}>
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 space-grotesk leading-none">
                    {cfg.resolvedLabel || status?.message}
                  </span>
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
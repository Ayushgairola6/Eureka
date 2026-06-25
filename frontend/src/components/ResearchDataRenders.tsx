import { useState } from "react";
import { GiArchiveResearch } from "react-icons/gi";
import { TbExternalLink, TbChevronDown, TbChevronUp, TbWorld, TbFileText, TbPhoto } from "react-icons/tb";
import { IoBarChartSharp } from "react-icons/io5";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { HandleVisualizationRequest, toggleInsights, setIsVisualizing } from "../store/visualierSlice.ts";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

// ─── Types matching backend SourceNode structure ─────────────────────────────
interface SourceNode {
    title: string;
    favicon: string;
    url: string;
    content: string;
    score: number;
    type: "webpage" | "document";
    images: { url: string; analysis: string }[];
    children: {
        pages: SourceNode[];
        documents: SourceNode[];
    };

}

interface ResearchData {
    sources: string[];
    favicons: string[];
    details: SourceNode[] | null;  // Array of root nodes
    queries: string[];
    isSynthesized: boolean;
}

export interface MessageResearch {
    MessageId: string;
    research_data: ResearchData;
    timestamp: string;
    status: "complete" | "partial" | "failed" | "pending";
}

// ─── Type config — drives all per-type visual decisions ───────────────────────
const TYPE_CFG = {
    webpage: {
        border: "border-l-sky-500",
        dot: "bg-sky-400",
        dotGlow: "shadow-[0_0_7px_rgba(56,189,248,0.55)]",
        ring: "border-sky-500/40",
        icon: TbWorld,
        iconColor: "text-sky-600",
        label: "WEB",
    },
    document: {
        border: "border-l-amber-500",
        dot: "bg-amber-400",
        dotGlow: "shadow-[0_0_7px_rgba(251,191,36,0.55)]",
        ring: "border-amber-500/40",
        icon: TbFileText,
        iconColor: "text-amber-600",
        label: "DOC",
    },
} as const;

// ─── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
    const pct = Math.min(Math.round(score * 100), 100);
    const color =
        pct >= 70 ? "bg-emerald-400" :
            pct >= 40 ? "bg-sky-400" :
                "bg-neutral-600";
    return (
        <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-10 h-[3px] dark:bg-neutral-800 bg-neutral-200 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
            <span className="bai-jamjuree-regular text-[9px] dark:text-neutral-600 text-neutral-400 tabular-nums">
                {pct}%
            </span>
        </div>
    );
}

// ─── Meta badge ────────────────────────────────────────────────────────────────
function MetaBadge({
    icon: Icon,
    count,
    label,
}: {
    icon: React.ElementType;
    count: number;
    label: string;
}) {
    if (!count) return null;
    return (
        <span className="flex items-center gap-[3px] px-1.5 py-[3px] rounded border dark:border-neutral-800 border-neutral-200 dark:bg-neutral-900/60 bg-neutral-50 text-[8px] bai-jamjuree-regular dark:text-neutral-500 text-neutral-500 shrink-0">
            <Icon size={7} />
            {count} {label}
        </span>
    );
}

// ─── Source node card ──────────────────────────────────────────────────────────
function SourceNode({
    source,
    index,
    isLast,
    depth = 0,
}: {
    source: SourceNode;
    index: number;
    isLast: boolean;
    depth?: number;
}) {
    const [expanded, setExpanded] = useState(depth === 0); // Auto-expand root nodes

    const cfg = TYPE_CFG[source.type ?? "webpage"];
    const TypeIcon = cfg.icon;

    let hostname = source.url;
    try { hostname = new URL(source.url).hostname.replace(/^www\./, ""); } catch { /* noop */ }

    // Compute meta from children structure
    const childPages = source.children?.pages?.length || 0;
    const childDocuments = source.children?.documents?.length || 0;
    const imagesAnalyzed = source.images?.length || 0;
    const hasMeta = childPages > 0 || childDocuments > 0 || imagesAnalyzed > 0;
    const hasChildren = childPages > 0 || childDocuments > 0;

    return (
        <div className="relative" style={{ paddingLeft: depth > 0 ? "24px" : "0" }}>
            {/* Vertical connector for nested nodes */}
            {depth > 0 && (
                <>
                    <div
                        className="absolute left-0 top-0 w-px dark:bg-neutral-800 bg-neutral-300"
                        style={{ height: isLast ? "26px" : "100%" }}
                    />
                    <div className="absolute left-0 top-[25px] w-5 h-px dark:bg-neutral-800 bg-neutral-300" />
                    <div
                        className={`absolute left-[17px] top-[21px] w-[9px] h-[9px] rounded-full border-2 ${cfg.ring} ${cfg.dot} ${cfg.dotGlow} z-10`}
                    />
                </>
            )}

            {/* Card */}
            <div
                className={`${depth > 0 ? "ml-4" : ""} mb-3 rounded-lg overflow-hidden border border-l-2 dark:border-neutral-800 border-neutral-200 ${cfg.border} dark:bg-neutral-950 bg-white hover:dark:border-neutral-700 hover:border-neutral-300 transition-all duration-200`}
            >
                {/* ── Header row ── */}
                <div
                    className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer group select-none"
                    onClick={() => setExpanded(!expanded)}
                >
                    {/* Index */}
                    <span className="space-grotesk text-[8px] dark:text-neutral-700 text-neutral-400 w-4 shrink-0 tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Type icon */}
                    <TypeIcon size={10} className={`${cfg.iconColor} shrink-0 opacity-70`} />

                    {/* Favicon */}
                    <img
                        src={source.favicon || `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
                        className="h-[15px] w-[15px] rounded-sm bg-white p-[1px] shrink-0"
                        alt=""
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />

                    {/* Title + hostname */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] bai-jamjuree-semibold dark:text-neutral-200 text-neutral-900 line-clamp-1 group-hover:text-sky-400 transition-colors duration-150">
                            {source.title}
                        </p>
                        <p className="text-[9px] bai-jamjuree-regular text-purple-500 truncate mt-[1px]">
                            {hostname}
                        </p>
                    </div>

                    {/* Score + chevron */}
                    <div className="flex items-center gap-2 shrink-0">
                        <ScoreBar score={source.score} />
                        <span className="dark:text-neutral-700 text-neutral-400 group-hover:dark:text-neutral-400 group-hover:text-neutral-600 transition-colors">
                            {expanded ? <TbChevronUp size={11} /> : <TbChevronDown size={11} />}
                        </span>
                    </div>
                </div>

                {/* ── Meta badges — always visible when children exist ── */}
                {hasMeta && (
                    <div className="flex items-center gap-1.5 px-3 pb-2.5 flex-wrap">
                        <MetaBadge icon={TbWorld} count={childPages} label="pages" />
                        <MetaBadge icon={TbFileText} count={childDocuments} label="docs" />
                        <MetaBadge icon={TbPhoto} count={imagesAnalyzed} label="images" />
                    </div>
                )}

                {/* ── Expanded content ── */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? "max-h-[500px] overflow-scroll opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                        }`}
                >
                    <div className="px-3 pb-3 border-t dark:border-neutral-800/60 border-neutral-100">
                        <Streamdown className="space-grotesk text-[15px] leading-relaxed dark:text-neutral-200 text-neutral-800 pt-3">
                            {source?.content}
                        </Streamdown>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t dark:border-neutral-800/40 border-neutral-100">
                            <span className="space-grotesk text-[9px] dark:text-neutral-600 text-neutral-400 uppercase tracking-wider">
                                Relevance:{" "}
                                <span className="text-sky-400">
                                    {Math.round(source.score * 100)}%
                                </span>
                            </span>
                            <a
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 text-[9px] bai-jamjuree-semibold dark:text-neutral-500 text-neutral-500 hover:text-sky-400 transition-colors uppercase tracking-wide"
                            >
                                Visit Source <TbExternalLink size={9} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Render children recursively ── */}
            {expanded && hasChildren && (
                <div className="mt-1">
                    {source.children.pages.map((child, idx) => (
                        <SourceNode
                            key={`page-${child.url}-${idx}`}
                            source={child}
                            index={idx}
                            isLast={idx === source.children.pages.length - 1 && source.children.documents.length === 0}
                            depth={depth + 1}
                        />
                    ))}
                    {source.children.documents.map((child, idx) => (
                        <SourceNode
                            key={`doc-${child.url}-${idx}`}
                            source={child}
                            index={source.children.pages.length + idx}
                            isLast={idx === source.children.documents.length - 1}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Root node header ──────────────────────────────────────────────────────────
function RootNode({
    status,
    count,
    MessageId,
    queries,
}: {
    status: MessageResearch["status"];
    count: number;
    MessageId: string;
    queries: string[];
}) {
    const STATUS_CFG = {
        complete: { label: "SYNTHESIS READY", dot: "bg-emerald-400", glow: "shadow-[0_0_8px_rgba(52,211,153,0.5)]", text: "text-emerald-400" },
        partial: { label: "PARTIAL GRAPH", dot: "bg-amber-400 animate-pulse", glow: "shadow-amber-400/40", text: "text-amber-400" },
        pending: { label: "BUILDING", dot: "bg-sky-400 animate-pulse", glow: "shadow-sky-400/40", text: "text-sky-400" },
        failed: { label: "GRAPH FAILED", dot: "bg-red-500", glow: "shadow-red-500/40", text: "text-red-400" },
    }[status] ?? { label: "UNKNOWN", dot: "bg-neutral-500", glow: "", text: "text-neutral-500" };

    const dispatch = useAppDispatch();

    function Visualize() {
        if (!MessageId) return;
        dispatch(toggleInsights(true));
        dispatch(setIsVisualizing(true));
        dispatch(HandleVisualizationRequest({ MessageId }))
            .unwrap()
            .then((res) => toast.message(res.message))
            .catch((err) => toast.error(err))
            .finally(() => dispatch(setIsVisualizing(false)));
    }

    return (
        <div className="flex items-start justify-between gap-3 mb-1 pl-1">
            <div className="flex flex-col gap-1.5 min-w-0">
                {/* Status row */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_CFG.dot} shadow-lg ${STATUS_CFG.glow}`} />
                    <GiArchiveResearch className="dark:text-neutral-500 text-neutral-600 text-sm shrink-0" />
                    <span className="bai-jamjuree-semibold text-[10px] dark:text-neutral-400 text-neutral-700 uppercase tracking-widest">
                        Research Graph
                    </span>
                    <span className="dark:text-neutral-700 text-neutral-400 text-[9px]">·</span>
                    <span className={`bai-jamjuree-regular text-[9px] uppercase tracking-wide ${STATUS_CFG.text}`}>
                        {STATUS_CFG.label}
                    </span>
                    {count > 0 && (
                        <>
                            <span className="dark:text-neutral-700 text-neutral-400 text-[9px]">·</span>
                            <span className="bai-jamjuree-regular text-[9px] dark:text-neutral-500 text-neutral-500">
                                {count} root source{count !== 1 ? "s" : ""}
                            </span>
                        </>
                    )}
                </div>

                {/* Query preview */}
                {queries?.[0] && (
                    <p className="bai-jamjuree-regular text-[9px] dark:text-neutral-600 text-neutral-500 italic truncate max-w-[300px] pl-[18px]">
                        "{queries[0]}"
                    </p>
                )}
            </div>

            {/* Visualize button */}
            <button
                onClick={Visualize}
                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md dark:bg-neutral-900 bg-neutral-100 border dark:border-neutral-800 border-neutral-200 text-[9px] bai-jamjuree-semibold dark:text-neutral-400 text-neutral-600 dark:hover:bg-neutral-800 hover:bg-neutral-200 transition-colors uppercase tracking-wide"
            >
                <IoBarChartSharp size={10} />
                Visualize
            </button>
        </div>
    );
}

// ─── Main export ───────────────────────────────────────────────────────────────
export function ResearchDataCenter() {
    const { ResearchData } = useAppSelector((s) => s.interface);
    if (!ResearchData || ResearchData.length === 0) return null;

    return (
        <>
            {ResearchData.map((data: any) => {
                if (!data?.MessageId) return null;

                const { details, queries } = data.research_data;
                const hasData =
                    (data.status === "complete" || data.status === "partial") &&
                    Array.isArray(details) &&
                    details.length > 0;

                return (
                    <div
                        onClick={() => console.log(ResearchData)}

                        key={data.MessageId}
                        className="mt-5 pl-4 border-l-2 border-dashed dark:border-neutral-800 border-neutral-300 flex flex-col gap-3"
                    >
                        <RootNode
                            status={data.status}
                            count={details?.length || 0}
                            MessageId={data.MessageId}
                            queries={queries || []}
                        />

                        <div className="relative pl-2">
                            {hasData ? (
                                <>
                                    {details!.map((source, idx) => (
                                        <SourceNode
                                            key={`${data.MessageId}-${source.url}-${idx}`}
                                            source={source}
                                            index={idx}
                                            isLast={idx === details!.length - 1}
                                            depth={0}
                                        />
                                    ))}

                                    {/* Terminal node */}
                                    <div className="relative pl-6 mt-1">
                                        <div className="absolute left-0 top-0 w-px h-[14px] dark:bg-neutral-800 bg-neutral-300" />
                                        <div className="absolute left-0 top-[13px] w-4 h-px dark:bg-neutral-800 bg-neutral-300" />
                                        <span className="bai-jamjuree-regular text-[8px] dark:text-neutral-700 text-neutral-500 uppercase tracking-wider">
                                            └─ graph complete · {details!.length} root source{details!.length !== 1 ? "s" : ""} resolved
                                        </span>
                                    </div>
                                </>
                            ) : data.status === "pending" ? (
                                <div className="pl-6 flex flex-col gap-2">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="h-12 rounded-lg dark:bg-neutral-900/80 bg-neutral-100 animate-pulse border dark:border-neutral-800 border-neutral-200"
                                            style={{ opacity: 1 - i * 0.25 }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="pl-6 bai-jamjuree-regular text-[10px] text-red-500/50 italic py-2">
                                    {">> GRAPH ERROR · no sources resolved · 0x404"}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </>
    );
}
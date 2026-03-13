import { useState } from "react";
import { GiArchiveResearch } from "react-icons/gi";
import { TbExternalLink, TbChevronDown, TbChevronUp } from "react-icons/tb";
import { useAppSelector } from "../store/hooks";

interface ResearchSource {
    title: string;
    content: string;
    url: string;
    score: number | "Unknown";
}

type ResearchData = [string[], string[], ResearchSource[]];

interface MessageResearch {
    MessageId: string;
    research_data: ResearchData;
    timestamp: number;
    status: string
}

// ─── Signal strength bars ─────────────────────────────────────────────────────
function SignalStrength({ score }: { score: number | "Unknown" }) {
    const pct = typeof score === "number" ? Math.round(score * 10) : 0;
    const bars = [25, 50, 75, 100];
    return (
        <div className="flex items-end gap-[2px]" title={`Relevance: ${pct}%`}>
            {bars.map((threshold, i) => (
                <div
                    key={i}
                    style={{ height: `${5 + i * 3}px`, width: "3px" }}
                    className={`rounded-sm ${typeof score === "number" && pct >= threshold
                        ? "bg-sky-400"
                        : "bg-neutral-700"
                        }`}
                />
            ))}
        </div>
    );
}

// ─── Source node card ─────────────────────────────────────────────────────────
function SourceNode({
    source,
    index,
    isLast,
}: {
    source: ResearchSource;
    favicon: string;
    index: number;
    isLast: boolean;
}) {
    const [expanded, setExpanded] = useState(false);

    let hostname = "";
    try { hostname = new URL(source.url).hostname; } catch { hostname = source.url; }

    return (
        <div className="relative pl-6">
            {/* Vertical line — stops halfway for last node */}
            <div
                className="absolute left-0 top-0 w-px bg-neutral-800 dark:bg-gray-50"
                style={{ height: isLast ? "22px" : "100%" }}
            />
            {/* Horizontal branch */}
            <div className="absolute left-0 top-[21px] w-5 h-px bg-neutral-700  dark:bg-gray-50" />
            {/* Branch dot */}
            <div className="absolute left-[17px] top-[17px] w-[8px] h-[8px] rounded-full border border-sky-500/50 bg-black dark:bg-white z-10 shadow-[0_0_6px_rgba(56,189,248,0.3)]" />

            {/* Card */}
            <div className="ml-4 mb-3 border border-neutral-800 rounded-lg overflow-hidden dark:bg-neutral-950 bg-white hover:border-neutral-700 transition-colors">

                {/* Header row — always visible, click to expand */}
                <div
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer group"
                    onClick={() => setExpanded(!expanded)}
                >
                    <span className="space-grotesk text-[9px] text-neutral-700 w-3 shrink-0 select-none">
                        {String(index + 1).padStart(2, "0")}
                    </span>

                    <img
                        src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
                        className=" rounded-sm p-0.5 bg-white h-4 w-4"
                        style={{ filter: "" }}
                        alt="source"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
                        }}
                    />

                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold dark:text-neutral-300 text-black line-clamp-1 bai-jamjuree-semibold group-hover:text-green-500 transition-colors">
                            {source.title}
                        </p>
                        <p className="font-mono text-[9px] dark:text-neutral-400 text-black truncate mt-0.5">
                            {hostname}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <SignalStrength score={source.score} />
                        <span className="dark:text-neutral-400 text-black group-hover:text-neutral-300 transition-colors">
                            {expanded ? <TbChevronUp size={11} /> : <TbChevronDown size={11} />}
                        </span>
                    </div>
                </div>

                {/* Expanded content */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                >
                    <div className="px-3 pb-3 border-t border-neutral-800/70">
                        <p className="space-grotesk text-[12px] leading-relaxed dark:text-neutral-200 text-black pt-3">
                            {source.content}
                        </p>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-800/50">
                            <span className="font-mono text-[9px] text-neutral-600">
                                SIG:{" "}
                                <span className="text-sky-500">
                                    {typeof source.score === "number"
                                        ? `${(source.score * 10).toFixed(0)}%`
                                        : "UNKNOWN"}
                                </span>
                            </span>
                            <a
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-[9px] bai-jamjuree-semibold dark:text-neutral-300 text-black hover:text-sky-400 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                OPEN_SOURCE <TbExternalLink size={9} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Root node header ─────────────────────────────────────────────────────────
function RootNode({ status, count }: { status: MessageResearch["status"]; count: number }) {
    const cfg = {
        complete: { label: "SYNTHESIS_READY", dot: "bg-green-400", glow: "shadow-green-400/40" },
        partial: { label: "PARTIAL_GRAPH", dot: "bg-amber-400 animate-pulse", glow: "shadow-amber-400/30" },
        pending: { label: "GRAPH_BUILDING", dot: "bg-sky-400 animate-pulse", glow: "shadow-sky-400/30" },
        failed: { label: "GRAPH_FAILED", dot: "bg-red-500", glow: "shadow-red-500/30" },
    }[status];

    return (
        <div className="flex items-center gap-2.5 mb-1 pl-1">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg?.dot} shadow-lg ${cfg?.glow}`} />
            <GiArchiveResearch className="dark:text-neutral-400 text-black text-sm" />
            <span className="bai-jamjuree-semibold text-[11px] dark:text-neutral-400 text-black uppercase tracking-wide">
                Research Graph
            </span>
            <span className="bai-jamjuree-regular text-[9px]  text-black">·</span>
            <span className="bai-jamjuree-regular text-[9px]  text-black uppercase">
                {cfg?.label}
            </span>
            {count > 0 && (
                <>
                    <span className="font-mono text-[9px] text-neutral-700">·</span>
                    <span className="font-mono text-[9px] text-neutral-700">
                        {count} node{count !== 1 ? "s" : ""}
                    </span>
                </>
            )}
        </div>
    );
}

// ─── Main exported component ──────────────────────────────────────────────────
export function ResearchDataCenter() {
    const { ResearchData } = useAppSelector(s => s.interface)
    if (!ResearchData || ResearchData.length === 0) return null;

    return (
        <>
            {ResearchData.map((data) => {
                if (!data?.MessageId) return null;

                const { favicons, details } = data.research_data;
                const hasData =
                    (data.status === "complete" || data.status === "partial") &&
                    details.length > 0;

                return (
                    <div
                        key={data.MessageId}
                        className="mt-5 pl-4 border-l-2 border-dashed border-neutral-800 flex flex-col gap-3"
                    >
                        <RootNode status={data.status} count={details.length} />

                        <div className="relative pl-2">
                            {hasData ? (
                                <>
                                    {details.map((source: any, idx: number) => (
                                        <SourceNode
                                            key={idx}
                                            source={source}
                                            favicon={favicons[idx] || ""}
                                            index={idx}
                                            isLast={idx === details.length - 1}
                                        />
                                    ))}

                                    {/* Terminal node */}
                                    <div className="relative pl-6 mt-1">
                                        <div className="absolute left-0 top-0 w-px h-[14px] dark:bg-neutral-800 bg-gray-50" />
                                        <div className="absolute left-0 top-[13px] w-4 h-px dark:bg-neutral-800 bg-gray-50" />
                                        <span className="font-mono text-[9px] dark:text-neutral-400 text-black  uppercase">
                                            └─ graph complete · {details.length} node{details.length !== 1 ? "s" : ""} resolved
                                        </span>
                                    </div>
                                </>
                            ) : data.status === "pending" ? (
                                <div className="pl-6 flex flex-col gap-2">
                                    {[1, 2].map((i) => (
                                        <div
                                            key={i}
                                            className="h-[52px] rounded-lg bg-neutral-900/80 animate-pulse border border-neutral-800"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="pl-6 font-mono text-[10px] text-red-500/50 italic py-2">
                                    {">> GRAPH_ERROR · no nodes resolved · 0x404"}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </>
    );
}
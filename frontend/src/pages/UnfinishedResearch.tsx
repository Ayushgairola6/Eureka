import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../store/hooks";
import { GiArchiveResearch } from "react-icons/gi";
import { TbClockExclamation, TbArrowRight, TbTrash, TbReload } from "react-icons/tb";
import { RiRadarLine } from "react-icons/ri";
import type { MessageResearch } from "../store/InterfaceSlice";






// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "just now";
}

function getStatusConfig(status: MessageResearch["status"]) {
    switch (status) {
        case "complete":
            return {
                label: "DATA_READY",
                dot: "bg-green-400",
                badge: "bg-green-500/10 text-green-400 border-green-500/20",
                glow: "shadow-green-500/5",
            };
        case "partial":
            return {
                label: "PARTIAL_SYNC",
                dot: "bg-amber-400 animate-pulse",
                badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                glow: "shadow-amber-500/5",
            };
        case "pending":
            return {
                label: "SCANNING_WEB",
                dot: "bg-sky-400 animate-pulse",
                badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
                glow: "shadow-sky-500/5",
            };
        case "failed":
            return {
                label: "CYCLE_FAILED",
                dot: "bg-red-500",
                badge: "bg-red-500/10 text-red-400 border-red-500/20",
                glow: "shadow-red-500/5",
            };
    }
}

// ─── Scan Line Background ─────────────────────────────────────────────────────
function ScanLines() {
    return (
        <div
            className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
            style={{
                backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)",
                backgroundSize: "100% 4px",
            }}
        />
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-32 text-center">
            <div className="relative">
                <div className="absolute inset-0 rounded-full bg-sky-500/10 blur-2xl scale-150" />
                <div className="relative w-20 h-20 rounded-full border border-dashed border-neutral-700 flex items-center justify-center">
                    <RiRadarLine className="text-neutral-600 text-3xl" />
                </div>
            </div>
            <div className="space-y-2">
                <p className="font-mono text-xs text-neutral-600 uppercase tracking-widest">
                    {">> NO_PENDING_THREADS_FOUND"}
                </p>
                <p className="bai-jamjuree-regular text-sm text-neutral-500 max-w-xs">
                    All your research sessions have been finalized or no sessions exist yet.
                </p>
            </div>
        </div>
    );
}

// ─── Research Card ────────────────────────────────────────────────────────────
function ResearchCard({
    entry,
    onResume,
    onDiscard,
}: {
    entry: MessageResearch;
    onResume: (id: string) => void;
    onDiscard: (id: string) => void;
}) {
    const { sources, favicons, details } = entry.research_data;
    const config = getStatusConfig(entry.status);
    const sourceCount = sources.length;
    const shortId = entry.MessageId.slice(-6).toUpperCase();

    return (
        <article
            className={`group relative flex flex-col gap-4 bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 hover:border-neutral-700 transition-all duration-300 shadow-lg ${config?.glow}`}
        >
            {/* Top row: ID + status + time */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-neutral-600 tracking-widest uppercase">
                        THREAD_{shortId}
                    </span>
                    <div
                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase ${config?.badge}`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${config?.dot}`} />
                        {config?.label}
                    </div>
                </div>
                <span className="font-mono text-[10px] text-neutral-600">
                    <TbClockExclamation className="inline mb-0.5 mr-1" />
                    {timeAgo(parseInt(entry?.timestamp))}
                </span>
            </div>

            {/* Source preview strip */}
            {details.length > 0 ? (
                <div className="flex flex-col gap-2">
                    {details.slice(0, 2).map((src, i) => {
                        let hostname = "";
                        try { hostname = new URL(src.url).hostname; } catch { hostname = src.url; }

                        return (
                            <div
                                key={i}
                                className="flex items-start gap-3 bg-neutral-900/60 border border-neutral-800 rounded-lg px-3 py-2.5"
                            >
                                <img
                                    src={
                                        favicons[i] ||
                                        `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
                                    }
                                    className="w-3.5 h-3.5 mt-0.5 rounded-sm grayscale"
                                    alt=""
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold text-neutral-300 truncate bai-jamjuree-semibold">
                                        {src.title}
                                    </p>
                                    <p className="text-[10px] text-neutral-600 font-mono truncate mt-0.5">
                                        {hostname}
                                    </p>
                                </div>
                                <span className="text-[9px] font-mono text-neutral-600 shrink-0 mt-0.5">
                                    {typeof src.score === "number" ? `${(src.score * 10).toFixed(0)}%` : "N/A"}
                                </span>
                            </div>
                        );
                    })}

                    {/* Overflow count */}
                    {sourceCount > 2 && (
                        <p className="text-[10px] font-mono text-neutral-600 pl-1">
                            +{sourceCount - 2} more source{sourceCount - 2 > 1 ? "s" : ""} not shown
                        </p>
                    )}
                </div>
            ) : (
                <div className="h-16 rounded-lg border border-dashed border-neutral-800 flex items-center justify-center">
                    <span className="text-[10px] font-mono text-neutral-700 uppercase tracking-widest">
                        {entry.status === "pending" ? "● Awaiting data stream..." : "No data captured"}
                    </span>
                </div>
            )}

            {/* Metadata row */}
            <div className="flex items-center gap-4 pt-1 border-t border-neutral-800/60">
                <span className="text-[10px] font-mono text-neutral-600">
                    SRC_COUNT: <span className="text-neutral-400">{sourceCount}</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-600">
                    MSG_ID: <span className="text-neutral-400 tracking-tight">{entry.MessageId.slice(-8)}</span>
                </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
                {entry.status !== "failed" && (
                    <button
                        onClick={() => onResume(entry.MessageId)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white text-black text-[11px] font-bold bai-jamjuree-semibold uppercase tracking-wide hover:bg-neutral-200 transition-colors"
                    >
                        {entry.status === "pending" ? (
                            <><TbReload className="text-sm" /> Continue Scan</>
                        ) : (
                            <><TbArrowRight className="text-sm" /> Resume & Finalize</>
                        )}
                    </button>
                )}
                <button
                    onClick={() => onDiscard(entry.MessageId)}
                    className="p-2 rounded-lg border border-neutral-800 text-neutral-600 hover:border-red-500/40 hover:text-red-400 transition-colors"
                    title="Discard"
                >
                    <TbTrash className="text-sm" />
                </button>
            </div>
        </article>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function UnfinishedResearchPage() {
    const navigate = useNavigate();
    const { ResearchData } = useAppSelector(s => s.interface);

    // Filter to only incomplete sessions: pending or partial
    // "complete" with no final report is also unfinished — no report means the pit stop was never passed
    const unfinished = ResearchData.filter(
        (entry) => entry.status === "pending" || entry.status === "partial"
    );

    // Sort by most recent first
    const sorted = [...unfinished].sort((a: any, b: any) => b.timestamp - a.timestamp);

    const [dismissed, setDismissed] = useState<Set<string>>(new Set());
    const visible = sorted.filter((e) => !dismissed.has(e.MessageId));

    function handleResume(MessageId: string) {
        navigate(`/interface?resume=${MessageId}`);
    }

    function handleDiscard(MessageId: string) {
        setDismissed((prev) => new Set([...prev, MessageId]));
        // TODO: dispatch(RemoveResearchData(MessageId)) when you wire up the action
    }

    return (
        <div className="relative min-h-screen w-full bg-black text-white overflow-hidden">
            <ScanLines />

            {/* Ambient glow top left */}
            <div className="pointer-events-none fixed top-0 left-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="pointer-events-none fixed bottom-0 right-0 w-80 h-80 bg-orange-500/4 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10 mx-auto max-w-3xl px-4 py-12 flex flex-col gap-10">

                {/* Page Header */}
                <header className="flex flex-col gap-3 border-b border-neutral-800 pb-8">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                            AntiNode / Archives /
                        </span>
                        <span className="text-[10px] font-mono text-sky-500 uppercase tracking-widest">
                            Unfinished_Threads
                        </span>
                    </div>

                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex flex-col gap-1">
                            <h1 className="bai-jamjuree-bold text-2xl md:text-3xl flex items-center gap-3">
                                <GiArchiveResearch className="text-sky-500" />
                                Unfinished Research
                            </h1>
                            <p className="space-grotesk text-sm text-neutral-500 max-w-md">
                                Sessions where data was collected but no final report was generated.
                                Resume to finalize or discard to clean up.
                            </p>
                        </div>

                        {/* Live count badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                            <span className="font-mono text-[11px] text-neutral-400">
                                {visible.length} pending thread{visible.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>

                    {/* Stats strip */}
                    {visible.length > 0 && (
                        <div className="flex items-center gap-6 pt-2">
                            {(["partial", "pending"] as const).map((s) => {
                                const count = visible.filter((e) => e.status === s).length;
                                const cfg = getStatusConfig(s);
                                return count > 0 ? (
                                    <div key={s} className="flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg?.dot}`} />
                                        <span className="font-mono text-[10px] text-neutral-500 uppercase">
                                            {count} {cfg?.label}
                                        </span>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    )}
                </header>

                {/* Content */}
                {visible.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {visible.map((entry) => (
                            <ResearchCard
                                key={entry.MessageId}
                                entry={entry}
                                onResume={handleResume}
                                onDiscard={handleDiscard}
                            />
                        ))}
                    </div>
                )}

                {/* Footer hint */}
                {visible.length > 0 && (
                    <p className="text-center font-mono text-[10px] text-neutral-700 uppercase tracking-widest">
                        {">> DATA_PERSISTS_FOR_3H >> AFTER_EXPIRY_RELOAD_FROM_DB"}
                    </p>
                )}
            </div>
        </div>
    );
}
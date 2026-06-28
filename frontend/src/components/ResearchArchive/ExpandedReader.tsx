// ExpandedReader.tsx
// Drop-in replacement. Usage:
//   <ExpandedReader source={source} />
//
// Props shape (same as original SourceDetail):
//   source.title    : string
//   source.url      : string
//   source.content  : string   (markdown supported via Streamdown)
//   source.queries? : string[]

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Streamdown } from "streamdown";
import {
    TbLink,
    TbQuote,
    TbSearch,
    TbExternalLink,
    TbX,
    TbBooksOff,
    TbChevronRight,
} from "react-icons/tb";
import { TTSRequest } from "../popups/text_toSpeech";

// ─── Slide-over panel ────────────────────────────────────────────────────────

function ReaderPanel({
    source,
    onClose,
}: {
    source: any;
    onClose: () => void;
}) {
    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    // Prevent body scroll while open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            />

            {/* Panel */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label={`Reading: ${source.title}`}
                className="
          fixed right-0 top-0 z-50 h-full
          w-full sm:w-[520px] lg:w-[600px]
          bg-white dark:bg-neutral-950
          border-l border-neutral-200 dark:border-neutral-800
          flex flex-col
          shadow-2xl
          animate-in slide-in-from-right duration-300
        "
            >
                {/* ── Header ── */}
                <header className="flex-shrink-0 flex items-start justify-between gap-4 px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex flex-col gap-1 min-w-0">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400 space-grotesk">
                            <TbBooksOff size={11} />
                            <span>Source Reader</span>
                        </div>

                        {/* Title */}
                        <h2 className="bai-jamjuree-bold text-sm text-neutral-900 dark:text-neutral-100 leading-snug line-clamp-2">
                            {source.title}
                        </h2>

                        {/* URL */}
                        <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-400 transition-colors truncate space-grotesk mt-0.5"
                        >
                            <TbLink size={10} />
                            <span className="truncate">{source.url}</span>
                            <TbExternalLink size={10} className="flex-shrink-0" />
                        </a>
                    </div>

                    {/* Close */}
                    <button
                        onClick={onClose}
                        aria-label="Close reader"
                        className="
              flex-shrink-0 mt-0.5
              p-1.5 rounded-md
              text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100
              hover:bg-neutral-100 dark:hover:bg-neutral-800
              transition-colors
            "
                    >
                        <TbX size={16} />
                    </button>
                </header>

                {/* ── Scrollable body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">

                    {/* Extracted content */}
                    <section className="flex flex-col gap-3">
                        <div className="flex items-center gap-1.5 text-neutral-400">
                            <TbQuote size={13} />
                            <span className="text-[10px] uppercase font-bold tracking-widest space-grotesk">
                                Extracted Content
                            </span>
                        </div>

                        <div className="
              bg-neutral-50 dark:bg-neutral-900
              border border-neutral-200 dark:border-neutral-800
              rounded-lg p-4
            ">
                            <Streamdown
                                className="
                  text-[15px] space-grotesk leading-7
                  text-black dark:text-white
                  prose prose-sm dark:prose-invert max-w-none
                  prose-headings:bai-jamjuree-bold
                  prose-a:text-blue-500
                  prose-code:text-orange-500
                  prose-code:bg-neutral-100 dark:prose-code:bg-neutral-800
                  prose-code:px-1 prose-code:rounded
                "
                            >
                                {source.content}
                            </Streamdown>
                        </div>
                    </section>

                    {/* Source queries */}
                    {source.queries && source.queries.length > 0 && (
                        <section className="flex flex-col gap-3">
                            <div className="flex items-center gap-1.5 text-neutral-400">
                                <TbSearch size={13} />
                                <span className="text-[10px] uppercase font-bold tracking-widest space-grotesk">
                                    Queries That Returned This Source
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {source.queries.map((q: string, i: number) => (
                                    <span
                                        key={i}
                                        className="
                      text-[11px] space-grotesk
                      bg-blue-50 dark:bg-blue-900/20
                      text-blue-600 dark:text-blue-400
                      border border-blue-200 dark:border-blue-800
                      px-2 py-1 rounded-md
                    "
                                    >
                                        {q}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* ── Footer ── */}
                <footer className="flex-shrink-0 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 space-grotesk uppercase tracking-widest font-bold">
                        AntiNode / Source Reader
                    </span>
                    <div className="flex items-center justify-center gap-2">
                        <TTSRequest text={source?.content} />
                        <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
              flex items-center gap-1.5
              text-[11px] space-grotesk font-semibold
              text-neutral-900 dark:text-neutral-100
              bg-neutral-100 dark:bg-neutral-800
              hover:bg-neutral-200 dark:hover:bg-neutral-700
              border border-neutral-200 dark:border-neutral-700
              px-3 py-1.5 rounded-md
              transition-colors
            "
                        >
                            Open original source
                            <TbExternalLink size={12} />
                        </a>
                    </div>

                </footer>
            </aside>
        </>,
        document.body
    );
}

// ─── Trigger row (replaces SourceDetail) ─────────────────────────────────────

export function ExpandedReader({ source }: { source: any }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Compact trigger row — same slot as the old accordion button */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 last:border-0">
                <button
                    onClick={() => setIsOpen(true)}
                    className="
            w-full flex items-center justify-between
            p-3
            hover:bg-neutral-50 dark:hover:bg-neutral-800/30
            transition-colors group
          "
                >
                    <div className="flex  items-center justify-between gap-3 max-w-[97%] px-1">
                        <span className="bai-jamjuree-bold text-xs truncate w-full text-neutral-900 dark:text-neutral-100">
                            {source.title}
                        </span>
                        {/* <span className="space-grotesk text-[10px] text-blue-500 truncate w-full flex items-center gap-1">
                            <TbLink size={10} />
                            {source.url}
                        </span> */}
                        <span className="
            flex items-center justify-center gap-1
            text-[10px] uppercase font-bold  space-grotesk
            bg-sky-600 text-white  p-1
            transition-colors  rounded-sm
          ">
                            Read
                            <TbChevronRight size={12} />
                        </span>
                    </div>

                    {/* "Read" affordance */}

                </button>
            </div>

            {/* Panel (portal) */}
            {isOpen && (
                <ReaderPanel source={source} onClose={() => setIsOpen(false)} />
            )}
        </>
    );
}

export default ExpandedReader;
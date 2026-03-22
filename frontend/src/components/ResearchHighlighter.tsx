import { useMemo, useState, useRef, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { Streamdown } from 'streamdown';

// ─── Panel renders outside the text flow entirely ─────────────────────────────
function SourcePanel({ source, position }: {
    source: any;
    position: { top: number; left: number };
}) {
    let domain = '';
    try { domain = new URL(source.url).hostname; } catch { domain = source.url; }
    const score = typeof source.score === 'number' ? source.score : 0; //score value of the chunk

    return (
        <div
            style={{ top: position.top, left: position.left }}
            className="absolute z-50 w-64 bg-neutral-950 border border-neutral-800 rounded-xl p-3 pointer-events-none shadow-xl"
        >
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-neutral-800">
                <img
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                    className="w-3.5 h-3.5 rounded-sm"
                    alt=""
                />
                <span className="font-mono text-[9px] text-neutral-500 truncate flex-1">{domain}</span>
                <span className="font-mono text-[9px] text-neutral-600">{score * 10}%</span>
            </div>
            <p className="text-[11px] font-semibold text-neutral-200 leading-snug mb-2 bai-jamjuree-semibold">
                {source.title}
            </p>
            <p className="font-mono text-[10px] text-neutral-500 leading-relaxed italic line-clamp-3 mb-2">
                "{source.content?.slice(0, 160)}..."
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
                <div className="flex items-end gap-[2px]">
                    {[1, 2, 3, 4].map((b) => (
                        <div
                            key={b}
                            style={{ height: `${4 + b * 3}px`, width: '3px' }}
                            className={`rounded-sm ${score * 2 >= b * 2 ? 'bg-sky-400' : 'bg-neutral-700'}`}
                        />
                    ))}
                </div>
                <span className="space grotesk text-[9px] text-neutral-700 uppercase">SRC MATCH</span>
            </div>
        </div>
    );
}

// ─── Segment builder ──────────────────────────────────────────────────────────
function buildSegments(content: string, details: any[]) {
    const matches: { index: number; length: number; source: any }[] = [];

    details.forEach((det) => {
        if (det.title && content.includes(det.title)) {
            matches.push({ index: content.indexOf(det.title), length: det.title.length, source: det });
            return;
        }
        const phrases = [
            ...Array.from(det.content?.matchAll(/\b\d+[,.]?\d*\s?(million|billion|thousand|%|qubits|years?|months?)\b/gi) || []),
            ...Array.from(det.content?.matchAll(/\b([A-Z][a-z]+ ){2,3}[A-Z][a-z]+\b/g) || []),
        ].map((m: any) => m[0]).filter((p: string) => p?.length > 10);

        for (const phrase of phrases) {
            if (content.includes(phrase)) {
                matches.push({ index: content.indexOf(phrase), length: phrase.length, source: det });
                break;
            }
        }
    });

    if (!matches.length) return null;

    matches.sort((a, b) => a.index - b.index);
    const clean = matches.filter((m, i) =>
        i === 0 || m.index >= matches[i - 1].index + matches[i - 1].length
    );

    const segments: { text: string; source?: any }[] = [];
    let cursor = 0;

    clean.forEach(({ index, length, source }) => {
        if (cursor < index) segments.push({ text: content.slice(cursor, index) });
        segments.push({ text: content.slice(index, index + length), source });
        cursor = index + length;
    });

    if (cursor < content.length) segments.push({ text: content.slice(cursor) });
    return segments;
}

// ─── Main component ───────────────────────────────────────────────────────────
export const ResearchHighlighter = ({ chat }: any) => {
    const { ResearchData } = useAppSelector(s => s.interface);
    const containerRef = useRef<HTMLDivElement>(null);
    const [activePanel, setActivePanel] = useState<{
        source: any;
        position: { top: number; left: number };
    } | null>(null);

    const segments = useMemo(() => {
        if (!chat?.message?.isComplete) return null;
        const research = ResearchData.find((r: any) => r.MessageId === chat.id);
        if (!research) return null;
        const { details } = research.research_data;
        if (!details?.length) return null;
        return buildSegments(chat.message.content, details);
    }, [chat.message.isComplete, chat.id, ResearchData]);

    // no matches — render normally, full markdown preserved
    if (!segments) {
        return <Streamdown className="bai-jamjuree-regular">{chat.message.content}</Streamdown>;
    }

    // has matches — render markdown normally, panel on container hover
    return (
        <div
            ref={containerRef}
            className="relative"
            onMouseLeave={() => setActivePanel(null)}
        >
            {/* full markdown renders untouched */}
            <Streamdown className="bai-jamjuree-regular">
                {chat.message.content}
            </Streamdown>

            {/* floating panel when a source is active */}
            {activePanel && (
                <SourcePanel source={activePanel.source} position={activePanel.position} />
            )}

            {/* invisible overlay spans that sit over matched text via findText */}
            <HighlightOverlay
                segments={segments}
                containerRef={containerRef}
                onHover={(source, position) => setActivePanel({ source, position })}
            />
        </div>
    );
};
function HighlightOverlay({ segments, containerRef, onHover }: {
    segments: { text: string; source?: any }[];
    containerRef: React.RefObject<HTMLDivElement | null>;
    onHover: (source: any, position: { top: number; left: number }) => void;
}) {
    const [rects, setRects] = useState<{ rect: DOMRect; source: any }[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;

        // wait for Streamdown to finish rendering
        const timer = setTimeout(() => {
            const container = containerRef.current;
            if (!container) return;

            const found: { rect: DOMRect; source: any }[] = [];

            segments.forEach((seg) => {
                if (!seg.source) return;

                // use TreeWalker to find text nodes containing the phrase
                const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
                let node;

                while ((node = walker.nextNode())) {
                    const idx = node.textContent?.indexOf(seg.text) ?? -1;
                    if (idx === -1) continue;

                    const range = document.createRange();
                    range.setStart(node, idx);
                    range.setEnd(node, idx + seg.text.length);

                    const rect = range.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();

                    found.push({
                        source: seg.source,
                        rect: new DOMRect(
                            rect.left - containerRect.left,
                            rect.top - containerRect.top,
                            rect.width,
                            rect.height
                        ),
                    });
                    break;
                }
            });

            setRects(found);
        }, 100); // small delay to let Streamdown render

        return () => clearTimeout(timer);
    }, [segments]);

    return (
        <>
            {rects.map((r, i) => (
                <span
                    key={i}
                    style={{
                        position: 'absolute',
                        top: r.rect.top,
                        left: r.rect.left,
                        width: r.rect.width,
                        height: r.rect.height,
                        borderBottom: '1.5px dashed rgba(56,189,248,0.5)',
                        cursor: 'pointer',
                        zIndex: 10,
                    }}
                    onMouseEnter={(e) => {
                        const container = containerRef.current;
                        if (!container) return;
                        const containerRect = container.getBoundingClientRect();
                        const spanRect = (e.target as HTMLElement).getBoundingClientRect();
                        onHover(r.source, {
                            top: spanRect.top - containerRect.top - 130,
                            left: Math.min(spanRect.left - containerRect.left, containerRect.width - 270),
                        });
                    }}
                />
            ))}
        </>
    );
}
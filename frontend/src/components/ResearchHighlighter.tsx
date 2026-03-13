// ResearchHighlighter.tsx
import { useMemo, useState } from 'react';
import { useAppSelector } from '../store/hooks';

function HighlightedText({ text, url, domain, snippet }: {
    text: string;
    url: string;
    domain: string;
    snippet: string;
}) {
    const [hovered, setHovered] = useState(false);
    return (
        <span
            className="relative border-b border-dashed border-sky-500/50 hover:border-sky-400 cursor-pointer transition-colors"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {text}
            {hovered && (
                <span className="absolute bottom-full left-0 z-50 w-64 bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 shadow-xl flex flex-col gap-1.5 pointer-events-none">
                    <span className="flex items-center gap-1.5">
                        <img
                            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                            className="w-3 h-3 rounded-sm"
                            alt=""
                        />
                        <span className="font-mono text-[9px] text-neutral-500 truncate">{domain}</span>
                    </span>
                    <span className="space-grotesk text-[10px] text-neutral-400 leading-relaxed line-clamp-3 italic">
                        "{snippet}"
                    </span>

                    <a href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[9px] text-sky-500 hover:text-sky-400 pointer-events-auto">
                        open source →
                    </a>
                </span>
            )
            }
        </span >
    );
}

function buildAttributedSegments(content: string, details: any[]) {
    // collect all matches: { index, length, source }
    const matches: { index: number; length: number; source: any }[] = [];

    details.forEach((det) => {
        // match on title first — most unique phrase in the report
        if (det.title && content.includes(det.title)) {
            matches.push({
                index: content.indexOf(det.title),
                length: det.title.length,
                source: det,
            });
        }
    });

    // sort by position, remove overlaps
    matches.sort((a, b) => a.index - b.index);
    const clean = matches.filter((m, i) =>
        i === 0 || m.index >= matches[i - 1].index + matches[i - 1].length
    );

    if (clean.length === 0) return null; // no matches — render plain

    // split content into segments
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

export const ResearchHighlighter = ({ chat }: any) => {
    const { ResearchData } = useAppSelector(s => s.interface);

    const segments = useMemo(() => {
        if (!chat?.message?.isComplete) return null;

        const research = ResearchData.find((r: any) => r.MessageId === chat.id);
        if (!research) return null;

        const { details } = research.research_data; // tuple destructure
        if (!details?.length) return null;

        return buildAttributedSegments(chat.message.content, details);
    }, [chat.message.isComplete, chat.id]); // only re-runs when stream completes

    // no matches or not complete — return null, parent renders normally
    if (!segments) return null;

    return (
        <p className="bai-jamjuree-regular text-sm leading-relaxed">
            {segments.map((seg, i) => {
                if (!seg.source) return <span key={i}>{seg.text}</span>;

                let domain = '';
                try { domain = new URL(seg.source.url).hostname; } catch { domain = seg.source.url; }

                return (
                    <HighlightedText
                        key={i}
                        text={seg.text}
                        url={seg.source.url}
                        domain={domain}
                        snippet={seg.source.content?.slice(0, 180) || ''}
                    />
                );
            })}
        </p>
    );
};
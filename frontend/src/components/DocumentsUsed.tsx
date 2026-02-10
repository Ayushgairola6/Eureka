import { useAppSelector } from "../store/hooks";
import React, { useState, type SetStateAction } from "react";
type props = {
  docused: boolean;
  setShowDocUsed: React.Dispatch<SetStateAction<boolean>>;
  chat: any;
};

const DocUsed: React.FC<props> = ({ chat }) => {
  const { favicon, docUsed } = useAppSelector((state) => state.interface);
  const [isOpen, setIsOpen] = useState(false);

  // 1. Extract Data relevant to this specific chat message

  const relevantFaviconData = favicon.find((f) => f.MessageId === chat.id);
  const sourceIcons = relevantFaviconData?.icon || [];
  const SourceUrls = relevantFaviconData?.url || []
  // Filter docused that actually have IDs (assuming logic matches your backend)
  const relevantDocs = docUsed?.find((doc: any) => {
    return doc.MessageId === chat.id;
  })?.docs;

  // 2. Helper: Check if we have anything to show
  const hasSources = sourceIcons.length > 0;
  const hasDocs = (relevantDocs?.length ?? 0) > 0;

  if (!hasSources && !hasDocs) return null;

  return (
    <div className="w-full mb-4">
      {/* Main Card Container */}
      <div
        className={`
          group border transition-all duration-200 ease-in-out rounded-xl overflow-hidden
          ${isOpen
            ? "bg-white dark:bg-neutral-950 border-gray-200 dark:border-zinc-700 shadow-sm"
            : "bg-gray-50 dark:bg-white/5 border-transparent hover:border-gray-200 dark:hover:border-zinc-700 cursor-pointer"
          }
        `}
      >
        {/* --- Header / Summary View --- */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between p-3 select-none"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Label */}
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-sparkles"
              >
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
              <span>Sources</span>
            </div>

            {/* Divider */}
            <div className="h-4 w-px bg-gray-300 dark:bg-neutral-800"></div>

            {/* Summary Content */}
            <div className="flex items-center gap-2">
              {hasSources && (
                <div className="flex -space-x-2">
                  {sourceIcons.slice(0, 3).map((icon, idx) => (
                    <img
                      key={idx}
                      src={icon}
                      alt="Source"
                      className="w-5 h-5 rounded-full border border-white dark:border-zinc-800 bg-gray-200 object-cover"
                    />
                  ))}
                  {sourceIcons.length > 3 && (
                    <span className="w-5 h-5 flex items-center justify-center rounded-full border border-white dark:border-zinc-800 bg-gray-100 dark:bg-zinc-800 text-[9px] font-bold text-gray-500">
                      +{sourceIcons.length - 3}
                    </span>
                  )}
                </div>
              )}

              <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {generateSummaryText(
                  sourceIcons?.length,
                  relevantDocs?.length || 0
                )}
              </span>
            </div>
          </div>

          {/* Chevron Icon */}
          <button
            className={`p-1 rounded-full transition-transform duration-200 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 ${isOpen ? "rotate-180 bg-gray-100 dark:bg-neutral-900" : ""
              }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* --- Expanded Content --- */}
        {isOpen && (
          <div className="px-3 pb-3 pt-0 border-t border-gray-100 dark:border-zinc-800 animate-in slide-in-from-top-2 fade-in duration-200">
            {/* 1. Web Sources Section */}
            {hasSources && (
              <div className="mt-3">
                <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                  Web Sources
                </h4>
                <div className="flex flex-col gap-2  p-2">
                  {sourceIcons.map((icon, idx) => (
                    <a
                      href={SourceUrls[idx]}
                      key={idx}
                      target="_blank"
                      className="flex items-center gap-2 bg-gray-50 dark:bg-neutral-950 curosor-pointer  px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <img src={icon?.includes('google.com') ? icon : `https://www.google.com/s2/favicons?domain=${icon}&sz=64 `} alt="" className="w-4 h-4 rounded-full" />
                      <span className="text-xs text-gray-700 dark:text-gray-300 truncate ">
                        Source {SourceUrls[idx]}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Documents Section */}
            {hasDocs && (
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                  Processed Documents
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {relevantDocs &&
                    relevantDocs?.map((doc, idx) => (
                      <div
                        key={`${doc?.doc_id}-${idx}`}
                        className="flex items-start gap-2 p-2 rounded-md bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 w-fit"
                      >
                        <div className="mt-0.5 text-blue-500 dark:text-blue-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="space-grotesk text-xs">
                            id:{doc.doc_id}
                          </span>
                          {/* Example: Show votes if relevant */}
                          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 space-grotesk">
                            <span className="text-green-600">
                              ▲ {doc.upvotes}
                            </span>
                            <span className="text-red-600">
                              ▼ {doc.downvotes}
                            </span>
                            <span className="text-sky-600">
                              ◐ {doc.partial_upvotes}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper to generate the string like "3 Sources, 1 Doc"
function generateSummaryText(iconCount: number, docCount: number): string {
  const parts = [];
  if (iconCount > 0) parts.push(`${iconCount} Web`);
  if (docCount > 0) parts.push(`${docCount} File${docCount > 1 ? "s" : ""}`);

  if (parts.length === 0) return "Information processed";
  return `Found from ${parts.join(" & ")}`;
}
export default DocUsed;

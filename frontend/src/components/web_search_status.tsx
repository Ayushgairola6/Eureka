import React from "react";
import {
  Loader2,
  // Globe,
  // CheckCircle2,
  Search,
  BrainCircuit,
  ExternalLink,
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
            className={`flex flex-col gap-1 transition-all animate-in fade-in slide-in-from-left-2 duration-300 ${
              !isLast ? "opacity-70" : "opacity-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 ${
                  isLast ? "ring-1 ring-blue-400/30" : ""
                }`}
              >
                <Icon
                  size={14}
                  className={`${
                    isLast ? "animate-pulse " + colorClass : "text-gray-500"
                  }`}
                />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                {title}
              </span>
              {isLast && (
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
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
              title="Analyzing"
              colorClass="text-purple-500"
            >
              <p className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-md">
                {Array.isArray(data) ? data[0] : data}
              </p>
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
                    className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-2 py-1 rounded text-[10px] text-gray-600 max-w-[120px] sm:max-w-[180px]"
                  >
                    <ExternalLink size={10} className="shrink-0" />
                    <span className="truncate">{new URL(link).hostname}</span>
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
                  <div className="h-full bg-blue-500 animate-progress-loading" />
                </div>
                <p className="text-[11px] text-blue-500 font-mono truncate max-w-[150px] sm:max-w-xs">
                  {url}
                </p>
              </div>
            </StatusWrapper>
          );
        }

        return null;
      })}
    </div>
  );
};

export default WebSearchStatus;

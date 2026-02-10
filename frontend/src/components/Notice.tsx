import React from "react";

export const Notice = () => {
  const [showNotice, setShowNotice] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const isSeen = sessionStorage.getItem("AntiNodePrivacySeenStatus");
      if (isSeen) {
        setShowNotice(JSON.parse(isSeen));
      }
    }
  }, []);

  return (
    <div className="fixed top-20 left-2  z-[5] transition-all duration-300">
      {showNotice ? (
        // EXPANDED STATE: The full warning
        <div className="flex flex-col gap-1 p-3 w-64 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-amber-200 dark:border-amber-900/50 rounded-lg shadow-xl ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-[11px] uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Experimental Tier
            </span>
            <button
              onClick={() => {
                sessionStorage.setItem(
                  "AntiNodePrivacySeenStatus",
                  JSON.stringify(false)
                );
                setShowNotice(false);
              }}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
            We are currently non-profitable. Our LLM providers may use data for
            training.
            <strong className="text-zinc-800 dark:text-zinc-200">
              {" "}
              Avoid sensitive Information & Documents.
            </strong>
          </p>
        </div>
      ) : (
        // MINIMIZED STATE: Just a subtle badge
        <button
          onClick={() => setShowNotice(true)}
          className="flex items-center gap-2 px-2 py-1 bg-amber-50/50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-900/30 border border-amber-200/50 dark:border-amber-900/30 rounded-full transition-all group"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          <span className="text-[10px] font-medium text-amber-800 dark:text-amber-400 opacity-70 group-hover:opacity-100">
            Privacy & Quota Info
          </span>
        </button>
      )}
    </div>
  );
};

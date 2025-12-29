import React, { useEffect, useState } from "react";
type Props = {
  isNew: string;
  setIsNew: any;
};
const InstallPWA: React.FC<Props> = ({ isNew, setIsNew }) => {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    // This will only work if the browser shows the install prompt
    // and you have a valid manifest.json
    console.log("Install clicked - browser will handle if PWA is valid");
  };

  if (!canInstall) return null;

  return (
    <>
      <div className="fixed top-10  bg-white dark:bg-[rgb(35,31,31)] border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 z-[100] max-w-sm backdrop-blur-sm ">
        <div className="flex items-start gap-3">
          {/* Icon Section */}
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-400 to-teal-600 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>

          {/* Content Section */}
          <div className="flex-1">
            <h1 className="bai-jamjuree-semibold text-lg text-gray-900 dark:text-white mb-1">
              Welcome to AntiNode
            </h1>
            <p className="space-grotesk text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
              Install AntiNode for a native app experience anytime, anywhere
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsNew("False");
                  localStorage.setItem(
                    "AntiNode-Installation-key",
                    JSON.stringify(isNew)
                  );
                  handleInstall();
                }}
                className="bai-jamjuree-regular text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-4 py-2 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-sky-500/25"
              >
                Install Now
              </button>
              <button
                onClick={() => {
                  setIsNew("False");
                  localStorage.setItem(
                    "AntiNode-Installation-key",
                    JSON.stringify(isNew)
                  );
                }}
                className="bai-jamjuree-regular text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg px-3 py-2 transition-colors duration-200"
              >
                Later
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              setIsNew("False");
              localStorage.setItem(
                "AntiNode-Installation-key",
                JSON.stringify(isNew)
              );
            }}
            className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-b-xl overflow-hidden">
          <div className="h-full bg-sky-500 animate-[progress_5s_linear]"></div>
        </div>
      </div>
    </>
  );
};
export default InstallPWA;

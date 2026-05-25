// LoadingScreen.jsx
const LoadingScreen = () => {
    return (
        <div className="h-screen bg-black flex flex-col items-center justify-center font-['Inter',_sans-serif] px-6">
            {/* Main brand - centered */}
            <div className="flex-1 flex items-center justify-center">
                <h1 className="text-white text-4xl font-light tracking-tight">
                    Antinode<span className="font-semibold">AI</span>
                </h1>
            </div>

            {/* Bottom section: logo + byline together */}
            <div className="pb-10 flex flex-col items-center space-y-2">
                <img
                    className="h-6 w-6 opacity-80"
                    src="/Antinode-AI-darkmode.png"
                    loading="lazy"
                    alt="Antinode-AI"
                />
                <p className="text-gray-300 text-xs tracking-wide font-medium">
                    by Antinode‑Labs
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;
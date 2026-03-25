import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FcGoogle } from "react-icons/fc";
import { SiGoogledrive } from "react-icons/si";
import {
    TbCheck,
    TbX,
    TbRefresh,
    TbArrowRight,
    TbWifi,
    TbLock,
    TbAlertTriangle,
} from "react-icons/tb";

// ─── State config ─────────────────────────────────────────────────────────────
const STATE_CONFIG = {
    connecting: {
        icon: null, // animated
        label: "ESTABLISHING_CONNECTION",
        sublabel: "Authenticating with Google Drive",
        color: "text-sky-400",
        dotColor: "bg-sky-400",
        border: "border-sky-500/20",
        bg: "bg-sky-500/5",
        showRetry: false,
        showContinue: false,
    },
    connected: {
        icon: TbCheck,
        label: "DRIVE_CONNECTED",
        sublabel: "Google Drive successfully linked to your account",
        color: "text-green-400",
        dotColor: "bg-green-400",
        border: "border-green-500/20",
        bg: "bg-green-500/5",
        showRetry: false,
        showContinue: true,
    },
    denied: {
        icon: TbX,
        label: "ACCESS_DENIED",
        sublabel: "You declined Drive access. You can connect it later from settings.",
        color: "text-amber-400",
        dotColor: "bg-amber-400",
        border: "border-amber-500/20",
        bg: "bg-amber-500/5",
        showRetry: true,
        showContinue: true,
    },
    token_failed: {
        icon: TbLock,
        label: "TOKEN_EXCHANGE_FAILED",
        sublabel: "Could not retrieve access tokens from Google. Please try again.",
        color: "text-red-400",
        dotColor: "bg-red-500",
        border: "border-red-500/20",
        bg: "bg-red-500/5",
        showRetry: true,
        showContinue: false,
    },
    no_refresh_token: {
        icon: TbRefresh,
        label: "TOKEN_MISSING",
        sublabel: "Google did not return a refresh token. Please disconnect and reconnect Drive in your Google account settings.",
        color: "text-amber-400",
        dotColor: "bg-amber-400",
        border: "border-amber-500/20",
        bg: "bg-amber-500/5",
        showRetry: true,
        showContinue: false,
    },
    storage_failed: {
        icon: TbAlertTriangle,
        label: "STORAGE_FAILED",
        sublabel: "Tokens received but failed to store. Please try again or contact support.",
        color: "text-red-400",
        dotColor: "bg-red-500",
        border: "border-red-500/20",
        bg: "bg-red-500/5",
        showRetry: true,
        showContinue: false,
    },
    invalid: {
        icon: TbAlertTriangle,
        label: "INVALID_REQUEST",
        sublabel: "This authorization link is invalid or has expired. Please try connecting again.",
        color: "text-red-400",
        dotColor: "bg-red-500",
        border: "border-red-500/20",
        bg: "bg-red-500/5",
        showRetry: true,
        showContinue: false,
    },
    error: {
        icon: TbWifi,
        label: "CONNECTION_ERROR",
        sublabel: "An unexpected error occurred. Our team has been notified.",
        color: "text-red-400",
        dotColor: "bg-red-500",
        border: "border-red-500/20",
        bg: "bg-red-500/5",
        showRetry: true,
        showContinue: false,
    },
    // if user lands here with no query param — initial connect state
    idle: {
        icon: SiGoogledrive,
        label: "CONNECT_DRIVE",
        sublabel: "Link your Google Drive to research your own documents",
        color: "text-sky-400",
        dotColor: "bg-sky-400",
        border: "border-sky-500/20",
        bg: "bg-sky-500/5",
        showRetry: false,
        showContinue: false,
        showConnect: true,
    },
};

// ─── Animated connecting spinner ──────────────────────────────────────────────
function ConnectingSpinner() {
    return (
        <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-dashed border-sky-500/30 animate-spin" style={{ animationDuration: "3s" }} />
            <div className="absolute inset-2 rounded-full border-t border-sky-400 animate-spin" style={{ animationDuration: "1s" }} />
            <FcGoogle className="text-lg relative z-10" />
        </div>
    );
}

// ─── Log lines that animate in ────────────────────────────────────────────────
const LOG_LINES = [
    "Initiating OAuth handshake...",
    "Verifying state parameter...",
    "Exchanging authorization code...",
    "Storing access tokens...",
    "Validating Drive permissions...",
];

function ConnectingLogs() {
    const [visible, setVisible] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisible((v) => Math.min(v + 1, LOG_LINES.length));
        }, 600);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-sm mt-4 space-y-1">
            {LOG_LINES.slice(0, visible).map((line, i) => (
                <div
                    key={i}
                    className="flex items-center gap-2 opacity-0"
                    style={{ animation: `fadeIn 0.3s ease forwards` }}
                >
                    <span className="font-mono text-[9px] text-neutral-600 w-4 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500">{line}</span>
                    {i === visible - 1 && (
                        <span className="font-mono text-[10px] text-sky-500 animate-pulse">_</span>
                    )}
                    {i < visible - 1 && (
                        <TbCheck className="text-green-500 text-xs shrink-0 ml-auto" />
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function DriveAuthPage() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<keyof typeof STATE_CONFIG>("connecting");
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const drive = params.get("drive");
        const error = params.get("error");

        if (error) {
            setStatus("error");
            return;
        }

        if (!drive) {
            setStatus("idle");
            return;
        }

        if (drive in STATE_CONFIG) {
            setStatus(drive as keyof typeof STATE_CONFIG);
        } else {
            setStatus("error");
        }

        // auto-redirect on success after 2.5s
        if (drive === "connected") {
            setTimeout(() => {
                setRedirecting(true);
                setTimeout(() => navigate("/interface"), 600);
            }, 2500);
        }
    }, []);

    const cfg = STATE_CONFIG[status];
    const Icon = cfg.icon;
    const isConnecting = status === "connecting";
    const isConnected = status === "connected";

    function handleRetry() {
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google/drive`;
    }

    function handleContinue() {
        navigate("/interface");
    }

    function handleConnect() {
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google/drive`;
    }

    return (
        <>
            <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
      `}</style>

            <div className="min-h-screen w-full bg-black flex items-center justify-center px-4">

                {/* Ambient glow */}
                <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full blur-3xl opacity-20"
                    style={{ background: isConnected ? "#22c55e" : isConnecting ? "#38bdf8" : "#ef4444" }}
                />

                {/* Card */}
                <div
                    className={`relative w-full max-w-md border rounded-2xl p-8 flex flex-col items-center gap-6 transition-all duration-500 ${cfg.border} ${cfg.bg}`}
                    style={{ animation: "scaleIn 0.4s ease forwards" }}
                >

                    {/* Top label */}
                    <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] text-neutral-600 uppercase tracking-widest">
                                AntiNode / Drive_Auth
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor} ${isConnecting ? "animate-pulse" : ""}`} />
                            <span className={`font-mono text-[9px] uppercase tracking-widest ${cfg.color}`}>
                                {cfg.label}
                            </span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-neutral-800" />

                    {/* Icon area */}
                    <div className="flex flex-col items-center gap-4">
                        {isConnecting ? (
                            <ConnectingSpinner />
                        ) : (
                            <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${cfg.border} ${cfg.bg}`}
                                style={{ animation: "scaleIn 0.3s ease 0.1s both" }}
                            >
                                {Icon && <Icon className={`text-xl ${cfg.color}`} />}
                            </div>
                        )}

                        <div className="text-center space-y-1.5">
                            <p className="bai-jamjuree-semibold text-sm text-neutral-200">
                                {isConnected
                                    ? "Drive is now linked"
                                    : isConnecting
                                        ? "Connecting to Google Drive"
                                        : cfg.label.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                            </p>
                            <p className="space-grotesk text-[11px] text-neutral-500 max-w-xs leading-relaxed">
                                {cfg.sublabel}
                            </p>
                        </div>
                    </div>

                    {/* Connecting logs */}
                    {isConnecting && <ConnectingLogs />}

                    {/* Connected — auto redirect indicator */}
                    {isConnected && (
                        <div className="w-full flex flex-col items-center gap-2">
                            <div className="w-full h-[2px] bg-neutral-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-400 rounded-full"
                                    style={{ animation: "slide 2.5s linear forwards" }}
                                />
                            </div>
                            <span className="font-mono text-[9px] text-neutral-600">
                                {redirecting ? "Redirecting..." : "Redirecting to interface in 2s..."}
                            </span>
                        </div>
                    )}

                    {/* What you get — only on idle/connect state */}
                    {"showConnect" in cfg && (
                        <div className="w-full space-y-2">
                            {[
                                "Research your own Google Docs and PDFs",
                                "Sources stay private — never shared",
                                "Read-only access — we never modify files",
                            ].map((point, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <TbCheck className="text-sky-500 text-xs shrink-0" />
                                    <span className="font-mono text-[10px] text-neutral-500">{point}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="w-full flex flex-col gap-2">
                        {"showConnect" in cfg && (
                            <button
                                onClick={handleConnect}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-black text-xs font-bold bai-jamjuree-semibold uppercase tracking-wide hover:bg-neutral-200 transition-colors"
                            >
                                <FcGoogle className="text-base" />
                                Connect Google Drive
                            </button>
                        )}

                        {cfg.showRetry && (
                            <button
                                onClick={handleRetry}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 text-xs font-mono uppercase tracking-wide hover:border-sky-500/40 hover:text-sky-400 transition-colors"
                            >
                                <TbRefresh className="text-sm" /> Try Again
                            </button>
                        )}

                        {cfg.showContinue && (
                            <button
                                onClick={handleContinue}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-neutral-800 text-neutral-500 text-xs font-mono uppercase tracking-wide hover:border-neutral-700 hover:text-neutral-400 transition-colors"
                            >
                                Continue to Interface <TbArrowRight className="text-sm" />
                            </button>
                        )}
                    </div>

                    {/* Footer */}
                    <p className="font-mono text-[9px] text-neutral-700 text-center">
                        READ_ONLY · NO_DATA_SOLD · REVOKE_ANYTIME
                    </p>
                </div>
            </div>

            <style>{`
        @keyframes slide { from { width: 0%; } to { width: 100%; } }
      `}</style>
        </>
    );
}
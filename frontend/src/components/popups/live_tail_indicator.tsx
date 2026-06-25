import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Loader2,
    Radio,
    ChevronLeft,
    Activity,
    ArrowRight
} from 'lucide-react';
import { connectSocket } from '../../store/websockteSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

const LiveTailIndicator = () => {
    const { isConnected } = useAppSelector((s) => s.socket);
    const dispatch = useAppDispatch();
    const [isConnecting, setIsConnecting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [connectionAttempts, setConnectionAttempts] = useState(0);
    const timeoutRef = useRef<any>(null);


    useEffect(() => {
        if (isConnected && isConnecting) {
            setIsConnecting(false);
            setConnectionAttempts(0);
        }
    }, [isConnected, isConnecting]);

    const handleConnect = () => {
        if (isConnected || isConnecting) return;
        setIsConnecting(true);
        setConnectionAttempts(p => p + 1);
        dispatch(connectSocket());
        setTimeout(() => setIsConnecting(false), 10000);
    };

    const handleMouseEnter = () => {
        clearTimeout(timeoutRef.current);
        setIsExpanded(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setIsExpanded(false), 600);
    };

    // ─── Collapsed: Minimal Tab ─────────────────────────────────────────────────
    if (!isExpanded) {
        return (
            <motion.div
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="fixed top-20 right-0 z-[50] cursor-pointer group"
                onMouseEnter={handleMouseEnter}
                onClick={() => setIsExpanded(true)}
            >
                <div className={`flex items-center pl-3 pr-2 py-2 rounded-l-md border-y border-l shadow-sm backdrop-blur-sm transition-colors duration-200
                    ${isConnected
                        ? "bg-white dark:bg-neutral-900 "
                        : "bg-white dark:bg-neutral-900  hover:border-amber-400 dark:hover:border-amber-600"
                    }`}
                >
                    <span className="relative flex w-1.5 h-1.5 mr-2">
                        {isConnected ? (
                            <>
                                <span className="absolute inset-0 rounded-full bg-emerald-500/30 dark:bg-emerald-400/30 animate-ping" />
                                <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                            </>
                        ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600  animate-pulse" />
                        )}
                    </span>
                    <ChevronLeft size={12} className="text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
                </div>

                {/* Tooltip */}
                <div className={`absolute right-full mr-2 top-1/2 -tranneutral-y-1/2 px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                    ${isConnected
                        ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                    }`}
                >
                    {isConnected ? "Live tail active" : "Connection interrupted"}
                </div>
            </motion.div>
        );
    }

    // ─── Expanded: Minimal Panel ────────────────────────────────────────────────
    return (
        <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15, ease: "backInOut" }}
            className="fixed top-20 right-3 z-[50]"
            onMouseLeave={handleMouseLeave}
        >
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl w-56 overflow-hidden">

                {/* Header */}
                <div className={`flex items-center justify-between px-3 py-2.5 border-b
                    ${isConnected
                        ? "border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/20"
                        : "border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/20"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500 dark:bg-emerald-400" : "bg-amber-500 dark:bg-amber-400"}`} />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                            {isConnected ? "Live Tail" : "No Tail"}
                        </span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium
                        ${isConnected
                            ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        }`}
                    >
                        {isConnected ? "ON" : "OFF"}
                    </span>
                </div>

                {/* Body */}
                <div className="px-3 py-3 space-y-3">

                    {/* Latency */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity size={14} className={`${isConnected ? "text-emerald-500 dark:text-emerald-400" : "text-neutral-400 dark:text-neutral-500"}`} />
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">Latency</span>
                        </div>
                        <span className={`text-xs font-mono font-medium
                            ${isConnected
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-neutral-400 dark:text-neutral-500"
                            }`}
                        >
                            {isConnected ? "<50ms" : "—"}
                        </span>
                    </div>

                    {/* Connect Button */}
                    {!isConnected && (
                        <button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition-all duration-200
                                ${isConnecting
                                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-wait border border-neutral-200 dark:border-neutral-700"
                                    : "bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-white text-white dark:text-neutral-900 border border-neutral-900 dark:border-neutral-100"
                                }`}
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 size={13} className="animate-spin" />
                                    <span>Connecting...</span>
                                </>
                            ) : (
                                <>
                                    <Radio size={13} />
                                    <span>{connectionAttempts > 0 ? "Retry" : "Connect"}</span>
                                    <ArrowRight size={12} className="ml-auto opacity-50" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default LiveTailIndicator;
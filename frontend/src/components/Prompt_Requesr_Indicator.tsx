import { GitMerge, Globe } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { IoHourglass, IoSubway } from 'react-icons/io5';
import { motion } from 'framer-motion'
const HUD_CONFIGS = [

    {
        name: "Web Search",
        label: "WEB_CRAWL",
        idCode: "NET_SRC_402",
        color: "text-sky-500",
        bgColor: "bg-sky-500",
        icon: <Globe size={14} className="animate-pulse" />
    },
    {
        name: "Synthesis",
        label: "SYNTH_ENGINE",
        idCode: "ML_CORE_v2",
        color: "text-purple-500",
        bgColor: "bg-purple-500",
        icon: <GitMerge size={14} className="animate-bounce" />,
    },
    {
        name: "Summary",// Used for Private RAG or general AI questions
        label: "PRIVATE_DOC_SUMMARY",
        idCode: "RAG_UNIT_01",
        color: "text-orange-600",
        bgColor: "bg-orange-600",
        icon: <IoHourglass size={14} className="animate-spin" />,
    },
    {
        name: "QNA",
        label: "PRIVATE_QNA",
        idCode: "RAG_PRIVATE_05",
        color: "text-yellow-600",
        bgColor: "bg-yellow-600",
        icon: <IoSubway size={14} className='animate-bounce' />,
    },
];



export const Loader = () => {
    const { queryType } = useAppSelector(s => s.interface)
    const { currentStatus } = useAppSelector(s => s.socket)

    const CurrentHUD = HUD_CONFIGS.find((e) => e.name.trim().toLowerCase().includes(queryType.trim().toLowerCase()))

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="relative my-4 flex items-center gap-3"
        >
            <ul className={`relative flex items-center w-fit overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#080808] p-1 rounded-md shadow-xl`}>

                {/* Dynamic Scanline - Color matches the mode */}
                <div className="absolute inset-0 z-0">
                    <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        className={`w-1/2 h-full bg-gradient-to-r from-transparent via-${CurrentHUD?.bgColor}/10 to-transparent -skew-x-12`}
                    />
                </div>

                <li className="relative z-10 flex items-center gap-3 px-3 py-1.5">
                    {/* Status Icon with Dynamic Glow */}
                    <div className="relative">
                        <div className={`${CurrentHUD?.color}`}>
                            {CurrentHUD?.icon}
                        </div>
                        <motion.div
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className={`absolute inset-0 ${CurrentHUD?.bgColor} blur-md rounded-full`}
                        />
                    </div>

                    {/* Text Area */}
                    <div

                        className="flex flex-col min-w-[140px]">
                        <div className="flex items-center gap-2">
                            <span className={`font-mono text-[9px] font-black tracking-tighter ${CurrentHUD?.color}`}>
                                {CurrentHUD?.label}
                            </span>
                            <span className="text-xs space-grotesk font-bold dark:text-neutral-300 text-neutral-700 truncate">
                                {currentStatus || "PROCESSING..."}
                            </span>
                        </div>

                        {/* Activity Bar */}
                        <div className="w-full h-[1px] bg-neutral-100 dark:bg-white/5 mt-1 relative overflow-hidden">
                            <motion.div
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                                className={`absolute inset-0 w-1/2 ${CurrentHUD?.bgColor}`}
                            />
                        </div>
                    </div>

                    {/* System ID - Meta Data */}
                    <div className="hidden sm:flex flex-col items-end ml-4 pl-4 border-l border-neutral-100 dark:border-neutral-800">
                        <span className="font-mono text-[8px] text-neutral-500 tracking-widest leading-none">STATUS_OK</span>
                        <span className="font-mono text-[9px] text-neutral-400 font-bold leading-none mt-1 uppercase">
                            {CurrentHUD?.idCode}
                        </span>
                    </div>
                </li>
            </ul>
        </motion.div>
    );
}

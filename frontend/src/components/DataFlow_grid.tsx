import { motion } from "framer-motion";

export const DataFlowGrid = () => {
    const lines = Array.from({ length: 15 });
    const packets = Array.from({ length: 5 }); // Increased for full-screen feel

    return (
        /* FIX: Changed absolute to inset-0 and ensured h-full w-full 
           The 'z-0' keeps it behind your text/terminal.
        */
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-full w-full">
            {/* Subtle Grid Lines */}
            <div className="absolute inset-0 opacity-[0.15] dark:opacity-[0.2]">
                {lines.map((_, i) => (
                    <div
                        key={`h-${i}`}
                        className="absolute w-full h-[1px] bg-neutral-500 dark:bg-neutral-700"
                        style={{ top: `${(i + 1) * 10}%` }}
                    />
                ))}
                {lines.map((_, i) => (
                    <div
                        key={`v-${i}`}
                        className="absolute h-full w-[1px] bg-neutral-500 dark:bg-neutral-700"
                        style={{ left: `${(i + 1) * 10}%` }}
                    />
                ))}
            </div>

            {/* Flying Data Packets - Now distributed across the whole screen */}
            {packets.map((_, i) => {
                // Randomly pick a grid line (10, 20, 30... 90)
                const gridLine = (Math.floor(Math.random() * 9) + 1) * 10;
                const delay = Math.random() * 20;
                const duration = Math.random() * 10 + 10; // Slower, more "ambient" travel

                return (
                    <motion.div
                        key={`p-${i}`}
                        initial={{ x: "-10%", y: `${gridLine}%`, opacity: 0 }}
                        animate={{
                            x: "110%",
                            opacity: [0, 1, 1, 0],
                        }}
                        transition={{
                            duration: duration,
                            repeat: Infinity,
                            delay: delay,
                            ease: "linear",
                        }}
                        className="absolute flex items-center"
                        style={{ top: `${gridLine}%` }}
                    >
                        {/* The Packet (Orange to match your Verified theme) */}
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_15px_#f97316]" />

                        {/* The Trail */}
                        <div className="w-32 h-[1px] bg-gradient-to-r from-orange-500/50 to-transparent" />

                        {/* Metadata Label */}
                        <span className="ml-2 text-[7px] font-mono text-neutral-900 dark:text-gray-300 uppercase tracking-tighter">
                            LOG_0x{Math.random().toString(16).slice(2, 5)}
                        </span>
                    </motion.div>
                );
            })}
        </div>
    );
};
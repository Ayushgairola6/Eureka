import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DeepWebArchitecture, SynthesisArchitecture, RoomsArchitecture } from "./Hero_State_diagram";

const diagrams = [
    {
        component: <DeepWebArchitecture />,
        label: "AUTONOMOUS_WEB_PIPELINE_V2",
        position: "translate-x-10 translate-y-10" // Optional tweaks per diagram
    },
    {
        component: <SynthesisArchitecture />,
        label: "RECURSIVE_SYNTHESIS_ENGINE",
        position: "translate-x-0 translate-y-0"
    },
    {
        component: <RoomsArchitecture />,
        label: "MULTI_USER_CONSENSUS_LAYER",
        position: "-translate-x-5 -translate-y-5"
    },
];

export const AmbientArchitectureCarousel = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % diagrams.length);
        }, 12000); // 12 seconds per slide (slow & premium)
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    className={`absolute w-full max-w-[800px] ${diagrams[index].position}`}
                    initial={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.05, y: -20, filter: "blur(8px)" }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                    {/* The Diagram */}
                    <div className="w-full opacity-40 dark:opacity-20 hover:opacity-100 transition-opacity duration-700">
                        {diagrams[index].component}
                    </div>

                    {/* Technical Label (Optional aesthetics) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="absolute -bottom-12 left-0 w-full text-center"
                    >
                        <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-400 dark:text-zinc-600 uppercase">
                            System_View: {diagrams[index].label}
                        </span>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
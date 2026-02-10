export const CHAT_THEMES = [
  {
    id: "void-prime",
    name: "Void Prime",
    color: "#000000",
    user: "bg-zinc-950 text-white dark:bg-white dark:text-black rounded-none border-l-[1px] border-zinc-500 pl-4 py-1 my-4 uppercase tracking-widest text-sm font-bold",
    ai: "bg-transparent text-zinc-800 dark:text-zinc-200 border-t border-zinc-100 dark:border-zinc-900/50 pt-6 pb-12 leading-[1.8] tracking-tight",
    // NEW: compact, high-contrast, neutral background with subtle frame
    aiSharp:
      "px-4 py-2 leading-snug rounded-sm border border-zinc-200/10 dark:border-zinc-800/60 bg-white/2 dark:bg-black/60 text-zinc-900 dark:text-zinc-100 max-w-prose break-words shadow-sm",
  },
  {
    id: "obsidian",
    name: "Obsidian",
    color: "#ffffff",
    user: "bg-white text-black font-mono border-b-4 border-black px-4 py-1",
    ai: "bg-[#050505] text-indigo-400 font-mono p-6 border border-zinc-800", // Matrix/Terminal style
    // NEW: condensed terminal block with tuned green for readable contrast
    aiSharp:
      "px-3 py-2 leading-tight rounded-sm border border-zinc-800 bg-[#050505] dark:bg-[#000] font-mono text-[#7CFF9A] dark:text-[#66FF99] max-w-prose break-words shadow-[0_6px_18px_-14px_rgba(0,255,153,0.08)]",
  },
  {
    id: "mainframe",
    name: "Mainframe",
    color: "#0ea5e9",
    user: "border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-900 dark:text-zinc-100 rounded-none px-4 py-2 font-mono text-xs",
    ai: "border-l-2 border-sky-500/50 bg-transparent text-zinc-900 dark:text-zinc-300 pl-8 my-10",
    // NEW: tighter left-accent block with clearer text contrast and compact spacing
    aiSharp:
      "pl-5 pr-4 py-2 my-3 leading-snug rounded-sm border-l-4 border-sky-500/70 bg-white/3 dark:bg-black/60 text-zinc-900 dark:text-zinc-100 max-w-prose break-words shadow-sm",
  },
  {
    id: "oxide",
    name: "Oxide",
    color: "#f97316",
    user: "bg-[#1a1a1a] text-[#f4f4f5] dark:bg-[#f4f4f5] dark:text-[#1a1a1a] rounded-none clip-path-slant px-6 py-2 shadow-[2px_2px_0px_#f97316]",
    ai: "bg-transparent text-zinc-800 dark:text-zinc-400 border-y border-zinc-100 dark:border-zinc-800/80 py-8 font-serif italic",
    // NEW: compact, industrial block with warm accent and high legibility
    aiSharp:
      "px-4 py-2 leading-snug rounded-sm border border-zinc-100/20 dark:border-zinc-800/60 bg-white/2 dark:bg-black/55 text-zinc-900 dark:text-zinc-100 font-serif italic max-w-prose break-words shadow-sm",
  },
  {
    id: "terminal-gold",
    name: "Terminal Gold",
    color: "#fbbf24",
    user: "border-b-2 border-amber-500 text-amber-600 dark:text-amber-500 font-mono font-black text-sm ",
    ai: "bg-[#fafafa] dark:bg-[#050505] text-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-900 p-8 shadow-2xl",
    // NEW: refined compact block with subtle amber tint for highlight and clarity
    aiSharp:
      "px-4 py-2 leading-snug rounded-sm border border-amber-200/25 dark:border-amber-800/45 bg-white/3 dark:bg-black/55 text-zinc-900 dark:text-zinc-100 max-w-prose break-words shadow-sm",
  },
];

import { useState, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setCurrenTheme } from "../store/InterfaceSlice";
export const CustomDropdown = () => {
  const currentTheme = useAppSelector((s) => s.interface.CurrentTheme);
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95"
      >
        <div
          className="w-5 h-5 rounded-full border border-black/5 dark:border-gray-400/70 shadow-sm"
          style={{ backgroundColor: currentTheme?.color }}
        />
        <span className="text-sm font-medium hidden sm:block">Theme</span>
      </button>

      {/* Dropdown Menu */}
      <div
        className={`
        absolute left-0 mt-2 w-48 rounded-xl border border-zinc-200 dark:border-zinc-800 
        bg-white dark:bg-zinc-900 shadow-xl z-[100] transition-all duration-200 origin-top-left
        ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }
      `}
      >
        <div className="p-1.5 space-y-1">
          <p className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
            Choose Interface
          </p>

          {CHAT_THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                dispatch(setCurrenTheme(t));
                localStorage.setItem(
                  "AntiNode_Interface_Theme",
                  JSON.stringify(t)
                );
              }}
              className={`
                w-full flex items-center gap-3 px-2 py-2 text-sm rounded-lg transition-colors
                ${
                  currentTheme.id === t.id
                    ? "bg-zinc-100 dark:bg-zinc-800"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-700"
                }
              `}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: t.color }}
              />
              <span className="flex-1 text-left">{t.name}</span>
              {currentTheme.id === t.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

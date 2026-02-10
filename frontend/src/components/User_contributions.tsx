import { FiCalendar, FiFile } from "react-icons/fi";
import { useAppSelector } from "../store/hooks";
import { setCurrTab } from '../store/AuthSlice'
import { Link } from "react-router";
import { TbTextCaption } from "react-icons/tb";
import { motion } from "framer-motion";
import { BsArrowLeft, BsArrowRight, BsArrowUpRight } from "react-icons/bs";
import React from "react";

export const UserContributions = () => {
  const containeRef = React.useRef<HTMLDivElement>(null);

  function ScrollLeft() {
    if (containeRef.current) {
      containeRef.current.scrollBy({
        left: -20,
        behavior: "smooth",
      });
    }
  }
  function ScrollRight() {
    if (containeRef.current) {
      containeRef.current.scrollBy({
        left: 20,
        behavior: "smooth",
      });
    }
  }
  const { user } = useAppSelector((state) => state.auth);

  return (
    <section
      className={`mb-8 border p-4 space-y-4 bg-transparent rounded-xl h-auto w-full`}
    >
      <div className="flex justify-between items-center mb-2 bai-jamjuree-regular">
        <h2 className="md:text-xl text-lg font-bold flex items-center gap-2">
          Docs <FiFile className="text-orange-500" />
        </h2>

        <span className="flex items-center justify-center gap-2">
          <button
            onClick={ScrollLeft}
            className="dark:bg-neutral-900 bg-black/5 rounded-full flex items-center justify-center p-1 "
          >
            <BsArrowLeft />
          </button>
          <button
            onClick={ScrollRight}
            className="dark:bg-neutral-900 bg-black/5 rounded-full flex items-center justify-center p-1 "
          >
            <BsArrowRight />
          </button>
        </span>
      </div>

      {/* HORIZONTAL SCROLL CONTAINER */}
      <div
        ref={containeRef}
        className="flex flex-row gap-4 overflow-x-auto pb-4 scrollbar-hide md:scrollbar-default 
                  snap-x snap-mandatory no-scrollbar"
      >
        {user?.Contributions_user_id_fkey &&
          user?.Contributions_user_id_fkey.length > 0 ? (
          user?.Contributions_user_id_fkey.map((conv, index) => (
            <motion.div
              key={`${conv.chunk_count}_${index}`}
              whileHover={{ scale: 0.95 }}
              className="flex-none w-[280px] md:w-[320px] snap-center p-4 rounded-xl 
                     bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 
                     transition-all cursor-pointer shadow-xl hover:shadow-orange-500/10"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold space-grotesk truncate w-3/4 flex items-center gap-2">
                  <TbTextCaption className="text-green-500" /> {conv.feedback}
                </h3>
                <span className="text-[10px] opacity-50 flex items-center gap-1">
                  <FiCalendar /> {conv.created_at.split("T")[0]}
                </span>
              </div>

              <p className="text-xs opacity-70 mb-4">
                Chunk Count:{" "}
                <span className="font-mono text-orange-500">
                  {conv.chunk_count}
                </span>
              </p>

              <div className="flex justify-end items-center">
                <Link
                  onClick={() => setCurrTab('DashBoard')}
                  to={
                    `/User/document_chat_history/${conv.document_id}`

                  }
                  className="text-[11px] font-bold text-orange-500 hover:text-orange-400 uppercase tracking-wider"
                >
                  View Full Chat →
                </Link>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="w-full h-32 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center">
            <Link
              to="/Interface"
              className="text-sm text-sky-500 hover:underline"
            >
              Upload docs +
            </Link>
          </div>
        )}
      </div>
      <Link
        to="/user/misallaneous-chats"
        className="text-xs md:text-sm text-cyan-600 dark:text-cyan-400 flex items-center gap-2 space-grotesk justify-self-end"
      >
        History <BsArrowUpRight />
      </Link>
    </section>
  );
};

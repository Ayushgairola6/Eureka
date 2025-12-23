import { FaRocketchat } from "react-icons/fa";
import { useAppSelector } from "../store/hooks";
import RoomCard from "./Room_card";
import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import React from "react";
import { BiPlus, BiUserPlus } from "react-icons/bi";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
type Props = {
  showcard: boolean;
  setShowCard: React.Dispatch<React.SetStateAction<boolean>>;
};

export const UserChatRoom: React.FC<Props> = ({ showcard, setShowCard }) => {
  const containeRef = React.useRef<HTMLDivElement>(null);

  function ScrollLeft() {
    if (containeRef.current) {
      containeRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  }
  function ScrollRight() {
    if (containeRef.current) {
      containeRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  }
  const { chatrooms } = useAppSelector((state) => state.auth);
  return (
    <section
      className={`border  transition-discrete ease-linear duration-300  rounded-md p-2`}
    >
      <div className="flex justify-between items-center mb-4 space-grotesk">
        <h2 className="md:text-xl text-lg  font-bold flex items-center justify-center gap-2">
          Chatrooms <FaRocketchat />
        </h2>
        <section className="inline-flex gap-5">
          <button
            onClick={() => setShowCard(!showcard)}
            className="text-xs md:text-sm text-sky-500 hover:underline"
          >
            Creat room +
          </button>
        </section>
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

      {/* list of chatrooms section */}
      <div
        ref={containeRef}
        className="flex flex-row gap-4 overflow-x-auto pb-4 scrollbar-hide md:scrollbar-default 
                  snap-x snap-mandatory no-scrollbar "
      >
        {chatrooms.length > 0 ? (
          chatrooms.map((room, index) => (
            <RoomCard room={room} index={index}></RoomCard>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ borderColor: "rgba(99, 102, 241, 0.5)" }} // Indigo glow on hover
              className=" group relative border-2 border-dashed border-gray-200 dark:border-white/10 
             rounded-xl flex flex-col items-center justify-center p-8 
             bg-gray-50/50 dark:bg-white/[0.02] transition-colors cursor-default"
            >
              {/* Subtle Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              <div className="relative z-10 flex flex-col items-center gap-3">
                {/* Minimalist Icon */}
                <div className="p-3 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 shadow-sm">
                  <FiPlus
                    className="text-gray-400 group-hover:text-indigo-500 transition-colors"
                    size={20}
                  />
                </div>

                <div className="text-center">
                  <h3 className="space-grotesk text-sm font-semibold text-gray-900 dark:text-white">
                    No active rooms
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Start a new conversation to see them here.
                  </p>
                </div>

                {/* Optional Action Button */}
                <button
                  onClick={() => setShowCard(!showcard)}
                  className="mt-2 text-[11px] font-bold text-indigo-500 uppercase tracking-widest hover:text-indigo-400 transition-colors"
                >
                  + Create Room
                </button>
              </div>
            </motion.div>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-neutral-300 dark:border-neutral-800"></div>
              <span className="flex-shrink-0 mx-4 text-neutral-400 text-xs uppercase tracking-widest space-grotesk">
                or
              </span>
              <div className="flex-grow border-t border-neutral-300 dark:border-neutral-800"></div>
            </div>
            <section className="shadow-2xl bg-gray-50 dark:bg-black p-3 space-y-3 border-2 dark:border-white/5 border-black/10 rounded-sm">
              <h5 className="bai-jamjuree-semibold flex items-center justify-normal gap-2">
                <BiUserPlus />
                Join a room{" "}
              </h5>
              <div className=" flex items-center justify-center rounded-md border p-3">
                <input
                  type="text"
                  placeholder="eg-3#482@2.."
                  className="outline-0 ring-0 focus:ring-0 border-none text-xs md:text-sm space-grotesk px-2 py-1 rounded-sm text-black dark:text-white"
                />
                <button
                  className={`dark:bg-white bg-black dark:text-black text-white  md:text-sm text-xs py-1 px-2 rounded-sm flex items-center justify-center gap-1 bai-jamjuree-regular active:scale-1.01`}
                >
                  Request <BiPlus />
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </section>
  );
};

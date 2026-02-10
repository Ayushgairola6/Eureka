import { BsArrowUpRight, BsPeople } from "react-icons/bs";
import { FaRegComments, FaUserSecret } from "react-icons/fa";
import { IoMdHourglass } from "react-icons/io";
import { JoinAChatRoom } from "../store/chatRoomSlice";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import React from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
type props = {
  showCard: boolean,
  setShowCard: React.Dispatch<React.SetStateAction<boolean>>
}

const JoinRoomInput: React.FC<props> = ({ showCard, setShowCard }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isJoiningRoom } = useAppSelector((state) => state.chats);
  const InputRef = React.useRef<HTMLInputElement>(null);

  //rom joining handler
  const handleJoinRoom = async () => {
    if (InputRef?.current?.value && user) {
      try {
        const result = await dispatch(JoinAChatRoom(InputRef.current.value))
          .unwrap()
          .then((res) => {
            if (res) {
              toast.success(res.message);
            }
          })
          .catch((error) => {
            toast.error(error);
          });
        return result;
      } catch (rejectedAction: any) {
        toast.error(rejectedAction || "Unknown error occured");
      }
    }
  };
  return (
    <>
      <div className=" w-full mx-auto flex flex-col items-center justify-center p-4 relative">
        {/* 1. Visual Icon (Optional but nice) */}
        <div className="mb-6 p-3 rounded-full bg-neutral-200 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500">
          <FaRegComments size={25} />
        </div>

        {/* 2. Text Context */}
        <div className="text-center space-y-2 mb-10">
          <h2 className="bai-jamjuree-semibold text-2xl md:text-3xl text-black dark:text-white">
            No active workspace found
          </h2>
          <p className="space-grotesk text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
            You aren't part of any discussions yet. Enter a code to join an
            existing session, or start your own.
          </p>
        </div>

        {/* 3. THE ACTION CLUSTER */}
        <div className="w-full max-w-md flex flex-col gap-6 shadow-xl">
          {/* --- JOIN SECTION (Your Component, slightly tweaked width) --- */}
          <section className="shadow-xl border rounded-xl w-full p-2 px-3 space-y-3  ring-1 ring-black/5 dark:ring-white/10 ">
            <h1 className="bai-jamjuree-semibold text-sm text-neutral-700 dark:text-neutral-400 flex items-center justify-start gap-2 px-1 pt-1 ">
              <FaUserSecret />
              Join with a workspace code
            </h1>

            <div className="flex items-center justify-between gap-2 ">
              <input
                ref={InputRef}
                className="rounded-lg px-3 py-2 text-base space-grotesk w-full bg-neutral-100 dark:bg-black text-black dark:text-white border-none outline-none ring-0 focus:ring-0 transition-all placeholder:dark:text-white-300"
                type="text"
                placeholder="e.g. 8X9-2A1" // Better placeholder
              />
              <motion.button
                whileTap={{ scale: 1.06 }}

                disabled={isJoiningRoom === true}
                onClick={handleJoinRoom}
                className={`px-2 py-1 rounded-sm text-sm bai-jamjuree-bold flex items-center justify-center gap-3
              ${isJoiningRoom === true
                    ? "bg-green-600 text-black cursor-not-allowed"
                    : "bg-amber-400 text-black cursor-pointer"
                  }`}
              >
                {isJoiningRoom ? (
                  <>
                    Pending...<IoMdHourglass className="animate-spin" />
                  </>
                ) : (
                  <>
                    Join <BsPeople size={18} />
                  </>
                )}
              </motion.button>
            </div>
          </section>

          {/* --- OR DIVIDER (Optional, adds clarity) --- */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-neutral-300 dark:border-neutral-800"></div>
            <span className="flex-shrink-0 mx-4 text-neutral-400 text-xs uppercase tracking-widest space-grotesk">
              or
            </span>
            <div className="flex-grow border-t border-neutral-300 dark:border-neutral-800"></div>
          </div>

          {/* --- CREATE ROOM LINK --- */}
          <button
            onClick={() => setShowCard(!showCard)} // Update with your route
            className="group w-full flex items-center justify-between p-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-300"
          >
            <div className="flex flex-col items-start">
              <span className="bai-jamjuree-semibold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Create a new workspace
              </span>
              <span className="text-xs text-neutral-500 space-grotesk">
                Become a host and invite others
              </span>
            </div>

            <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 flex items-center justify-center transition-colors">
              <BsArrowUpRight className="text-neutral-600 dark:text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default JoinRoomInput;

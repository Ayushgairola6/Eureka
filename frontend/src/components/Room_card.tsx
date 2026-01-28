import type React from "react";
import { BiCopy } from "react-icons/bi";
import { BsArrowUpRight, BsCalendarEvent } from "react-icons/bs";
import { FaGlobeAmericas, FaHashtag, FaLock, FaUsers } from "react-icons/fa";
import { Link } from "react-router";
import { toast } from "sonner";

type props = {
  room: any;
  index: number;
};
const handleCopyId = (e: any, id: string) => {
  e.preventDefault(); // Stop navigation if card is a link
  e.stopPropagation();
  navigator.clipboard.writeText(id);
  toast.success("Room ID copied!");
};

const RoomCard: React.FC<props> = ({ room, index }) => {
  return (
    <>
      <div
        key={`${room.room_id}_ind_${index}`}
        className="group relative flex flex-col justify-between h-fit
      rounded-2xl border border-neutral-200 dark:border-white/10 
      bg-gray-100 dark:bg-[#0A0A0A] 
      p-5 transition-all duration-300 
       hover:shadow-teal-600/20 shadow-2xl
      cursor-pointer overflow-hidden flex-none  "
      >
        {/* --- Hover Gradient Effect (Subtle Landing Page Vibe) --- */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* --- TOP SECTION: Header & Badge --- */}
        <div className="space-y-4 relative ">
          <div className="flex items-start justify-between gap-3">
            {/* Room Type Badge */}
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase space-grotesk border flex items-center gap-1.5
            ${room?.chat_rooms.room_type?.toLowerCase() === "private"
                  ? "bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                  : "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30 text-blue-600 dark:text-blue-400"
                }`}
            >
              {room?.chat_rooms.room_type?.toLowerCase() === "private" ? (
                <FaLock size={10} />
              ) : (
                <FaGlobeAmericas size={10} />
              )}
              {room.chat_rooms.room_type}
            </span>

            {/* Creation Date */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 space-grotesk">
              <BsCalendarEvent />
              <span>
                {room.chat_rooms.created_at &&
                  new Date(room?.chat_rooms?.created_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
              </span>
            </div>
          </div>

          {/* Room Name & Description */}
          <div>
            <h1 className="bai-jamjuree-bold text-xl text-black dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
              {room.chat_rooms.room_name}
            </h1>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 space-grotesk line-clamp-2 min-h-[2.5rem]">
              {room.chat_rooms.Room_Description || "No description provided."}
            </p>
          </div>
        </div>

        {/* --- BOTTOM SECTION: Meta Data --- */}
        <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-white/5 flex items-end justify-between relative ">
          {/* Left: Participant Count */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 space-grotesk">
              Participants Limit
            </span>
            <div className="flex items-center gap-2 text-sm font-medium text-black dark:text-white space-grotesk">
              <FaUsers className="text-neutral-400" />
              {room.chat_rooms.participant_count}
            </div>
          </div>

          {/* Right: Room ID (Clickable) */}
          <div className="flex flex-col gap-1 items-end">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 space-grotesk">
              Joining Code
            </span>
            <button
              onClick={(e) =>
                handleCopyId(e, room.chat_rooms.Room_Joining_code)
              }
              className="group/code flex items-center gap-2 px-2 py-1 rounded bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
            >
              <FaHashtag className="text-neutral-400 text-xs" />
              <span className="font-mono text-xs text-black dark:text-neutral-300">
                {room.chat_rooms.Room_Joining_code}
              </span>
              <BiCopy className="text-neutral-400 opacity-0 group-hover/code:opacity-100 transition-opacity text-xs" />
            </button>
          </div>
        </div>
        <Link
          className="  mt-6 text-xs md:text-sm text-white dark:text-black "
          to={`/chatroom/${room?.room_id}`}
        >
          <ul className=" flex items-center justify-center gap-2 bg-black dark:bg-white px-2 py-1 rounded-sm space-grotesk font-semibold ">
            <button>Enter</button>
            <BsArrowUpRight />
          </ul>
        </Link>
      </div>
    </>
  );
};

export default RoomCard;

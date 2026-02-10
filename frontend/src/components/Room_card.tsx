import { Calendar } from "lucide-react";
import type React from "react";
import { BiCopy } from "react-icons/bi";
import { BsArrowUpRight } from "react-icons/bs";
import { FaGlobeAmericas, FaLock, FaUsers } from "react-icons/fa";
import { Link } from "react-router";
import { toast } from "sonner";
import { useAppDispatch } from '../store/hooks.tsx'
import { setCurrTab } from '../store/AuthSlice.ts'
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
  const dispatch = useAppDispatch()

  return (
    <>
      {room && room.room_id && <div
        key={`${room.room_id}_ind_${index}`}
        className="group relative flex flex-col justify-between h-[320px] w-full md:w-80
    rounded-xl border border-neutral-200 dark:border-neutral-800/50 
    bg-white dark:bg-[#050505] 
    transition-all duration-500 ease-out
    hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(234,88,12,0.05)]
    cursor-pointer overflow-hidden flex-none"
      >
        {/* --- Background System Grid --- */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] group-hover:scale-110 transition-transform duration-700" />

        {/* --- Top Metadata Strip --- */}
        <div className="relative p-5 pb-0">
          <div className="flex items-center justify-between mb-4">
            {/* Type Badge as a "System Tag" */}
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-tighter
        ${room?.chat_rooms?.room_type?.toLowerCase() === "private"
                ? "bg-neutral-100 dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-500"
                : "bg-orange-600/10 border-orange-600/20 text-orange-600"
              }`}
            >
              {room?.chat_rooms?.room_type?.toLowerCase() === "private" ? <FaLock size={8} /> : <FaGlobeAmericas size={8} />}
              {room?.chat_rooms?.room_type}
            </div>

            {/* Date in Mono */}
            <span className="bai-jamjuree-regular text-[9px] text-neutral-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <Calendar size={12} />{room?.chat_rooms?.created_at && new Date(room.chat_rooms?.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>

          {/* Title & Description */}
          <h3 className="bai-jamjuree-bold text-lg text-neutral-900 dark:text-neutral-100 leading-tight group-hover:text-orange-600 transition-colors duration-300">
            {room?.chat_rooms?.room_name}
          </h3>
          <p className="mt-2 md:text-sm text-xs text-neutral-500 dark:text-neutral-400 space-grotesk line-clamp-3 leading-relaxed">
            {room?.chat_rooms?.Room_Description || "System node initialized with no protocol description."}
          </p>
        </div>

        {/* --- Middle: Specs Section --- */}
        <div className="px-5 mt-auto relative ">
          <div className="flex items-center justify-between py-3 border-t border-dashed border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono text-neutral-400">Cap_Limit</span>
              <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold dark:text-neutral-200">
                <FaUsers size={12} className="text-neutral-500" />
                {room?.chat_rooms?.participant_count}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase font-mono text-neutral-400">Join_Hex</span>
              <button
                onClick={(e) => handleCopyId(e, room?.chat_rooms?.Room_Joining_code)}
                className="flex items-center gap-2 group/code hover:text-orange-500 transition-colors"
              >
                <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-400 group-hover/code:text-orange-500 transition-colors">
                  #{room?.chat_rooms?.Room_Joining_code}
                </span>
                <BiCopy size={12} className="opacity-0 group-hover/code:opacity-100 transition-all transform translate-x-[-4px] group-hover/code:translate-x-0" />
              </button>
            </div>
          </div>
        </div>

        {/* --- Bottom: Action Link --- */}
        <Link
          onClick={() => dispatch(setCurrTab('Workspace'))}
          to={`/chatroom/${room?.room_id}`}
          className="relative  w-full group/btn"
        >
          <div className="flex items-center justify-between bg-neutral-950 dark:bg-neutral-900 hover:bg-orange-600 dark:hover:bg-orange-600 px-5 py-3 transition-all duration-300 text-white">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] space-grotesk">
              Enter workspace
            </span>
            <BsArrowUpRight className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
          </div>
        </Link>

        {/* --- Decorative Corner Accent --- */}
        <div className="absolute top-0 left-0 w-1 h-0 bg-orange-600 group-hover:h-full transition-all duration-500" />
      </div>}
    </>
  );
};

export default RoomCard;

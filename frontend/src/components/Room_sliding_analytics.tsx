import React, { useMemo } from "react";
import {
  FaNetworkWired,
  FaFingerprint,
  FaGlobeAmericas,
  FaLock,
} from "react-icons/fa";
import { BsArrowRight, BsLightningChargeFill } from "react-icons/bs";
import { useAppSelector } from "../store/hooks";
import { motion } from "framer-motion";
import { IoMdCreate } from "react-icons/io";
type MainProps = {
  view: boolean;
  setView: React.Dispatch<React.SetStateAction<boolean>>;
  showCard: boolean;
  setShowCard: React.Dispatch<React.SetStateAction<boolean>>;
};
const SlidingAnalytics: React.FC<MainProps> = ({ view, setView, showCard, setShowCard }) => {
  const { user, chatrooms } = useAppSelector((state) => state?.auth);
  // --- 1. MEMOIZED CALCULATIONS (Client Side Logic) ---
  const stats = useMemo(() => {
    const totalRooms = chatrooms.length;

    // Assuming room object structure has chat_rooms relation
    const ownedRooms = chatrooms.filter(
      (r) => r.chat_rooms?.created_by === user?.id // Check your DB column name for owner
    ).length;

    // Sum of all people in all your rooms (Your "Reach")
    const federatedReach = chatrooms.reduce(
      (acc, r) => acc + (r.chat_rooms?.participant_count || 1),
      0
    );

    const privateCount = chatrooms.filter(
      (r) => r.chat_rooms?.room_type === "private"
    ).length;

    return { totalRooms, ownedRooms, federatedReach, privateCount };
  }, [chatrooms, user?.id]);

  if (chatrooms.length === 0) return null; // Don't show if empty state

  return (
    <motion.div
      initial={{ x: 400 }}
      animate={{
        x: view === true ? 0 : 400,
      }}
      transition={{ ease: "anticipate", duration: 1 }}
      className={`z-5 fixed top-18 right-0 flex md:hidden items-center justify-start flex-col gap-2 h-full p-3 dark:bg-black bg-gray-200 overflow-auto w-80
      `}
    >
      <section className='w-full flex items-center justify-between px-2 border-b pb-2'>

        <button
          onClick={() => setView(!view)}
          className="  rounded-full h-5 w-5 flex items-center justify-center dark:bg-white lg:hidden font-bold bg-black text-white dark:text-black "
        >
          <BsArrowRight />
        </button>
        <h2 className='space-grotesk font-medium text-sm uppercase '>See what's happening</h2>
      </section>

      {/* CARD 1: TOTAL WORKSPACES */}
      <StatCard
        label="Active Workspaces"
        value={stats.totalRooms}
        icon={<FaNetworkWired className="text-blue-500" />}
        subtext="Synced channels"
      />

      {/* CARD 2: HOST ACCESS (Your Rooms) */}
      <StatCard
        label="Host Access"
        value={stats.ownedRooms}
        icon={<FaFingerprint className="text-orange-500" />}
        subtext="Admin privileges"
      />

      {/* CARD 3: FEDERATED REACH (Total Humans) */}
      <StatCard
        label="Federated Reach"
        value={stats.federatedReach}
        icon={<FaGlobeAmericas className="text-purple-500" />}
        subtext="Total peers can connect"
      />

      {/* CARD 4: PRIVACY RATIO */}
      <StatCard
        label="Private Channels"
        value={stats.privateCount}
        icon={<FaLock className="text-green-500" />}
        subtext={`${((stats.privateCount / stats.totalRooms) * 100).toFixed(
          0
        )}% of your network`}
      />
      <button onClick={() => setShowCard(!showCard)} className="flex items-center justify-center gap-2  bg-neutral-900 text-white dark:bg-gray-100 dark:text-black rounded-md px-3 py-1 mt-10 mx-auto space-grotesk  shadow-xl">Build new workspace <IoMdCreate /></button>
    </motion.div>
  );
};
type StatProps = {
  label: string;
  value: any;
  icon: any;
  subtext: any;
};
// --- REUSABLE SUB-COMPONENT ---
const StatCard: React.FC<StatProps> = ({ label, value, icon, subtext }) => (
  <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] group hover:border-blue-500/30 transition-colors h-30 w-full">
    {/* Background Glow */}
    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-transparent to-neutral-100 dark:to-white/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />

    <div className="flex items-start justify-between mb-2 relative ">
      <span className="space-grotesk text-xs font-bold uppercase tracking-wider text-neutral-400">
        {label}
      </span>
      <div className="p-1.5 rounded-md bg-neutral-100 dark:bg-white/5">
        {icon}
      </div>
    </div>

    <div className="relative ">
      <h3 className="bai-jamjuree-bold text-3xl text-black dark:text-white">
        {value}
      </h3>
      <p className="space-grotesk text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1">
        {subtext === "Admin privileges" && (
          <BsLightningChargeFill size={10} className="text-yellow-500" />
        )}
        {subtext}
      </p>
    </div>
  </div>
);

export default SlidingAnalytics;

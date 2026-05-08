import JoinRoomInput from "@/components/room_join_input";
import { useAppSelector } from "../store/hooks";
import RoomCard from "@/components/Room_card";
import RoomAnalytics from "@/components/Room_analytics";
import React from "react";
import { BsArrowLeft, BsArrowRight, BsChat, BsLock } from "react-icons/bs";
import SlidingAnalytics from "@/components/Room_sliding_analytics";
import CreateRoom from "@/components/createRoom.tsx";
import { Link } from "react-router";

const UserChatRooms = () => {
  const { user, chatrooms } = useAppSelector((state) => state.auth);
  const [view, setView] = React.useState(false);
  const [showCard, setShowCard] = React.useState(false);
  return (
    <>
      {user?.IsPremiumUser === true ? <div className=" dark:bg-black bg-white  w-full flex p-2  items-normal justify-between gap-3 relative overflow-hidden min-h-screen">
        <CreateRoom showcard={showCard} setShowCard={setShowCard} />
        <section className="  w-full h-full">
          {chatrooms?.length > 0 && (
            <span className="space-grotesk flex items-center justify-between px-2 py-2 ">
              <h1 className="border-b flex items-center justify-center gap-2 font-bold md:text-2xl text-xl">
                <BsChat /> My Workspace
              </h1>
              <button
                onClick={() => setView(!view)}
                className="   rounded-sm py-1 px-2  text-xs space-grotesk flex items-center justify-center dark:bg-white/10 lg:hidden bg-black/10 dark:text-white text-black md:hidden  gap-2 hover:shadow-red-600/30 shadow-xl transition-all duration-300"
              >
                Analytics <BsArrowLeft />
              </button>
            </span>
          )}

          {user !== null && chatrooms && chatrooms.length > 0 ? (
            <>
              <div className="p-4 grid grid-cols-1 gap-3 md:grid-cols-3 ">
                {chatrooms.map((room, index) => {
                  return (
                    <>
                      <RoomCard room={room} index={index} />
                    </>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center w-full px-2">
              <JoinRoomInput showCard={showCard} setShowCard={setShowCard} />
            </div>
          )}
        </section>

        <RoomAnalytics showCard={showCard} setShowCard={setShowCard} />
        <SlidingAnalytics showCard={showCard} setShowCard={setShowCard} view={view} setView={setView} />
      </div> : <>
        <div className="dark:bg-black bg-white w-full min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

          {/* Decorative ambient blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-500/10 dark:bg-red-400/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 dark:bg-purple-400/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center max-w-lg w-full text-center">

            {/* Glass‑style icon circle */}
            <div className="rounded-full p-6 mb-8 bg-gradient-to-br from-red-500/20 to-red-600/10 dark:from-red-500/10 dark:to-red-600/5 backdrop-blur-md shadow-xl shadow-red-500/10 dark:shadow-red-500/5 ring-1 ring-white/10">
              <BsLock size={56} className="text-red-500 dark:text-red-400" />
            </div>

            <h1 className="space-grotesk font-bold text-3xl md:text-4xl text-gray-900 dark:text-white mb-4">
              Workspaces are a Premium feature
            </h1>

            <p className="space-grotesk text-gray-600 dark:text-gray-300 mb-10 max-w-md text-lg">
              Unlock unlimited rooms, advanced analytics, and seamless collaboration.
            </p>

            {/* Modern CTA with shimmer effect */}
            <Link to="/" className="group relative px-10 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold text-lg shadow-xl hover:shadow-red-500/25 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-400/50 overflow-hidden">
              <span className="relative z-10 flex items-center gap-3">
                Upgrade to Premium
                <BsArrowRight className="text-xl group-hover:translate-x-1 transition-transform duration-200" />
              </span>
              {/* Shimmer overlay */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </Link>

            {/* Micro feature chips */}
            <div className="mt-10 flex flex-wrap gap-3 justify-center">
              {['Unlimited Rooms', 'Advanced Analytics', 'Priority Support'].map((feature) => (
                <span
                  key={feature}
                  className="px-4 py-1.5 rounded-full text-sm space-grotesk bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/5"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </>}
    </>
  );
};

export default UserChatRooms;

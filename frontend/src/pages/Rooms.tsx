import JoinRoomInput from "@/components/room_join_input";
import { useAppSelector } from "../store/hooks";
import RoomCard from "@/components/Room_card";
import RoomAnalytics from "@/components/Room_analytics";
import React from "react";
import { BsArrowLeft } from "react-icons/bs";
import SlidingAnalytics from "@/components/Room_sliding_analytics";

const UserChatRooms = () => {
  const { user, chatrooms } = useAppSelector((state) => state.auth);
  const [view, setView] = React.useState(false);
  return (
    <>
      <div className="dark:bg-black bg-white h-screen w-full flex p-2  items-center justify-between gap-3 relative overflow-hidden">
        <section className="border  w-full h-full">
          {chatrooms?.length > 0 && (
            <span className="space-grotesk flex items-center justify-between px-2 py-2 ">
              <h1 className="font-bold md:text-2xl text-xl">
                All your rooms at one place
              </h1>
              <button
                onClick={() => setView(!view)}
                className="   rounded-sm py-1 px-2  text-xs space-grotesk flex items-center justify-center dark:bg-white/10 lg:hidden bg-black/10 dark:text-white text-black md:hidden  gap-2 hover:shadow-blue-600/30 shadow-xl transition-all duration-300"
              >
                Analytics <BsArrowLeft />
              </button>
            </span>
          )}

          {user !== null && chatrooms && chatrooms.length > 0 ? (
            <>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2  gap-3  ">
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
              <JoinRoomInput />
            </div>
          )}
        </section>

        <RoomAnalytics />
        <SlidingAnalytics view={view} setView={setView} />
      </div>
    </>
  );
};

export default UserChatRooms;

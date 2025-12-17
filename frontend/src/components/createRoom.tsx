import { FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { CreateChatRoom } from "../store/chatRoomSlice.ts";
import { useAppDispatch, useAppSelector } from "../store/hooks.tsx";
import { toast } from "sonner";
import { IoIosHourglass } from "react-icons/io";
import { LuCircleFadingPlus } from "react-icons/lu";
import { FaPeopleGroup, FaHouseFlag } from "react-icons/fa6";
import { MdOutlineBadge, MdOutlineDescription } from "react-icons/md";
import { IoPersonAddOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
//defining the prop types
type RoomProps = {
  showcard: boolean;
  setShowCard: React.Dispatch<React.SetStateAction<boolean>>;
};

const CreateRoom: React.FC<RoomProps> = ({ showcard, setShowCard }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [participantCount, setParticipantCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [room_type, setRoomType] = useState("public");
  const isPending = useAppSelector(
    (state) => state.chats.RoomCreationIspending
  );
  const RoomNameRef = useRef<HTMLInputElement>(null);
  const RoomTypeRef = useRef<HTMLInputElement>(null);
  const RoomDescriptions = useRef<HTMLTextAreaElement>(null);

  function HandleCreateRoom() {
    if (
      !RoomNameRef?.current?.value ||
      !participantCount ||
      !RoomTypeRef?.current?.value ||
      !RoomDescriptions?.current?.value
    ) {
      toast.error("All fields are mandatory!");
      return;
    }
    if (!user?.IsPremiumUser) {
      if (room_type === "private") {
        toast.info("Only premium members can create Private chatRooms");
        return;
      }
      if (participantCount > 2) {
        toast.info(
          "Only premium users can create rooms with more than 2 members."
        );
        return;
      }
    }
    // 2. Create properly typed data object
    const Data = {
      Room_name: RoomNameRef.current.value,
      participant_count: Number(participantCount),
      Room_type: room_type,
      Description: RoomDescriptions.current.value,
    };

    // 3. Properly handle the async dispatch
    dispatch(CreateChatRoom(Data))
      .unwrap()
      .then((response) => {
        if (response) {
          toast.success("Rom has been created");
        }
      })
      .catch((error) => {
        toast.error(error || "Failed to create room");
      });
  }

  return (
    <>
      <div
        className={`max-h-screen fixed top-0 left-0 inset-0 z-[2] bg-black/40 backdrop-blur-sm  transition-all duration-300 ${
          showcard
            ? "opacity-100 translate-x-0 "
            : "opacity-0 -translate-x-full  pointer-events-none"
        } flex items-center justify-center p-4`}
      >
        <div className=" max-w-md w-full relative">
          {/* Close Button */}
          <motion.button
            onClick={() => setShowCard(false)}
            className={`absolute top-5 right-5 z-10 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors ease-in-out duration-200 ${
              showcard ? "rotate-0" : "-rotate-180"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaArrowLeft className="text-sky-500" size={15} />
          </motion.button>

          {/* Card Container */}
          <div className="bg-gray-100 shadow-sm shadow-gray-600 dark:shadow-gray-300 dark:bg-[#141414] rounded-xl  overflow-hidden p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 bai-jamjuree-semibold flex items-center justify-start gap-2">
              <FaPeopleGroup /> Create new discussion room
            </h2>

            <div className="space-y-4">
              {/* Room Name */}
              <div className="space-y-1">
                <label
                  className=" bai-jamjuree-semibold text-sm flex items-center justify-start gap-2 text-gray-900 dark:text-gray-200"
                  htmlFor="roomName"
                >
                  <MdOutlineBadge /> Room Name
                </label>
                <input
                  ref={RoomNameRef}
                  id="roomName"
                  type="text"
                  placeholder="e.g. Dragon's Den"
                  className="w-full space-grotesk text-sm px-4 py-2 border border-gray-400 rounded-lg"
                />
              </div>

              {/* Max Participants */}
              <div className="space-y-1">
                <label
                  className=" bai-jamjuree-semibold text-sm flex items-center justify-start gap-2 text-gray-900 dark:text-gray-200"
                  htmlFor="maxParticipants"
                >
                  <IoPersonAddOutline /> Max Participants
                </label>
                {/* options div */}
                <section className="flex items-center justify-between gap-4 space-grotesk text-sm my-2 relative ">
                  <div className="flex items-center justify-start gap-4 px-2   rounded-md py-2">
                    <ul>Number of paticipants</ul>
                    <label
                      className="text-green-600 bg-green-600/10 rounded-full p-3 h-5 w-5 flex items-center justify-center font-semibold text-xs border border-green-600"
                      htmlFor="count"
                    >
                      {participantCount}
                    </label>
                  </div>
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className="bg-black/10 dark:bg-white/5 rounded-full p-1 cursor-pointer"
                  >
                    <IoIosArrowDown
                      className={`transition-transform duration-300 ${
                        isActive ? "rotate-90" : "rotate-0"
                      }`}
                    />
                  </button>

                  {/* the animated dropdown menu */}
                  <div
                    className={`bg-white dark:bg-black absolute top-10 left-0 w-full overflow-hidden rounded-lg shadow-lg dark:shadow-white/10 
        transition-[max-height] duration-500 ease-in-out  ${
          isActive ? "max-h-96" : "max-h-0"
        }`}
                  >
                    <ul className="grid grid-cols-1">
                      {[
                        {
                          count: 2,
                          icon: "Casual curiosity session with friend",
                        },
                        { count: 4, icon: "Small study/friends group" },
                        {
                          count: 8,
                          icon: "Large study groups, event planning sessions",
                        },
                        {
                          count: 16,
                          icon: "Small/Medium discussion or research teams",
                        },
                        { count: 50, icon: "Large discussion/research teams " },
                        {
                          count: 100,
                          icon: "Reasearchers, Tutors, Collborative teams etc. ",
                        },
                      ].map((val, index) => (
                        <section
                          onClick={() => {
                            setParticipantCount(val?.count);
                            setIsActive(false); // Close dropdown after selection
                          }}
                          className="flex items-center justify-between gap-3 px-2 hover:px-4 py-1  w-full hover:bg-sky-500/20 transition-all ease-in duration-200 cursor-pointer border-b"
                          key={`${val.count}+${index}`}
                        >
                          <span>{val.icon}</span>
                          <ul className="  dark:bg-white bg-black rounded-full text-white text-xs p-3 flex items-center justify-center h-5 w-5 text-center dark:text-black">
                            {val.count}
                          </ul>
                        </section>
                      ))}
                    </ul>
                  </div>
                </section>
              </div>

              {/* Room Type */}
              <div className="space-y-1">
                <label className=" bai-jamjuree-semibold text-sm flex items-center justify-start gap-2 text-gray-900 dark:text-gray-200">
                  <FaHouseFlag /> Room Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`inline-flex items-center p-3 border  rounded-lg cursor-pointer  ${
                      room_type === "public"
                        ? "bg-sky-500/10 border border-sky-500 shadow-sm shadow-sky-500 text-sky-500"
                        : ""
                    }`}
                  >
                    <input
                      ref={RoomTypeRef}
                      onClick={() => setRoomType("public")}
                      type="radio"
                      name="roomType"
                      value="public"
                      className="h-4 w-4 text-indigo-600"
                      defaultChecked
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 ">
                      Public
                    </span>
                  </label>
                  <label
                    className={`inline-flex items-center p-3 border  rounded-lg cursor-pointer  ${
                      room_type === "private"
                        ? "bg-green-500/10 border border-green-500 shadow-sm shadow-green-500 text-green-500"
                        : ""
                    }`}
                  >
                    <input
                      onClick={() => setRoomType("private")}
                      ref={RoomTypeRef}
                      type="radio"
                      name="roomType"
                      value="private"
                      className="h-4 w-4 text-indigo-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 ">
                      Private
                    </span>
                  </label>
                </div>
              </div>

              {/* Room Description */}
              <div className="space-y-1">
                <label
                  className=" bai-jamjuree-semibold text-sm flex items-center justify-start gap-2 text-gray-900 dark:text-gray-200"
                  htmlFor="description"
                >
                  <MdOutlineDescription /> Description
                </label>
                <textarea
                  ref={RoomDescriptions}
                  id="description"
                  rows={3}
                  placeholder="What's this room about?"
                  className="w-full space-grotesk text-sm px-4 py-2 border border-gray-400 rounded-lg"
                />
              </div>

              {/* Create Button */}
              <motion.button
                disabled={isPending === true}
                onClick={HandleCreateRoom}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full mt-6 ${
                  isPending === true
                    ? "bg-green-500 text-white"
                    : "dark:bg-white dark:text-black bg-black text-white"
                }   font-medium py-2 px-4 rounded-lg transition-colors duration-200 bai-jamjuree-semibold flex items-center justify-center gap-2`}
              >
                {isPending === false ? (
                  <>
                    Create Room
                    <LuCircleFadingPlus />
                  </>
                ) : (
                  <>
                    Setting things up for you
                    <IoIosHourglass className="animate-spin" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateRoom;

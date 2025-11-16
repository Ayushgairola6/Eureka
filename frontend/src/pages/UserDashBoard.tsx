import { useRef } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { FiUsers, FiCalendar, FiFile } from "react-icons/fi";
import { MdMarkUnreadChatAlt } from "react-icons/md";
import { BsLightningChargeFill } from "react-icons/bs";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { TbOctahedron, TbTextCaption } from "react-icons/tb";
import { useEffect, useState } from "react";
import {
  FaFilePdf,
  FaArrowDown,
  FaCloudSunRain,
  FaUserSecret,
  FaRocketchat,
} from "react-icons/fa";
import { TbSunset2 } from "react-icons/tb";
import { IoSunnyOutline } from "react-icons/io5";
import { JoinAChatRoom } from "../store/chatRoomSlice.ts";
import { toast, Toaster } from "sonner";
import { IoMdHourglass } from "react-icons/io";
import { BiError, BiLoaderAlt, BiLogOut } from "react-icons/bi";
import { LogoutUser } from "../store/AuthSlice.ts";
import { FaArrowUpRightDots } from "react-icons/fa6";
// import {NewUserNotification} from '../store/AuthSlice.ts'
import CreateRoom from "@/components/createRoom.tsx";
import QuestionAskedChart from "@/components/UserQuestionAskedChart.tsx";
import UserFeedbackReport from "@/components/UserFeedbackReport.tsx";
import SimilarQuestions from "@/components/SimilarQueryChart.tsx";

const UserDashboard = () => {
  // Mock user data

  const dispatch = useAppDispatch();
  const Feedback = useAppSelector((state) => state.auth.FeedbackCounts);
  const chatrooms = useAppSelector((state) => state.auth.chatrooms);
  const isJoining = useAppSelector((state) => state.chats.isJoiningRoom);
  const InputRef = useRef<HTMLInputElement>(null);
  const [score, setScore] = useState<number>(0);
  const [showcard, setShowCard] = useState(false);
  const [open, setOpen] = useState(false);
  const [IncreaseHeight, setIncreaseHeight] = useState(false);
  const { isDarkMode, isLoggingOut, user } = useAppSelector(
    (state) => state.auth
  );
  // Mock conversations

  useEffect(() => {
    const totalVotes =
      Feedback?.upvotes + Feedback?.partial_upvotes + Feedback?.downvotes;
    if (totalVotes === 0) {
      // Handle case with no votes, e.g., display 0 or 'N/A'
      setScore(0);
    } else {
      const weightedSum =
        Feedback?.upvotes * 1 +
        Feedback?.partial_upvotes * 0.5 -
        Feedback?.downvotes * 1;
      setScore((weightedSum / totalVotes) * 100);
    }
  }, [Feedback]);

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
        console.log(rejectedAction.response.data);
        toast.error(rejectedAction.response.data);
      }
    }
  };

  return (
    <>
      <div
        className={`dark:bg-black dark:text-white bg-white text-black relative flex min-h-screen w-full overflow-hidden z-[1] realative`}
      >
        <Toaster />
        {!isDarkMode && (
          <div className="h-full w-full absolute z-[-1] bg-gradient-to-br from-purple-500/20 to-sky-600/20 blur-3xl"></div>
        )}

        {/* Sidebar */}
        <div className="w-64 p-6 border-r dark:border-gray-800 hidden md:block">
          <div className="flex flex-col items-center justify-center mb-10">
            <span className="rounded-full h-24 w-24 text-5xl flex flex-col items-center justify-center border-2 bg-indigo-500 mb-4 dark:text-white text-black relative">
              {user?.username ? (
                user?.username.trim().split("_")[0].charAt(0).toUpperCase()
              ) : (
                <BiError />
              )}
              <ul className="absolute -top-4 -right-11">
                {score > 70 ? (
                  <IoSunnyOutline color="green" />
                ) : score > 30 && score < 70 ? (
                  <TbSunset2 color="yellow" />
                ) : (
                  <FaCloudSunRain color="ghostwhite" />
                )}
              </ul>
            </span>
            <h3 className="font-bold text-xl">{}</h3>
            {/* <p className="text-sm opacity-70">{user.role}</p> */}
            <p className="text-sm mt-1 opacity-80">
              Joined on :{user?.created_at.split("T")[0]}
            </p>
            <p className="text-sm mt-1 opacity-80">{user?.email}</p>
          </div>
          <section className="w-full">
            <button
              disabled={isLoggingOut}
              onClick={() => dispatch(LogoutUser())}
              className={`
    relative flex items-center justify-center gap-4 px-3 py-1 w-3/5 rounded-md
    text-white font-semibold transition-all duration-300
    ${
      isLoggingOut
        ? "cursor-not-allowed bg-red-400"
        : "cursor-pointer bg-red-600 hover:bg-red-700 active:scale-95"
    }
  `}
            >
              <span
                className={`${
                  isLoggingOut ? "opacity-0" : "opacity-100"
                } transition-opacity duration-300`}
              >
                Logout
              </span>

              {isLoggingOut && (
                <span className="absolute">
                  <BiLoaderAlt className="animate-spin" size={24} />
                </span>
              )}

              <span
                className={`${
                  isLoggingOut ? "opacity-0" : "opacity-100"
                } transition-opacity duration-300`}
              >
                <BiLogOut />
              </span>
            </button>
          </section>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl  font-bold bai-jamjuree-bold">
                Welcome back,{" "}
                {user?.username.trim().split(" ")[0].toUpperCase()}!
              </h1>
              <p className="opacity-70 text-xs md:text-sm space-grotesk">
                Let's see what's happening with your Account{" "}
              </p>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ">
            <QuestionAskedChart />
            <SimilarQuestions />
            {/* user uploaded docs feedback section */}
            <UserFeedbackReport score={score} />
            {/* user active projects section */}
            <motion.div
              whileHover={{ y: -5 }}
              className=" bg-gray-100 dark:bg-black p-6 rounded-xl border border-gray-400"
            >
              <h3 className="text-sm opacity-70 font-semibold">
                Active Documents
              </h3>
              <span className="text-3xl font-bold mt-2 flex items-center justify-start gap-2">
                {user?.Contributions_user_id_fkey?.length}
                <ul className="text-sm font-semibold">
                  Documents are your current favorite
                </ul>
              </span>
              <span className="text-xs mt-1  flex flex-wrap items-center justify-start gap-1 max-h-20 overflow-hidden">
                {user?.Contributions_user_id_fkey &&
                  user?.Contributions_user_id_fkey.length > 0 &&
                  user?.Contributions_user_id_fkey.map((doc) => {
                    return (
                      <ul
                        className=" text-indigo-400  bai-jamjuree-regular rounded-md truncate flex items-center justify-center gap-2"
                        key={`${doc.chunk_count}_${doc.created_at}`}
                      >
                        {doc.feedback.trim().split("")}
                        <FaFilePdf />
                      </ul>
                    );
                  })}
              </span>
            </motion.div>
          </div>

          {/* User  Conversations and documents */}
          <section
            className={`mb-8   p-2 rounded-lg ${
              open === true
                ? "h-90 overflow-scroll"
                : `${
                    user && user?.Contributions_user_id_fkey?.length > 0
                      ? "h-50"
                      : "h-30"
                  } overflow-hidden`
            } transition-discrete ease-linear duration-500`}
          >
            <div className="flex justify-between items-center mb-4 bai-jamjuree-regular flex-wrap">
              <h2 className="md:text-xl text-lg font-bold flex  items-center justify-center gap-2">
                Docs <FiFile />
              </h2>
              <section className="inline-flex gap-5">
                <Link
                  onClick={() => {
                    if (user?.IsPremiumUser === false) {
                      toast.info(
                        "Become our premium member to access this feature."
                      );
                      return;
                    }
                  }}
                  to={`${
                    user?.IsPremiumUser === true
                      ? "/user/misallaneous-chats"
                      : "/user/dashboard"
                  }`}
                  className="text-xs md:text-sm text-green-600 dark:text-green-400 cursor-pointer flex items-center justify-center gap-2"
                >
                  Other chats <TbOctahedron />
                </Link>
                {user && user?.Contributions_user_id_fkey?.length > 0 && (
                  <button
                    onClick={() => setOpen(!open)}
                    className="text-xs md:text-sm text-green-600 dark:text-green-400 cursor-pointer flex items-center justify-center gap-2"
                  >
                    View all
                    <FaArrowDown
                      className={`${
                        open === false ? "rotate-0" : "rotate-180"
                      } transition-discrete duration-500`}
                      size={10}
                    />
                  </button>
                )}
              </section>
            </div>

            {/* users private documents list sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-grotesk   rounded-md p-2">
              {user?.Contributions_user_id_fkey &&
              user?.Contributions_user_id_fkey.length > 0 ? (
                user?.Contributions_user_id_fkey.map((conv, index) => (
                  <motion.div
                    key={`${conv.chunk_count}_${index}`}
                    className="p-4 rounded-lg  bg-gray-100 dark:bg-black border dark:border-gray-200 border-gray-400 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium space-grotesk flex items-center justify-center gap-2">
                        <TbTextCaption color="green" /> {conv.feedback}
                      </h3>
                      <span className="text-xs opacity-50 dark:text-white text-black flex items-center justify-center gap-2">
                        <FiCalendar />
                        {conv.created_at.split("T")[0]}
                      </span>
                    </div>
                    <p className="text-sm opacity-70 mt-2">
                      Chunk Count: {conv.chunk_count}
                    </p>

                    <div className="flex justify-end items-center mt-4">
                      <Link
                        onClick={() => {
                          if (user?.IsPremiumUser === false) {
                            toast.info(
                              "Become our premium member to be able to view chat history."
                            );
                            return;
                          }
                        }}
                        to={`${
                          user?.IsPremiumUser === true
                            ? `/User/document_chat_history/${conv.document_id}`
                            : `/user/dashboard`
                        }`}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        View full chat →
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-black/5 dark:bg-white/5 border  rounded-lg h-full w-full p-4 flex ">
                  <Link to="/Interface" className="m-auto text-sm text-sky-500">
                    Upload docs +
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Rooms  Section */}
          <section
            className={`${
              IncreaseHeight === true
                ? "h-100 overflow-scroll"
                : `${chatrooms.length > 0 ? "h-65" : "h-30"} overflow-hidden`
            } transition-discrete ease-linear duration-300  rounded-md p-2`}
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
                  Creat New +
                </button>
                {chatrooms.length > 0 && (
                  <button
                    className="text-xs md:text-sm text-green-500 cursor-pointer flex items-center justify-center gap-2"
                    onClick={() => setIncreaseHeight(!IncreaseHeight)}
                  >
                    {IncreaseHeight === true ? "Hide" : "View all"}{" "}
                    <FaArrowDown
                      className={`${
                        IncreaseHeight === false ? "rotate-0" : "rotate-180"
                      } transition-discrete duration-500`}
                      size={10}
                    />
                  </button>
                )}
              </section>
            </div>

            {/* list of chatrooms section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bai-jamjuree-regular">
              {chatrooms.length > 0 ? (
                chatrooms.map((room) => (
                  <motion.div
                    key={room?.room_id}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    // onClick={() => console.log(room)}
                    className="w-full  p-4 rounded-xl border border-gray-400 bg-white dark:bg-white/5 shadow-sm hover:shadow-md transition-all cursor-pointer relative"
                  >
                    {/* Admin badge */}
                    {user?.id === room.chat_rooms.created_by && (
                      <span className="absolute top-3 right-3 bg-lime-100  text-green-600  text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}

                    <div className="text-center space-y-2">
                      <h3 className="text-lg  text-gray-800 dark:text-white line-clamp-1 flex items-center justify-start gap-2 bai-jamjuree-semibold">
                        <MdMarkUnreadChatAlt className="w-6 h-6" />
                        {room?.chat_rooms?.room_name || "Untitled Room"}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 min-h-[40px]">
                        {room?.chat_rooms?.Room_Description || "No description"}
                      </p>

                      <div className="flex justify-center gap-3 pt-2 flex-wrap">
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            room?.chat_rooms?.room_type === "private"
                              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                              : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          }`}
                        >
                          {room?.chat_rooms?.room_type || "unknown"}
                        </span>

                        <span className="flex items-center text-xs bg-yellow-600/10 px-3 py-1 rounded-full text-yellow-600 ">
                          <FiUsers className="mr-1" />
                          {room?.chat_rooms?.participant_count || 0}
                        </span>
                        <span className="flex items-center text-xs  dark:bg-red-700/10 px-3 py-1 rounded-full text-red-700 ">
                          <FaUserSecret className="mr-1" />
                          {room?.chat_rooms?.Room_Joining_code}
                        </span>
                      </div>

                      <div className="pt-3 text-xs flex items-center justify-between flex-wrap">
                        <ul className="text-gray-800 dark:text-gray-300 ">
                          Created:{" "}
                          {room?.chat_rooms?.created_at?.split("T")[0] ||
                            "Unknown date"}
                        </ul>
                        <Link
                          className="   text-xs md:text-sm text-white dark:text-black "
                          to={`/chatroom/${room?.room_id}`}
                        >
                          <ul className=" flex items-center justify-center gap-2 bg-black dark:bg-white px-2 py-1 rounded-sm bai-jamjuree-semibold ">
                            <button>Enter</button>
                            <FaArrowUpRightDots />
                          </ul>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-black/5 dark:bg-white/5 border  rounded-lg flex ">
                  <h1 className="m-auto space-grotesk text-sm md:text-md p-2">
                    Not a member of any group
                  </h1>
                </div>
              )}
            </div>
          </section>
          {/* join a room with a code section */}
          <section className="dark:bg-white/5 bg-gray-100 border border-gray-300 rounded-lg w-full md:w-1/3 p-3 mt-8 space-y-3">
            <h1 className="bai-jamjuree-semibold flex items-center justify-start gap-2">
              <FaUserSecret /> Have a room code ?
            </h1>
            <div className="flex items-center justify-between gap-2">
              <input
                ref={InputRef}
                className="rounded-lg border border-gray-400 px-2 py-1 text-sm space-grotesk w-full"
                type="text"
                placeholder="Enter 6 digit code here "
              />
              <button
                disabled={isJoining === true}
                onClick={handleJoinRoom}
                className={` text-white dark:text-black  ${
                  isJoining === true ? "bg-green-500" : "dark:bg-white bg-black"
                } rounded-lg px-2 py-1 text-sm space-grotesk font-semibold CustPoint flex items-center justify-center gap-2`}
              >
                {isJoining === false ? (
                  <>
                    Join <BsLightningChargeFill />
                  </>
                ) : (
                  <>
                    Joining.. <IoMdHourglass className="animate-spin" />
                  </>
                )}
              </button>
            </div>
          </section>
          <section className=" md:hidden block my-6 w-full">
            <button
              disabled={isLoggingOut}
              onClick={() => dispatch(LogoutUser())}
              className={`
    relative flex items-center justify-center justify-self-end gap-4 px-3 py-1 rounded-md
    text-white font-semibold transition-all duration-300 
    ${
      isLoggingOut
        ? "cursor-not-allowed bg-red-400"
        : "cursor-pointer bg-red-600 hover:bg-red-700 active:scale-95"
    }
  `}
            >
              <span
                className={`${
                  isLoggingOut ? "opacity-0" : "opacity-100"
                } transition-opacity duration-300`}
              >
                Logout
              </span>

              {isLoggingOut && (
                <span className="absolute">
                  <BiLoaderAlt className="animate-spin" size={24} />
                </span>
              )}

              <span
                className={`${
                  isLoggingOut ? "opacity-0" : "opacity-100"
                } transition-opacity duration-300`}
              >
                <BiLogOut />
              </span>
            </button>
          </section>
        </div>
      </div>
      <CreateRoom showcard={showcard} setShowCard={setShowCard} />
    </>
  );
};

export default UserDashboard;

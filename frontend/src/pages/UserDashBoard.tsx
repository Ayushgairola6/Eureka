import { lazy, useRef } from "react";
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
  FaThumbsDown,
  FaThumbsUp,
  FaUserSecret,
  FaRocketchat,
  FaExclamation,
} from "react-icons/fa";
import { TbSunset2 } from "react-icons/tb";
import { IoSunnyOutline } from "react-icons/io5";
import { MdReviews } from "react-icons/md";
import { JoinAChatRoom } from "../store/chatRoomSlice.ts";
import { toast, Toaster } from "sonner";
import { IoMdHourglass } from "react-icons/io";
import { BiLoaderAlt, BiLogOut } from "react-icons/bi";
import { LogoutUser } from "../store/AuthSlice.ts";
import { FaArrowUpRightDots } from "react-icons/fa6";
// import {NewUserNotification} from '../store/AuthSlice.ts'
const CreateRoom = lazy(() => import("@/components/createRoom.tsx"));

const UserDashboard = () => {
  // Mock user data

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const QueryCount = useAppSelector((state) => state.auth.Querycount);
  const Feedback = useAppSelector((state) => state.auth.FeedbackCounts);
  const chatrooms = useAppSelector((state) => state.auth.chatrooms);
  const isJoining = useAppSelector((state) => state.chats.isJoiningRoom);
  const InputRef = useRef<HTMLInputElement>(null);
  const [score, setScore] = useState<number>(0);
  const [showcard, setShowCard] = useState(false);
  const [open, setOpen] = useState(false);
  const [IncreaseHeight, setIncreaseHeight] = useState(false);
  const { isDarkMode, isLoggingOut } = useAppSelector((state) => state.auth);
  // Mock conversations

  const now = new Date();
  // useEffect(() => {
  //   if (isLoggingOut === true) {
  //     navigate("/");
  //   }
  // }, [isLoggingOut]);

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
    <div
      className={`dark:bg-black dark:text-white bg-white text-black relative flex min-h-screen w-full overflow-hidden z-[1] realative`}
    >
      <Toaster />
      <CreateRoom showcard={showcard} setShowCard={setShowCard} />
      {!isDarkMode && (
        <div className="h-full w-full absolute z-[-1] bg-gradient-to-br from-purple-500/20 to-sky-600/20 blur-3xl"></div>
      )}

      {/* Sidebar */}
      <div className="w-64 p-6 border-r dark:border-gray-800 hidden md:block">
        <div className="flex flex-col items-center justify-center mb-10">
          <span className="rounded-full h-24 w-24 text-5xl flex flex-col items-center justify-center border-2 bg-indigo-500 mb-4 dark:text-white text-black relative">
            {user?.username.trim().split(" ")[0].split("")[0].toUpperCase()}
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
    relative flex items-center justify-center gap-4 px-4 py-2 w-full rounded-md
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
              Welcome back, {user?.username.trim().split(" ")[0].toUpperCase()}!
            </h1>
            <p className="opacity-70 text-xs md:text-sm space-grotesk">
              Let's see what's happening with your Account{" "}
            </p>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gray-100 dark:bg-black p-6 rounded-xl border  border-gray-400"
          >
            <h3 className="text-sm md:text-lg opacity-70  bai-jamjuree-semibold">
              Questions Asked
            </h3>
            {/* <p className="text-3xl font-bold mt-2">{user.stats.questions}</p> */}
            <p className="text-xs md:text-sm mt-1 text-green-300 space-grotesk">
              -- Percent Questions asked - {QueryCount / 10}% till{" "}
              {now.toLocaleDateString()}
            </p>
            <p className="text-xs md:text-sm mt-1 text-sky-400 space-grotesk">
              {`-- ${(
                Math.random() * 20
              ).toFixed()}% Users asked similar questions as you`}
            </p>
          </motion.div>

          {/* user uploaded docs feedback section */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="bg-gray-100 dark:bg-black p-6 rounded-2xl border border-gray-400  transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                Community Feedback
              </h3>
              <div className="w-6 h-6 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                <MdReviews className="text-gray-500 dark:text-gray-400 text-xs" />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* Upvotes */}
              <div className="bg-green-500/10  backdrop-blur-sm rounded-xl p-3 border border-green-200/50 dark:border-green-800/50 group hover:border-green-300 dark:hover:border-green-600 transition-colors cursor-pointer">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <FaThumbsUp className="group-hover:animate-bounce" />
                  <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Up
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {Feedback?.upvotes || 0}
                  </span>
                </div>
              </div>

              {/* Downvotes */}
              <div className="bg-red-500/10  backdrop-blur-sm rounded-xl p-3 border border-red-200/50 dark:border-red-800/50 group hover:border-red-300 dark:hover:border-red-600 transition-colors cursor-pointer">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <FaThumbsDown className="group-hover:animate-bounce" />
                  <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Down
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-lg font-bold text-red-600 dark:text-red-400">
                    {Feedback?.downvotes || 0}
                  </span>
                </div>
              </div>

              {/* Partial Votes */}
              <div className="bg-indigo-500/10    backdrop-blur-sm rounded-xl p-3 border border-pink-200/50 dark:border-indigo-800/50 group hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer">
                <div className="flex items-center justify-center gap-1.5 mb-1 ">
                  <FaExclamation className="group-hover:animate-bounce" />
                  <span className="text-[10px] font-medium text-gray-800 dark:text-gray-300 uppercase tracking-wide">
                    Partial
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {Feedback?.partial_upvotes || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Confidence Score with Visual Indicator */}
            <div className="mt-4 pt-4 border-t border-gray-200/30 dark:border-gray-700/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-current rounded-full opacity-60"></div>
                  Confidence Score
                </span>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                    score > 70
                      ? "bg-green-100/50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      : score > 30
                      ? "bg-yellow-100/50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                      : "bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  }`}
                >
                  {score || 0}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score || 0}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    score > 70
                      ? "bg-gradient-to-r from-green-400 to-emerald-500"
                      : score > 30
                      ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                      : "bg-gradient-to-r from-red-400 to-rose-500"
                  } shadow-sm`}
                />
              </div>

              {/* Status Text */}
              <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>

            {/* Peer Review Badge */}
            <div className="mt-3 flex items-center justify-center">
              <div className="inline-flex items-center gap-1.5 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200/30 dark:border-gray-700/30">
                <MdReviews className="text-gray-400 dark:text-gray-500 text-xs" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  From{" "}
                  {(Feedback?.upvotes || 0) +
                    (Feedback?.downvotes || 0) +
                    (Feedback?.partial_upvotes || 0) || 0}{" "}
                  peer reviews
                </span>
              </div>
            </div>
          </motion.div>

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
            open === true ? "h-90 overflow-scroll" : "h-50 overflow-hidden"
          } transition-discrete ease-linear duration-500`}
        >
          <div className="flex justify-between items-center mb-4 bai-jamjuree-regular flex-wrap">
            <h2 className="md:text-xl text-lg font-bold flex  items-center justify-center gap-2">
              Docs <FiFile />
            </h2>
            <section className="inline-flex gap-5">
              <Link
                to="/user/misallaneous-chats"
                className="text-xs md:text-sm text-green-600 dark:text-green-400 cursor-pointer flex items-center justify-center gap-2"
              >
                Other chats <TbOctahedron />
              </Link>
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
                      to={`/User/document_chat_history/${conv.document_id}`}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      View full chat →
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="dark:bg-white/10 bg-gray-100 border border-gray-400 rounded-lg h-full w-full p-4 flex ">
                <Link to="/Interface" className="m-auto text-sm">
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
              : "h-60 overflow-hidden"
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
              <div className="bg-gray-100 dark:bg-black border border-gray-400 rounded-lg flex ">
                <h1 className="m-auto space-grotesk text-sm md:text-md p-2">
                  Your are not member of any room yet , Join a room +
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
        <section className="w-1/3 md:hidden block my-6">
          <button
            disabled={isLoggingOut}
            onClick={() => dispatch(LogoutUser())}
            className={`
    relative flex items-center justify-center gap-4 px-4 py-2 w-full rounded-md
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
  );
};

export default UserDashboard;

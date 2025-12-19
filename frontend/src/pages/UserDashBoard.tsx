import { Link } from "react-router";
import { motion } from "framer-motion";
import { FiCalendar, FiFile } from "react-icons/fi";
import {
  BsFile,
  BsFiletypeDocx,
  BsFiletypeJson,
  BsFiletypeMd,
  BsFiletypePptx,
  BsFiletypeTxt,
} from "react-icons/bs";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { TbOctahedron, TbTextCaption } from "react-icons/tb";
import { useEffect, useState } from "react";
import { FaFilePdf, FaArrowDown, FaRocketchat } from "react-icons/fa";

import { toast } from "sonner";
import { BiError, BiLoaderAlt, BiLogOut } from "react-icons/bi";
import {
  LogoutUser,
  togglePreference,
  UpdatePreference,
} from "../store/AuthSlice.ts";
import CreateRoom from "@/components/createRoom.tsx";
import QuestionAskedChart from "@/components/UserQuestionAskedChart.tsx";
import UserFeedbackReport from "@/components/UserFeedbackReport.tsx";
import SimilarQuestions from "@/components/SimilarQueryChart.tsx";
import PreferenceToggle from "@/components/Preference.tsx";
import JoinRoomInput from "@/components/room_join_input.tsx";
import RoomCard from "@/components/Room_card.tsx";

const UserDashboard = () => {
  // Mock user data

  const dispatch = useAppDispatch();
  const Feedback = useAppSelector((state) => state.auth.FeedbackCounts);
  const { AllowedTrainingModels } = useAppSelector((state) => state.auth);
  const chatrooms = useAppSelector((state) => state.auth.chatrooms);
  const [score, setScore] = useState<number>(0);
  const [showcard, setShowCard] = useState(false);
  const [open, setOpen] = useState(false);
  const [IncreaseHeight, setIncreaseHeight] = useState(false);
  const { isLoggingOut, user, isDarkMode } = useAppSelector(
    (state) => state.auth
  );
  // Mock conversations

  useEffect(() => {
    const totalVotes =
      Feedback?.upvotes ||
      0 + Feedback?.partial_upvotes ||
      0 + Feedback?.downvotes ||
      0;
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
  }, []);

  return (
    <>
      <div
        className={`dark:bg-black dark:text-white bg-white text-black relative flex min-h-screen w-full overflow-hidden z-[1] realative`}
      >
        {/* Sidebar */}
        <div className="w-64 p-6 border-r  hidden md:block shadow-sm shadow-black dark:shadow-white/20">
          <div className="flex flex-col items-center justify-center mb-10 ">
            <span className="rounded-full h-24 w-24 text-5xl flex flex-col items-center justify-center  border-yellow-600 bg-black text-white dark:bg-white dark:text-black mb-4 relative shadow-sm shadow-black dark:shadow-white/20 relative">
              {user?.username ? (
                user?.username.trim().split("_")[0].charAt(0).toUpperCase()
              ) : (
                <BiError />
              )}
              <ul className="absolute h-15 w-15 -bottom-2 -right-7 rounded-full ">
                {score > 70 ? (
                  <img src="/high.png" />
                ) : score > 30 && score < 70 ? (
                  <img src="/medium.png" />
                ) : (
                  <img src="/low.png" />
                )}
              </ul>
            </span>
            {/* <h3 className="font-bold text-xl">{}</h3> */}
            {/* <p className="text-sm opacity-70">{user.role}</p> */}
            <p className="text-sm mt-1 opacity-80 ">
              Joined on :{user?.created_at.split("T")[0]}
            </p>
            <p className="text-sm mt-1 opacity-80">{user?.email}</p>
          </div>
          {/* settings option for sidebar */}
          <section className="w-full mt-auto flex flex-col gap-4">
            {/* Logout Button */}
            <button
              disabled={isLoggingOut}
              onClick={() => dispatch(LogoutUser())}
              className={`
      relative group flex items-center justify-center gap-3 px-4 py-2.5 w-full rounded-xl shadow-sm 
      text-white font-medium tracking-wide transition-all duration-300 ease-out
      ${
        isLoggingOut
          ? "cursor-not-allowed bg-red-400/80"
          : "cursor-pointer bg-red-600 hover:bg-red-700 hover:shadow-red-500/25 active:scale-[0.98]"
      }
    `}
            >
              {/* Content Container (Fades out on loading) */}
              <div
                className={`flex items-center gap-3 ${
                  isLoggingOut ? "opacity-0" : "opacity-100"
                } transition-opacity duration-300`}
              >
                <span>Logout</span>
                <BiLogOut size={20} />
              </div>

              {/* Loader (Fades in on loading) */}
              <div
                className={`absolute inset-0 flex items-center justify-center ${
                  isLoggingOut ? "opacity-100" : "opacity-0"
                } transition-opacity duration-300 pointer-events-none`}
              >
                <BiLoaderAlt className="animate-spin" size={22} />
              </div>
            </button>

            {/* Toggle Switch Section */}
            {AllowedTrainingModels && (
              <div className="md:flex items-center justify-between gap-3 hidden">
                <h2 className="space-grotesk text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight">
                  Allow training models using your contributions
                </h2>

                <button
                  type="button"
                  onClick={() => {
                    // Optimistic update logic
                    const newValue =
                      AllowedTrainingModels === "YES" ? "NO" : "YES";
                    dispatch(togglePreference(newValue));

                    dispatch(UpdatePreference(newValue))
                      .unwrap()
                      .then(() => toast.message("Preference updated"))
                      .catch(() => {
                        toast.message("Could not update the preferences");
                        // Revert logic
                        dispatch(
                          togglePreference(
                            AllowedTrainingModels === "YES" ? "NO" : "YES"
                          )
                        );
                      });
                  }}
                  className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none 
          ${
            AllowedTrainingModels === "YES"
              ? "bg-sky-500"
              : "bg-gray-300 dark:bg-gray-600"
          }
        `}
                >
                  <span className="sr-only">Use setting</span>
                  <span
                    aria-hidden="true"
                    className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out
            ${
              AllowedTrainingModels === "YES"
                ? "translate-x-5"
                : "translate-x-0"
            }
          `}
                  />
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div
              className={`border-l-4 ${
                score > 70
                  ? "border-green-500"
                  : score > 30
                  ? "border-sky-500"
                  : "border-indigo-500"
              } pl-4 py-1`}
            >
              <h1 className="text-3xl md:text-4xl font-bold bai-jamjuree-bold text-slate-900 dark:text-white tracking-tight">
                {user?.username.trim().split(" ")[0].toUpperCase()}
              </h1>

              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2">
                <span className="space-grotesk text-xs font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 uppercase tracking-wider">
                  Personal dashboard
                </span>
                <p className="text-xs md:text-sm text-slate-500 space-grotesk">
                  Overview of your personal information.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between w-full py-2  md:hidden">
              {/* Left Side: Score/Badge */}
              <div className="flex items-center gap-3">
                {/* Image */}
                <div className="h-10 w-10">
                  <img
                    src={
                      score > 70
                        ? "/high.png"
                        : score > 30
                        ? "/medium.png"
                        : "/low.png"
                    }
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>

                {/* Text Stack */}
                <div className="flex flex-col space-grotesk">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                    {score}% Score
                  </span>
                  <span className="text-[10px] text-gray-500 leading-none">
                    Authenticity Rating
                  </span>
                </div>
              </div>
              {/* toggle option */}
              <PreferenceToggle />
            </div>
          </header>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ">
            <section className="grid grid-cols-1 space-y-3">
              <QuestionAskedChart />
              {/* user active projects section */}
              <motion.div
                whileHover={{ y: -5 }}
                className=" bg-gray-100 dark:bg-black p-6 rounded-xl border shadow-sm shadow-black dark:shadow-white/20"
              >
                <h3 className="text-sm opacity-70 font-semibold ">
                  Active Documents
                </h3>
                <span className="text-3xl font-bold mt-2 flex items-center justify-start gap-2">
                  {user?.Contributions_user_id_fkey?.length}
                  <ul className="text-sm font-semibold">
                    Documents are your current favorite
                  </ul>
                </span>
                <span className="text-xs mt-1  flex flex-wrap items-center justify-start gap-1 max-h-20 overflow-y-auto">
                  {user?.Contributions_user_id_fkey &&
                    user?.Contributions_user_id_fkey.length > 0 &&
                    user?.Contributions_user_id_fkey.map((doc) => {
                      return (
                        <>
                          <ul
                            className={`${
                              doc.feedback.trim().split(".")[1] == "txt"
                                ? "text-teal-500"
                                : doc.feedback.trim().split(".")[1] === "pdf"
                                ? "text-red-500"
                                : doc.feedback.trim().split(".")[1] === "docx"
                                ? "text-lime-500"
                                : doc.feedback.trim().split(".")[1] === "md"
                                ? "text-green-500"
                                : doc.feedback.trim().split(".")[1] === "json"
                                ? "text-purple-500"
                                : doc.feedback.trim().split(".")[1] === "pptx"
                                ? "text-pink-500"
                                : "text-blue-500"
                            }   bai-jamjuree-regular  truncate flex items-center justify-center gap-2 border rounded-sm px-2`}
                            key={`${doc.chunk_count}_${doc.created_at}`}
                          >
                            {doc.feedback.trim().split(".")[1] == "txt" ? (
                              <BsFiletypeTxt
                                color={`${
                                  isDarkMode === true ? "white" : "black"
                                }`}
                              />
                            ) : doc.feedback.trim().split(".")[1] === "pdf" ? (
                              <FaFilePdf
                                color={`${
                                  isDarkMode === true ? "white" : "black"
                                }`}
                              />
                            ) : doc.feedback.trim().split(".")[1] === "docx" ? (
                              <BsFiletypeDocx
                                color={`${
                                  isDarkMode === true ? "white" : "black"
                                }`}
                              />
                            ) : doc.feedback.trim().split(".")[1] === "md" ? (
                              <BsFiletypeMd
                                color={`${
                                  isDarkMode === true ? "white" : "black"
                                }`}
                              />
                            ) : doc.feedback.trim().split(".")[1] === "json" ? (
                              <BsFiletypeJson
                                color={`${
                                  isDarkMode === true ? "white" : "black"
                                }`}
                              />
                            ) : doc.feedback.trim().split(".")[1] === "pptx" ? (
                              <BsFiletypePptx
                                color={`${
                                  isDarkMode === true ? "white" : "black"
                                }`}
                              />
                            ) : (
                              <BsFile
                                color={`${
                                  isDarkMode === true ? "white" : "black"
                                }`}
                              />
                            )}
                            {doc.feedback.trim()}
                          </ul>
                        </>
                      );
                    })}
                </span>
              </motion.div>
            </section>
            <SimilarQuestions />
            {/* user uploaded docs feedback section */}
            <UserFeedbackReport score={score} />
          </div>
          {/* User  Conversations and documents */}
          <section
            className={`mb-8 border p-2 space-y-2  rounded-lg ${
              open === true
                ? "h-100 overflow-y-scroll"
                : `${
                    user && user?.Contributions_user_id_fkey?.length > 0
                      ? "h-60  "
                      : "h-30"
                  } overflow-hidden`
            } transition-discrete ease-linear duration-500`}
          >
            <div className="flex justify-between items-center mb-4 bai-jamjuree-regular flex-wrap">
              <h2 className="md:text-xl text-lg font-bold flex  items-center justify-center gap-2">
                Docs <FiFile />
              </h2>
              <section className="inline-flex gap-5 ">
                <Link
                  to="/user/misallaneous-chats"
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
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-grotesk   rounded-md p-2 "> */}
            {user?.Contributions_user_id_fkey &&
            user?.Contributions_user_id_fkey.length > 0 ? (
              user?.Contributions_user_id_fkey.map((conv, index) => (
                <motion.div
                  key={`${conv.chunk_count}_${index}`}
                  className="p-4 rounded-lg  bg-gray-100 dark:bg-black border   transition-all cursor-pointer shadow-sm shadow-black dark:shadow-white/20"
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
            {/* </div> */}
          </section>
          {/* Rooms  Section */}
          <section
            className={`border ${
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bai-jamjuree-regular ">
              {chatrooms.length > 0 ? (
                chatrooms.map((room, index) => (
                  <RoomCard room={room} index={index}></RoomCard>
                ))
              ) : (
                <div className=" border  rounded-lg flex bg-gray-100 dark:bg-black">
                  <h1 className="m-auto space-grotesk text-sm md:text-md p-2">
                    No active rooms
                  </h1>
                </div>
              )}
            </div>
          </section>
          {/* join a room with a code section */}
          <JoinRoomInput />
          {/* logout button */}
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

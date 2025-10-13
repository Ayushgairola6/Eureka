import { useState, useEffect, useRef, useCallback } from "react";
import {
  FiSend,
  FiPaperclip,
  FiUsers,
  FiFileText,
  FiX,
  FiChevronDown,
} from "react-icons/fi";
import { IoMdClose, IoMdHourglass } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../store/hooks.tsx";
import {
  AddNewMessage,
  AskAI,
  ChooseFile,
  SearchWeb,
  SetChatRoomFile,
  setFavicon,
  whoIsTyping,
} from "../store/websockteSlice.ts";

import { useParams } from "react-router";
import {
  sendMessage,
  joinAChatRoom,
  leaveChatRoom,
  connectSocket,
  GetChatRoomHistory,
  isTyping,
  setWhoIsTyping,
} from "../store/websockteSlice.ts";
import { toast, Toaster } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Streamdown } from "streamdown";
import { FaInternetExplorer } from "react-icons/fa";
import TypingIndicator from "@/components/TypingIndicator.tsx";
import DocumentPanel from "@/components/DocumentPanel.tsx";
import AiQuerySection from "@/components/AiQuerySection.tsx";
import WebSearchPanel from "@/components/ChatRoomWebSearch.tsx";

const ChatRoom = () => {
  const { id } = useParams();
  // State management
  // const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const data = useAppSelector((state) => state.socket.newMessage);
  const [showDocsPanel, setShowDocsPanel] = useState(false);
  const [showWebSearchPanel, setShowWebSearchPanel] = useState(false);
  // const [currentRoomName, setCurrentRoomName] = useState<any>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const User = useAppSelector((state) => state?.auth.user);
  const chatrooms = useAppSelector((state) => state?.auth.chatrooms);
  const notification = useAppSelector((state) => state.socket.response);
  const isConnected = useAppSelector((state) => state.socket.isConnected);
  const gettinChats = useAppSelector((state) => state.socket.gettingOldMessage);
  const { whoistyping, chatRoomFile, favicon } = useAppSelector(
    (state) => state.socket
  );
  const roomMembers = useAppSelector((state) => state.socket.membername);
  const [showRoomInfo, setShowRoomInfo] = useState(false);

  useEffect(() => {
    // Ensure socket is connected first
    if (!isConnected) {
      dispatch(connectSocket());
    }
  }, [dispatch, isConnected]);

  //   reset the popup
  useEffect(() => {
    const timer = setTimeout(() => {
      setWhoIsTyping();
    }, 500);
    return () => clearTimeout(timer);
  }, [whoistyping]);
  // storing the last notification message
  const lastNotificationRef = useRef<string>("");

  useEffect(() => {
    if (
      notification &&
      notification !== "" &&
      notification !== lastNotificationRef.current
    ) {
      lastNotificationRef.current = notification;
      toast.success(notification);
    }
  }, [notification]);

  // finding the current room from the aray of the chatsroom
  const currentRoom = chatrooms.find((e) => e.chat_rooms.room_id === id);
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Array of month names for clarity
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  // Array of day names
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const dayOfMonth = now.getDate();
  const dayOfWeek = dayNames[now.getDay()];
  const year = now.getFullYear();
  const month = monthNames[now.getMonth()];

  // Format time in 12-hour format with AM/PM
  const formattedTime = `${hour > 12 ? hour - 12 : hour}:${minute
    .toString()
    .padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;

  // Combine all parts into a single string using a delimiter
  const currentTime = `${formattedTime}|${dayOfMonth} ${month} ${year}|${dayOfWeek}`;
  useEffect(() => {
    // Only run if the room and user information is available AND socket is connected
    if (currentRoom && User && isConnected && id) {
      const roomInfo = {
        room_id: currentRoom.room_id,
        room_name: currentRoom.chat_rooms.room_name,
        username: User.username,
        user_id: User.id,
      };

      // Dispatch the join action
      dispatch(joinAChatRoom(roomInfo));
      dispatch(GetChatRoomHistory(id));
      return () => {
        const data = {
          room_id: currentRoom.room_id,
          username: User.username,
        };
        dispatch(leaveChatRoom(data));
      };
    }
  }, [id, User, chatrooms, dispatch, isConnected, currentRoom]);
  // id, User, chatrooms, dispatch

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  // send message handler
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      message_id: uuidv4(),
      sent_at: currentTime,
      sent_by: User?.id || null,
      message: newMessage,
      room_id: currentRoom?.room_id,
      users: { username: User?.username },
    };

    // setMessages([...messages, message]);
    setNewMessage("");
    // Send to backend/WebSocket
    dispatch(sendMessage(message));
  };

  // selecting doc handler with event emitter
  const handleSelectDoc = (doc: any) => {
    if (showWebSearchPanel === true) {
      setShowWebSearchPanel(false);
    }
    dispatch(SetChatRoomFile(doc));
    dispatch(ChooseFile({ file: doc, room_id: id, username: User?.username }));
    // Notify room members about document selection
    const systemMessage = {
      message_id: uuidv4(),
      sent_at: currentTime,
      sent_by: "SYSTEM",
      message: `${User?.username} selected document: ${doc.feedback}`,
      room_id: currentRoom?.room_id,
      users: { username: "SYSTEM" },
    };
    setShowDocsPanel(!showDocsPanel);
    dispatch(sendMessage(systemMessage));
  };

  // function to handle document queryin the chatroom
  const handleQueryDocument = async () => {
    if (!User) {
      toast.error("Please login to continue");
      return;
    }
    if (!aiQuery.trim() || !chatRoomFile || isQuerying) {
      toast.error(
        !aiQuery.trim() ? "Please enter a question" : "Please select a document"
      );
      return;
    }
    // one time unique message id so that the id is similar accorss the users
    const MessageId = uuidv4();

    setIsQuerying(true);

    const information = {
      question: aiQuery,
      document_id: chatRoomFile.document_id,
      room_id: id,
      user_id: User?.id,
      MessageId: MessageId,
    };

    // Send system message immediately
    dispatch(
      sendMessage({
        message_id: uuidv4(),
        sent_at: currentTime,
        sent_by: null,
        message: `${User?.username} asked question=${aiQuery} about ${chatRoomFile.feedback}`,
        room_id: currentRoom?.room_id,
        users: { username: "SYSTEM" },
      })
    );

    await dispatch(AskAI(information))
      .unwrap()
      .then((res) => {
        dispatch(
          AddNewMessage({
            message_id: MessageId,
            sent_at: currentTime,
            sent_by: null,
            message: res.answer,
            room_id: currentRoom?.room_id,
            users: { username: "EUREKA" },
          })
        );

        setIsQuerying(false);

        setAiQuery("");
        return res.answer;
      })
      .catch((_error) => {
        dispatch(
          AddNewMessage({
            message_id: MessageId,
            sent_at: currentTime,
            sent_by: null,
            message: _error,
            room_id: currentRoom?.room_id,
            users: { username: "EUREKA" },
          })
        );

        setIsQuerying(false);
        setAiQuery("");
        return _error;
      });
  };

  // web search handler
  const handleRoomWebSearch = async () => {
    if (!User) {
      toast.error("Please login to continue");
      return;
    }
    if (!aiQuery.trim() || isQuerying) {
      toast.error(!aiQuery.trim() && "Please enter a question");
      return;
    }
    // one time unique message id so that the id is similar accorss the users
    const MessageId = uuidv4();

    setIsQuerying(true);

    // info to send to the function
    const information = {
      room_id: id,
      MessageId: MessageId,
      query: aiQuery,
    };

    // Send system message immediately
    dispatch(
      sendMessage({
        message_id: uuidv4(),
        sent_at: currentTime,
        sent_by: null,
        message: `${User?.username} searched ${aiQuery} from the web`,
        room_id: currentRoom?.room_id,
        users: { username: "SYSTEM" },
      })
    );

    // search web and get Results
    dispatch(SearchWeb(information))
      .unwrap()
      .then((res) => {
        dispatch(
          AddNewMessage({
            message_id: MessageId,
            sent_at: currentTime,
            sent_by: null,
            message: res.answer,
            room_id: currentRoom?.room_id,
            users: { username: "EUREKA" },
          })
        );
        dispatch(setFavicon(res.favicon));

        setIsQuerying(false);

        setAiQuery("");
        return res.answer;
      })
      .catch((_error) => {
        dispatch(
          AddNewMessage({
            message_id: MessageId,
            sent_at: currentTime,
            sent_by: null,
            message: _error,
            room_id: currentRoom?.room_id,
            users: { username: "EUREKA" },
          })
        );

        setIsQuerying(false);
        setAiQuery("");
        return _error;
      });
  };

  const [timer, setTimer] = useState<any>(null);
  //   emitting the isTyping event to the room so that others can see someone is typing
  const HandleTypingIndicator = useCallback(() => {
    // Clear any existing timer to prevent sending multiple events
    if (timer) {
      clearTimeout(timer);
    }

    // Set a new timer
    const newTimer = setTimeout(() => {
      // Dispatch the typing event
      dispatch(
        isTyping({ room_id: currentRoom?.room_id, username: User?.username })
      );
    }, 2000);

    // Store the timer ID in state so it can be cleared on the next call
    setTimer(newTimer);
  }, [dispatch, User, timer]); // Add timer to the dependency array

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100">
      <Toaster />
      {/* Mobile Header */}
      <div className="lg:hidden flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold bai-jamjuree-bold">
          {currentRoom?.chat_rooms.room_name}
        </h1>
        {/* Mobile Room Info Button */}
        <div className="lg:hidden flex items-center justify-between gap-4  bg-white dark:bg-gray-800  dark:border-gray-700">
          <button
            onClick={() => setShowRoomInfo(!showRoomInfo)}
            className="flex items-center space-x-2 px-4 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium"
          >
            <span> Info</span>
            <FiChevronDown
              className={`transition-transform ${
                showRoomInfo ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Room Info Panel */}
      <AnimatePresence>
        {showRoomInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Room Information</h3>
                <button
                  onClick={() => setShowRoomInfo(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Room Name:</span>
                  <span className="text-sm">
                    {currentRoom?.chat_rooms.room_name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Created:</span>
                  <span className="text-sm">
                    {currentRoom?.chat_rooms.created_at?.split("T")[0]}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Type:</span>
                  <span className="px-2 py-1 text-xs bg-green-600/10 text-green-600 rounded-full">
                    {currentRoom?.chat_rooms.room_type}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">About:</span>
                  <span className="px-2 py-1 text-xs  text-black dark:text-white line-clamp-2">
                    {currentRoom?.chat_rooms.Room_Description}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Invite Code:</span>
                  <span className="px-2 py-1 text-xs bg-red-600/10 text-red-600 rounded-full">
                    {currentRoom?.chat_rooms.Room_Joining_code}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Limit:</span>
                  <span className="text-sm">
                    {currentRoom?.chat_rooms.participant_count}
                  </span>
                </div>
              </div>

              {/* Room Members List for Mobile */}
              {roomMembers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold mb-2 text-sm flex items-center">
                    <FiUsers className="mr-2" />
                    Active now
                  </h4>
                  <div className=" flex items-center justify-evenly flex-wrap gap-2">
                    {roomMembers.map((member: any, index: any) => (
                      <div
                        key={`${member.user}_at_${index}`}
                        className="flex items-center text-sm"
                      >
                        <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs mr-2">
                          {member.user.charAt(0)}
                        </div>
                        <span className="flex items-center justify-center gap-3">
                          {member.user}{" "}
                          <ul className=" rounded-full bg-green-500 h-2 w-2"></ul>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        <div className="relative hidden lg:flex lg:w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-700 p-4 flex-col">
          <div className="flex items-center justify-between gap-2 mb-4 flex-wrap space-grotesk">
            <h2 className="text-xl font-bold ">
              {currentRoom?.chat_rooms.room_name}
            </h2>
            <span className="text-xs text-gray-400">
              From {currentRoom?.chat_rooms.created_at?.split("T")[0]}
            </span>
            <ul className=" bg-green-600/10 text-green-600 rounded-xl px-2 py-1 text-xs">
              {currentRoom?.chat_rooms.room_type}
            </ul>
            <span className="px-2 py-1 text-xs  text-black dark:text-white ">
              {currentRoom?.chat_rooms.Room_Description}
            </span>
            <ul className=" bg-red-600/10 text-red-600 rounded-xl px-2 py-1 text-xs">
              Invite code - {currentRoom?.chat_rooms.Room_Joining_code}
            </ul>
          </div>

          <div className="mb-6 space-grotesk">
            <h3 className="font-semibold mb-2 flex items-center">
              <FiUsers className="mr-2" /> Members Limit (
              {currentRoom?.chat_rooms.participant_count})
            </h3>
            <div className="space-y-2">
              <label htmlFor="active">Active now</label>
              {roomMembers.map((member: any, index: any) => (
                <div
                  key={`${member.user}_at_${index}`}
                  className="flex items-center "
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                    {member.user.charAt(0)}
                  </div>
                  <span className="flex items-center justify-center gap-3">
                    {member.user}{" "}
                    <ul className=" rounded-full bg-green-500 h-2 w-2"></ul>
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* feature butttons */}
          <section className="mt-auto w-full gap-2 flex flex-col justify-center items-center">
            <button
              onClick={() => {
                if (chatRoomFile !== null) {
                  dispatch(SetChatRoomFile(null));
                }
                setShowWebSearchPanel(!showWebSearchPanel);
              }}
              className="w-full flex items-center justify-center space-x-2 bg-black hover:bg-gray-900 dark:hover:bg-gray-400 text-white dark:bg-white dark:text-black py-2 px-4 rounded-lg transition-colors bai-jamjuree-regular"
            >
              <FaInternetExplorer />
              <span>{showDocsPanel ? "Cancel" : "Web Search"}</span>
            </button>
            <button
              onClick={() => setShowDocsPanel(!showDocsPanel)}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors bai-jamjuree-regular"
            >
              <FiFileText />
              <span>{showDocsPanel ? "Hide Documents" : "My Documents"}</span>
            </button>
          </section>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden space-grotesk">
          {/* Selected Document Banner */}
          {chatRoomFile && (
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 border-b border-blue-200 dark:border-blue-800">
              <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Active Document:</h3>
                  <p className="text-sm">{chatRoomFile?.feedback}</p>
                </div>
                <button
                  onClick={() => dispatch(SetChatRoomFile(null))}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                >
                  <IoMdClose size={18} />
                </button>
              </div>
            </div>
          )}

          {/* AI Query Section */}

          <AiQuerySection
            setAiQuery={setAiQuery}
            isQuerying={isQuerying}
            handleQueryDocument={handleQueryDocument}
            aiQuery={aiQuery}
          />
          {/* web search panel section */}
          <WebSearchPanel
            setAiQuery={setAiQuery}
            isQuerying={isQuerying}
            aiQuery={aiQuery}
            handleRoomWebSearch={handleRoomWebSearch}
            showWebSearchPanel={showWebSearchPanel}
          />
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-grotesk relative">
            {gettinChats === true && data.length === 0 ? (
              <div className="flex h-full">
                <h1 className="bai-jamjuree-regular  text-green-400 m-auto flex items-center justify-center gap-2">
                  Looking for older messages...{" "}
                  <IoMdHourglass className="animate-spin" />
                </h1>
              </div>
            ) : (
              data.map((message: any, index: any) => (
                <>
                  {/*  return (
                            <>
                              <img
                                className="h-5 w-5 rounded-full"
                                src={icon}
                                alt=""
                              />
                            </>
                          ); */}
                  {favicon.length > 0 &&
                    favicon.find((e) => e.MessageId === message.message_id) && (
                      <section className="flex items-center justify-start gap-2 bai-jamjuree-semibold text-md my-6 px-3">
                        From{" "}
                        {
                          favicon.find(
                            (e: any) => e.MessageId === message.message_id
                          )?.favicon.length
                        }{" "}
                        Sources
                        {favicon
                          .find((e) => e.MessageId === message.message_id)
                          ?.favicon.map((icon, index) => {
                            return (
                              <>
                                <img
                                  key={`${message.message_id}_${index}`}
                                  className="h-5 w-5 rounded-full"
                                  src={icon}
                                  alt="source favicon"
                                />
                              </>
                            );
                          })}
                      </section>
                    )}
                  <motion.div
                    key={`${message.room_id}_${message.sent_by}_${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-4  flex bai-jamjuree-regular ${
                      message.sent_by === User?.id
                        ? "justify-end" // User's messages on right
                        : message.sent_by === null
                        ? "justify-center " // Eureka messages centered
                        : "justify-start" // Other users on left
                    }`}
                  >
                    <div
                      className={`${
                        message.sent_by === User?.id
                          ? "border bg-gray-100 text-black dark:bg-white/5 dark:text-white rounded-lg rounded-br-none"
                          : message.sent_by === null
                          ? "bg-white text-black dark:bg-black dark:text-white border w-full rounded-lg"
                          : "border bg-sky-600/10  dark:text-white  text-black rounded-lg rounded-bl-none"
                      } p-3 max-w-[80%]`}
                    >
                      {/* username with timestamp */}
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <p
                          className={`bai-jamjuree-semibold text-sm ${
                            message.sent_by === User?.id
                              ? "text-green-600"
                              : message.sent_by === null
                              ? "text-indigo-600"
                              : "text-sky-600"
                          }`}
                        >
                          {message.sent_by === User?.id
                            ? "You"
                            : message.users?.username || "• Eureka"}
                          {/* {message.sent_by === null && " • Eureka"} */}
                        </p>
                        <p className="text-xs text-gray-700 dark:text-gray-400">
                          {message?.sent_at &&
                            `at ${message.sent_at.split("|")[0]}`}
                        </p>
                      </div>

                      {/* Message content */}
                      {message.sent_by === null ? (
                        <Streamdown className="">{message.message}</Streamdown>
                      ) : (
                        <p>{message.message}</p>
                      )}
                    </div>
                  </motion.div>
                  {message === data[data.length - 1] &&
                    whoistyping !== "" &&
                    whoistyping !== User?.username && <TypingIndicator />}
                </>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bai-jamjuree-regular">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center">
                <button
                  onClick={() => {
                    if (chatRoomFile !== null) {
                      dispatch(SetChatRoomFile(null));
                    }
                    setShowWebSearchPanel(!showWebSearchPanel);
                  }}
                  className="cursor-pointer p-2 mr-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                >
                  <FaInternetExplorer />
                </button>
                <button
                  onClick={() => setShowDocsPanel(!showDocsPanel)}
                  className="cursor-pointer p-2 mr-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                >
                  <FiPaperclip size={20} />
                </button>
                <input
                  onFocus={() => dispatch(whoIsTyping(""))}
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    HandleTypingIndicator();
                  }}
                  onKeyUp={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
                />
                <button
                  disabled={isQuerying === true}
                  onClick={handleSendMessage}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r-lg transition-colors"
                >
                  <FiSend size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Panel */}
        <DocumentPanel
          showDocsPanel={showDocsPanel}
          setShowDocsPanel={setShowDocsPanel}
          handleSelectDoc={handleSelectDoc}
        />
      </div>
    </div>
  );
};

export default ChatRoom;

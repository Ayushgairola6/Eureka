import { useState, useEffect, useRef, useCallback } from "react";
import {
  FiSend,
  FiPaperclip,
  FiUsers,
  FiFileText,
  FiSearch,
  FiX,
  FiChevronDown,
} from "react-icons/fi";
import { IoMdClose, IoMdHourglass } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../store/hooks.tsx";
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
const ChatRoom = () => {
  const { id } = useParams();
  // State management
  // const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showDocsPanel, setShowDocsPanel] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>();
  const [aiQuery, setAiQuery] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const data = useAppSelector((state) => state.socket.newMessage);
  // const [currentRoomName, setCurrentRoomName] = useState<any>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const User = useAppSelector((state) => state?.auth.user);
  const chatrooms = useAppSelector((state) => state?.auth.chatrooms);
  const notification = useAppSelector((state) => state.socket.response);
  const isConnected = useAppSelector((state) => state.socket.isConnected);
  const gettinChats = useAppSelector((state) => state.socket.gettingOldMessage);
  const { whoistyping } = useAppSelector((state) => state.socket);
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

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      message_id: uuidv4(),
      sent_at: currentTime,
      sent_by: User?.id ?? "Anonymus",
      message: newMessage,
      room_id: currentRoom?.room_id,
      users: { username: User?.username },
    };

    // setMessages([...messages, message]);
    setNewMessage("");
    // Send to backend/WebSocket
    dispatch(sendMessage(message));
  };

  const handleSelectDoc = (doc: any) => {
    setSelectedDoc(doc);
    // Notify room members about document selection
    const systemMessage = {
      message_id: uuidv4(),
      sent_at: currentTime,
      sent_by: "SYSTEM",
      message: `${User?.username} selected document: ${doc.feedback}`,
      room_id: currentRoom?.room_id,
      users: { username: "SYSTEM" },
    };
    dispatch(sendMessage(systemMessage));
  };

  const handleQueryDocument = async () => {
    if (!aiQuery.trim() || !selectedDoc || isQuerying) return;

    setIsQuerying(true);

    try {
      // Mock API call - replace with actual implementation
      const aiResponse = await mockQueryAI(selectedDoc.id, aiQuery);

      const responseMessage = {
        message_id: uuidv4(),
        sent_at: currentTime,
        sent_by: "EUREKA",
        message: aiResponse,
        room_id: currentRoom?.room_id,
        users: { username: "EUREKA" },
      };

      dispatch(sendMessage(responseMessage));
      setAiQuery("");
    } catch (error) {
      console.error("AI query failed:", error);
    } finally {
      setIsQuerying(false);
    }
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
    }, 3000);

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
          <button
            onClick={() => setShowDocsPanel(!showDocsPanel)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
          >
            <FiFileText size={20} />
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
                  <div className="space-y-2">
                    {roomMembers.map((member, index) => (
                      <div
                        key={`${member.user}_at_${index}`}
                        className="flex items-center text-sm"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">
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
              {roomMembers.map((member, index) => (
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

          <button
            onClick={() => setShowDocsPanel(!showDocsPanel)}
            className="mt-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors bai-jamjuree-regular"
          >
            <FiFileText />
            <span>{showDocsPanel ? "Hide Documents" : "My Documents"}</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden space-grotesk">
          {/* Selected Document Banner */}
          {selectedDoc && (
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 border-b border-blue-200 dark:border-blue-800">
              <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Active Document:</h3>
                  <p className="text-sm">{selectedDoc?.feedback}</p>
                </div>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                >
                  <IoMdClose size={18} />
                </button>
              </div>
            </div>
          )}

          {/* AI Query Section */}
          {selectedDoc && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 border-b border-gray-200 dark:border-gray-700 bai-jamjuree-regular">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2">
                  <FiSearch className="text-gray-500" />
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder={`Ask anything about ${selectedDoc.feedback}...`}
                    className="flex-1 bg-transparent border-none focus:outline-none"
                    onKeyUp={(e) => e.key === "Enter" && handleQueryDocument()}
                  />
                  <button
                    onClick={handleQueryDocument}
                    disabled={isQuerying}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                  >
                    {isQuerying ? "Analyzing..." : "Ask"}
                  </button>
                </div>
              </div>
            </div>
          )}

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
                <motion.div
                  key={`${message.room_id}_${message.sent_by}_${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 flex items-center  bai-jamjuree-regular   ${
                    message.sent_by === User?.id
                      ? "text-right justify-start"
                      : "text-left justify-end"
                  }`}
                >
                  <div
                    className={`${
                      message.sent_by === "SYSTEM"
                        ? "bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg p-0.5"
                        : message.sent_by === User?.id
                        ? "bg-gradient-to-br from-purple-700 to-blue-600 rounded-lg p-0.5"
                        : "bg-gradient-to-br from-pink-600 to-lime-600 rounded-lg p-0.5"
                    }`}
                  >
                    <div
                      className={`${
                        message.sent_by === "SYSTEM"
                          ? "bg-gray-800 text-gray-200 italic "
                          : message.sent_by === User?.id
                          ? "bg-gray-900 text-white "
                          : "bg-gray-200 text-black "
                      } rounded-lg rounded-bl-lg p-3 w-fit  `}
                    >
                      {/* username with timestamp */}
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <p
                          className={` font-medium text-sm  ${
                            message.sent_by === "SYSTEM"
                              ? "text-red-500"
                              : message.sent_by === User?.id
                              ? "text-green-600"
                              : "text-sky-600"
                          } t`}
                        >
                          {message.users?.username === User?.username
                            ? "You"
                            : message.users?.username}
                          {message.sent_by === "SYSTEM" && " • System"}
                        </p>
                        <p
                          className={`text-xs ${
                            message.sent_by === "SYSTEM"
                              ? "text-gray-100"
                              : message.sent_by === User?.id
                              ? "text-gray-400"
                              : "text-black"
                          }`}
                        >
                          {message?.sent_at &&
                            `at ${message.sent_at.split("|")[0]}
                            `}
                        </p>
                      </div>

                      {/* Message text - main content */}
                      <p className="text-sm leading-relaxed mb-2 text-left">
                        {message.message}
                      </p>
                    </div>
                  </div>

                  {whoistyping && whoistyping !== User?.username && (
                    <div className="absolute bottom-2 left-2 flex items-center justify-center gap-2">
                      {`${whoistyping
                        .trim()
                        .split("")[0]
                        .toUpperCase()} is typing`}
                      <span className="flex items-center justify-center gap-2">
                        <motion.ul
                          className="bg-gray-500 rounded-full h-2 w-2"
                          animate={{ y: [0, -6, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: 0,
                          }}
                        />
                        <motion.ul
                          className="bg-gray-500 rounded-full h-2 w-2"
                          animate={{ y: [0, -6, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: 1,
                          }}
                        />
                        <motion.ul
                          className="bg-gray-500 rounded-full h-2 w-2"
                          animate={{ y: [0, -7, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: 2,
                          }}
                        />
                      </span>
                    </div>
                  )}
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bai-jamjuree-regular">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center">
                <button
                  onClick={() => setShowDocsPanel(!showDocsPanel)}
                  className="p-2 mr-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <FiPaperclip size={20} />
                </button>
                <input
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
        <AnimatePresence>
          {showDocsPanel && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed inset-0 z-50 bg-white dark:bg-gray-800 lg:relative lg:w-72 lg:border-l lg:border-gray-200 dark:lg:border-gray-700 overflow-y-auto bai-jamjuree-regular"
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">My Documents</h3>
                  <button
                    onClick={() => setShowDocsPanel(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                  >
                    <IoMdClose size={24} />
                  </button>
                </div>

                <div className="space-y-3">
                  {User?.Contributions_user_id_fkey ? (
                    User?.Contributions_user_id_fkey.map((doc: any) => (
                      <motion.div
                        key={doc.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          onClick={() => handleSelectDoc(doc)}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedDoc?.id === doc.id
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          <div className="flex items-center">
                            <FiFileText className="mr-2 text-gray-500" />
                            <span className="truncate">{doc.feedback}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div>
                      <h1>You do not have any documents</h1>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Mock function - replace with actual API call
const mockQueryAI = async (docId: string, query: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        `AI response about document ${docId} for query: "${query}"\n\nThis would be the actual response from your server's AI processing.`
      );
    }, 1500);
  });
};

type Doc = {
  id: string;
  feedback: string;
};

export default ChatRoom;

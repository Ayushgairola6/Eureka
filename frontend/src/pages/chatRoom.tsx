import { useState, useEffect, useRef } from "react";
import {
  FiSend,
  FiPaperclip,
  FiUsers,
  FiFileText,
  FiX,
  FiChevronDown,
} from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../store/hooks.tsx";
import {
  AddNewMessage,
  AskAI,
  ChooseFile,
  FetchMoreChatsInTheRoom,
  isTyping,
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
  // isTyping,
  setWhoIsTyping,
} from "../store/websockteSlice.ts";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Streamdown } from "streamdown";
import { FaInternetExplorer } from "react-icons/fa";
import TypingIndicator from "@/components/TypingIndicator.tsx";
import DocumentPanel from "@/components/DocumentPanel.tsx";
import AiQuerySection from "@/components/AiQuerySection.tsx";
import WebSearchPanel from "@/components/ChatRoomWebSearch.tsx";
import DocUsed from "@/components/DocumentsUsed.tsx";
import SynthesisMode from "@/components/ChatRoomSynthesisMode.tsx";
import SynthesisPanel from "@/components/SynthesiQueryBar.tsx";
import { GiArchiveResearch } from "react-icons/gi";
import { useNavigate } from 'react-router'
import {
  emptyArray,
  setRoomQueryMode,
  setShowSynthesisPanel,
} from "../store/chatRoomSlice.ts";
import WebSearchStatus from "@/components/web_search_status.tsx";
const ChatRoom = () => {
  const { id } = useParams();
  // State management
  const [newMessage, setNewMessage] = useState("");
  const [docused, setShowDocUsed] = useState(false);
  const navigate = useNavigate();
  const [aiQuery, setAiQuery] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const data = useAppSelector((state) => state.socket.newMessage);
  const { showSyntheSisPanel, roomWebSearchDepth } = useAppSelector((state) => state.chats);
  const [showDocsPanel, setShowDocsPanel] = useState(false);
  const { web_search_status } = useAppSelector(s => s.socket)
  const [showWebSearchPanel, setShowWebSearchPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const User = useAppSelector((state) => state?.auth.user);
  const chatrooms = useAppSelector((state) => state?.auth.chatrooms);
  const notification = useAppSelector((state) => state.socket.response);
  const isConnected = useAppSelector((state) => state.socket.isConnected);
  const { RoomQueryMode } = useAppSelector((state) => state.chats);
  const { fetchingMoreChats } = useAppSelector((state) => state.socket);
  const gettinChats = useAppSelector((state) => state.socket.gettingOldMessage);
  const { whoistyping, chatRoomFile } = useAppSelector((state) => state.socket);
  const roomMembers = useAppSelector((state) => state.socket.membername);
  const [showRoomInfo, setShowRoomInfo] = useState(false);

  useEffect(() => {
    // Ensure socket is connected first
    if (!isConnected) {
      dispatch(connectSocket());
    }
  }, [dispatch, isConnected]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWhoIsTyping();
    }, 500);
    return () => clearTimeout(timer);
  }, [whoistyping])
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
  // empty the doc array;
  useEffect(() => {
    if (RoomQueryMode !== "Synthesis") {
      dispatch(emptyArray());
      if (showSyntheSisPanel === true) {
        dispatch(setShowSynthesisPanel(false));
      }
    } else if (RoomQueryMode === "Synthesis") {
      dispatch(setShowSynthesisPanel(!showSyntheSisPanel));
    }
  }, [RoomQueryMode]);

  // typing effect handler
  useEffect(() => {

    //if the total chracter count is 20 or more tell everyone that this user is typing
    if (newMessage && newMessage.trim().length >= 20) {
      dispatch(isTyping({ room_id: id, username: User?.username }))

    }
    const timer = setTimeout(() => {
      setWhoIsTyping();
    }, 500);
    return () => clearTimeout(timer);

  }, [newMessage])
  // to keep the track of joining and leaving the chatroom
  const joinRef = useRef(false);

  useEffect(() => {
    // 1. Only join if we have the ID and haven't joined this specific ID yet
    if (id && isConnected === true && User && currentRoom && !joinRef.current) {

      const roomInfo = {
        room_id: currentRoom.room_id,
        room_name: currentRoom.chat_rooms.room_name,
        username: User.username,
        user_id: User.id,
      };

      dispatch(joinAChatRoom(roomInfo));

      dispatch(GetChatRoomHistory(id)).unwrap().then((res) => toast.message(res.message)).catch((err: any) => toast.error(err))
      joinRef.current = true; // Block further joins


    }
  }, [id, isConnected, User, currentRoom]);

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
    // setShowDocsPanel(!showDocsPanel);
    dispatch(sendMessage(systemMessage));
  };
  //synthesis room info emittter

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

    dispatch(AskAI(information))
      .unwrap()
      .then((res) => {
        dispatch(
          AddNewMessage({
            message_id: MessageId,
            sent_at: currentTime,
            sent_by: null,
            message: res.answer,
            room_id: currentRoom?.room_id,
            users: { username: "AntiNode" },
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
            users: { username: "AntiNode" },
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
    if (!aiQuery.trim() || isQuerying === true) {
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
      web_search_depth: roomWebSearchDepth
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

    // add the ai mock message to the array of entire chatroom
    dispatch(sendMessage({
      message_id: MessageId,
      sent_by: null,
      message: `ANTINODE will now start thinking about prompt= ${aiQuery}`,
      room_id: currentRoom?.room_id,
      users: { username: "AntiNode" },
      sent_at: currentTime || new Date().toISOString(),
    }))

    // return;
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
            users: { username: "AntiNode" },
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
            users: { username: "AntiNode" },
          })
        );
      })
      .finally(() => {
        setIsQuerying(false);
        setAiQuery("");
      });

  };

  const HandleFetchOlderChats = (event: any) => {
    const container = event.target;
    // const chatContainerRef = useRef(null);
    // 1. Check Condition and Gate
    if (container.scrollTop === 0 && fetchingMoreChats === false) {
      // console.log("Triggering fetch for older chats...");

      // Store the current scroll height BEFORE fetching new content
      const previousScrollHeight = container.scrollHeight;

      const lastMessage = data[0]; //last item
      //the room id and the time of the last message in the array
      const information = {
        room_id: currentRoom?.room_id,
        time_value: lastMessage?.created_at,
        MessageId: lastMessage.message_id,
        index: 1,
      };

      // console.log(information);
      if (!information.time_value) {
        toast.message("Unable to fetch");
        return;
      }
      dispatch(FetchMoreChatsInTheRoom(information))
        .unwrap()
        .then((res) => {
          if (res.message) {
            toast.message(res.message);
          }
        })
        .catch((err) => {
          if (err) {
            toast.error(err);
          }
        });

      // Calculate the height of the newly loaded content
      const newScrollHeight = container.scrollHeight;
      const newContentHeight = newScrollHeight - previousScrollHeight;

      // Set the scroll position below the new content
      container.scrollTop = newContentHeight;
    }
  };



  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden flex justify-between items-center p-4 bg-white dark:bg-neutral-900 shadow-lg">
        <h1 className="text-xl font-bold bai-jamjuree-bold">
          {currentRoom?.chat_rooms.room_name}
        </h1>
        {/* Mobile Room Info Button */}
        <div className="lg:hidden flex items-center justify-between gap-4   ">
          <section className="flex items-center justify-center gap-2">
            <button className='bg-red-500 text-white space-grotesk px-3 py-1 text-xs rounded-sm ' onClick={() => {
              if (!id || !User?.username) {
                toast.info(!id ? "Room id is not valid or is empty" : "Please log in to continue")
                return;
              } dispatch(leaveChatRoom({ room_id: id, username: User?.username }))
              navigate(-1)
            }}>Leave room</button>
            <button
              onClick={() => setShowRoomInfo(!showRoomInfo)}
              className="flex items-center space-x-2 px-3 py-1 bg-black dark:bg-white dark:text-black text-white rounded-full text-sm font-medium border shadow-xl"
            >

              <span> Info</span>
              <FiChevronDown
                className={`transition-transform ${showRoomInfo ? "rotate-180" : ""
                  }`}
              />
            </button>
          </section>

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
                <h3 className="font-semibold">Workspace Information</h3>
                <button
                  onClick={() => setShowRoomInfo(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Workspace Name:</span>
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
                  <div className=" flex overflow-x-auto scrollbar-hide  gap-2">
                    {roomMembers.map((member: any, index: any) => (<>
                      <div
                        key={`${member.user}_at_${index}`}
                        className="flex items-center text-sm"
                      >
                        <div className="w-5 font-bold h-5 rounded-full bg-neutral-950 dark:bg-gray-200  text-white dark:text-black space-grotesk text-xs flex items-center justify-center  mr-2">
                          {member.user.charAt(0)}
                        </div>
                        <span className="flex items-center justify-center gap-3">
                          {member.user}{" "}
                          <ul className=" rounded-full bg-green-600 h-2 w-2"></ul>
                        </span>
                      </div>
                      <div
                        key={`${member.user}_at_${index}`}
                        className="flex items-center text-sm"
                      >
                        <div className="w-5 font-bold h-5 rounded-full bg-neutral-950 dark:bg-gray-200  text-white dark:text-black space-grotesk text-xs flex items-center justify-center  mr-2">
                          {member.user.charAt(0)}
                        </div>
                        <span className="flex items-center justify-center gap-3">
                          {member.user}{" "}
                          <ul className=" rounded-full bg-green-600 h-2 w-2"></ul>
                        </span>
                      </div>
                    </>
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
          <section className="mt-auto w-full flex flex-col gap-1.5 p-3 space-grotesk">
            <button className='bg-red-600 text-white space-grotesk px-3 py-2 text-xs rounded-sm space-grotesk' onClick={() => {
              if (!id || !User?.username) {
                toast.info(!id ? "Room id is not valid or is empty" : "Please log in to continue")
                return;
              } dispatch(leaveChatRoom({ room_id: id, username: User?.username }))
              navigate(-1)
            }}>Leave room</button>
            <div className="text-xs text-gray-600 border-b  dark:text-gray-400 uppercase tracking-wider px-3 mb-2 bai-jamjuree-semibold">
              Modes
            </div>

            {[
              {
                id: 1,
                value: "Web Search",
                description: "Search the internet in real-time",
                icon: <FaInternetExplorer className="text-lg" />,
                mode: "WebSearch",
              },
              {
                id: 2,
                value: "Synthesis",
                description: "Analyze multiple sources together",
                icon: <GiArchiveResearch className="text-lg" />,
                mode: "Synthesis",
              },
              {
                id: 3,
                value: "My Documents",
                description: "Work with your uploaded files",
                icon: <FiFileText className="text-lg" />,
                mode: "Basic",
              },
            ].map((item) => {
              const isActive =
                (item.mode === "WebSearch" && showWebSearchPanel) ||
                (item.mode === "Synthesis" && showDocsPanel && RoomQueryMode === "Synthesis") ||
                (item.mode === "Basic" && showDocsPanel && RoomQueryMode === "Basic");

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 1) {
                      if (chatRoomFile !== null) {
                        dispatch(SetChatRoomFile(null));
                      }
                      setShowWebSearchPanel(!showWebSearchPanel);
                      dispatch(setRoomQueryMode("WebSearch"));
                    } else if (item.id === 2) {
                      if (chatRoomFile !== null) {
                        dispatch(SetChatRoomFile(null));
                      }
                      setShowDocsPanel(!showDocsPanel);
                      dispatch(setRoomQueryMode("Synthesis"));
                    } else if (item.id === 3) {
                      if (chatRoomFile !== null) {
                        dispatch(SetChatRoomFile(null));
                      }
                      setShowDocsPanel(!showDocsPanel);
                      dispatch(setRoomQueryMode("Basic"));
                    }
                  }}
                  className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-md
          transition-all duration-150 text-left group
          ${isActive
                      ? "bg-orange-500 text-white"
                      : "text-gray-700 hover:bg-gray-100 bg-neutral-300"
                    }
        `}
                >
                  <div className={`${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${isActive ? "text-white" : "text-gray-900"}`}>
                      {item.value}
                    </div>
                    <div className={`text-xs truncate ${isActive ? "text-orange-100" : "text-gray-500"}`}>
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
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
          {/* Synthesis mode query panel */}
          <SynthesisPanel
            room_id={id}
            currentTime={currentTime}
            currentRoom={currentRoom}
          />
          {/* Messages Area */}
          <div
            onScroll={(e) => HandleFetchOlderChats(e)}
            className="flex-1 overflow-y-auto max-h-screen px-3 py-4 space-grotesk relative"
          >
            {/* fetching more chats indicator */}
            {fetchingMoreChats === true && (
              <div className="text-sm text-black dark:text-white space-grotesk  mx-auto w-full flex items-center justify-center gap-4  py-2">
                fetching more...
                <ul className="border-t-2 dark:border-white h-5 w-5 border:black rounded-full animate-spin"></ul>
              </div>
            )}
            {/* current first batch chat gettign indicator */}
            {gettinChats === true && data.length === 0 ? (
              <div className="flex h-full">
                <h1 className="bai-jamjuree-regular  text-green-400 m-auto flex items-center justify-center gap-2">
                  Fething workspace history....
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-green-500 rounded-sm" // Sharp corners (sm) and tech green
                      animate={{
                        height: ["16px", "26px", "16px"], // Grow and shrink
                        opacity: [0.5, 1, 0.5], // Pulse opacity
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </h1>
              </div>
            ) : (
              data.map((message: any, index: any) => (
                <>
                  {message.sent_by === null && (
                    <DocUsed
                      chat={message}
                      docused={docused}
                      setShowDocUsed={setShowDocUsed}
                    />
                  )}
                  {web_search_status?.length > 0 && web_search_status?.some((e) => e.MessageId === message.message_id) && <WebSearchStatus chat={message} lastMessageId={message.message_id} />}
                  <motion.div
                    key={`${message.room_id}_${message.sent_by}_${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-4  flex bai-jamjuree-regular ${message.sent_by === User?.id
                      ? "justify-end" // User's messages on right
                      : message.sent_by === null
                        ? "justify-center " // AntiNode messages centered
                        : "justify-start" // Other users on left
                      }`}
                  >
                    <div
                      className={`${message.sent_by === User?.id
                        ? "border bg-black text-white dark:bg-white dark:text-black rounded-lg rounded-br-none max-w-4/5"
                        : message.sent_by === null
                          ? "bg-white text-black dark:bg-neutral-950 dark:text-white border w-full rounded-lg"
                          : "border bg-gray-300 dark:bg-neutral-900  dark:text-white  text-black rounded-lg rounded-bl-none max-w-4/5"
                        } p-3 `}
                    >
                      {/* username with timestamp */}
                      <div className=" border-b border-gray-500/40 flex items-center justify-between mb-1 gap-4 pb-1">
                        <p
                          className={`bai-jamjuree-bold text-xs  ${message.sent_by === User?.id
                            ? "text-white dark:text-black"
                            : message.sent_by === null
                              ? "text-black dark:text-white"
                              : "text-black dark:text-white"
                            }`}
                        >
                          {message.sent_by === User?.id
                            ? "You"
                            : message.users?.username || "• AntiNode"}
                          {/* {message.sent_by === null && " • AntiNode"} */}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-700 ">
                          {message?.sent_at &&
                            `at ${message.sent_at.split("|")[0]}`}
                        </p>
                      </div>

                      <Streamdown className="space-grotesk">{message.message}</Streamdown>
                    </div>
                  </motion.div>
                  {message === data[data.length - 1] &&
                    whoistyping !== "" && User?.username && !whoistyping.includes(User?.username) &&
                    < TypingIndicator />}
                </>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 dark:border-gray-700  bai-jamjuree-regular">
            {/* <div className=" w-ful bg-red-600 py-4 px-2"> */}
            <div className="flex items-center justify-center gap-2  px-2 py-3 ">
              {/* Features selector next to the input section */}

              <section className=' flex items-center justify-center gap-2 p-2 rounded-md bg-neutral-200 dark:bg-neutral-900 md:hidden'>
                <SynthesisMode
                  currentTime={currentTime}
                  currentRoom={currentRoom}
                  setShowDocsPanel={setShowDocsPanel}
                  showDocsPanel={showDocsPanel}
                />

                <button
                  onClick={() => {
                    if (chatRoomFile !== null) {
                      dispatch(SetChatRoomFile(null));
                    }
                    setShowWebSearchPanel(!showWebSearchPanel);
                    dispatch(setRoomQueryMode("WebSearch"));
                  }}
                  className="bg-black text-white dark:bg-white dark:text-black rounded-full p-1.5 group relative"
                >
                  <label
                    className="group-hover:block hidden  bg-gray-800 text-gray-50 dark:bg-gray-100 dark:text-gray-800 py-1 px-2 rounded-sm absolute bottom-9 left-5 text-xs space-grotesk font-semibold"
                    htmlFor="mode"
                  >
                    Web Search
                  </label>
                  <FaInternetExplorer />
                </button>
                <button
                  onClick={() => {
                    setShowDocsPanel(!showDocsPanel);
                    dispatch(setRoomQueryMode("Basic"));
                  }}
                  className="bg-black text-white dark:bg-white dark:text-black rounded-full p-1.5 group relative"
                >
                  <label
                    className="group-hover:block hidden  bg-gray-800 text-gray-50 dark:bg-gray-100 dark:text-gray-800 py-1 px-2 rounded-sm absolute bottom-9 left-5 text-xs space-grotesk font-semibold"
                    htmlFor="mode"
                  >
                    My Cloud
                  </label>
                  <FiPaperclip />
                </button>
              </section>

              <input
                onFocus={() => dispatch(whoIsTyping(""))}
                type="text"
                value={newMessage}
                disabled={gettinChats === true}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                }}
                onKeyUp={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message here.."
                className="flex-1  rounded-sm px-4 py-2 focus:outline-none focus:ring-0 ring-0 dark:bg-neutral-800 bg-neutral-200 space-grotesk"
              />
              <button
                disabled={isQuerying === true}
                onClick={handleSendMessage}
                className="bg-neutral-800 text-white dark:bg-neutral-300 dark:text-black px-4 py-2 rounded-r-lg transition-colors"
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
  );
};

export default ChatRoom;

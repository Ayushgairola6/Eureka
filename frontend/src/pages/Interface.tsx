import { useState, lazy, useRef, useEffect } from "react";
import { Streamdown } from "streamdown";
import { Toaster, toast } from "sonner";
import { GoZap } from "react-icons/go";
// import { MdSend } from "react-icons/md";

const PrivateDocuments = lazy(
  () => import("@/components/PrivateDocuments.tsx")
);
import WebSearch from "@/components/webSearch.tsx";
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;

const ResponseFeedback = lazy(
  () => import("@/components/ResponseFeedback.tsx")
);
const QueryType = lazy(() => import("@/components/Query_type.tsx"));
import { motion } from "framer-motion";
import { IoOptions } from "react-icons/io5";
import { IoDocument } from "react-icons/io5";
import { BiCopy, BiHourglass } from "react-icons/bi";
import { BsStars } from "react-icons/bs";
import { useAppSelector, useAppDispatch } from "../store/hooks.tsx";
import {
  UpdateChats,
  setShowDocs,
  setShowOptions,
  setShowType,
  UploadDocuments,
  QueryPrivateDocuments,
  setQuestion,
  QueryAIQuestions,
  WebSearchHandler,
  MimicSSE,
  setQueryType,
  setSelectedDoc,
  setShowUserForm,
  setLoading,
} from "../store/InterfaceSlice.ts";
import { v4 as uuid } from "uuid";
import axios from "axios";
import UserForm from "@/components/ui/userDetail.tsx";
import { FaFileUpload } from "react-icons/fa";
const PublicQueryOptions = lazy(
  () => import("@/components/PublicQueryOptions.tsx")
);
// import { HandleSSEConnection } from "../store/SSEHandler.tsx";
function Interface() {
  const dispatch = useAppDispatch();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [ReceivedResponseId, setReceivedRsponseId] = useState<any>([]);
  const loggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const { user } = useAppSelector((state) => state.auth);
  const {
    question,
    loading,
    category,
    showDocs,
    showType,
    shwoOptions,
    visibility,
    subCategory,
    queryType,
    favicon,
    Chats,
    selectedDoc,
    shhowUserForm,
  } = useAppSelector((state) => state.interface);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  useEffect(() => {
    adjustTextareaHeight();
  }, [question]);
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

  // parial messages sent by sse

  // uploading a document
  const handleUpload = async (UserData: FormData) => {
    try {
      if (
        !selectedFile ||
        category === " " ||
        !UserData ||
        !visibility ||
        !subCategory
      ) {
        toast.error(
          !selectedFile
            ? "❌ Please select a file first."
            : "❌ Please select a category first."
        );
        return;
      }

      if (loggedIn === false) {
        toast.message(
          "We currently only allow verified users to contribute !Please Login to continue ."
        );
        return;
      }

      toast.info(
        visibility === "Public"
          ? "Thanks for your contribution ."
          : "This document will be only accessible to you ."
      );

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("category", category);
      formData.append("visibility", visibility);
      formData.append("subCategory", subCategory);
      formData.append("feedback", UserData.get("feedback") as string);

      dispatch(UploadDocuments(formData))
        .unwrap()
        .then((res: any) => {
          if (res.message) {
            toast.message(res.message);
          }
        })
        .catch((err) => toast.error(err.message));
    } catch (err) {
      console.error(err);
    }
  };

  // Ask for a new SSEToken;
  const GetSSEToken = async () => {
    try {
      const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");

      const response = await axios.get(`${BaseApiUrl}/api/new-sseToken`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${AuthToken}`,
        },
      });
      if (response.data.token) {
        return response.data.token;
      }
    } catch (err: any) {
      console.log(err);
      toast.error(err.response.data.message || "Something went wrong");
    }
  };
  // web search
  const SearchWeb = async () => {
    try {
      if (!question) {
        toast.error("Please type a message first");
        return;
      }
      const SseToken = await GetSSEToken();
      if (!SseToken) {
        toast.error("Please try again !");
        return;
      }
      const user_id = uuid();
      const AiId = uuid();

      // Insert user message
      dispatch(
        UpdateChats({
          id: user_id,
          sent_at: currentTime,
          sent_by: "You",
          message: {
            isComplete: true,
            content: question,
          },
        })
      );

      // Insert empty AI message
      dispatch(
        UpdateChats({
          id: AiId,
          sent_at: currentTime,
          sent_by: "Eureka",
          message: {
            isComplete: false,
            content: "",
          },
        })
      );

      // const Url = `${BaseApiUrl}/api/user/web-search?question=${question}&AccessToken=${SseToken}`;
      // const SSe = HandleSSEConnection(Url, AiId, dispatch);
      // return SSe;
      dispatch(WebSearchHandler(question))
        .unwrap()
        .then((res) => {
          if (res.message) {
            dispatch(MimicSSE({ id: AiId, delta: res.Answer }));
          }
        })
        .catch(() => {
          dispatch(MimicSSE({ id: AiId, delta: "Server busy" }));

          toast.error("Server busy");
        });
      dispatch(setQuestion(""));
    } catch (err: any) {
      toast.error(err.response.data.message);
    }
  };

  // Asking question from the AI for public docs
  const handleAsk = async () => {
    try {
      // if the dropdown menu is visible
      if (shwoOptions === true) {
        dispatch(setShowOptions(false));
      }
      // if the doc is selected then the query is going to be not web search
      if (selectedDoc && selectedDoc !== "" && queryType !== "Web Search") {
        await QueryPrivateDocument();
        return;
      }
      // if private doc is not selected and query type web search is chosen
      else if (!selectedDoc && queryType === "Web Search") {
        await SearchWeb();
        return;
      }

      if (!question.trim() || !category || category === "") {
        toast.message(
          !question
            ? "❌ Please enter a question."
            : "❌ Please choose a category!"
        );
        return;
      }

      // get a session only token
      // const SseToken = await GetSSEToken();
      // if (!SseToken) {
      //   toast.error("Something went wrong");
      //   return;
      // }
      const user_id = uuid();
      const AiId = uuid();

      // // Insert user message
      dispatch(
        UpdateChats({
          id: user_id,
          sent_at: currentTime,
          sent_by: "You",
          message: {
            isComplete: true,
            content: question,
          },
        })
      );

      // Insert empty AI message
      dispatch(
        UpdateChats({
          id: AiId,
          sent_at: currentTime,
          sent_by: "Eureka",
          message: {
            isComplete: false,
            content: "",
          },
        })
      );

      // const Url = `${BaseApiUrl}/api/ask-pdf?question=${encodeURIComponent(
      //   question
      // )}&AccessToken=${SseToken}&subCategory=${encodeURIComponent(
      //   subCategory
      // )}&category=${encodeURIComponent(category)}`;

      // const SSe = HandleSSEConnection(Url, AiId, dispatch);
      // return SSe;
      const data = {
        question: question,
        category: category,
        subCategory: subCategory,
      };
      // get answers
      dispatch(QueryAIQuestions(data))
        .unwrap()
        .then((res) => {
          if (res.message) {
            dispatch(MimicSSE({ id: AiId, delta: res.answer }));
          }
        })
        .catch(() => {
          dispatch(setLoading(false));
          dispatch(MimicSSE({ id: AiId, delta: "Server busy" }));

          toast.error("Server busy");
        });
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  // query only private documents
  const QueryPrivateDocument = async () => {
    try {
      if (!question) {
        toast.info("Question cannot be empty !");
        return;
      }
      if (!selectedDoc) {
        toast.info("Please select a document before querying");
        return;
      }
      if (!queryType) {
        toast.info("Please select a query type");
        return;
      }
      // get a session only token
      // const SseToken = await GetSSEToken();
      // if (!SseToken) {
      //   toast.error("Something went wrong");
      //   return;
      // }
      const user_id = uuid();
      const AiId = uuid();

      // Insert user message
      dispatch(
        UpdateChats({
          id: user_id,
          sent_at: currentTime,
          sent_by: "You",
          message: {
            isComplete: true,
            content: question,
          },
        })
      );

      // Insert empty AI message
      dispatch(
        UpdateChats({
          id: AiId,
          sent_at: currentTime,
          sent_by: "Eureka",
          message: {
            isComplete: false,
            content: "",
          },
        })
      );

      // const Url = `${BaseApiUrl}/api/privateDocs/ask?question=${encodeURIComponent(
      //   question
      // )}&AccessToken=${SseToken}&docId=${encodeURIComponent(
      //   selectedDoc
      // )}&query_type=${encodeURIComponent(queryType)}`;
      // const SSe = HandleSSEConnection(Url, AiId, dispatch);
      // return SSe;
      const data = {
        docId: selectedDoc,
        question,
        query_type: queryType,
      };
      if (!data.docId || !data.question || !data.query_type) {
        toast.error(`Some fields are missing`);
        return;
      }
      dispatch(QueryPrivateDocuments(data))
        .unwrap()
        .then((res) => {
          if (res.message) {
            console.log(res);
            dispatch(MimicSSE({ id: AiId, delta: res.Answer }));
          }
        })
        .catch(() => {
          dispatch(MimicSSE({ id: AiId, delta: "Server busy" }));

          toast.error("Server busy");
        });
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  // auto scroll container
  const chatcontainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatcontainer.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatcontainer, Chats]);

  return (
    <>
      <div
        className={`w-full  flex items-center justify-center flex-col h-screen dark:bg-black  relative p-4 z-[1]`}
      >
        {/* gradient background for light thtme */}
        <div className="z-[-2] absolute top-0 left-0 h-full w-full bg-gradient-to-br from-orange-600/30 to-red-600/30 blur-3xl  dark:from-white/10 dark:to-black"></div>
        {/* the options section */}

        <div
          className={`${
            Chats.length > 0 ? "" : ""
          } max-h-4/5 p-4 overflow-auto w-full md:w-4/5 lg:w-3/4`}
        >
          {Chats.length > 0 ? (
            Chats.map((chat, index) => {
              return (
                <div key={`chat-${index}-${chat.sent_by}`} className={` mb-3 `}>
                  {/* Chat Bubble Container */}
                  <div className="space-y-8 ">
                    {favicon.length > 0 &&
                      chat.id === Chats[Chats.length - 1].id &&
                      chat.sent_by === "Eureka" && (
                        <>
                          <ul className="bai-jamjuree-semibold text-sm">
                            Source{" "}
                          </ul>
                          <span className="flex items-center justify-start gap-1">
                            {favicon.map((im: any, index) => {
                              return (
                                <img
                                  className="h-8 w-8 rounded-full"
                                  key={index}
                                  src={im}
                                  alt="/source.png"
                                />
                              );
                            })}
                          </span>
                        </>
                      )}
                    {/* Chat Bubble */}
                    {chat.sent_by === "Eureka" &&
                    chat.message.content === "" &&
                    chat.id === Chats[Chats.length - 1].id ? (
                      <ul className="bai-jamjuree-semibold text-lg animate-pulse my-8">
                        "Thinking...
                      </ul>
                    ) : (
                      <div
                        className={`px-4 py-2 rounded-2xl w-fit transition-all duration-200 ${
                          chat.sent_by === "You"
                            ? "dark:bg-white/20 dark:text-white bg-gray-100 text-black rounded-br-none shado justify-self-end "
                            : "bg-gray-200 dark:bg-white/5 text-gray-800 dark:text-white rounded-bl-none  justify-self-auto w-full"
                        }`}
                      >
                        {chat.sent_by !== "You" && (
                          <button
                            onClick={() => {
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(
                                  chat.message.content
                                );
                                toast.info("Copied to clipboard");
                                return;
                              }
                            }}
                          >
                            <BiCopy />
                          </button>
                        )}
                        <Streamdown>{chat.message.content}</Streamdown>

                        {/* Timestamp */}
                        {chat.sent_at && (
                          <span
                            className={`text-xs  block mt-1 ${
                              chat.sent_by === "You"
                                ? "justify-self-end dark:text-white text-gray-400"
                                : "justify-self-start text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {chat.sent_at}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Feedback for AI responses - positioned below the bubble */}

                    {chat.id === Chats[Chats.length - 1].id &&
                    chat.message.content !== "" &&
                    !ReceivedResponseId.includes(chat.id) ? (
                      <div className="mt-2">
                        <ResponseFeedback
                          setReceivedRsponseId={setReceivedRsponseId}
                          chat={chat}
                        />
                      </div>
                    ) : null}
                    {Chats.length > 0 && (
                      <div ref={chatcontainer} className="h-0" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center w-full py-8">
              <h1 className="text-2xl bai-jamjuree-bold">
                Welcome,{" "}
                {user?.username
                  ? user?.username.split(" ")[0].toLocaleUpperCase()
                  : "Beautiful person"}{" "}
              </h1>
              <span className="text-sm dark:text-gray-400 text-gray-700 space-grotesk">
                Choose a category and start asking
              </span>
            </div>
          )}
        </div>
        {/* chattting seciton */}

        <motion.section
          className={` transition-all duration-300 w-full md:w-4/5 lg:w-3/4 bottom-0 left-0 p-3 gap-2 dark:bg-white/10 bg-gray-50 border dark:text-white text-black bai-jamjuree-regular text-md rounded-tr-lg rounded-tl-lg`}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* input section */}
          <textarea
            value={question}
            onChange={(e) => {
              dispatch(setQuestion(e.target.value));
            }}
            ref={textareaRef}
            rows={2}
            name="input"
            placeholder="Your question"
            className="w-full rounded-lg px-2 py-3 focus:border-none active:border-none transition-all duration-200 resize-none focus:bg-white focus:dark:bg-gray-800 focus:shadow-lg"
          />
          {/* the other options section */}
          <div className="flex items-center justify-between ">
            <section className="flex items-center justify-center gap-2">
              {/* show options icon */}
              <PrivateDocuments
                selectedDoc={selectedDoc}
                setSelectedDoc={setSelectedDoc}
              />

              <section className="relative">
                <ul
                  onClick={() => {
                    if (selectedDoc) dispatch(setSelectedDoc(""));
                    dispatch(setShowOptions(!shwoOptions));
                    dispatch(setQueryType(""));
                  }}
                  className={` cursor-pointer  ${
                    shwoOptions
                      ? "bg-green-300  text-black"
                      : "dark:bg-gray-600  bg-gray-200"
                  } rounded-full p-1  h-auto `}
                >
                  <IoOptions size={18} />
                </ul>
                <PublicQueryOptions />
              </section>

              {/* query type for personal documents */}
              {selectedDoc && (
                <ul
                  onClick={() => dispatch(setShowType(!showType))}
                  className={`  cursor-pointer ${
                    selectedDoc ? "bg-indigo-600" : "bg-gray-200"
                  } rounded-full p-1  h-auto relative`}
                >
                  <GoZap size={18} />
                  <QueryType />
                </ul>
              )}

              <WebSearch
                selectedDoc={selectedDoc}
                setSelectedDoc={setSelectedDoc}
              />
              <ul
                onClick={() => {
                  dispatch(setShowUserForm(!shhowUserForm));
                  console.log(shhowUserForm);
                }}
                className="cursor-pointer dark:bg-white/10 bg-black/10 rounded-full p-2  h-auto relative"
              >
                <FaFileUpload />
              </ul>
            </section>

            {/* private documents of the user */}

            <ul
              className={`space-groesk font-semibold text-sm flex items-center justify-end gap-2 CustPoint dark:text-gray-200 text-black`}
              onClick={() => {
                dispatch(setShowDocs(!showDocs));
                dispatch(setShowOptions(!shwoOptions));
              }}
            >
              {(() => {
                if (!selectedDoc) return "PrivateDocs";

                // Find document name from user contributions
                const foundDoc = user?.Contributions_user_id_fkey?.find(
                  (contribution) => contribution.document_id === selectedDoc
                );

                return foundDoc?.feedback || "PrivateDocs";
              })()}
              <IoDocument />
            </ul>
          </div>
          {/* query type and send button container */}
          <div className="flex items-center justify-between my-3">
            <ul className="  bai-jamjuree-regular text-sm text-teal-500 ">
              {queryType ? queryType : null}
            </ul>
            {/* query send button at bottom right */}
            <motion.button
              disabled={!question || loading === true}
              whileTap={{ scale: 1.03 }}
              whileHover={{ scaleX: 1.05 }}
              transition={{ duration: 0.3, ease: "circIn" }}
              onClick={handleAsk}
              className={`cursor-pointer ${
                loading === true
                  ? "bg-green-600 text-white animate-pulse "
                  : ` ${
                      question === ""
                        ? "dark:bg-gray-600 bg-gray-400"
                        : "bg-black dark:bg-gray-100"
                    }   dark:text-black`
              } text-white  p-2  rounded-full space-grotesk   text-sm flex items-center justify-center gap-2  `}
            >
              {loading === false ? (
                <>
                  <BsStars size={18} />
                </>
              ) : (
                <>
                  <BiHourglass className="animate-spin" size={18} />
                </>
              )}
            </motion.button>
          </div>
        </motion.section>
        <Toaster />
      </div>
      <UserForm
        setSelectedFile={setSelectedFile}
        selectedFile={selectedFile}
        handleUpload={handleUpload}
      />
    </>
  );
}

export default Interface;

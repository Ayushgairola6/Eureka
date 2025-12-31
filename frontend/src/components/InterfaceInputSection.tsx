import type React from "react";
import { motion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "../store/hooks.tsx";
// import WebSearch from "./webSearch.tsx";
import QueryType from "./Query_type.tsx";
import { v4 as uuid } from "uuid";
// import axios from "axios";
import { IoOptions } from "react-icons/io5";
import { IoDocument } from "react-icons/io5";
import { BiHourglass, BiSend, BiUpload } from "react-icons/bi";
import { BsMic, BsPlusLg } from "react-icons/bs";
import { GoZap } from "react-icons/go";
import {
  UpdateChats,
  setShowDocs,
  setShowOptions,
  setShowType,
  QueryPrivateDocuments,
  setQuestion,
  QueryAIQuestions,
  WebSearchHandler,
  MimicSSE,
  setQueryType,
  setSelectedDoc,
  setShowUserForm,
  setLoading,
  updateFavicon,
  ProcessSynthesis,
} from "../store/InterfaceSlice.ts";
// const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { SetQueryCount } from "../store/AuthSlice.ts";
import AccessBar from "@/components/AccessBar.tsx";
import { useState } from "react";
import { setCurrentStatus, setWebStatus } from "../store/websockteSlice.ts";
type InputProps = {
  textareaRef: React.Ref<HTMLInputElement>;
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
};
const InputSection: React.FC<InputProps> = ({
  textareaRef,
  isActive,
  setIsActive,
}) => {
  const dispatch = useAppDispatch();
  const {
    question,
    loading,
    category,
    showDocs,
    showType,
    shwoOptions,
    subCategory,
    queryType,
    selectedDoc,
    shhowUserForm,
    SynthesisDocuments,
  } = useAppSelector((state) => state.interface);
  // const { setCurrentStatus } = useAppSelector((state) => state.socket);
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAppSelector((state) => state.auth);
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
  const [Showfeatures, SetShowFeatures] = useState(false);

  // getting sse token before sending a request
  // const GetSSEToken = async () => {
  //   try {
  //     const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");

  //     const response = await axios.get(`${BaseApiUrl}/api/new-sseToken`, {
  //       withCredentials: true,
  //       headers: {
  //         Authorization: `Bearer ${AuthToken}`,
  //       },
  //     });
  //     if (response.data.token) {
  //       return response.data.token;
  //     }
  //   } catch (err: any) {
  //     console.log(err);
  //     toast.error(err.response.data.message || "Something went wrong");
  //   }
  // };
  // private documents querying

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
      if (queryType === "Summary" && user?.IsPremiumUser === false) {
        toast.info("Get our premium membership to access this feature.");
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
          sent_by: "AntiNode",
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
        MessageId: AiId,
        userMessageId: user_id,
      };
      if (!data.docId || !data.question || !data.query_type) {
        toast.error(`Some fields are missing`);
        return;
      }
      dispatch(QueryPrivateDocuments(data))
        .unwrap()
        .then((res) => {
          if (res.message) {
            dispatch(MimicSSE({ id: AiId, delta: res.Answer }));
            dispatch(SetQueryCount());
          }
        })
        .catch(() => {
          dispatch(MimicSSE({ id: AiId, delta: "Server busy" }));

          toast.error("Server busy");
        })
        .finally(() => setIsActive(false));
    } catch (err) {
      toast.error("Something went wrong");
    }
  };
  //web search handler
  const SearchWeb = async () => {
    try {
      if (!question || question === "") {
        toast.error("Please type a message first");
        return;
      }
      // const SseToken = await GetSSEToken();
      // if (!SseToken) {
      //   toast.error("Please try again !");
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
          sent_by: "AntiNode",
          message: {
            isComplete: false,
            content: "",
          },
        })
      );

      // const Url = `${BaseApiUrl}/api/user/web-search?question=${question}&AccessToken=${SseToken}`;
      // const SSe = HandleSSEConnection(Url, AiId, dispatch);
      // return SSe;
      dispatch(
        WebSearchHandler({ question, MessageId: AiId, userMessageId: user_id })
      )
        .unwrap()
        .then((res) => {
          if (res.message === "Results found") {
            dispatch(MimicSSE({ id: AiId, delta: res.Answer }));
            dispatch(updateFavicon(res.favicon));
            dispatch(SetQueryCount());
          }
        })
        .catch((err) => {
          dispatch(
            MimicSSE({
              id: AiId,
              delta:
                err ||
                "It seems like there are many people using our service right now, I would like to apologize for the inconvenience.",
            })
          );
        })
        .finally(() => {
          setIsActive(false);
          dispatch(setWebStatus([]));
        });
      dispatch(setQuestion(""));
    } catch (err: any) {
      toast.error(err.response.data.message);
    }
  };

  const PerformSynthesis = async () => {
    if (!question || typeof question !== "string") {
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
        sent_by: "AntiNode",
        message: {
          isComplete: false,
          content: "",
        },
      })
    );

    // dispatch the main function
    dispatch(
      ProcessSynthesis({
        question: question,
        MessageId: AiId,
        userMessageId: user_id,
        selectedDocuments: SynthesisDocuments,
      })
    )
      .unwrap()
      .then((res) => {
        if (res.message === "Response generated") {
          // console.log(res.Answer);
          dispatch(MimicSSE({ id: AiId, delta: res.Answer }));
          dispatch(setCurrentStatus("Analyzing.."));
          if (res.favicon) {
            dispatch(updateFavicon(res.favicon));
          }

          dispatch(SetQueryCount());
        }
      })
      .catch(() => {
        dispatch(
          MimicSSE({
            id: AiId,
            delta:
              "It seems like there are many people using our service right now, I would like to apologize for the inconvenience.",
          })
        );
      })
      .finally(() => setIsActive(false));
  };
  // centeral function that manages when to call which function
  const handleAsk = async () => {
    try {
      if (isLoggedIn === false) {
        navigate("/Login");
        return;
      }
      if (loading === true) {
        return;
      }
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
      } else if (queryType === "Synthesis" && !selectedDoc) {
        await PerformSynthesis();
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
          sent_by: "AntiNode",
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
        MessageId: AiId,
        userMessageId: user_id,
      };
      // get answers
      dispatch(QueryAIQuestions(data))
        .unwrap()
        .then((res) => {
          if (res.message) {
            dispatch(MimicSSE({ id: AiId, delta: res.answer }));
            dispatch(SetQueryCount());
          }
        })
        .catch((err) => {
          dispatch(
            MimicSSE({
              id: AiId,
              delta: "We are experiencing heavy traffic right now.",
            })
          );

          toast.error(err || "Server busy");
        })
        .finally(() => {
          setIsActive(false);
          dispatch(setLoading(false));
        });
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      {/* input section body */}
      <motion.section
        initial={false}
        animate={{
          height: isActive ? "auto" : 64,
        }}
        transition={{
          ease: "linear",
          duration: 0.4,
        }}
        className={`relative overflow-y-visible w-full px-3 py-2 gap-2 dark:bg-[rgb(27,26,26)] bg-gray-50 border border-black/20 dark:border-white/10 bai-jamjuree-regular text-md rounded-tr-lg rounded-tl-lg z-[3] transition-all duration-150 ease-linear shadow-2xl `}
      >
        {/* input section */}
        <div className="w-full flex items-center justify-between ">
          <input
            value={question}
            onFocus={() => {
              dispatch(setShowOptions(false));
              SetShowFeatures(false);
              setIsActive(true);
            }}
            onChange={(e) => {
              dispatch(setQuestion(e.target.value));
            }}
            onKeyUp={(e) => e.key === "Enter" && handleAsk()}
            ref={textareaRef}
            name="input"
            placeholder="What would you like to research today ... ?"
            className="w-full dark:text-white text-black rounded-lg px-2 py-3 focus:ring-0 ring-0 transition-all duration-200 outline-0 "
          />
          {/* send button */}

          <motion.button
            disabled={!question || loading === true}
            whileTap={{ scale: 1.03 }}
            whileHover={{ scaleX: 1.05 }}
            transition={{ duration: 0.3, ease: "circIn" }}
            onClick={handleAsk}
            className={` top-5 right-4 cursor-pointer ${
              loading === true
                ? "bg-cyan-600  animate-pulse "
                : "bg-black dark:bg-gray-100"
            }
                     
              text-white dark:text-black  p-1  rounded-full space-grotesk   text-sm flex items-center justify-center gap-2  `}
          >
            {loading === false ? (
              <>
                {question === "" ? <BsMic size={18} /> : <BiSend size={18} />}
              </>
            ) : (
              <>
                <BiHourglass className="animate-spin" size={18} />
              </>
            )}
          </motion.button>
        </div>

        {/* the other options section */}
        <div
          className={`${
            isActive === true ? "flex" : "hidden"
          } items-center justify-between `}
        >
          <section className="flex items-center justify-center gap-2 my-2">
            {/* show options icon */}

            <section className="relative group">
              <ul className="dark:bg-white dark:text-black bg-black text-white space-grotesk font-semibold text-xs rounded-sm p-1 absolute group-hover:block hidden bottom-10 w-auto">
                Domains
              </ul>
              <button
                onClick={() => {
                  if (selectedDoc) dispatch(setSelectedDoc(""));
                  dispatch(setShowOptions(!shwoOptions));
                  SetShowFeatures(false);

                  dispatch(setQueryType(""));
                }}
                className={` cursor-pointer  ${
                  shwoOptions === true
                    ? "bg-green-600  text-white"
                    : "dark:bg-white bg-black dark:text-black text-white"
                } rounded-full p-1  h-auto `}
              >
                <IoOptions size={18} />
              </button>
            </section>

            {/* query type for personal documents */}
            {selectedDoc && (
              <ul
                onClick={() => dispatch(setShowType(!showType))}
                className={`  cursor-pointer ${
                  selectedDoc
                    ? "dark:bg-white bg-black dark:text-black text-white"
                    : "bg-gray-200"
                } rounded-full p-1  h-auto relative`}
              >
                <GoZap size={18} />
                <QueryType />
              </ul>
            )}

            <div className="relative group">
              <AccessBar
                Showfeatures={Showfeatures}
                SetShowFeatures={SetShowFeatures}
              />
              <button
                onClick={() => SetShowFeatures(!Showfeatures)}
                className="cursor-pointer dark:bg-white bg-black dark:text-black text-white rounded-full p-1  h-auto  "
              >
                <BsPlusLg size={18} />
              </button>

              <ul className="dark:bg-white dark:text-black bg-black text-white space-grotesk font-semibold text-xs rounded-sm p-1 absolute group-hover:block hidden bottom-10 w-fit">
                Features
              </ul>
            </div>

            <ul
              onClick={() => {
                dispatch(setShowUserForm(!shhowUserForm));
              }}
              className="cursor-pointer dark:bg-white bg-black dark:text-black text-white rounded-full p-1  h-auto relative group"
            >
              <ul className="dark:bg-white dark:text-black bg-black text-white space-grotesk font-semibold text-xs rounded-sm p-1 absolute group-hover:block hidden bottom-10 w-auto">
                Upload
              </ul>
              <BiUpload size={18} />
            </ul>
          </section>

          {/* private documents of the user */}

          <div
            role="button"
            className="flex-wrap space-grotesk font-normal text-xs  flex items-center gap-1  dark:text-gray-200 text-black justify-end"
            onClick={() => {
              dispatch(setShowDocs(!showDocs));
              dispatch(setShowOptions(false));
            }}
          >
            <span className="flex-1 min-w-0 line-clamp-1 text-center  flex-wrap">
              {(() => {
                if (!selectedDoc) return "MyDocs";

                // Find document name from user contributions
                const foundDoc = user?.Contributions_user_id_fkey?.find(
                  (contribution: any) =>
                    contribution.document_id === selectedDoc
                );

                return foundDoc?.feedback || "MyDocs";
              })()}

              {/* {selectedDoc ? (foundDoc?.feedback ?? "MyDocs") : "MyDocs"} */}
            </span>

            <IoDocument className="flex-none ml-1" />
          </div>
        </div>
        {/* query type and send button container */}
        <div className="flex items-center justify-between mt-1">
          <ul className="  bai-jamjuree-semibold text-sm text-gray-500 dark:text-gray-400 ">
            {queryType ? (
              <>Process - {queryType}</>
            ) : category ? (
              <>Category - {category}</>
            ) : null}
          </ul>
          {/* query send button at bottom right */}
        </div>
      </motion.section>
    </>
  );
};

export default InputSection;

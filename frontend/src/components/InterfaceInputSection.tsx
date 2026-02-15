import React from "react";
import { motion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "../store/hooks.tsx";
// import WebSearch from "./webSearch.tsx";
import QueryType from "./Query_type.tsx";
import { v4 as uuid } from "uuid";
// import axios from "axios";
import { IoOptions } from "react-icons/io5";
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
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { SetQueryCount, setVariant } from "../store/AuthSlice.ts";
import AccessBar from "@/components/AccessBar.tsx";
import { useState } from "react";
import { setCurrentStatus } from "../store/websockteSlice.ts";
import { currentTime } from "../../utlis/Date.ts";
import { Cloud } from "lucide-react";
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
    SynthesisDocuments, search_depth
  } = useAppSelector((state) => state.interface);
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAppSelector((state) => state.auth);

  const [Showfeatures, SetShowFeatures] = useState(false);


  // handles user message Insert with placeholder message insert
  function handleUUidCreationAndMessageInsert() {
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

    return { AiId, user_id }
  }

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

      const { AiId, user_id } = handleUUidCreationAndMessageInsert()
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
        .catch((err) => {
          dispatch(MimicSSE({ id: AiId, delta: err }));

          toast.error(err);
        })
        .finally(() => setIsActive(false));
    } catch (err) {
      toast.error("Something went wrong");
    }
  };
  //web search handler
  const SearchWeb = async () => {
    try {
      const search_depths = ['surface_web', 'deep_web']
      if (!question || question === "") {
        toast.error("Please type a message first");
        return;
      }
      if (!queryType || queryType !== 'Web Search') {
        toast.message("Invalid mode")
        return;
      }
      if (!search_depth || search_depth === '' || !search_depths.includes(search_depth)) {
        toast.message("Invalid search-depth")
        return
      }


      const { AiId, user_id } = handleUUidCreationAndMessageInsert()

      dispatch(
        WebSearchHandler({ question, MessageId: AiId, userMessageId: user_id, web_search_depth: search_depth })
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
                err
            })
          );
          setIsActive(false);

        })
        .finally(() => {
          setIsActive(false);
          dispatch(setQuestion(""));

        });
    } catch (err: any) {
    }
  };

  const PerformSynthesis = async () => {
    if (!question || typeof question !== "string") {
      return;
    }
    const { AiId, user_id } = handleUUidCreationAndMessageInsert()


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
      .catch((err) => {
        dispatch(
          MimicSSE({
            id: AiId,
            delta:
              err
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

      const { AiId, user_id } = handleUUidCreationAndMessageInsert()
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
              delta: err
            })
          );

          toast.error(err || "Server busy");
        })
        .finally(() => {
          setIsActive(false);
          dispatch(setLoading(false));
        });
    } catch (_err) {
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
          duration: 0.3,
          ease: "linear",
        }}
        className="relative overflow-visible w-full px-4 py-3 dark:bg-neutral-950 bg-white border border-gray-200 dark:border-neutral-800 bai-jamjuree-regular rounded-xl z-[3] shadow-lg"
      >
        {/* Input section */}
        <div className="w-full flex items-center gap-3">
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
            className="flex-1 dark:text-white text-neutral-900 bg-transparent rounded-lg px-2 py-3 focus:outline-none placeholder:text-gray-600 dark:placeholder:text-gray-400"
          />

          {/* Send button */}
          <button
            disabled={!question || loading === true}
            onClick={handleAsk}
            className={`shrink-0 p-2 rounded-lg transition-colors duration-150
              ${loading ? "bg-green-400 " : "bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-gray-200"}
              text-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading === false ? (
              question === "" ? <BsMic size={18} /> : <BiSend size={18} />
            ) : (
              <BiHourglass className="animate-spin" size={18} />
            )}
          </button>
        </div>

        {/* Options section */}
        {isActive && (
          < div className="flex  items-start sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-gray-200 dark:border-neutral-800">
            {/* Action buttons */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {/* Domains button */}
              <button
                onClick={() => {
                  if (selectedDoc) dispatch(setSelectedDoc(""));
                  dispatch(setShowOptions(!shwoOptions));
                  SetShowFeatures(false);
                  dispatch(setVariant("signal-break"));
                  dispatch(setQueryType(""));
                }}
                className={`p-2 rounded-lg transition-colors duration-150 ${shwoOptions
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-gray-100 dark:bg-neutral-900 text-neutral-900 dark:text-white hover:bg-gray-200 dark:hover:bg-neutral-800"
                  }`}
                title="Domains"
              >
                <IoOptions size={18} />
              </button>

              {/* Query type */}
              {selectedDoc && (
                <button
                  onClick={() => {
                    dispatch(setShowType(!showType));
                    dispatch(setVariant("binary-cut"));
                  }}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-900 text-neutral-900 dark:text-white hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors duration-150"
                  title="Query Type"
                >
                  <GoZap size={18} />
                  <QueryType />
                </button>
              )}

              {/* Features button */}
              <div className="relative">
                <AccessBar
                  Showfeatures={Showfeatures}
                  SetShowFeatures={SetShowFeatures}
                />
                <button
                  onClick={() => {
                    dispatch(setVariant("split-badge-original"));
                    SetShowFeatures(!Showfeatures);
                  }}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-900 text-neutral-900 dark:text-white hover:bg-gray-200 dark:hover:bg-neutal-800 transition-colors duration-150"
                  title="Features"
                >
                  <BsPlusLg size={18} />
                </button>
              </div>

              {/* Upload button */}
              <button
                onClick={() => {
                  dispatch(setVariant("bracketed-identity"));
                  dispatch(setShowUserForm(!shhowUserForm));
                }}
                className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-900 text-neutral-900 dark:text-white hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors duration-150"
                title="Upload"
              >
                <BiUpload size={18} />
              </button>
            </div>

            {/* Private documents */}
            <button
              onClick={() => {
                dispatch(setShowDocs(!showDocs));
                dispatch(setShowOptions(false));
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors duration-150  text-neutral-900 dark:text-white space-grotesk w-[150px] md:w-full max-w-[200px]"
            >
              <Cloud className="shrink-0" size={14} />
              <span className="truncate text-[11px] uppercase cursor-pointer">
                {(() => {
                  if (!selectedDoc) return "My_Cloud";
                  const foundDoc = user?.Contributions_user_id_fkey?.find(
                    (contribution: any) => contribution.document_id === selectedDoc
                  );
                  return foundDoc?.feedback || "My_Cloud";
                })()}
              </span>
            </button>
          </div>
        )}

        {/* Status display */}
        {isActive && (queryType || category) && (
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-neutral-800">
            <span className="inline-block px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-900 rounded space-grotesk">
              {queryType ? `Process: ${queryType}` : `Category: ${category}`}
            </span>
          </div>
        )}
      </motion.section >
    </>
  );
};

export default InputSection;

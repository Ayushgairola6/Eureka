import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import ChatBubble from "@/components/ChatBubble.tsx";
import InputSection from "@/components/InterfaceInputSection.tsx";
import { useAppSelector, useAppDispatch } from "../store/hooks.tsx";
import { currentTime } from "../../utlis/Date.ts";
import {
  MimicSSE,
  setQueryType,
  setQuestion,
  // GetSessionHistory,
  setSelectedDoc,
  setUploadStatus,
  UpdateChats,
  updateFavicon,
  // updatefetchingSessionHistory,
  // UpdateResponseStatus,
  // UpdateSessionChats,
  setSearchDepth,
  UploadDocuments,
  WebSearchHandler,
} from "../store/InterfaceSlice.ts";
import { setDocs, SetQueryCount } from "../store/AuthSlice.ts";
import UserForm from "@/components/ui/userDetail.tsx";
import { useSearchParams } from "react-router";
import PrivateDocuments from "@/components/PrivateDocuments.tsx";
import PublicQueryOptions from "@/components/PublicQueryOptions.tsx";
import { Notice } from "@/components/Notice.tsx";
import { v4 as uuid } from 'uuid'
function Interface() {
  const [searchParams] = useSearchParams();
  // handling google auth localstorage sessionToken storage
  useEffect(() => {
    const SessionId = searchParams.get("SessionId");
    if (SessionId) {
      localStorage.setItem("AntiNode_six_eta_v1_Authtoken", SessionId);
    }
  }, []);
  const dispatch = useAppDispatch();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(false);
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const { question, category, visibility, subCategory, Chats, selectedDoc, search_depth, queryType } =
    useAppSelector((state) => state.interface);

  const textareaRef = useRef<HTMLInputElement>(null);
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  const isStreaming = Chats[Chats.length - 1]?.sent_by !== "You" && Chats[Chats.length - 1]?.message?.isComplete === false;
  //self up moving message input container 
  useEffect(() => {
    adjustTextareaHeight();
  }, [Chats, isStreaming]);

  // checking if there is any prompt based saved from redirect url
  useEffect(() => {
    // if the app has not loaded completely yet
    if (typeof window === 'undefined') return;

    // if the user is not logged In 
    if (isLoggedIn === false) return;

    const value = sessionStorage.getItem("AntiNode_Redirect_prompt");
    if (!value) return;
    dispatch(setQuestion((value)));
    dispatch(setQueryType("Web Search"));
    dispatch(setSearchDepth('surface_web'));


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


      const user_id = uuid()

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

      dispatch(
        WebSearchHandler({ question, MessageId: AiId, userMessageId: user_id, web_search_depth: search_depth })
      )
        .unwrap()
        .then((res) => {
          if (res.message === "Results found") {
            dispatch(MimicSSE({ id: AiId, delta: res.Answer }));
            dispatch(updateFavicon(res.favicon));
            dispatch(SetQueryCount());
            sessionStorage.removeItem("AntiNode_Redirect_prompt");

          }
        })
        .catch((err: any) => {
          dispatch(
            MimicSSE({
              id: AiId,
              delta:
                err ||
                "It seems like there are many people using our service right now, I would like to apologize for the inconvenience.",
            })
          );
          // dispatch(setWebStatus([]));
          setIsActive(false);
          sessionStorage.removeItem("AntiNode_Redirect_prompt");

        })
        .finally(() => {
          dispatch(
            MimicSSE({
              id: AiId,
              delta:

                "It seems like there are many people using our service right now, I would like to apologize for the inconvenience.",
            })
          );
          setIsActive(false);
          // dispatch(setWebStatus([]));
          dispatch(setQuestion(""));
          sessionStorage.removeItem("AntiNode_Redirect_prompt");

        });
    } catch (err: any) {
      toast.error(err?.response?.data?.message);
    }

  }, [dispatch])
  // const FetchCountRef = React.useRef(0);
  // useEffect(() => {
  //   // Only fetch if logged in and we haven't loaded history yet
  //   if (!isLoggedIn || Chats.length > 0 || FetchCountRef?.current > 0) return;

  //   // Use a loading flag to prevent multiple simultaneous fetches
  //   dispatch(GetSessionHistory("0")) // Or your timestamp logic
  //     .unwrap()
  //     .then((res) => {
  //       if (res.history?.length > 0) {
  //         FetchCountRef.current = 1; //flag to toggle state
  //         dispatch(UpdateResponseStatus(res.history));
  //         // Map your "single row" DB format to your UI format here
  //         // if the reducer doesn't do it
  //         dispatch(UpdateSessionChats(res.history));
  //         dispatch(updatefetchingSessionHistory(false));
  //       }
  //     })
  //     .catch((err) => console.error(err))
  //     .finally(() => (FetchCountRef.current = 1));
  // }, [isLoggedIn, dispatch]);
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

      if (isLoggedIn === false) {
        toast.message(
          "We currently only allow verified users to contribute !Please Login to continue ."
        );
        return;
      }

      toast.info(
        visibility === "Public"
          ? "Thanks for your contribution ."
          : "This document will be only accessible to you."
      );

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("category", category);
      formData.append("visibility", visibility);
      formData.append("subCategory", subCategory);
      formData.append("feedback", UserData.get("feedback") as string);
      formData.append("about", UserData.get("about") as string);

      dispatch(UploadDocuments(formData))
        .unwrap()
        .then((res: any) => {
          if (res.message) {
            toast.message(res.message);
            // console.log(res.insertData); //show a popup message
            dispatch(setDocs(res.insertData)); //update the local state
          }
        })
        .catch((err) => {
          toast.message(err);
          dispatch(setUploadStatus("Failed"));
        })
        .finally(() => {
          dispatch(setUploadStatus("Processing"));
        });
    } catch (err) {
      console.error(err);
    }
  };

  // auto scroll container
  const chatcontainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatcontainer.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatcontainer, Chats]);

  return (
    <>
      {" "}
      <div
        className={`w-full  flex items-center justify-between flex-col min-h-[90vh]  dark:bg-black  relative z-[1]  px-4 py-3 `}
      >
        <Notice />

        <ChatBubble
          isActive={isActive}
          setIsActive={setIsActive}
          chatcontainer={chatcontainer}
        />
        <div className="w-full flex items-center justify-center fixed bottom-0 py-0.5 left-0 md:px-2 px-0.5   dark:bg-black bg-white ">
          <PrivateDocuments
            selectedDoc={selectedDoc}
            setSelectedDoc={setSelectedDoc}
          />
          <UserForm
            setSelectedFile={setSelectedFile}
            selectedFile={selectedFile}
            handleUpload={handleUpload}
          />
          <div className="w-full md:max-w-3/5 relative rounded-2xl p-0.5 dark:bg-black bg-white ">
            {" "}
            {/* Added padding */}
            <div
              className={`relative bg-white dark:bg-black  backdrop-blur-md overflow-y-visible rounded-sm`}
            >
              <PublicQueryOptions />

              {/* Slightly smaller radius */}

              <InputSection
                isActive={isActive}
                setIsActive={setIsActive}
                textareaRef={textareaRef}
              />
              <div className='space-grotesk text-[10px] text-gray-700 dark:text-gray-500 text-center '>
                Antinode can make mistakes!
              </div>
            </div>
          </div>
        </div>
        {/* chattting seciton */}
      </div>
    </>
  );
}

export default Interface;

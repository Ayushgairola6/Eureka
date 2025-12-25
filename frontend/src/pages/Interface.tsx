import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import ChatBubble from "@/components/ChatBubble.tsx";
import InputSection from "@/components/InterfaceInputSection.tsx";
import { useAppSelector, useAppDispatch } from "../store/hooks.tsx";
import {
  GetSessionHistory,
  setSelectedDoc,
  setUploadStatus,
  updatefetchingSessionHistory,
  UpdateSessionChats,
  UploadDocuments,
} from "../store/InterfaceSlice.ts";
import { setDocs } from "../store/AuthSlice.ts";
import UserForm from "@/components/ui/userDetail.tsx";
import { useSearchParams } from "react-router";
import PrivateDocuments from "@/components/PrivateDocuments.tsx";
import PublicQueryOptions from "@/components/PublicQueryOptions.tsx";
// import { HandleSSEConnection } from "../store/SSEHandler.tsx";
function Interface() {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const SessionId = searchParams.get("SessionId");
    if (SessionId) {
      localStorage.setItem("Eureka_six_eta_v1_Authtoken", SessionId);
    }
  }, []);
  const dispatch = useAppDispatch();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(false);
  const { isLoggedIn, isDarkMode } = useAppSelector((state) => state.auth);
  const {
    question,
    category,
    visibility,
    subCategory,
    Chats,
    selectedDoc,
    fetchingSessionHistory,
  } = useAppSelector((state) => state.interface);

  const textareaRef = useRef<HTMLInputElement>(null);
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

  const FetchCountRef = React.useRef(0);
  useEffect(() => {
    // Only fetch if logged in and we haven't loaded history yet
    if (!isLoggedIn || Chats.length > 0 || FetchCountRef?.current > 0) return;

    // Use a loading flag to prevent multiple simultaneous fetches
    dispatch(GetSessionHistory("0")) // Or your timestamp logic
      .unwrap()
      .then((res) => {
        if (res.history?.length > 0) {
          FetchCountRef.current = 1; //flag to toggle state
          // Map your "single row" DB format to your UI format here
          // if the reducer doesn't do it
          dispatch(UpdateSessionChats(res.history));
          dispatch(updatefetchingSessionHistory(false));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => (FetchCountRef.current = 1));
  }, [isLoggedIn, dispatch]);
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
        <div className="fixed z-[1] top-10 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/5 transition-opacity duration-500 text-xs md:text-sm">
          {/* Status Dot */}
          <div className="relative flex h-2 w-2">
            {fetchingSessionHistory && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                fetchingSessionHistory ? "bg-blue-500" : "bg-emerald-500"
              }`}
            ></span>
          </div>

          {/* Status Text */}
          <span className="text-[11px] font-medium tracking-wide uppercase dark:text-gray-400 text-gray-600">
            {fetchingSessionHistory ? "Syncing History..." : "Synced"}
          </span>
        </div>
        {/* gradient background for light thtme */}
        {!isDarkMode && (
          <div className="absolute top-0 left-0 w-full h-64 overflow-hidden z-[-2] pointer-events-none">
            {/* 1. Primary Light: Deep Indigo (Left) */}
            <div
              className="absolute -top-24 -left-20 w-96 h-96 
      bg-indigo-500/30 rounded-full blur-[100px] 
      animate-pulse mix-blend-multiply"
            />

            {/* 2. Secondary Light: Bright Cyan (Right) */}
            <div
              className="absolute -top-32 right-0 w-[500px] h-[500px] 
      bg-cyan-400/20 rounded-full blur-[120px] 
      animate-pulse"
            />

            {/* 3. The "Fade Out" Mask to ensure it blends down smoothly */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white" />
          </div>
        )}
        <ChatBubble
          isActive={isActive}
          setIsActive={setIsActive}
          chatcontainer={chatcontainer}
        />
        <div className="w-full flex items-center justify-center fixed bottom-0 py-0.5 left-0 md:px-2 px-0.5  rounded-sm dark:bg-black ">
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
            </div>
          </div>
        </div>
        {/* chattting seciton */}
      </div>
    </>
  );
}

export default Interface;

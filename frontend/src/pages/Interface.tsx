import { useState, useRef, useEffect } from "react";
import { Toaster, toast } from "sonner";
import ChatBubble from "@/components/ChatBubble.tsx";
import InputSection from "@/components/InterfaceInputSection.tsx";
import { useAppSelector, useAppDispatch } from "../store/hooks.tsx";
import { setSelectedDoc, UploadDocuments } from "../store/InterfaceSlice.ts";
import UserForm from "@/components/ui/userDetail.tsx";
import { useSearchParams } from "react-router";
import PrivateDocuments from "@/components/PrivateDocuments.tsx";
import PublicQueryOptions from "@/components/PublicQueryOptions.tsx";
import { motion } from "framer-motion";
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

  const { isLoggedIn, isDarkMode, loading } = useAppSelector(
    (state) => state.auth
  );
  const { question, category, visibility, subCategory, Chats, selectedDoc } =
    useAppSelector((state) => state.interface);

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

  // auto scroll container
  const chatcontainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatcontainer.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatcontainer, Chats]);

  return (
    <>
      <div
        className={`w-full  flex items-center justify-between flex-col min-h-screen  dark:bg-black  relative z-[1]  px-4 py-3 `}
      >
        {loading === true && (
          <motion.div
            initial={{ width: "100%" }}
            animate={{
              width: ["100%", "80%", "60%", "40%", "70%", "25%", "12%", "0%"],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="bg-gradient-to-r from-red-600 via-sky-600 to-yellow-600 p-1   w-full  fixed   top-9"
          />
        )}
        {/* gradient background for light thtme */}
        {!isDarkMode && (
          <div className="bg-gradient-to-br from-pink-500/50 to-amber-500/40  z-[-2] absolute top-0 left-0 h-full w-full blur-2xl"></div>
        )}

        <ChatBubble chatcontainer={chatcontainer} />

        <div className="w-full flex items-center justify-center fixed bottom-0 py-0.5 left-0 md:px-2 px-0.5  rounded-sm dark:bg-black ">
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
        <Toaster />
      </div>
      <PrivateDocuments
        selectedDoc={selectedDoc}
        setSelectedDoc={setSelectedDoc}
      />
      <UserForm
        setSelectedFile={setSelectedFile}
        selectedFile={selectedFile}
        handleUpload={handleUpload}
      />
    </>
  );
}

export default Interface;

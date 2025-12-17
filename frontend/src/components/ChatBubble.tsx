import React, { useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import ResponseFeedback from "./ResponseFeedback.tsx";
import { BiCopy } from "react-icons/bi";
import {
  useAppDispatch,
  useAppSelector,
  useTypewriter,
} from "../store/hooks.tsx";
import { toast } from "sonner";
import { IoHourglass } from "react-icons/io5";
import DocUsed from "@/components/DocumentsUsed.tsx";
import { GetCachedSessionHistory } from "../store/InterfaceSlice.ts";
type ChatBubbleProps = {
  chatcontainer: React.Ref<HTMLDivElement>;
};
const ChatBubble: React.FC<ChatBubbleProps> = ({ chatcontainer }) => {
  const ReceivedResponseId: any = []; //just a tracker array
  const { Chats } = useAppSelector((state) => state.interface);
  const { currentStatus } = useAppSelector((state) => state.socket);
  const [docused, setShowDocUsed] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  // array of welcom messages
  const steps = [
    "Validating",
    "Researching",
    "Evaluating",
    "Collaborating",
    "Contributing",
  ];
  const [text, setText] = useState<string>(steps[0]); //default the first value of steps message

  // creating a slight animation effect for ux
  useEffect(() => {
    if (Chats.length > 0) {
      return;
    }
    let i = 0; //counter of index

    // update the text every 2 seconds and clear when done
    const interval = setInterval(() => {
      setText(steps[i]); //update the value of text
      i++;
      if (i >= steps.length || Chats.length > 0) {
        clearInterval(interval);
      }
    }, 2000); //2 seconds of gap when animating

    return () => clearInterval(interval); //clear the interval on unmount
  }, []);

  // fetch chat cache only once
  const CountRef = useRef(0);
  useEffect(() => {
    if (CountRef.current === 0) {
      dispatch(GetCachedSessionHistory())
        .unwrap()
        .then((_res) => {
          CountRef.current = 1;
          // console.log(Chats);
        })
        .catch(() => {
          // console.log(error);
        });
    }
  }, []);
  return (
    <>
      {Chats.length > 0 ? (
        Chats.map((chat, index) => {
          return (
            <div
              key={`chat-${index}-${chat.sent_by}`}
              className={`w-full md:w-3/5 relative ${
                chat === Chats[Chats.length - 1] && Chats.length > 1
                  ? "mb-50"
                  : "mb-3"
              }`}
            >
              {/* Chat Bubble Container */}
              <div className="space-y-8 ">
                {/* the favicon portion */}

                {/* the documents used section for public documents */}
                {chat.sent_by === "Eureka" && (
                  <DocUsed
                    chat={chat}
                    docused={docused}
                    setShowDocUsed={setShowDocUsed}
                  />
                )}
                {/* Chat Bubble */}
                {chat.sent_by === "Eureka" &&
                chat.message.content === "" &&
                chat.id === Chats[Chats.length - 1].id ? (
                  <ul className="bai-jamjuree-semibold text-lg  my-2 flex items-center justify-start gap-2  w-fit   relative overflow-hidden border rounded-xl border-gray-700 p-[1px]">
                    <div className=" absolute top-0 left-0   h-full w-full  bg-gradient-to-br from-red-600 via-sky-600 to-yellow-600 z-[-2] ThinkingIndicator" />

                    <p className="flex items-center bg-white dark:bg-black h-[90%] w-full rounded-xl justify-center gap-2 px-2 text-sm">
                      <IoHourglass className="animate-spin" />
                      {currentStatus}
                    </p>
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
                            navigator.clipboard.writeText(chat.message.content);
                            toast.info("Copied to clipboard");
                            return;
                          }
                        }}
                      >
                        <BiCopy />
                      </button>
                    )}
                    <ChatMessage
                      chat={chat}
                      lastMessageId={Chats[Chats.length - 1].id}
                    />
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

                {/* if the message is last and is not stored in the responsefeedback array and is sent by EUREKA */}
                {chat.sent_by === "Eureka" &&
                  !ReceivedResponseId.some(
                    (elem: any) => elem?.chat_id === chat.id
                  ) && (
                    <div className="mt-2">
                      <ResponseFeedback
                        ReceivedResponseId={ReceivedResponseId}
                        chat={chat}
                      />
                    </div>
                  )}
                {Chats.length > 0 && (
                  <div ref={chatcontainer} className="h-0" />
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center  py-8  m-auto w-full  flex items-center justify-center flex-col gap-1">
          <h1 className="text-3xl bai-jamjuree-bold">
            Welcome,{" "}
            {user?.username
              ? user?.username.split("_")[0].toLocaleUpperCase()
              : "Cadet"}{" "}
          </h1>
          <span className="text-md dark:text-gray-400 text-gray-700 ">
            What are we {/* Apply your custom class here */}
            <span className="bai-jamjuree-bold  text-transparent bg-clip-text bg-gradient-to-r from-[#4f46e5] to-[#0891b2] dark:from-[#a78bfa] dark:to-[#22d3ee]">
              {text}{" "}
            </span>
            today?
          </span>
        </div>
      )}
    </>
  );
};

export default ChatBubble;

//the render component for sse like effect
const ChatMessage = ({ chat, lastMessageId }: any) => {
  // 1. Determine if this message should be streaming
  // Conditions:
  //   a. It was NOT sent by the user ('You').
  //   b. It is the LAST message in the entire chat history.
  const isStreaming = chat?.sent_by !== "You" && chat.id === lastMessageId;

  // 2. Call the hook UNCONDITIONALLY (Hooks rule!)
  // Hooks must be called in the same order on every render.
  // We pass the full content, but the hook is smart enough to manage the speed.
  const streamingText = useTypewriter(chat.message.content, 10);

  // 3. Determine which text source to use for rendering
  const textToRender = isStreaming
    ? streamingText // Use the animating text if streaming
    : chat.message.content; // Use the full, final content if it's history

  return (
    <div className={`message-bubble ${chat.sent_by}`}>
      <Streamdown className="space-grotesk">
        {textToRender}
        {/* Optional: Add a cursor/placeholder when streaming */}
      </Streamdown>
    </div>
  );
};

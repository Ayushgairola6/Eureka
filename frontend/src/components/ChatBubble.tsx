import React, { useEffect, useState } from "react";
import ResponseFeedback from "./ResponseFeedback.tsx";
import { BiCopy } from "react-icons/bi";
import { useAppSelector } from "../store/hooks.tsx";
import { toast } from "sonner";
import { IoHourglass } from "react-icons/io5";
import DocUsed from "@/components/DocumentsUsed.tsx";
import WebSearchStatus from "./web_search_status.tsx";
import { ChatMessage } from "./Streaming_Component.tsx";
import { AgentWelcome } from "./InterfaceWelcome_Components.tsx";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";

type ChatBubbleProps = {
  chatcontainer: React.Ref<HTMLDivElement>;
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
};
const ChatBubble: React.FC<ChatBubbleProps> = ({
  chatcontainer,
  isActive,
  setIsActive,
}) => {
  const ReceivedResponseId: any = []; //just a tracker array
  const { Chats, ResponseStatus, CurrentTheme } = useAppSelector(
    (state) => state.interface
  );
  const { currentStatus, web_search_status } = useAppSelector(
    (state) => state.socket
  );
  const [docused, setShowDocUsed] = useState(false);
  // array of welcom messages
  const steps = [
    "Uncovering", // Sounds more exciting than Researching
    "Synthesizing", // Very "AI" specific (combining info)
    "Decoding", // Implies finding hidden truths
    "Verifying", // Stronger than Validating
    "Solving", // The ultimate goal
  ];
  const [text, setText] = useState<string>(steps[0]); //default the first value of steps message

  // creating a slight animation effect for ux
  useEffect(() => {
    let i = 0; //counter of index

    // update the text every 2 seconds and clear when done
    const interval = setInterval(() => {
      setText(steps[i]); //update the value of text
      i++;
      if (i >= steps.length - 1 || Chats.length > 0) {
        i = 0; //return to 0 and create an infinite loop
      }
    }, 4000); //2 seconds of gap when animating

    return () => clearInterval(interval); //clear the interval on unmount
  }, []);

  // const colorOption = [
  //   "bg-cyan-600",
  //   "bg-blue-600",
  //   "bg-lime-600",
  //   "bg-green-600",
  //   "bg-purple-600",
  //   "bg-pink-600",
  // ];

  return (
    <>
      {Chats.length > 0 ? (
        Chats.map((chat, index) => {
          return (
            <div
              onClick={() => {
                if (isActive === true) {
                  setIsActive(false);
                }
              }}
              key={`chat-${index}-${chat.sent_by}`}
              className={`w-full md:w-3/5 relative  overflow-x-hidden ${
                chat === Chats[Chats.length - 1] && Chats.length > 1
                  ? "mb-160"
                  : "mb-5"
              }`}
            >
              {/* Chat Bubble Container */}
              <div className="space-y-8 ">
                {/* the favicon portion */}

                {/* the documents used section for public documents */}
                {chat.sent_by === "AntiNode" && (
                  <DocUsed
                    chat={chat}
                    docused={docused}
                    setShowDocUsed={setShowDocUsed}
                  />
                )}

                {chat.sent_by === "AntiNode" &&
                chat.message.content === "" &&
                chat.id === Chats[Chats.length - 1].id ? (
                  web_search_status?.length > 0 ? (
                    <WebSearchStatus chat={chat} lastMessageId={chat.id} />
                  ) : (
                    <ul className="space-grotesk text-lg  my-2 flex items-center justify-start gap-2  w-fit   relative overflow-hidden border rounded-xl border-gray-700 p-[1px]">
                      <div className=" absolute top-0 left-0   h-full w-full  bg-gradient-to-br from-red-600 via-sky-600 to-yellow-600 z-[-2] ThinkingIndicator " />

                      <p className="flex items-center bg-white dark:bg-black h-[90%] w-full rounded-xl justify-center gap-2 px-2 py-2 space-grotesk text-sm">
                        <IoHourglass className="animate-spin" />
                        {currentStatus}
                      </p>
                    </ul>
                  )
                ) : (
                  <div
                    className={`px-3 py-2 rounded-2xl transition-all duration-200 ease-in-out shadow-sm text-md text-wrap space-grotesk ${
                      chat.sent_by === "You"
                        ? "max-w-[80%] justify-self-end rounded-br-none " +
                          CurrentTheme.user + // Slack-ish primary blue
                          "font-medium self-end items-center justify-center"
                        : " w-full justify-self-start rounded-bl-none " +
                          CurrentTheme.ai
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
                            ? "justify-self-end dark:text-gray-700 text-gray-300"
                            : "justify-self-start text-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {chat.sent_at}
                      </span>
                    )}
                  </div>
                )}

                {/* Feedback for AI responses - positioned below the bubble */}

                {/* if the message is last and is not stored in the responsefeedback array and is sent by AntiNode */}
                {chat.sent_by !== "You" &&
                  ResponseStatus?.find((i) => i.id === chat.id) === false && (
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
        <AgentWelcome
          text={text}
          isActive={isActive}
          setIsActive={setIsActive}
        />
      )}
    </>
  );
};

export default ChatBubble;

//charts renderer

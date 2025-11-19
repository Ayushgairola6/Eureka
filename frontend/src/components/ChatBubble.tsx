import React, { lazy, useState } from "react";
import { Streamdown } from "streamdown";
const ResponseFeedback = lazy(() => import("./ResponseFeedback.tsx"));
import { BiCopy } from "react-icons/bi";
import { useAppSelector } from "../store/hooks.tsx";
import { toast } from "sonner";
import { IoHourglass } from "react-icons/io5";
import DocUsed from "@/components/DocumentsUsed.tsx";
type ChatBubbleProps = {
  chatcontainer: React.Ref<HTMLDivElement>;
};
const ChatBubble: React.FC<ChatBubbleProps> = ({ chatcontainer }) => {
  const [ReceivedResponseId, setReceivedRsponseId] = useState<any>([]);
  const { Chats } = useAppSelector((state) => state.interface);
  const [docused, setShowDocUsed] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  return (
    <>
      {Chats.length > 0 ? (
        Chats.map((chat, index) => {
          return (
            <div
              key={`chat-${index}-${chat.sent_by}`}
              className={`w-full md:w-3/5 relative ${
                chat === Chats[Chats.length - 1] ? "mb-50" : "mb-3"
              }`}
            >
              {/* Chat Bubble Container */}
              <div className="space-y-8 ">
                {/* the favicon portion */}

                {/* the documents used section for public documents */}
                {chat.sent_by === "Eureka" &&
                  chat === Chats[Chats.length - 1] && (
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

                    <p className="flex items-center bg-white dark:bg-black h-[90%] w-full rounded-xl justify-center gap-2 px-2">
                      <IoHourglass className="animate-spin" />
                      Analyzing...
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
                    <Streamdown className="space-grotesk">
                      {chat.message.content}
                    </Streamdown>

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
        <div className="text-center  py-8  m-auto w-full  flex items-center justify-center flex-col gap-1">
          <h1 className="text-2xl bai-jamjuree-bold">
            Welcome,{" "}
            {user?.username
              ? user?.username.split("_")[0].toLocaleUpperCase()
              : "Beautiful person"}{" "}
          </h1>
          <span className="text-sm dark:text-gray-400 text-gray-700 space-grotesk">
            What are we reasearching today?
          </span>
        </div>
      )}
    </>
  );
};

export default ChatBubble;

import React, { useEffect, useState } from "react";
import ResponseFeedback from "./ResponseFeedback.tsx";
import { BiCopy } from "react-icons/bi";
import { useAppSelector } from "../store/hooks.tsx";
import { toast } from "sonner";
import { Loader } from "@/components/Prompt_Requesr_Indicator.tsx";
import DocUsed from "@/components/DocumentsUsed.tsx";
import WebSearchStatus from "./web_search_status.tsx";
import { ChatMessage } from "./Streaming_Component.tsx";
import { AgentWelcome } from "./InterfaceWelcome_Components.tsx";
import { ChevronDown } from "lucide-react";


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
  const { Chats, ResponseStatus } = useAppSelector(
    (state) => state.interface
  );
  const [showCurrent, setShowCurrent] = React.useState({ id: '', status: false })
  const { web_search_status } = useAppSelector(
    (state) => state.socket
  );
  const [docused, setShowDocUsed] = useState(false);
  // array of welcom messages
  const steps = [
    "Uncovering",
    "Synthesizing",
    "Decoding",
    "Verifying",
    "Solving",]
  const [text, setText] = useState<string>(steps[0]); //default the first value of steps message


  useEffect(() => {
    let i = 0;


    const interval = setInterval(() => {
      setText(steps[i]); //update the value of text
      i++;
      if (i >= steps.length - 1 || Chats.length > 0) {
        i = 0;
      }
    }, 4000);

    return () => clearInterval(interval); //clear the interval on unmount
  }, []);



  return (
    <>
      {Chats.length > 0 ? (
        Chats.map((chat, index) => {


          // message container height class determiner
          const containerHeight = chat.sent_by !== 'You'
            ? "h-auto"
            : (showCurrent.id === chat.id && showCurrent.status === true)
              ? "h-auto "
              : "h-[4rem] overflow-hidden ";
          return (
            <div
              onClick={() => {
                if (isActive === true) {
                  setIsActive(false);
                }
              }}
              key={`chat-${index}-${chat.sent_by}`}
              className={`w-full md:w-3/5 relative  overflow-x-hidden ${chat === Chats[Chats.length - 1] && Chats.length > 1
                ? "mb-160"
                : "mb-5"
                }`}
            >
              {/* Chat Bubble Container */}
              <div className="space-y-8 ">


                {/* the documents used section for public documents */}
                {chat.sent_by === "AntiNode" && (
                  <DocUsed
                    chat={chat}
                    docused={docused}
                    setShowDocUsed={setShowDocUsed}
                  />
                )}
                {chat.sent_by === 'AntiNode' && chat.message.content !== '' && web_search_status.some((e) => e.MessageId === chat.id) && <WebSearchStatus chat={chat} lastMessageId={chat.id} />}
                {chat.sent_by === "AntiNode" &&
                  chat.message.content === ""
                  ? (
                    web_search_status?.length > 0 ? (
                      <WebSearchStatus chat={chat} lastMessageId={chat.id} />
                    ) : (
                      <Loader />
                    )
                  ) : (<>
                    <div
                      className={`relative group flex flex-col gap-2 mb-6 ${chat.sent_by === "You" ? "items-end ml-auto" : "items-start"
                        }`}
                    >
                      {/* Header Label: Keeping that Industrial vibe */}
                      <div className="flex items-center justify-center gap-2 px-1">
                        <ul>
                          {chat.sent_by === "You" && <button onClick={() => {
                            if (showCurrent?.id === chat.id) {
                              setShowCurrent({ id: '', status: false })
                            } else {
                              setShowCurrent({ id: chat?.id.toString(), status: true })
                            }
                          }}><ChevronDown size={15} /></button>}
                        </ul>
                        <span className="text-[10px] font-mono font-bold dark:text-gray-300 text-gray-700 uppercase tracking-widest">
                          {chat.sent_by === "You" ? ">> ORIGIN_USER" : ">> ANTINODE_RESPONSE"}
                        </span>
                        <div className={`h-[1px] w-4 ${chat.sent_by === "You" ? "bg-orange-600" : "bg-sky-600"}`} />
                      </div>
                      <div
                        className={`relative transition-all duration-500 ease-in-out border shadow-sm
      ${chat.sent_by === "You"
                            ? "dark:bg-white bg-black dark:text-black text-white border-transparent rounded-2xl rounded-tr-none px-4 py-3 w-full md:w-120"
                            : "dark:bg-black bg-gray-50 dark:text-neutral-200 text-black border-neutral-200 dark:border-neutral-800 rounded-2xl rounded-tl-none px-5 py-4"
                          } 
             ${containerHeight} 
       transition-all duration-300`}
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
                      </div>
                      {chat.sent_at && (
                        <section className='flex items-center justify-end gap-2 text-xs space-grotesk  text-gray-600 dark:text-gray-400'>
                          {chat.sent_at?.split("|").join("-")}
                        </section>

                      )}
                    </div>
                  </>
                  )}


                {chat.sent_by !== "You" &&
                  !ResponseStatus.some((i) => i.id === chat.id) && (
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

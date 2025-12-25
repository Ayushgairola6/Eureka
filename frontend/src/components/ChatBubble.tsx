import React, { useEffect, useState } from "react";
import { Streamdown } from "streamdown";
import ResponseFeedback from "./ResponseFeedback.tsx";
import { BiCopy } from "react-icons/bi";
import { useAppSelector, useTypewriter } from "../store/hooks.tsx";
import { toast } from "sonner";
import { IoHourglass } from "react-icons/io5";
import DocUsed from "@/components/DocumentsUsed.tsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
  const { Chats } = useAppSelector((state) => state.interface);
  const { currentStatus } = useAppSelector((state) => state.socket);
  const [docused, setShowDocUsed] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
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
                  <ul className="space-grotesk text-lg  my-2 flex items-center justify-start gap-2  w-fit   relative overflow-hidden border rounded-xl border-gray-700 p-[1px]">
                    <div className=" absolute top-0 left-0   h-full w-full  bg-gradient-to-br from-red-600 via-sky-600 to-yellow-600 z-[-2] ThinkingIndicator " />

                    <p className="flex items-center bg-white dark:bg-black h-[90%] w-full rounded-xl justify-center gap-2 px-2 text-sm">
                      <IoHourglass className="animate-spin" />
                      {currentStatus}
                    </p>
                  </ul>
                ) : (
                  <div
                    className={`px-3 py-2 rounded-2xl transition-all duration-200 ease-in-out shadow-sm text-sm md:text-md text-wrap space-grotesk ${
                      chat.sent_by === "You"
                        ? "max-w-[80%] justify-self-end rounded-br-none " +
                          "bg-black text-white dark:bg-white dark:text-black " + // Slack-ish primary blue
                          "font-medium self-end items-center justify-center"
                        : " w-full justify-self-start rounded-bl-none " +
                          "bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 " + // Slack dark-mode gray
                          "text-gray-900 dark:text-gray-100"
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
        <div
          onClick={() => {
            if (isActive === true) {
              setIsActive(false);
            }
          }}
          className="text-center  py-8  m-auto w-full  flex items-center justify-center flex-col gap-1"
        >
          <h1 className="md:text-5xl text-3xl  bai-jamjuree-bold ">
            Welcome{" "}
            {user?.username
              ? user?.username.split("_")[0].toLocaleUpperCase()
              : "Cadet"}{" "}
          </h1>
          <span className="text-md dark:text-gray-400 text-gray-700 space-grotesk font-semibold">
            What are we {/* Apply your custom class here */}
            <AnimatePresence mode="wait">
              <motion.span
                key={text}
                className="text-transparent  bg-clip-text bg-gradient-to-r from-blue-600 to-sky-600  "
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {text}
              </motion.span>
            </AnimatePresence>
            {"  today?"}
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
    // <div className={`message-bubble ${chat.sent_by}`}>
    <Streamdown
      // isAnimating={isStreaming} // Critical for smooth streaming in Streamdown
      components={{
        code(props: any) {
          const { node, inline, className, children, ...rest } = props;
          const match = /language-chart/.exec(className || "");
          const content = String(children).replace(/\n$/, "");

          if (!inline && match) {
            return <DynamicChart content={content} />;
          }

          // Fallback to default code rendering for JS, Python, etc.
          return (
            <code className={className} {...rest}>
              {children}
            </code>
          );
        },
      }}
      className="space-grotesk"
    >
      {textToRender}
      {/* Optional: Add a cursor/placeholder when streaming */}
    </Streamdown>
    // </div>
  );
};

//charts renderer
const DynamicChart = ({ content }: any) => {
  try {
    const chartData = JSON.parse(content);

    // FIX: Transform generic "label/value" data to match your dynamic xAxis/yAxis keys
    const formattedData = chartData.data.map((item: any) => ({
      ...item, // Keep original properties
      [chartData.xAxis]: item.label, // e.g., Maps "label" -> "Feature"
      [chartData.yAxis]: item.value, // e.g., Maps "value" -> "Persistence Level"
    }));

    return (
      <div className="h-72 w-full my-6 p-4 rounded-xl border border-white/10 bg-black/20 backdrop-blur-md shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-4 ml-2">
          {chartData.title || "Data Synthesis"}
        </p>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
              opacity={0.5}
            />
            <XAxis
              dataKey={chartData.xAxis} // Now finds "Feature" in formattedData
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10} // Add some spacing for the labels
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "8px",
                color: "#f1f5f9",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#22d3ee" }}
            />
            <Bar
              dataKey={chartData.yAxis} // Now finds "Persistence Level"
              fill="#22d3ee"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (e) {
    // Gracefully handle partial/invalid JSON during streaming
    return (
      <div className="h-64 w-full my-6 rounded-xl bg-white/5 animate-pulse flex items-center justify-center">
        <span className="text-white/20 text-sm">Visualizing data...</span>
      </div>
    );
  }
};

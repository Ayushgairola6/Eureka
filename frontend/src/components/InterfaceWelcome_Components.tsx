import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch } from "../store/hooks";
import {
  setQuestion,
  setQueryType,
  MimicSSE,
  UpdateChats,
} from "../store/InterfaceSlice";
import { ArrowRight } from "lucide-react";
import { AnswerAndData } from "../../utlis/PromptsWithResponse.ts";
import { setWebStatus } from "../store/websockteSlice";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { currentTime } from "../../utlis/Date.ts";
type WelcomeProps = {
  text: string; // dynamic word for the animated span
  isActive: boolean;
  setIsActive: (v: boolean) => void;
};
const Prompts = [
  { id: 1, prompt: "Recent findings about cancer treatment." },
  { id: 2, prompt: "How LLM's are affecting the market?" },
  { id: 3, prompt: "Why getting a job has become so hard?" },
];
export const AgentWelcome: React.FC<WelcomeProps> = ({
  text,
  isActive,
  setIsActive,
}) => {
  const dispatch = useAppDispatch();

  const [choice, setChoice] = useState<number | null>(null);

  useEffect(() => {
    if (!choice) {
      return;
    }

    const chosenPrompt = AnswerAndData.filter((el) => el.id === choice);
    if (!chosenPrompt) return;

    const user_id = uuid();
    const ai_id = uuid();

    dispatch(
      UpdateChats({
        id: user_id,
        sent_at: currentTime,
        sent_by: "You",
        message: {
          isComplete: true,
          content: chosenPrompt[0].prompt,
        },
      })
    );

    dispatch(
      UpdateChats({
        id: ai_id,
        sent_at: currentTime,
        sent_by: "AntiNode",
        message: {
          isComplete: false,
          content: "",
        },
      })
    );

    let i = 0;

    const interval = setInterval(() => {
      dispatch(
        setWebStatus({
          message: "processing_links",
          data: [chosenPrompt[0].Links[i]],
        })
      );
      // console.log(web_search_status);
      i++;
      if (i === chosenPrompt[0].Links.length) {
        dispatch(
          MimicSSE({
            id: ai_id,
            delta: chosenPrompt[0].markdown,
          })
        );
        clearInterval(interval);
      }
    }, 2000);

    // return () => clearInterval(interval);
  }, [choice]);

  return (
    <section
      role="region"
      aria-label="Welcome to Antinode"
      onClick={() => isActive && setIsActive(false)}
      className="mx-auto w-full max-w-2xl px-6 pt-10 pb-16 flex flex-col gap-8 space-grotesk"
    >
      {/* Header: logo + status */}
      <header className="flex items-center gap-4">
        <div className="h-10 w-10 flex items-center justify-center rounded-md border border-zinc-700/30 dark:border-zinc-200/10 font-mono text-xs">
          AN
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-mono uppercase tracking-wide text-zinc-500">
            Antinode
          </span>
          <span className="text-xs text-zinc-400">
            Your research and analysis partner
          </span>
        </div>
      </header>

      {/* Core prompt */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl md:text-4xl font-semibold leading-tight bai-jamjuree-bold">
          What are we{" "}
          <AnimatePresence mode="wait">
            <motion.span
              key={text}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-sky-500"
            >
              {text}
            </motion.span>
          </AnimatePresence>{" "}
          today?
        </h1>

        <p className="text-sm text-zinc-500 max-w-prose">
          Paste a URL or enter a research query. Antinode retrieves sources,
          traces, and synthesis across surface and deep web layers.
        </p>
      </div>

      {/* Primary action */}
      <div className="flex gap-2 w-full flex-col items-normal justify-center  ">
        <section>
          <h1 className="bai-jamjuree-semibold text-xl">
            Not sure where to start?
          </h1>
          <span className="text-gray-600 dark:text-gray-400 bai-jamjuree-regular text-sm">
            Try these
          </span>
        </section>

        <div className="">
          {Prompts.map((e, i) => {
            return (
              <ul
                onClick={() => {
                  dispatch(setQuestion(e.prompt));
                  dispatch(setQueryType("Web Search"));
                  setChoice(e.id);
                  // dispatch(WebSearchHandler(question));
                }}
                className="space-grotesk text-xs md:text-sm text-gray-700 dark:text-gray-300 flex items-center justify-start gap-2 cursor-pointer"
                role="button"
                key={i}
              >
                {e.prompt}
                <ArrowRight color="green" />
              </ul>
            );
          })}
        </div>
      </div>
    </section>
  );
};

import { useMemo } from "react";
import { Streamdown } from "streamdown";
import { useTypewriter } from "../store/hooks";


export const ChatMessage = ({ chat, lastMessageId }: any) => {
  const isStreaming = chat?.sent_by !== "You" && chat.id === lastMessageId && chat.message.isComplete === false;

  // Get the typewriter text
  const streamingText = useTypewriter(chat.message.content, 10);

  // Memoize the content to prevent unnecessary re-parses
  const contentToRender = useMemo(() => {
    return isStreaming ? streamingText : chat.message.content;
  }, [isStreaming, streamingText, chat.message.content]);
  return (
    <div className={``}>



      <Streamdown
        className="bai-jamjuree-regular"
      >
        {contentToRender}
      </Streamdown>
    </div >
  );
};
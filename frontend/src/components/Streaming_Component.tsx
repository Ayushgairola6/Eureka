import { useMemo } from "react";
import { Streamdown } from "streamdown";
import { useTypewriter } from "../store/hooks";

export const ChatMessage = ({ chat, lastMessageId }: any) => {
  const isStreaming = chat?.sent_by !== "You"
    && chat.id === lastMessageId
    && chat.message.isComplete === false;


  const streamingText = useTypewriter(chat.message.content, 10);

  const contentToRender = useMemo(() => {
    return isStreaming ? streamingText : chat.message.content;
  }, [isStreaming, streamingText, chat.message.content]);

  // check if this message has research data


  return (
    <div className="relative">
      <Streamdown className="space-grotesk">{contentToRender}</Streamdown>
    </div>
  );
};
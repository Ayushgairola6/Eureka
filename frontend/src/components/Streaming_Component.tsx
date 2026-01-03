import { Streamdown } from "streamdown";
import { useTypewriter } from "../store/hooks";

export const ChatMessage = ({ chat, lastMessageId }: any) => {
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
    <Streamdown className="space-grotesk">{textToRender}</Streamdown>
    // </div>
  );
};

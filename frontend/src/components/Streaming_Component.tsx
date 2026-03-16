import { useMemo } from "react";
import { Streamdown } from "streamdown";
import { useTypewriter, useAppSelector } from "../store/hooks";

export const ChatMessage = ({ chat, lastMessageId }: any) => {
  const isStreaming = chat?.sent_by !== "You" && chat.id === lastMessageId && chat.message.isComplete === false;
  const { ResearchData } = useAppSelector(s => s.interface)


  async function ShowSourceOnHover() {
    if (!chat) return;
    // check if there are source in the researchData for the current response
    const ReportSource = ResearchData.findIndex((elem) => elem.MessageId === chat.id);

    // if it does not exists return
    if (!ReportSource || ReportSource === -1) return;

    const IncludesInfo = ResearchData[ReportSource].research_data.details.find((res) => {
      res.content.includes(chat.message.content);
    })
    if (IncludesInfo)

      return (<>
        <div className='absolute -bottom-5 left-3 '>
          <h1 className='space-grotesk '>{IncludesInfo?.title || "Source name not included"}</h1>
          <span>score:{IncludesInfo?.score} </span>
          <span>source:{IncludesInfo?.url} </span>
        </div>
      </>)


  }
  // Get the typewriter text
  const streamingText = useTypewriter(chat.message.content, 10);

  // Memoize the content to prevent unnecessary re-parses
  const contentToRender = useMemo(() => {
    return isStreaming ? streamingText : chat.message.content;
  }, [isStreaming, streamingText, chat.message.content]);
  return (
    <div className={`relative`}>

      <ShowSourceOnHover />

      <Streamdown
        className="bai-jamjuree-regular"
      >
        {contentToRender}
      </Streamdown>
    </div >
  );
};
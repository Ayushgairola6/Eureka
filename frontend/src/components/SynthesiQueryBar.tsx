import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { GiArchiveResearch } from "react-icons/gi";
import {
  setSyntheSisQuery,
  GetSynthesizedResult,
} from "../store/chatRoomSlice";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { AddNewMessage, sendMessage } from "../store/websockteSlice";
type prop = {
  room_id: any;
  currentTime: any;
  currentRoom: any;
};

const SynthesisPanel: React.FC<prop> = ({
  room_id,
  currentTime,
  currentRoom,
}) => {
  const dispatch = useAppDispatch();
  const {
    showSyntheSisPanel,
    synthesisQuery,
    RoomSynthesisDocs,
    RoomQueryMode,
    isSynthesizing,
  } = useAppSelector((state) => state.chats);
  const { currentStatus } = useAppSelector((state) => state.socket);
  const { user } = useAppSelector((state) => state.auth);

  //sends a message in the room
  function NotifyRoom() {
    const systemMessage = {
      message_id: uuidv4(),
      sent_at: currentTime,
      sent_by: "SYSTEM",
      message: `${user?.username} has asked to synthesize this request= ${synthesisQuery}`,
      room_id: currentRoom?.room_id,
      users: { username: "SYSTEM" },
    };
    // setShowDocsPanel(!showDocsPanel);
    dispatch(sendMessage(systemMessage));
  }

  //perform synthesis
  function HandleSyntheSisQuery() {
    if (
      RoomQueryMode === "Synthesis" &&
      // RoomSynthesisDocs.length > 0 &&
      synthesisQuery !== ""
    ) {
      //unsique message Id
      const MessageId = uuidv4();

      const information = {
        question: synthesisQuery,
        documents: RoomSynthesisDocs,
        room_id: room_id,
        user_id: user?.id,
        MessageId: MessageId,
      };

      //first notify everyone in the room
      NotifyRoom();

      dispatch(GetSynthesizedResult(information))
        .unwrap()
        .then((res) => {
          if (res.Answer) {
            dispatch(
              AddNewMessage({
                message_id: MessageId,
                sent_at: currentTime,
                sent_by: null,
                message: res.Answer,
                room_id: currentRoom?.room_id,
                users: { username: "AntiNode" },
              })
            );
          }
        })
        .catch((error) => toast.error(error))
        .finally();
    }
  }

  return (
    <>
      {showSyntheSisPanel && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 border-b border-gray-200 dark:border-gray-700 bai-jamjuree-regular mt-1 ">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-start bai-jamjuree-semibold text-md  text-red-400 mb-2">
              Get synthesized result
            </h1>
            <div className="flex items-center gap-2">
              <GiArchiveResearch className="text-gray-300" />
              <input
                type="text"
                value={synthesisQuery}
                onChange={(e) => dispatch(setSyntheSisQuery(e.target.value))}
                placeholder={`Analyze the selected documents and make a sales plan as per latest market trends in the clothing market..`}
                className="flex-1 bg-transparent border-none focus:outline-none"
              // onKeyUp={(e) => e.key === "Enter" && handleRoomWebSearch()}
              />
              <button
                onClick={HandleSyntheSisQuery}
                disabled={isSynthesizing === true}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                {isSynthesizing ? currentStatus : "Process"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SynthesisPanel;

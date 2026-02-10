import React, { type SetStateAction } from "react";
import { GiArchiveResearch } from "react-icons/gi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setRoomQueryMode } from "../store/chatRoomSlice";
import { sendMessage, SetChatRoomFile } from "../store/websockteSlice";
import { v4 as uuidv4 } from "uuid";

//props for the component
type Props = {
  showDocsPanel: boolean;
  setShowDocsPanel: React.Dispatch<SetStateAction<boolean>>;
  currentTime: any;
  currentRoom: any;
};
const SynthesisMode: React.FC<Props> = ({
  showDocsPanel,
  setShowDocsPanel,
  currentTime,
  currentRoom,
}) => {
  const { chatRoomFile } = useAppSelector((state) => state.socket);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  ///sends a notifier message in the rooom for users actions
  function HandleSynthsisEvent() {
    const systemMessage = {
      message_id: uuidv4(),
      sent_at: currentTime,
      sent_by: "SYSTEM",
      message: `${user?.username} is choosing documents for synthesis`,
      room_id: currentRoom?.room_id,
      users: { username: "SYSTEM" },
    };
    // setShowDocsPanel(!showDocsPanel);
    dispatch(sendMessage(systemMessage));
  }
  return (
    <>
      <button
        onClick={() => {
          setShowDocsPanel(!showDocsPanel);
          dispatch(setRoomQueryMode("Synthesis"));
          if (chatRoomFile !== null) {
            dispatch(SetChatRoomFile(null));
          } //toggle document panel
          HandleSynthsisEvent();
        }}
        className="group realtive bg-black text-white dark:bg-white dark:text-black rounded-full p-1.5 relative"
      >
        <label
          className="group-hover:block hidden  bg-gray-800 text-gray-50 dark:bg-gray-100 dark:text-gray-800 py-1 px-2 rounded-sm absolute bottom-9 left-2 text-xs space-grotesk font-semibold"
          htmlFor="mode"
        >
          Synthesis Mode
        </label>
        <GiArchiveResearch />
      </button>
    </>
  );
};

export default SynthesisMode;

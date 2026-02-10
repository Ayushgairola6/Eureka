import { type FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { FiFileText } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { MdQuestionAnswer } from "react-icons/md";
import { GiArchiveResearch } from "react-icons/gi";
import { setRoomSynthesisDocs, setRoomQueryMode } from "../store/chatRoomSlice";
import { SetChatRoomFile } from "../store/websockteSlice";

type PanelProps = {
  showDocsPanel: boolean;
  setShowDocsPanel: any;
  handleSelectDoc: any;
};

const DocumentPanel: FC<PanelProps> = ({
  showDocsPanel,
  setShowDocsPanel,
  handleSelectDoc,
}) => {
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { chatRoomFile } = useAppSelector((state) => state.socket);
  const { RoomQueryMode, RoomSynthesisDocs } = useAppSelector(
    (state) => state.chats
  );

  return (
    <>
      <AnimatePresence>
        {showDocsPanel && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-0 z-50 bg-gray-50  dark:bg-black lg:relative lg:w-150 lg:border-l lg:border-gray-200 dark:lg:border-gray-700 overflow-y-auto bai-jamjuree-regular"
          >
            <div className="p-4">
              {/* header */}
              <div className="flex justify-between items-center mb-4 border-b pb-4 dark:border-gray-800">
                {/* Left: Title */}
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg whitespace-nowrap">
                    My Docs
                  </h3>

                  {/* Mobile Only: Tiny Badge showing current mode */}
                  <span className="md:hidden text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                    {RoomQueryMode}
                  </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                  {/* Desktop/Tablet: Full Buttons */}
                  <section className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                    {["WebSearch", "Synthesis", "Basic"].map((li) => (
                      <button
                        key={li}
                        onClick={() => dispatch(setRoomQueryMode(li))}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          RoomQueryMode === li
                            ? "bg-white text-black shadow-sm"
                            : "text-gray-500"
                        }`}
                      >
                        {li}
                      </button>
                    ))}
                  </section>

                  {/* Mobile: Simple Select Dropdown (Native feel) */}
                  <div className="md:hidden relative">
                    <select
                      value={RoomQueryMode}
                      onChange={(e) => {
                        dispatch(setRoomQueryMode(e.target.value));
                        dispatch(SetChatRoomFile(null));
                      }}
                      className="appearance-none bg-gray-100 dark:bg-gray-800 text-xs py-1 pl-2 pr-6 rounded-md focus:outline-none"
                    >
                      <option value="WebSearch">WebSearch</option>
                      <option value="Synthesis">Synthesis</option>
                      <option value="Basic">Basic</option>
                    </select>
                    {/* Tiny arrow pointer for the select */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-500">
                      <svg className="fill-current h-3 w-3" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDocsPanel(false)}
                    className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-1 transition"
                  >
                    <IoMdClose size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {user?.Contributions_user_id_fkey ? (
                  user?.Contributions_user_id_fkey.map((doc: any) => (
                    <motion.div
                      key={doc.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        onClick={() => {
                          //if the mode is not synthsis select single file
                          if (RoomQueryMode !== "Synthesis") {
                            handleSelectDoc(doc);
                            return;
                          }
                          // console.log(doc);
                          /// add room_doc_id to array
                          dispatch(setRoomSynthesisDocs(doc.document_id));
                        }}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          chatRoomFile?.id === doc.id
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <div className="flex items-center">
                          <FiFileText className="mr-2 text-gray-500" />
                          <span className="truncate">{doc.feedback}</span>
                        </div>
                      </div>
                      {/* if the room file is this and query type is not synthesis */}
                      {chatRoomFile?.id === doc.id &&
                        RoomQueryMode !== "Synthesis" && (
                          <label className="dark:bg-white dark:text-black bg-black text-white rounded-sm text-xs space-grotesk  py-1 px-2 flex items-center justify-start gap-2 w-fit">
                            Ready for Qna <MdQuestionAnswer />
                          </label>
                        )}
                      {/* show a label if the query type is synthesis and file is selected for synthesis */}
                      {RoomSynthesisDocs.includes(doc.document_id) &&
                        RoomQueryMode == "Synthesis" && (
                          <label className=" bg-blue-600 text-white rounded-sm text-xs space-grotesk  py-1 px-2 flex items-center justify-start gap-2 w-fit">
                            Selected for synthesis <GiArchiveResearch />
                          </label>
                        )}
                    </motion.div>
                  ))
                ) : (
                  <div>
                    <h1>You do not have any documents</h1>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DocumentPanel;

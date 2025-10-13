import { type FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { FiFileText } from "react-icons/fi";
import { useAppSelector } from "../store/hooks";

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
  const { user } = useAppSelector((state) => state.auth);
  const { chatRoomFile } = useAppSelector((state) => state.socket);

  return (
    <>
      <AnimatePresence>
        {showDocsPanel && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-0 z-50 bg-white dark:bg-gray-800 lg:relative lg:w-72 lg:border-l lg:border-gray-200 dark:lg:border-gray-700 overflow-y-auto bai-jamjuree-regular"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">My Documents</h3>
                <button
                  onClick={() => setShowDocsPanel(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                >
                  <IoMdClose size={24} />
                </button>
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
                        onClick={() => handleSelectDoc(doc)}
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

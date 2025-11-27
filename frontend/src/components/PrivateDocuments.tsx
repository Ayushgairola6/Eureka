import { useAppSelector, useAppDispatch } from "../store/hooks.tsx";
import { setNeedToRefresh, setShowDocs } from "../store/InterfaceSlice.ts";
import { FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import { FiFile } from "react-icons/fi";
import ConfirmationBox from "@/components/ConfirmationBox.tsx";
import { useState } from "react";
import { BiRefresh } from "react-icons/bi";
import { GetUserDashboardData } from "../store/AuthSlice.ts";
type PrivateDocProps = {
  selectedDoc: string;
  setSelectedDoc: any;
};

const PrivateDocuments: React.FC<PrivateDocProps> = ({
  selectedDoc,
  setSelectedDoc,
}) => {
  const dispatch = useAppDispatch();
  const { showDocs, NeedToRefresh } = useAppSelector(
    (state) => state.interface
  );
  const User = useAppSelector((state) => state?.auth.user);
  const [ShowBox, setShowBox] = useState(false);
  const [DocToDel, setDocToDel] = useState<string>("");
  return (
    <div
      className={`fixed border h-full max-h-screen overflow-y-auto w-full md:w-1/2  p-4 top-10 left-0 z-[5] space-grotesk 
              bg-gray-100 dark:bg-black shadow-lg
              transition-all duration-500 ease-in-out 
              ${
                showDocs
                  ? "translate-x-0"
                  : "-translate-x-full md:-translate-x-[120%]"
              }`}
    >
      {/* Close button */}

      {/* Documents container */}
      <div className="h-full overflow-y-auto pb-16">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white px-2">
          My Documents
        </h2>

        {User && User?.Contributions_user_id_fkey.length > 0 ? (
          <div className="grid grid-cols-1  gap-3 p-2">
            {User?.Contributions_user_id_fkey.map((doc: any) => (
              <motion.div
                key={doc.id}
                onClick={() => {
                  dispatch(
                    setSelectedDoc(
                      selectedDoc === doc.document_id ? "" : doc.document_id
                    )
                  );

                  // dispatch(setShowDocs(!showDocs));
                }}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${
                        selectedDoc === doc.document_id
                          ? "border-green-400 bg-green-100 dark:bg-white/5 shadow-md"
                          : "border-gray-400 dark:border-gray-600 bg-white dark:bg-white/10 hover:border-amber-300"
                      }
                      hover:scale-[1.02] active:scale-[0.98]`}
                whileHover={{ y: -2 }}
              >
                <h3 className="font-bold text-gray-800 dark:text-white truncate">
                  {doc.feedback || "Untitled Document"}
                </h3>

                <div className="mt-2 text-xs text-gray-600 dark:text-green-300">
                  <p>ID: {doc.document_id}</p>
                </div>
                <p className="mt-2 text-xs text-gray-600 dark:text-red-300">
                  Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                </p>
                <section className="flex items-center justify-end">
                  <button
                    onClick={() => {
                      setShowBox(!ShowBox);
                      setDocToDel(doc.document_id);
                    }}
                    className="mt-2 text-xs text-red-600 bg-red-600/10 border border-red-600 px-2 py-1 rounded-md bai-jamjuree-semibold "
                  >
                    Delete
                  </button>
                </section>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FiFile className="text-gray-500 dark:text-gray-300 text-4xl mb-2" />
            <p className="text-gray-600 dark:text-gray-300">
              No documents found
            </p>
            <span className="text-sm bai-jamjuree-regular text-red-600">
              * Click on contributions button to upload your first file {":)"}
            </span>
          </div>
        )}
      </div>
      <ConfirmationBox
        setDocToDel={setDocToDel}
        DocToDel={DocToDel}
        ShowBox={ShowBox}
        setShowBox={setShowBox}
      />
      {/* refreshButton */}
      <div className="fixed top-5 right-8  flex items-center justify-center gap-2">
        {NeedToRefresh === true && (
          <motion.button
            onClick={() =>
              dispatch(GetUserDashboardData())
                .unwrap()
                .then((res) => {
                  if (res) {
                    dispatch(setNeedToRefresh(false));
                  }
                })
            }
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-sm bg-gray-400/20 dark:bg-gray-100/20 rounded-md p-1 cursor-pointer"
          >
            <BiRefresh size={18} />
          </motion.button>
        )}
        <motion.button
          onClick={() => dispatch(setShowDocs(!showDocs))}
          className={` cursor-pointer p-2 rounded-full 
               bg-gray-400/20 dark:bg-gray-100/20 hover:bg-gray-300 dark:hover:bg-gray-600
               transition-all duration-300 ${
                 showDocs ? "rotate-0" : "rotate-180"
               }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowLeft className="text-gray-700 dark:text-gray-200" size={12} />
        </motion.button>
      </div>
    </div>
  );
};

export default PrivateDocuments;

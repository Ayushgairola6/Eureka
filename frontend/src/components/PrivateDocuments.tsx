
import { useAppSelector } from "../store/hooks.tsx";
import { FaArrowLeft } from "react-icons/fa";
import { motion } from 'framer-motion'
import { FiFile } from "react-icons/fi";
type PrivateDocProps = {
    showDocs: boolean
    setShowDocs: React.Dispatch<React.SetStateAction<boolean>>
    selectedDoc: string
    setSelectedDoc: React.Dispatch<React.SetStateAction<string>>
}

const PrivateDocuments: React.FC<PrivateDocProps> = ({ showDocs, setShowDocs, selectedDoc, setSelectedDoc }) => {
    // ${showDocs ? "h-full w-full opacity-100" : "h-0 w-0 opacity-0 overflow-hidden"
    //             }
    const privateDocs = useAppSelector((state) => state.auth.documents)
    return (
        <div
            className={`absolute h-full w-full md:w-1/2 lg:w-1/3 p-4 top-0 left-0 z-[100] space-grotesk 
              bg-gray-100 dark:bg-black shadow-lg
              transition-all duration-500 ease-in-out 
              ${showDocs ? "translate-x-0" : "-translate-x-full md:-translate-x-[120%]"}`}
        >
            {/* Close button */}
            <motion.button
                onClick={() => setShowDocs(!showDocs)}
                className={`absolute top-4 right-4 z-10 p-2 rounded-full 
               bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
               transition-all duration-300 ${showDocs ? "rotate-0" : "rotate-180"}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <FaArrowLeft className="text-gray-700 dark:text-gray-200" size={20} />
            </motion.button>

            {/* Documents container */}
            <div className="h-full overflow-y-auto pb-16">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white px-2">
                    My Documents
                </h2>

                {privateDocs && privateDocs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2">
                        {privateDocs.map((doc) => (
                            <motion.div
                                key={doc.document_id}
                                onClick={() => setSelectedDoc(selectedDoc === doc.document_id ? "" : doc.document_id)}
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${selectedDoc === doc.document_id
                                        ? "border-green-400 bg-green-100 dark:bg-white/10 shadow-md"
                                        : "border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 hover:shadow-sm"}
                      hover:scale-[1.02] active:scale-[0.98]`}
                                whileHover={{ y: -2 }}
                            >
                                <h3 className="font-bold text-gray-800 dark:text-white truncate">
                                    {doc.feedback || "Untitled Document"}
                                </h3>
                                
                                <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                                    <p>ID: {doc.document_id}</p>
                                    <p>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <FiFile className="text-gray-400 dark:text-gray-500 text-4xl mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No documents found</p>
                        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                            Upload Document
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PrivateDocuments;
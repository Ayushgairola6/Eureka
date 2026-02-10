import { useAppSelector, useAppDispatch } from "../store/hooks.tsx";
import {
  EmptyTheSynthesisArray,
  setNeedToRefresh,
  setShowDocs,
  SetSynthesisDocuments,
} from "../store/InterfaceSlice.ts";
import { FaSearch, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FiFile } from "react-icons/fi";
import ConfirmationBox from "@/components/ConfirmationBox.tsx";
import { useState, useMemo } from "react";
import { BiCopy, BiPlus, BiRefresh, BiSortAlt2 } from "react-icons/bi";
import { GetUserDashboardData } from "../store/AuthSlice.ts";
import { toast } from "sonner";

type PrivateDocProps = {
  selectedDoc: string;
  setSelectedDoc: any;
};

type SortOption = "date-desc" | "date-asc" | "name-asc" | "name-desc";

const PrivateDocuments: React.FC<PrivateDocProps> = ({
  selectedDoc,
  setSelectedDoc,
}) => {
  const dispatch = useAppDispatch();
  const { showDocs, NeedToRefresh, queryType, SynthesisDocuments } =
    useAppSelector((state) => state.interface);
  const User = useAppSelector((state) => state?.auth.user);

  // Enhanced state management
  const [ShowBox, setShowBox] = useState(false);
  const [DocToDel, setDocToDel] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [showFilters, setShowFilters] = useState(false);

  // Filtered and sorted documents
  const processedDocs = useMemo(() => {
    if (!User?.Contributions_user_id_fkey) return [];

    let docs = [...User.Contributions_user_id_fkey];

    // Apply search filter
    if (searchQuery.trim()) {
      docs = docs.filter((doc: any) =>
        (doc.feedback || "Untitled Document")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        doc.document_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    docs.sort((a: any, b: any) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "date-asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name-asc":
          return (a.feedback || "Untitled").localeCompare(b.feedback || "Untitled");
        case "name-desc":
          return (b.feedback || "Untitled").localeCompare(a.feedback || "Untitled");
        default:
          return 0;
      }
    });

    return docs;
  }, [User?.Contributions_user_id_fkey, searchQuery, sortBy]);

  const handleDocumentSelect = (doc: any) => {
    if (queryType === "Synthesis") {
      dispatch(SetSynthesisDocuments(doc.document_id));
    } else {
      if (SynthesisDocuments?.length > 0) {
        dispatch(EmptyTheSynthesisArray());
      }
      dispatch(
        setSelectedDoc(
          selectedDoc === doc.document_id ? "" : doc.document_id
        )
      );
    }
  };

  const handleCopyFilename = async (feedback: string) => {
    if (feedback) {
      await navigator.clipboard.writeText(feedback);
      toast.success("Filename copied to clipboard");
    }
  };

  const handleRefresh = () => {
    dispatch(GetUserDashboardData())
      .unwrap()
      .then((res) => {
        if (res) {
          dispatch(setNeedToRefresh(false));
          toast.success("Documents refreshed");
        }
      })
      .catch(() => {
        toast.error("Failed to refresh documents");
      });
  };

  return (
    <>
      <div
        className={`fixed border h-full max-h-screen w-full md:w-1/2 lg:w-2/5 xl:w-1/3 top-14 left-0 z-[3] space-grotesk 
              bg-gray-50 dark:bg-neutral-950 shadow-2xl
              transition-all duration-500 ease-in-out 
              ${showDocs
            ? "translate-x-0"
            : "-translate-x-full md:-translate-x-[120%]"
          }`}
      >
        {/* Header Section */}
        <div className="sticky top-0 z-10 bg-gray-50 dark:bg-neutral-950 border-b border-gray-200 dark:border-neutral-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
              My Documents
            </h2>
            <div className="flex items-center gap-2">
              {NeedToRefresh && (
                <motion.button
                  onClick={handleRefresh}
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                  title="Refresh documents"
                >
                  <BiRefresh size={18} />
                </motion.button>
              )}
              <motion.button
                onClick={() => dispatch(setShowDocs(false))}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Close sidebar"
              >
                <FaTimes className="text-gray-700 dark:text-gray-200" size={14} />
              </motion.button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                       placeholder:text-gray-400 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FaTimes size={12} />
              </button>
            )}
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors
                ${showFilters
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                } hover:opacity-80`}
            >
              <BiSortAlt2 size={16} />
              <span>Sort</span>
            </button>

            {/* Document Count */}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {processedDocs.length} document{processedDocs.length !== 1 ? 's' : ''}
              {SynthesisDocuments.length > 0 && (
                <span className="ml-2 text-indigo-600 dark:text-indigo-400">
                  ({SynthesisDocuments.length} selected)
                </span>
              )}
            </span>
          </div>

          {/* Sort Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {[
                    { value: "date-desc", label: "Newest First" },
                    { value: "date-asc", label: "Oldest First" },
                    { value: "name-asc", label: "Name A-Z" },
                    { value: "name-desc", label: "Name Z-A" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as SortOption)}
                      className={`px-3 py-2 rounded-lg text-xs transition-colors
                        ${sortBy === option.value
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Documents List */}
        <div className="h-[calc(100vh-220px)] overflow-y-auto p-4">
          {processedDocs.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode="popLayout">
                {processedDocs.map((doc: any) => (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${selectedDoc === doc.document_id
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20 shadow-lg shadow-green-500/10"
                        : SynthesisDocuments.includes(doc.document_id)
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-500/10"
                          : "border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-900 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md"
                      }
                      hover:scale-[1.01] active:scale-[0.99] relative group`}
                    whileHover={{ y: -2 }}
                  >
                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <motion.button
                        onClick={() => handleCopyFilename(doc.feedback)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 rounded-lg bg-neutral-900 dark:bg-gray-100 text-white dark:text-gray-900 
                                  hover:bg-gray-900 dark:hover:bg-gray-200"
                        title="Copy filename"
                      >
                        <BiCopy size={14} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDocumentSelect(doc)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 rounded-lg bg-neutral-900 dark:bg-gray-100 text-white dark:text-gray-900 
                                  hover:bg-gray-900 dark:hover:bg-gray-200"
                        title={queryType === "Synthesis" ? "Add to synthesis" : "Select document"}
                      >
                        <BiPlus size={14} />
                      </motion.button>
                    </div>

                    {/* Document Info */}
                    <h3 className="font-bold text-gray-800 dark:text-white truncate pr-20 mb-2">
                      {doc.feedback || "Untitled Document"}
                    </h3>

                    <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <p className="truncate">ID: {doc.document_id}</p>
                      <p>Uploaded: {new Date(doc.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <motion.button
                        onClick={() => {
                          setShowBox(true);
                          setDocToDel(doc.document_id);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs font-semibold text-red-600 dark:text-red-400 
                                 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 
                                 px-3 py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                      >
                        Delete
                      </motion.button>

                      {/* Status Badges */}
                      <div className="flex gap-2">
                        {SynthesisDocuments.includes(doc.document_id) && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full
                                       bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 
                                       border border-indigo-200 dark:border-indigo-800">
                            Synthesis
                          </span>
                        )}
                        {selectedDoc === doc.document_id && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full
                                       bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300
                                       border border-green-200 dark:border-green-800">
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : User?.Contributions_user_id_fkey && User?.Contributions_user_id_fkey?.length > 0 ? (
            // No search results
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FaSearch className="text-gray-400 dark:text-gray-500 text-4xl mb-3" />
              <p className="text-gray-600 dark:text-gray-300 font-semibold">
                No documents found
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Clear Search
              </button>
            </div>
          ) : (
            // No documents at all
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <FiFile className="text-gray-400 dark:text-gray-500 text-5xl mb-3" />
              <p className="text-gray-700 dark:text-gray-200 font-semibold text-lg">
                No documents yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">
                Click the contributions button to upload your first document and get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationBox
        setDocToDel={setDocToDel}
        DocToDel={DocToDel}
        ShowBox={ShowBox}
        setShowBox={setShowBox}
      />
    </>
  );
};

export default PrivateDocuments;
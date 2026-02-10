import React, { useState } from "react";
import { FaRegFile, FaEye, FaCloudUploadAlt, FaLock } from "react-icons/fa";
import { FaCircleNodes } from "react-icons/fa6";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  setCategory,
  setShowUserForm,
  setSubCategory,
  setVisibility,
} from "../../store/InterfaceSlice";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { Categories, SubCategories } from "../../../utlis/Info.ts";
import { BiDetail, BiHourglass, BiSearch, BiUpload } from "react-icons/bi";
import { FiChevronRight, FiCpu } from "react-icons/fi";
import { LuFileCode, LuX } from "react-icons/lu";
// declaring props type
type FormProps = {
  setSelectedFile?: React.Dispatch<React.SetStateAction<File | null>>;
  selectedFile?: File | null;
  handleUpload?: (UserData: FormData) => void;
};

const UserForm: React.FC<FormProps> = ({
  setSelectedFile,
  handleUpload,
  selectedFile,
}) => {
  const [searchResult, SetSearchResult] = useState<any>([]);
  const dispatch = useAppDispatch();
  const { uploadStatus } = useAppSelector((state) => state.interface);
  //   drag and drop feature
  const isSupportedFormat = (filename: any) => {
    const supportedFormats = [
      ".pdf",
      ".docx",
      ".txt",
      ".md",
      ".json",
      ".csv",
      ".pptx",
    ];
    return supportedFormats.some((format) =>
      filename.toLowerCase().endsWith(format)
    );
  };

  const {
    shhowUserForm,
    // loading,
    category,
    subCategory,
    uploading,
    visibility,
  } = useAppSelector((state) => state.interface);
  const [feedback, setFeedback] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");

  // top-10 right-2  md:right-50
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSearchResults(e: any) {
    if (e && e.target.value) {
      const inputValue = e.target.value.toLowerCase().trim();

      // Clear previous results
      SetSearchResult([]);

      // Find matching categories and subcategories
      const matches = SubCategories.flatMap((category) => {
        const categoryMatches = [];

        // Check category name
        if (category.parent.toLowerCase().includes(inputValue)) {
          categoryMatches.push({
            type: "category",
            name: category.parent,
            data: category,
          });
        }

        // Check subcategories
        const subMatches = category.subcategories
          .filter((sub) => sub.toLowerCase().includes(inputValue))
          .map((sub) => ({
            type: "subcategory",
            name: sub,
            parent: category.parent,
            data: category,
          }));

        return [...categoryMatches, ...subMatches];
      });

      SetSearchResult(matches);
    } else {
      // Clear results if input is empty
      SetSearchResult([]);
    }
  }

  function SetValues(val: string) {
    const isCategory = Categories.some((cat) => cat.name === val);
    if (isCategory) {
      dispatch(setCategory(val)); //if category update instantly
    } else {
      dispatch(setSubCategory(val)); //first update the subcategory
      const category = SubCategories.find((e) =>
        e.subcategories.find((elm) => elm === val)
      );

      // console.log(category?.parent);
      dispatch(setCategory(category?.parent));
    }
  }

  // Helper to determine file icon
  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith("pdf")) return <FaRegFile className="text-red-500" />;
    if (fileName.endsWith("json") || fileName.endsWith("csv"))
      return <LuFileCode className="text-yellow-500" />;
    return <FaRegFile className="text-blue-500" />;
  };
  return (
    <>
      <div
        className={`fixed inset-0 bg-neutral-950/60 backdrop-blur-xs z-[2] transition-opacity duration-200 top-30 ${shhowUserForm
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none "
          }flex items-center justify-center  overflow-y-auto`}
      >

        {/* Main Panel */}
        <div
          className={`mx-auto  w-full md:w-[900px]   z-[3]  bg-white dark:bg-[#0a0a0a] border-l border-neutral-200 dark:border-neutral-800 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col font-sans ${shhowUserForm ? "translate-y-0" : "translate-y-full"
            }`}
        >
          {/* --- Header: Sharp & Technical --- */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-100 dark:bg-neutral-900 rounded-sm border border-neutral-200 dark:border-neutral-800">
                <FiCpu className="text-black dark:text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider bai-jamjuree-semibold text-neutral-900 dark:text-white">
                  Ingest Resource
                </h2>
                <p className="text-[10px] text-neutral-500 space-grotesk uppercase tracking-widest">
                  Research Agent / Knowledge Base
                </p>
              </div>
            </div>
            <button
              onClick={() => dispatch(setShowUserForm(false))}
              className="text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <LuX size={20} />
            </button>
          </div>

          {/* --- Scrollable Content --- */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent p-6 space-y-8">
            {/* 1. Meta Data Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.5 space-grotesk">
                  01
                </span>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide bai-jamjuree-semibold">
                  Metadata
                </span>
              </div>

              <div className="grid gap-4">
                <div className="group relative">
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase mb-1  space-grotesk flex items-center gap-1">
                    <FaCircleNodes size={10} /> File Identifier
                  </label>
                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="enter_file_name_v1"
                    className="w-full bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-300 dark:border-neutral-700 text-sm px-3 py-2 space-grotesk text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600/20 transition-all rounded-sm placeholder:text-neutral-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase mb-1  space-grotesk flex items-center gap-1">
                    <BiDetail size={12} /> Synopsis
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="> Brief description for vectorization context..."
                    rows={3}
                    className="w-full bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-300 dark:border-neutral-700 text-sm px-3 py-2 space-grotesk text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600/20 transition-all rounded-sm resize-none placeholder:text-neutral-600"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1 text-right space-grotesk">
                    Markdown supported
                  </p>
                </div>
              </div>
            </section>

            <hr className="border-neutral-200 dark:border-neutral-800 border-dashed" />

            {/* 2. Taxonomy Section */}
            <section className="space-y-4 relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.5 space-grotesk">
                  02
                </span>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide bai-jamjuree-semibold">
                  Taxonomy
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <BiSearch className="text-neutral-500" />
                </div>
                <input
                  onChange={handleSearchResults}
                  type="text"
                  placeholder="Search domain ontology..."
                  className="w-full pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-sm text-xs space-grotesk focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-neutral-900 dark:text-white"
                />

                {/* Search Results Popover */}
                {searchResult.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 shadow-xl z-50 max-h-48 overflow-y-auto scrollbar-thin">
                    {searchResult.map((res: any, index: number) => (
                      <button
                        key={index}
                        className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-neutral-100 dark:hover:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 last:border-0 flex items-center gap-2 text-neutral-700 dark:text-neutral-300"
                        onClick={() => {
                          SetValues(res.name);
                          SetSearchResult([]);
                        }}
                      >
                        <span className="text-blue-500">
                          {res.type === "category" ? ">" : "#"}
                        </span>
                        {res.name}
                        {res.type === "subcategory" && (
                          <span className="opacity-50 ml-auto text-[10px]">
                            [{res.parent}]
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Domains Grid - Compact & Dense */}
              <div>
                <label className="text-[10px] font-semibold text-neutral-500 uppercase mb-2 block space-grotesk">
                  Select Domain
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto scrollbar-thin pr-1">
                  {Categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => dispatch(setCategory(cat.name))}
                      className={`px-3 py-1 text-[11px] border rounded-sm transition-all space-grotesk ${category === cat.name
                        ? "bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-900 dark:border-white font-bold"
                        : "bg-white dark:bg-black text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700 hover:border-neutral-500 dark:hover:border-neutral-500"
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategories - Horizontal Strip */}
              <AnimatePresence>
                {category && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FiChevronRight className="text-neutral-500 text-xs" />
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase space-grotesk">
                        {category} Sub-Nodes
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 bg-neutral-50 dark:bg-neutral-900/30 p-2 border border-neutral-200 dark:border-neutral-800 rounded-sm">
                      {SubCategories.find(
                        (cat) => cat.parent === category
                      )?.subcategories.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => {
                            dispatch(setSubCategory(sub));
                            const category = SubCategories.find((e) =>
                              e.subcategories.find((elm) => elm === sub)
                            );
                            dispatch(setCategory(category?.parent));
                          }}
                          className={`px-2 py-0.5 text-[10px] uppercase tracking-wide border rounded-sm ${subCategory === sub
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-transparent border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300"
                            }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <hr className="border-neutral-200 dark:border-neutral-800 border-dashed" />

            {/* 3. Upload & Visibility */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.5 space-grotesk">
                  03
                </span>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide bai-jamjuree-semibold">
                  Source & Scope
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* File Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add(
                      "border-blue-500",
                      "bg-blue-50/10"
                    );
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove(
                      "border-blue-500",
                      "bg-blue-50/10"
                    );
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove(
                      "border-blue-500",
                      "bg-blue-50/10"
                    );
                    const file = e.dataTransfer.files[0];
                    if (file && isSupportedFormat(file.name))
                      setSelectedFile?.(file);
                  }}
                  className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 bg-neutral-50 dark:bg-neutral-900/20 rounded-sm p-6 cursor-pointer transition-all group relative"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt,.md,.json,.csv,.pptx"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setSelectedFile?.(file);
                    }}
                  />

                  {selectedFile ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm">
                          {getFileIcon(selectedFile.name)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-white space-grotesk">
                            {selectedFile.name}
                          </p>
                          <p className="text-[10px] text-neutral-500 font-mono">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (setSelectedFile) {
                            setSelectedFile(null);
                          }
                        }}
                        className="text-xs text-red-500 hover:underline"
                      >
                        [REMOVE]
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FaCloudUploadAlt className="mx-auto text-2xl text-neutral-400 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 bai-jamjuree-semibold">
                        DRAG FILE OR CLICK TO BROWSE
                      </p>
                      <p className="text-[9px] text-neutral-400 mt-1 font-mono">
                        PDF, DOCX, TXT, MD, JSON, CSV
                      </p>
                    </div>
                  )}
                </div>

                {/* Visibility Toggle */}
                <div className="bg-neutral-100 dark:bg-neutral-900 p-1 rounded-sm flex border border-neutral-200 dark:border-neutral-800">
                  {["Public", "Private"].map((option) => (
                    <button
                      key={option}
                      onClick={() => dispatch(setVisibility(option))}
                      className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-sm transition-all space-grotesk ${visibility === option
                        ? "bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700"
                        : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        }`}
                    >
                      {option === "Public" ? (
                        <FaEye size={10} />
                      ) : (
                        <FaLock size={10} />
                      )}
                      {option.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* --- Footer: Action & Status --- */}
          <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0a0a0a]">
            {/* Status Bar */}
            {uploading && (
              <div className="mb-3 flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 px-3 py-2 border-l-2 border-blue-500">
                <BiHourglass className="animate-spin" />
                <span>STATUS: {uploadStatus || "INITIALIZING STREAM..."}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => dispatch(setShowUserForm(false))}
                className="px-4 py-3 text-xs font-bold uppercase tracking-wider bg-transparent border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors w-1/3 rounded-sm space-grotesk"
              >
                Cancel
              </button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={uploading}
                onClick={() => {
                  if (!feedback || !description) {
                    // Assuming you have toast imported
                    toast.error(
                      "MISSING FIELDS: Filename and Description required"
                    );
                    return;
                  }
                  if (!selectedFile) {
                    toast.error("MISSING RESOURCE: No file selected");
                    return;
                  }

                  const UserData = new FormData();
                  UserData.append("feedback", feedback);
                  UserData.append("about", description);
                  // Append other fields if your backend expects them separately or relying on state
                  handleUpload?.(UserData);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow-sm space-grotesk ${uploading
                  ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                  : "bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                  }`}
              >
                {uploading ? (
                  "PROCESSING..."
                ) : (
                  <>
                    <BiUpload size={14} /> INGEST DOCUMENT
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserForm;

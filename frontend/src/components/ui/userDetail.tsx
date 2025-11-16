import React, { useState } from "react";
import { FaRegFile, FaEye, FaCloudUploadAlt } from "react-icons/fa";
import { FaCircleNodes } from "react-icons/fa6";
import { BsStars } from "react-icons/bs";
import { useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  setCategory,
  setShowUserForm,
  setSubCategory,
  setVisibility,
} from "../../store/InterfaceSlice";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { Categories, SubCategories } from "../../../utlis/Info.ts";
import { BiCategory, BiHourglass } from "react-icons/bi";
import { FiChevronDown } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
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
    loading,
    category,
    subCategory,
    uploading,
    visibility,
  } = useAppSelector((state) => state.interface);
  const [feedback, setFeedback] = React.useState<string>("");

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
      dispatch(setCategory(val));
    } else {
      dispatch(setSubCategory(val));
    }
  }
  return (
    <>
      <div
        className={`absolute top-12 left-0 ${
          shhowUserForm === true ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-[1] w-full md:w-[600px] p-4 max-h-screen`}
      >
        <button
          onClick={() => dispatch(setShowUserForm(false))}
          className="absolute top-8 right-8 dark:bg-white bg-black dark:text-black text-white p-1 rounded-full cursor-pointer"
        >
          <IoClose />
        </button>
        <section
          className={`h-auto  py-4 flex items-center justify-center gap-2 opacity-100   overflow-y-auto px-3 bg-gray-100 text-black dark:bg-black dark:text-white  overflow-hidden transition-all duration-500 rounded-lg     flex-col border border-gray-300 `}
        >
          <div className="flex items-start justify-start gap-3 flex-col  w-full rounded-lg p-2">
            <label
              className="text-sm md:text-md font-semibold flex items-center justify-cente gap-2 bai-jamjuree-semibold"
              htmlFor="Feeback"
            >
              File name <FaCircleNodes />
            </label>
            <textarea
              onChange={(e) => {
                setFeedback(e.target.value);
              }}
              value={feedback}
              className="border text-sm py-1 space-grotesk  border-black dark:border-white rounded-sm px-2 font-normal w-full"
              placeholder="Fifty shades of C++ ... "
              rows={2}
            />
          </div>
          {/* categories */}
          <div className="flex items-start justify-start gap-3 flex-col  w-full rounded-lg p-2">
            {/* domain heading and input */}
            <section className="flex items-center justify-between w-full relative">
              <label
                className="text-sm md:text-md font-semibold flex items-center justify-center gap-2 bai-jamjuree-semibold"
                htmlFor="Feedback"
              >
                Domain <BiCategory />
              </label>
              <div className="relative space-grotesk">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-sky-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <input
                  onChange={handleSearchResults}
                  type="text"
                  placeholder="Search domains..."
                  className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm space-grotesk rounded-xl text-xs px-2 py-1 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-gray-300/50 dark:border-gray-600/50 "
                />

                {/* Results Dropdown */}
                {searchResult.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 z-50">
                    <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {searchResult.map((res: any, index: number) => (
                        <div
                          key={`result-${index}`}
                          className="px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                          onClick={() => {
                            SetValues(res.name);
                            SetSearchResult([]); // Clear results after selection
                          }}
                        >
                          {res.type === "category" ? "📁" : "📄"} {res.name}
                          {res.type === "subcategory" && ` (${res.parent})`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="flex items-center justify-center gap-2 flex-wrap max-h-30 overflow-auto  space-grotesk">
              {Categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => dispatch(setCategory(cat.name))}
                  className="p-2 rounded-lg text-xs flex flex-col items-center gap-1"
                  title={cat.name}
                >
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    {cat.name.slice(0, 2)}
                  </div>
                  <span className="text-[10px] truncate w-full text-center">
                    {cat.name.length > 8
                      ? `${cat.name.slice(0, 8)}...`
                      : cat.name}
                  </span>
                </button>
              ))}
            </section>
          </div>
          {/* subCategories */}
          <div className="flex items-start justify-start gap-3 flex-col  w-full rounded-lg p-2">
            <label
              className="text-sm md:text-md font-semibold flex items-center justify-cente gap-2 bai-jamjuree-semibold "
              htmlFor="Feeback"
            >
              SubDomain <FiChevronDown />
            </label>

            <section className="flex items-center justify-center gap-2 flex-wrap space-grotesk">
              {category && (
                <div className="mt-3">
                  <label className="text-sm font-semibold">
                    Subcategories for {category}
                  </label>
                  <div className="flex flex-wrap gap-1 mt-2 max-h-24 overflow-auto">
                    {SubCategories.find(
                      (cat) => cat.parent === category
                    )?.subcategories.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => dispatch(setSubCategory(sub))}
                        className={`px-2 py-1 text-xs rounded-full border ${
                          subCategory === sub
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-gray-100 dark:bg-gray-800 border"
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
          {/* category and subCategory */}
          <div className="space-y-1 border border-gray-500 rounded-md my-2 w-full p-2">
            {category && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400 bai-jamjuree-regular">
                  Category
                </span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full space-grotesk">
                  {category}
                </span>
              </div>
            )}
            {subCategory && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400 bai-jamjuree-regular">
                  Subcategory
                </span>
                <span className="font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full space-grotesk">
                  {subCategory}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-start justify-start gap-3 flex-col w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-black">
            <label className="flex items-center justify-between w-full font-bold text-sm md:text-md bai-jamjuree-semibold">
              <span>Choose your file</span>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-full dark:bg-gray-300 bg-gray-400 hover:bg-gray-600 transition-all duration-300 cursor-pointer z-[1] text-white dark:text-black hover:scale-110"
              >
                <FaRegFile className="transition-transform duration-300 hover:rotate-12" />
              </div>
            </label>

            {/* File type indicators */}
            <div className="w-full">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Supported formats:
              </p>
              <div className="flex flex-wrap gap-2">
                {["pdf", "docx", "txt", "md", "json", "csv", "pptx"].map(
                  (format) => (
                    <span
                      key={format}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-xs font-medium"
                    >
                      .{format}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Selected file display */}
            {selectedFile && (
              <div className="w-full p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaRegFile className="text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      {selectedFile.name}
                    </span>
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
            )}

            <input
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setSelectedFile?.(file);
              }}
              ref={fileInputRef}
              className="hidden"
              type="file"
              accept=".pdf,.docx,.txt,.md,.json,.csv,.pptx"
            />

            {/* Drag and drop area */}
            <div
              className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-colors duration-300"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("border-blue-400", "bg-blue-50");
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove(
                  "border-blue-400",
                  "bg-blue-50"
                );
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove(
                  "border-blue-400",
                  "bg-blue-50"
                );
                const file = e.dataTransfer.files[0];
                if (file && isSupportedFormat(file.name)) {
                  setSelectedFile?.(file);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <FaCloudUploadAlt className="mx-auto text-3xl text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag and drop your file here or click to browse
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Supports: PDF, DOCX, TXT, MD, JSON, CSV, PPTX
              </p>
            </div>
          </div>
          {/* visibility section */}
          <div className="flex items-start justify-start gap-3 flex-col w-full rounded-lg p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <label className="text-sm font-semibold flex items-center gap-2 bai-jamjuree-semibold text-gray-700 dark:text-gray-300">
              Visibility <FaEye className="text-blue-500" />
            </label>

            <section className="flex items-center gap-4 w-full">
              {/* Public Option */}
              <label className="flex-1 cursor-pointer group">
                <input
                  value="Public"
                  onChange={(e) => dispatch(setVisibility(e.target.value))}
                  name="visibility"
                  type="radio"
                  className="sr-only" // Hide default radio
                />
                <div
                  className={`p-3 rounded-xl border-2 transition-all duration-200 group-hover:scale-105 ${
                    visibility === "Public"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-500/20"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-green-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        visibility === "Public"
                          ? "border-green-500 bg-green-500"
                          : "border-gray-400 dark:border-gray-500 group-hover:border-green-400"
                      }`}
                    >
                      {visibility === "Public" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div>
                      <span
                        className={`font-medium text-sm block ${
                          visibility === "Public"
                            ? "text-green-700 dark:text-green-300"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        Public
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Anyone can access
                      </span>
                    </div>
                  </div>
                </div>
              </label>

              {/* Private Option */}
              <label className="flex-1 cursor-pointer group">
                <input
                  value="Private"
                  onChange={(e) => dispatch(setVisibility(e.target.value))}
                  name="visibility"
                  type="radio"
                  className="sr-only"
                />
                <div
                  className={`p-3 rounded-xl border-2 transition-all duration-200 group-hover:scale-105 ${
                    visibility === "Private"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-blue-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        visibility === "Private"
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-400 dark:border-gray-500 group-hover:border-blue-400"
                      }`}
                    >
                      {visibility === "Private" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div>
                      <span
                        className={`font-medium text-sm block ${
                          visibility === "Private"
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        Private
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Only you can access
                      </span>
                    </div>
                  </div>
                </div>
              </label>
            </section>
          </div>
          <motion.button
            onClick={() => {
              const UserData = new FormData();
              if (!feedback) {
                toast("Please fill in all fields");
                return;
              }

              UserData.append("feedback", feedback);
              handleUpload?.(UserData);
            }}
            disabled={uploading === true}
            whileDrag={{ scale: 2 }}
            whileTap={{ scale: 1.09, boxShadow: "2px 2px 2px gray" }}
            className={` ${
              loading === true ? "bg-green-500 " : "bg-black dark:bg-white"
            } text-white  dark:text-black rounded-xl px-3 py-2  text-sm  cursor-pointer  transition-all duration-300 z-[1] bai-jamjuree-regular flex items-center justify-center gap-2 bai-jamjuree-semibold w-full`}
          >
            {uploading === true ? (
              <>
                Uploading.. <BiHourglass className="animate-spin" />
              </>
            ) : (
              <>
                Upload <BsStars />
              </>
            )}
          </motion.button>
          <button
            onClick={() => dispatch(setShowUserForm(!shhowUserForm))}
            className="dark:bg-white/10 rounded-xl px-3 py-2  text-sm  cursor-pointer  transition-all duration-300 z-[1] bai-jamjuree-regular flex items-center justify-center gap-2 bai-jamjuree-semibold w-full"
          >
            Cancel
          </button>
        </section>
      </div>
    </>
  );
};

export default UserForm;

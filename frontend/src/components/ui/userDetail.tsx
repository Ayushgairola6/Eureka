import React, { useState } from "react";
import {
  FaRegFile,
  FaUserCheck,
  FaEye,
  FaCloudUploadAlt,
} from "react-icons/fa";
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

  const { shhowUserForm, loading, category, subCategory, uploading } =
    useAppSelector((state) => state.interface);
  const [name, SetName] = React.useState<string>("");
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
        className={` absolute top-0 left-0 ${
          shhowUserForm === true ? "-translate-x-0" : "-translate-x-full"
        } transition-all duration-300  z-[1] h-full w-full md:w-[600px] p-4`}
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
          <div className="flex items-start justify-start gap-3 flex-col w-full rounded-lg p-2">
            <label
              className="text-sm md:text-md  flex items-center justify-center gap-2 bai-jamjuree-semibold"
              htmlFor="Name"
            >
              Name <FaUserCheck />
            </label>
            <input
              onChange={(e) => {
                SetName(e.target.value);
              }}
              value={name}
              className=" rounded-sm px-2 py-1 space-grotesk border border-black dark:border-white  font-normal"
              type="text"
              placeholder="Your Name"
            />
          </div>

          <div className="flex items-start justify-start gap-3 flex-col  w-full rounded-lg p-2">
            <label
              className="text-sm md:text-md font-semibold flex items-center justify-cente gap-2 bai-jamjuree-semibold"
              htmlFor="Feeback"
            >
              A Title <FaCircleNodes />
            </label>
            <textarea
              onChange={(e) => {
                setFeedback(e.target.value);
              }}
              value={feedback}
              className="border text-sm py-1 space-grotesk  border-black dark:border-white rounded-sm px-2 font-normal w-full"
              placeholder="Anything related to this document "
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

            <section className="flex items-center justify-center gap-2 flex-wrap">
              {Categories.map((cat, index) => {
                return (
                  <>
                    <ul
                      onClick={() => dispatch(setCategory(cat.name))}
                      className={`px-3 py-1 rounded-xl text-xs space-grotesk transition-all duration-200 border cursor-pointer ${
                        category === cat.name
                          ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-transparent shadow-lg shadow-indigo-500/25"
                          : "bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-800 dark:hover:text-gray-200"
                      } hover:scale-105 active:scale-95 backdrop-blur-sm`}
                      key={`cat=${cat.name}_at_index=${index}`}
                    >
                      <span
                        className={`h-1 w-1 rounded-full ${
                          category === cat.name
                            ? "bg-yellow-600"
                            : "bg-pink-600"
                        }`}
                      ></span>
                      {cat.name}
                    </ul>
                  </>
                );
              })}
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

            <section className="flex items-center justify-center gap-2 flex-wrap">
              {SubCategories.filter((cat) => cat.parent === category).map(
                (cat, index) => (
                  <div
                    key={`subcat-${index}`}
                    className="flex items-center justify-evenly flex-wrap "
                  >
                    {cat?.subcategories?.map((sub, subIndex) => (
                      <label
                        key={`sub-${subIndex}`}
                        className="flex items-center p-2.5 rounded-xl transition-all duration-200 cursor-pointer group hover:bg-gray-50/80 dark:hover:bg-gray-800/80 backdrop-blur-sm"
                      >
                        <div
                          className={`w-2 h-2  rounded-full mr-3 transition-colors ${
                            subCategory === sub
                              ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/25"
                              : "bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-400 dark:group-hover:bg-gray-500"
                          }`}
                        />
                        <span className=" text-sm  bai-jamjuree-regular flex-1 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                          {sub}
                        </span>
                        <input
                          onChange={() => dispatch(setSubCategory(sub))}
                          type="radio"
                          value={sub}
                          name="subcategory"
                          checked={subCategory === sub}
                          className="sr-only"
                        />
                      </label>
                    ))}
                  </div>
                )
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
          <div className="flex items-start justify-start gap-3 flex-col bai-jamjuree-regular  w-full rounded-lg p-2">
            <label
              className="text-sm md:text-md font-semibold flex items-center justify-cente gap-2 bai-jamjuree-semibold"
              htmlFor="Visibility"
            >
              Visibility type <FaEye />
            </label>
            <section className="flex items-center justify-evenly  w-full  text-sm">
              <span className="flex items-center justify-start gap-2 bai-jamjuree-regular">
                <input
                  value="Public"
                  onChange={(e) => dispatch(setVisibility(e.target.value))}
                  name="visibility"
                  type="radio"
                  className="space-grotesk"
                />
                <label htmlFor="visibility ">Public</label>
              </span>
              <span className="flex items-center justify-start gap-2 bai-jamjuree-regular text-sm">
                <input
                  value="Private"
                  onChange={(e) => dispatch(setVisibility(e.target.value))}
                  name="visibility"
                  type="radio"
                />
                <label htmlFor="visibility ">Private</label>
              </span>
            </section>
          </div>
          <motion.button
            onClick={() => {
              const UserData = new FormData();
              if (!name || !feedback) {
                toast("Please fill in all fields");
                return;
              }

              UserData.append("name", name);
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

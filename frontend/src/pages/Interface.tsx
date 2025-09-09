import { useState, lazy } from 'react';
import { Toaster, toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const DropDown = lazy(() => import('../components/dropdown'));
const UserForm = lazy(() => import('../components/ui/userDetail'));
const SubCategories = lazy(() => import('@/components/subcategories.tsx'));
const PrivateDocuments = lazy(() => import("@/components/PrivateDocuments.tsx"));
const QueryType = lazy(() => import("@/components/Query_type.tsx"))
import { motion } from 'framer-motion'
// import axios from 'axios';
import { IoOptions } from 'react-icons/io5';
import MarkdownRenderer from '@/components/safeHtml.tsx';
import { IoDocument } from 'react-icons/io5';
import { FaThumbsDown, FaThumbsUp } from 'react-icons/fa';
import { IoHeartHalfOutline } from "react-icons/io5";
import { BiQuestionMark } from 'react-icons/bi';
import { BsStars } from "react-icons/bs";
import { useAppSelector, useAppDispatch } from '../store/hooks.tsx';
import { SetQueryCount } from '../store/AuthSlice.ts';
import {
  setQuestion, setShowDocs, setShowOptions,
  setShowType, UploadDocuments, QueryAIQuestions,
  QueryPrivateDocuments, AuthenticityResponseHandler,
  setLikeness
} from '../store/InterfaceSlice.ts';
// const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL

function Interface() {
  const dispatch = useAppDispatch();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loggedIn = useAppSelector(state => state.auth.isLoggedIn);
  const [selectedDoc, setSelectedDoc] = useState<string>('');
  // const [docId, setDocId] = useState<Array<{ uploaded_by: string; doc_id: string;[key: string]: any }>>([]);
  const docId = useAppSelector(state => state.interface.docUsed)

  const { answer, question, loading, isVisible, category, suggestion, shhowUserForm, showDocs, showSubcategory, showType, shwoOptions, visibility, subCategory, queryType, likeness, sendingFeedback } = useAppSelector(state => state.interface);

  // uploading a document
  const handleUpload = async (UserData: FormData) => {
    if (!selectedFile || category === " " || !UserData || !visibility || !subCategory) {
      toast.error(!selectedFile ? '❌ Please select a PDF file first.' : "❌ Please select a category first.");
      return;
    }

    if (loggedIn === false) {
      toast.message("We currently only allow verified users to contribute !Please Login to continue .")
      return;
    }

    toast.info(visibility === "Public" ? "Your Chosen Visiblity is Public , now everyone will be able to access the the information you shared !" : "Your Chosen Visibility is Private , this document will be only visible to you in you dashboard !")

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append("category", category);
    formData.append("visibility", visibility);
    formData.append('subCategory', subCategory);
    formData.append("name", UserData.get("name") as string);
    formData.append("feedback", UserData.get("feedback") as string);

    dispatch(UploadDocuments(formData)).unwrap().then((res: any) => {
      if (res.message) {
        toast.message(res.message)
      }
    }).catch(err => toast.error(err.message))
  };



  // Asking question from the AI
  const handleAsk = async () => {
    // const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
    if (selectedDoc || selectedDoc !== "") {
      await QueryPrivateDocument()
      return;
    }

    if (!question.trim() || !category || category === "") {
      toast.message(!question ? '❌ Please enter a question.' : '❌ Please choose a category!');
      return;
    }


    const data = {
      question: question,
      category: category,
      subCategory: subCategory,

    }
    dispatch(QueryAIQuestions(data)).unwrap().then((res) => {
      if (res.message) {
        toast.message(res.message)
        // dispatch(setAnswer(""))
        dispatch(SetQueryCount());
      }
    }).catch(err => toast.error(err.message))

  };

  const QueryPrivateDocument = async () => {
    // try {

    if (!question) {
      toast.info("Question cannot be empty !");
      return;
    }
    if (!selectedDoc) {
      toast.info("Please select a document before querying");
      return;
    }
    if (!queryType) {
      toast.info("Please select a query type");
      return;
    }

    const data = {
      question: question,
      docId: selectedDoc,
      query_type: queryType
    }

    dispatch(QueryPrivateDocuments(data)).unwrap().then((res) => {
      if (res.message) {
        toast.message(res.message)
      }
    }).catch(err => toast.error(err.message))
  }





  // Upvote or downvote the post
  const ResponseAuthenticity_Handler = async () => {
    if (!likeness || likeness === "" || !docId) {
      toast("Some fields are missing !");
      return;
    }

    const data = {
      likeness: likeness,
      suggestions: suggestion,
      docId: docId
    }
    dispatch(AuthenticityResponseHandler(data)).unwrap().catch(err => toast.error(err))
      .then((res: any) => {
        if (res.message) {
          toast.success(res.message)
        }
      })
  }

  return (
    <div className=" mx-auto p-4 md:p-8 min-h-screen   flex flex-col items-center justify-center  dark:bg-black text-gray-900 dark:text-gray-50 z-[1] relative">
      <div className={`absolute top-0 right-3 flex flex-wrap  justify-center items-center ${shwoOptions ? " translate-y-0 opacity-100" : " -translate-y-200 opacity-0"} transition-all duration-300 z-[1] `}>
        {isVisible === true || showSubcategory === true || showDocs === true ? null : <UserForm
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          handleUpload={handleUpload}
        />}

        {isVisible === true || shhowUserForm === true || showDocs === true ? null : <SubCategories
        />}

        {shhowUserForm === true || showSubcategory === true || showDocs === true ? null : <DropDown

        />}
      </div>
      {/* draggable question mark */}
      <PrivateDocuments selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} />


      {/* the dropdown */}
      <div className="z-[-1] absolute top-0 left-0 h-full w-full bg-gradient-to-br  from-pink-600/20 to-red-600/20 dark:from-black dark:to-black blur-3xl "></div>





      {/* rest of the page */}
      <Card className="lg:w-1/2 md:w-4/5 w-full  overflow-y-scroll  bg-gray-100 dark:bg-white/10 rounded-md  ">
        {/* private docs */}

        <CardContent>
          <div className="space-y-6 ">
            {/* Answer Display Section */}
            {answer && (
              <div className="grid  w-full items-start gap-5 mt-4 max-h-[50vh] min-h-[200px] overflow-y-auto">
                <Label className='space-grotesk text-sm font-semibold'>Response!</Label>
                <div className="bg-gray-100 dark:bg-black rounded-md border border-gray-300 p-4 h-full overflow-auto">
                  <MarkdownRenderer
                    content={answer}
                    className="text-sm text-gray-800 dark:text-gray-200 darj h-full bai-jamjuree-regular leading-loose"
                  />
                </div>
              </div>
            )}

            {/* Ask Question Section */}
            <div className="grid w-full items-center gap-5 relative ">
              <section className='flex items-center justify-between w-full'>
                <Label className='bai-jamjuree-semibold ' htmlFor="question">
                  {/* <BrainCircuit size={16} color='black' /> */}

                  Enter you question

                </Label>
                <ul className="bai-jamjuree-regular text-sm text-purple-500 ">{queryType ? `Query-Type :${queryType}` : null}</ul>
              </section>

              <textarea
                id="question"
                placeholder="1. Why is light the fastest thing in the universe ?
                "
                value={question}
                onChange={(e) => dispatch(setQuestion(e.target.value))}
                rows={6}
                // disabled={!currentDbName}
                className="resize-none disabled:opacity-70 space-grotesk text-sm md:text-md px-2 py-1 rounded-md  border border-gray-400"
              />

              {/* other options for the user */}

              <div className='flex items-center justify-between '>
                <section className='flex items-center justify-center gap-2'>
                  {/* show options icon */}

                  <ul onClick={() => dispatch(setShowOptions(!shwoOptions))} className={` cursor-pointer  ${shwoOptions ? "bg-green-300  text-black" : "dark:bg-gray-600  bg-gray-200"} rounded-full p-1 relative h-auto`}><IoOptions size={18} />
                  </ul>
                  {/* query type for personal documents */}
                  {selectedDoc && <ul onClick={() => dispatch(setShowType(!showType))} className={`  cursor-pointer ${selectedDoc ? "bg-blue-400" : "bg-gray-200"} rounded-full p-1  h-auto relative`}><BiQuestionMark size={18} />
                    <QueryType
                    />
                  </ul>}
                </section>

                {/* private documents of the user */}

                <ul className={`bai-jamjuree-regular text-sm  flex items-center justify-end gap-2 CustPoint dark:text-gray-200 text-black`} onClick={() => dispatch(setShowDocs(!showDocs))}>{selectedDoc !== "" ? selectedDoc : "PrivateDocs"} <IoDocument /></ul>
              </div>

              {/* action button */}
              <motion.button whileTap={{ scale: 1.03 }} whileHover={{ scaleX: 1.05 }} transition={{ duration: 0.3, ease: "circIn" }} onClick={handleAsk} className={`cursor-pointer ${loading ? "bg-gray-700 text-white animate-pulse " : "bg-black dark:bg-gray-100 dark:text-black"} text-white w-full p-2 rounded-lg space-grotesk   text-sm flex items-center justify-center gap-2 `}>
                {loading ? (<>
                  Analyzing <BsStars size={24} />
                </>) : (<>
                  Ask Question <BsStars size={24} />
                </>)}
              </motion.button>

            </div>


            {/* upvote and downvote system */}
            {answer && (
              <div onClick={() => console.log(docId)} className="p-2 rounded-lg bg-gray-100 dark:bg-black border border-gray-200 dark:border-gray-700 mt-4">
                {/* Contributors section */}
                <h1 className='bai-jamjuree-regular text-sm text-black dark:text-white my-2'>what would you rate this Information</h1>
                {docId.length > 0 && (
                  <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Contributors to this answer
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {docId
                        .filter((doc, index, self) =>
                          index === self.findIndex((d) => d.uploaded_by === doc.uploaded_by)
                        )
                        .map((doc, index) => (
                          <div key={index} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-xs">
                            <span className="text-gray-700 dark:text-gray-200">{doc?.uploaded_by}</span>
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="text-green-500"><FaThumbsUp /> {doc.upvotes}</span>
                              <span className="text-red-500"><FaThumbsDown /> {doc.downvotes}</span>
                              <span className="text-blue-500"><IoHeartHalfOutline /> {doc.partial_upvotes}</span>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}

                {/* Feedback buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center justify-start gap-4">
                    <button
                      onClick={() => dispatch(setLikeness("upvote"))}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs transition-colors ${likeness === "upvote"
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        }`}
                    >
                      <FaThumbsUp  />
                      {/* <span>Helpful</span> */}
                    </button>

                    <button
                      onClick={() => dispatch(setLikeness("downvote"))}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs transition-colors ${likeness === "downvote"
                        ? "bg-red-100 text-red-800 border border-red-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        }`}
                    >
                      <FaThumbsDown  />
                      {/* <span>Incorrect</span> */}
                    </button>

                    <button
                      onClick={() => dispatch(setLikeness("partial_upvote"))}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs transition-colors ${likeness === "partial_upvote"
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        }`}
                    >
                      <IoHeartHalfOutline  />
                      {/* <span>Missing info</span> */}
                    </button>
                  </div>

                  <button
                    disabled={sendingFeedback}
                    onClick={ResponseAuthenticity_Handler}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${sendingFeedback
                      ? "bg-green-600 text-white"
                      : "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                      }`}
                  >
                    {sendingFeedback ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>

  );

}

export default Interface;

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
import {
  setQuestion, setAnswer, setShowDocs, setShowOptions,
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
  const docId = useAppSelector(state => state.interface.docUser)

  const { answer, question, loading, isVisible, category, suggestion, shhowUserForm, showDocs, showSubcategory, showType, shwoOptions, visibility, subCategory, queryType, likeness, privateResponse } = useAppSelector(state => state.interface);

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


    // try {
    //   const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
    //   const response = await axios.post(`${BaseApiUrl}/api/upload-pdf`, formData, {
    //     withCredentials: true,
    //     headers: {
    //       "Authorization": `Bearer ${AuthToken}`,
    //     }
    //   });

    //   if (response.data.message === "Upload successfull") {
    //     toast.message(`✅ ${response.data.message}`);
    //   } else {
    //     toast.info(`❌ Failed to Upload the File, Please try again later.`);
    //   }
    // } catch (err: any) {
    //   toast.error(`❌ Network error: ${err.message}`);
    // } finally {
    //   dispatch(setLoading(false));
    // }
    dispatch(UploadDocuments(formData)).unwrap().then((res:any) => {
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


    // try {
    //   const response = await axios.post(`${BaseApiUrl}/api/ask-pdf`, { question: question, category, subCategory: subCategory }, {
    //     withCredentials: true,
    //     headers: {
    //       "Authorization": `Bearer ${AuthToken}`
    //     }
    //   });
    //   // console.log(response.data)
    //   if (response.data.message === "Response found") {

    //     setDocId((prev) => [...prev, ...response.data.doc_id])
    //     dispatch(setAnswer(response.data.answer));
    //   } else {
    //     toast.error(`❌${response.data.answer}`);
    //   }
    //   // console.log(response.data)

    // } catch (err: any) {
    //   // console.log(err)
    //   toast.error(`❌ Network error: ${err.message}`);
    // } finally {
    //   dispatch(setLoading(false));
    // }

    const data = {
      question: question,
      category: category,
      subCategory: subCategory,

    }
    dispatch(QueryAIQuestions(data)).unwrap().then((res) => {
      if (res.message) {
        toast.message(res.message)
        dispatch(setAnswer(""))
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
    //   const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");

    //   const privateDocResponse = await axios.post(`${BaseApiUrl}/api/privateDocs/ask`, { question: question, docId: selectedDoc, query_type: queryType }, {
    //     withCredentials: true, headers: {
    //       'Authorization': `Bearer ${AuthToken}`
    //     }
    //   })

    //   dispatch(setPrivateResponse(privateDocResponse.data.answer));
    //   return privateDocResponse.data.answer
    // } catch (err: any) {
    //   // console.log(err)
    //   toast.error(`❌ Network error: ${err.message}`);
    // } finally {
    //   dispatch(setLoading(false));
    // }
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
    // try {
    //   const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");

    //   const response = await axios.post(`${BaseApiUrl}/api/doc/authenticity`, { likeness: likeness, suggestions: suggestion, docId }, {
    //     withCredentials: true, headers: {
    //       'Authorization': `Bearer ${AuthToken}`
    //     }
    //   })
    //   // setAnswer("");
    //   dispatch(setLikeness(""));
    //   dispatch(setSuggestion(""));

    //   if (response.data.message === 'Feedback recorded successfully') {
    //     toast.message("Thank you for your feedback !")
    //   } else {
    //     toast.message(response.data.message);
    //   }
    // } catch (error: any) {
    //   // console.log(error);
    //   toast.error(error.message);

    // }
    const data = {
      likeness: likeness,
      suggestions: suggestion,
      docId: docId
    }
    dispatch(AuthenticityResponseHandler(data)).unwrap().then((res:any) => {
      if (res.message) {
        toast.message(res.message)
      }
    }).catch(err => toast.error(err.message))
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
      <Card className="lg:w-1/2 md:w-4/5 w-full  overflow-y-scroll min-h-[85vh] bg-gray-100 dark:bg-white/10 rounded-md  ">
        {/* private docs */}

        <CardContent>
          <div className="space-y-6 ">


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

            {/* Answer Display Section */}
            {answer || privateResponse ? (
              <div className="grid  w-full items-start gap-5 mt-4 max-h-[50vh] min-h-[200px] overflow-y-auto">
                <Label className='space-grotesk text-sm font-semibold'>Response!</Label>
                <div className="bg-gray-100 dark:bg-black rounded-md border border-gray-300 p-4 h-full overflow-auto">
                  <MarkdownRenderer
                    content={answer ? answer : privateResponse}
                    className="text-sm text-gray-800 dark:text-gray-200 darj h-full bai-jamjuree-regular leading-loose"
                  />
                </div>
              </div>
            ) : <div className='flex items-center justify-center space-grotesk text-gray-400 '>
              <h1>Response will be visible here</h1>
            </div>}
            {/* upvote and downvote system */}
            {answer ? (
              <div className="py-6 px-4 rounded-xl bg-white dark:bg-gray-900 shadow-md mt-6 w-full">
                {docId.length > 0 && (
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    <h1 className="text-sm text-center md:text-md bai-jamjuree-semibold text-gray-700 dark:text-gray-200">
                      Docs uploaded by these beautiful people used for this answer
                    </h1>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {docId
                        .filter((doc, index, self) =>
                          index === self.findIndex((d) => d.uploaded_by === doc.uploaded_by)
                        )
                        .map((doc, index) => (<>
                          <div className='flex flex-col items-center justify-center gap-1'>
                            <span
                              key={index}
                              className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-3 py-1 rounded-full text-xs md:text-sm font-medium space-grotesk"
                            >
                              {doc?.uploaded_by}
                            </span>
                            <section className='flex items-center justify-center gap-1'>
                              <ul className='flex items-center justfiy-center'><FaThumbsUp color="green" />{doc.upvotes}</ul>
                              <ul className='flex items-center justfiy-center'> <FaThumbsDown color="red" />{doc.downvotes}</ul>
                              <ul className='flex items-center justfiy-center'><IoHeartHalfOutline color="skyblue" />{doc.partial_upvotes}</ul>
                            </section>
                          </div>

                        </>
                        ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-col md:flex-row md:items-start items-stretch justify-between gap-6 w-full">
                  <div className="bai-jamjuree-regular text-sm flex flex-col  gap-2 w-full md:w-1/3">
                    <section
                      onClick={() => dispatch(setLikeness("upvote"))}

                      className={`flex items-center gap-2 border  rounded-lg p-1 ${likeness === "upvote" ? "bg-green-300 text-black " : "dark:bg-white/20 bg-white  border-green-200"}`}>

                      <FaThumbsUp color='green' />
                      <label htmlFor="Helpful">Helpful</label>

                    </section>
                    <section
                      onClick={() => dispatch(setLikeness("downvote"))}

                      className={`flex items-center gap-2 border  rounded-lg p-1 ${likeness === "downvote" ? "bg-red-300 text-black " : "dark:bg-white/20 bg-white  border-red-200"}`}>

                      <FaThumbsDown color='red' />
                      <label htmlFor="Incorrect">Flag incorrect</label>

                    </section>
                    <section
                      onClick={() => dispatch(setLikeness("partial_upvote"))}
                      className={`flex items-center gap-2 border dark  rounded-lg p-1 ${likeness === "partial_upvote" ? "bg-sky-300 text-black " : "bg-white dark:bg-white/20  border-sky-200"}`}>

                      <IoHeartHalfOutline color='blue' />
                      <label htmlFor="Missing">Missing some information </label>

                    </section>
                  </div>
                  <div className="flex flex-col gap-2 w-full md:w-2/3">

                    <div className="flex items-center justify-end mt-2">
                      <button
                        onClick={ResponseAuthenticity_Handler}
                        className="bg-black  space-grotesk text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>

  );

}

export default Interface;

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import DropDown from '../components/dropdown';
import UserForm from '../components/ui/userDetail';
import SubCategories from '@/components/subcategories.tsx';
import PrivateDocuments from '@/components/PrivateDocuments.tsx';
import { motion } from 'framer-motion'
import { useStore } from '../store/zustandHandler.ts';
import axios from 'axios';
import MarkdownRenderer from '@/components/safeHtml.tsx';
import { IoDocument } from 'react-icons/io5';
import { useAppDispatch } from '../store/hooks.tsx';
import { GetUserDocs } from '../store/AuthSlice.ts';


function Interface() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  // const [currentDbName, setCurrentDbName] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false)
  const [category, setCategory] = useState<string>('');
  const [shhowUserForm, setShowUserForm] = useState(false);
  const [visibility, setVisibility] = useState<string>('Public')
  const [showSubcategory, setShowSubCategory] = useState(false);
  const [subCategory, setSubCategory] = useState<string>('');
  const [showDocs, setShowDocs] = useState(false);
  const loggedIn = useStore((state) => state.isLoggedIn)
  const [selectedDoc, setSelectedDoc] = useState<string>('');
  const [privateResponse, setPrivateResponse] = useState<string>('');

  const dispatch = useAppDispatch();


  // uploading a document
  const handleUpload = async (UserData: FormData) => {
    if (!selectedFile || category === " " || !UserData || !visibility || !subCategory) {
      toast(!selectedFile ? '❌ Please select a PDF file first.' : "❌ Please select a category first.");
      return;
    }

    if (loggedIn === false) {
      toast("We currently only allow verified users to contribute !Please Login to continue .")
      return;
    }

    toast(visibility === "Public" ? "Your Chosen Visiblity is Public , now everyone will be able to access the the information you shared !" : "Your Chosen Visibility is Private , this document will be only visible to you in you dashboard !")

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append("category", category);
    formData.append("visibility", visibility);
    formData.append('subCategory', subCategory);
    formData.append("name", UserData.get("name") as string);
    formData.append("feedback", UserData.get("feedback") as string);


    try {
      const token = localStorage.getItem("Eureka_six_eta_v1_Auth_token")
      const response = await axios.post('https://eureka-7ks7.onrender.com/api/upload-pdf', formData, {
        withCredentials: true,
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });

      if (response.data.message === "Upload successfull") {
        toast(`✅ ${response.data.message}`);
      } else {
        toast(`❌ Failed to Upload the File, Please try again later.`);
      }
    } catch (err: any) {
      console.log(err)
      toast(`❌ Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };



  // Asking question from the AI
  const handleAsk = async () => {
    const token = localStorage.getItem("Eureka_six_eta_v1_Auth_token")
    if (selectedDoc || selectedDoc !== "") {
      await QueryPrivateDocument()
      return;
    }

    if (!question.trim() || !category || category === "") {
      toast(!question ? '❌ Please enter a question.' : '❌ Please choose a category!');
      return;
    }


    setLoading(true);
    setAnswer('');
    try {
      const response = await axios.post('https://eureka-7ks7.onrender.com/api/ask-pdf', { question: question, category, subCategory: subCategory }, {
        withCredentials: true,
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });



      if (response.data.message === "Response found") {
        // console.log(response.data.answer)
        setAnswer(response.data.answer);
      } else {
        toast(`❌ Unable to Generate a Response at the moment'}`);
      }
    } catch (err: any) {
      // console.log(err)
      toast(`❌ Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const QueryPrivateDocument = async () => {
    try {
      const token = localStorage.getItem("Eureka_six_eta_v1_Auth_token")
      setLoading(true);

      const privateDocResponse = await axios.post("https://eureka-7ks7.onrender.com/api/privateDocs/ask", { question: question, docId: selectedDoc }, {
        withCredentials: true, headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setLoading(false);

      setPrivateResponse(privateDocResponse.data.answer);
      return privateDocResponse.data.answer
    } catch (err: any) {
      // console.log(err)
      toast(`❌ Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (loggedIn) {
      dispatch(GetUserDocs());
    }
  }, [loggedIn, dispatch])


  // state reset function handler that hides any toast or drop down when user clicks anywhere on screen



  return (
    <div  className=" mx-auto p-4 md:p-8 min-h-screen max-h-[90vh]  flex flex-col items-center justify-center  dark:bg-gray-900 text-gray-900 dark:text-gray-50 z-[1] relative">
      {/* draggable question mark */}
      <PrivateDocuments selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} showDocs={showDocs} setShowDocs={setShowDocs} />


      {/* the dropdown */}
      <div className="z-[-1] absolute top-0 left-0 h-full w-full bg-gradient-to-br from-pink-400/15 to-red-400/15 blur-xl "></div>

      <div className='absolute top-2 flex  justify-center items-center flex-wrap'>



        {isVisible === true || showSubcategory === true || showDocs === true ? null : <UserForm
          setShowUserForm={setShowUserForm}
          shhowUserForm={shhowUserForm}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          handleUpload={handleUpload}
          loading={loading}
          setVisibility={setVisibility}
        />}


        {isVisible === true || shhowUserForm === true || showDocs === true ? null : <SubCategories
          showSubcategory={showSubcategory}
          setShowSubCategory={setShowSubCategory}
          subCategory={subCategory}
          setSubCategory={setSubCategory}
          category={category}
        />}

        {shhowUserForm === true || showSubcategory === true || showDocs === true ? null : <DropDown
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          setCategory={setCategory}
          category={category}
        />}




      </div>



      {/* rest of the page */}
      <Card className="w-full max-w-2xl border border-gray-400 max-h-[80vh] bg-gray-100  overflow-y-scroll">
        {/* private docs */}

        <CardContent>
          <div className="space-y-6">

            {/* Ask Question Section */}
            <div className="grid w-full items-center gap-5 ">
              <Label className='bai-jamjuree-semibold ' htmlFor="question">
                {/* <BrainCircuit size={16} color='black' /> */}

                Enter you question
              </Label>
              <textarea
                id="question"
                placeholder="1. Why is light the fastest thing in the universe ?
                "
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={6}
                // disabled={!currentDbName}
                className="resize-none disabled:opacity-70 space-grotesk text-sm md:text-md px-2 py-1 rounded-md  border border-gray-400"
              />
              {/* private documents of the user */}
              <ul className='bai-jamjuree-regular text-sm  flex items-center justify-end gap-2 CustPoint' onClick={() => setShowDocs(!showDocs)}>{selectedDoc !== "" ? selectedDoc : "MyDocs"} <IoDocument /></ul>
              {/* action button */}
              <motion.button whileTap={{ scale: 1.03 }} whileHover={{ scaleX: 1.05 }} onClick={handleAsk} className='cursor-pointer bg-black w-full p-2 rounded-lg space-grotesk text-white text-sm' >
                {loading ? 'Analyzing' : 'Ask Question'}
              </motion.button>
              {/* {!currentDbName && (
                <p className="text-sm text-red-500">Please upload and process a PDF before asking questions.</p>
              )} */}
            </div>

            {/* Answer Display Section */}
            {answer || privateResponse && (
              <div className="grid  w-full items-start gap-5 mt-4 max-h-[50vh] min-h-[200px] overflow-y-auto">
                <Label className='space-grotesk text-sm font-semibold'>Response!</Label>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-300 p-4 h-full overflow-auto">
                  <MarkdownRenderer
                    content={answer ? answer : privateResponse}
                    className="text-sm text-gray-800 dark:text-gray-200 h-full"
                  />
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

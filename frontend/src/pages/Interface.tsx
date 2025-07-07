import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DropDown from '../components/dropdown';
import UserForm from '../components/ui/userDetail';
// import SafeHTML from '@/components/safeHtml.tsx';
import { motion } from 'framer-motion'
// import { BiQuestionMark } from 'react-icons/bi';
// import Dispatch from 'react';
// import SetStateAction
import { useStore } from '../store/zustandHandler.ts';
import axios from 'axios';
import MarkdownRenderer from '@/components/safeHtml.tsx';

function Interface() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  // const [currentDbName, setCurrentDbName] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false)
  const [category, setCategory] = useState<string>('');
  const [shhowUserForm, setShowUserForm] = useState<boolean>(false);


  const loggedIn = useStore((state) => state.isLoggedIn)

  const handleUpload = async (UserData: FormData) => {
    if (!selectedFile || category === " " || !UserData) {
      toast(!selectedFile ? '❌ Please select a PDF file first.' : "❌ Please select a category first.");
      return;
    }

    if (loggedIn === false) {
      toast("We currently only allow verified users to contribute !Please Login to continue .")
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append("category", category);
    formData.append("name", UserData.get("name") as string);
    formData.append("email", UserData.get("email") as string);
    formData.append("feedback", UserData.get("feedback") as string);


    try {
      const token = localStorage.getItem("Eureka_six_eta_v1_Auth_token")
      const response = await axios.post('https://eureka-7ks7.onrender.com/api/upload-pdf', formData, {
        withCredentials: true,
        headers: {
          "Authorization": `Bearer ${token}`,
          // 'Content-Type':"multipart/form-data"
        }
      });



      if (response.data.message === "Upload successfull") {
        toast(`✅ ${response.data.message}`);
      } else {
        toast(`❌ Failed to Upload the File, Please try again later.`);
      }
    } catch (err: any) {
      toast(`❌ Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ask question
  const handleAsk = async () => {
    if (!question.trim() || !category || category === "") {
      toast(!question ? '❌ Please enter a question.' : '❌ Please choose a category!');
      return;
    }
    const token = localStorage.getItem("Eureka_six_eta_v1_Auth_token")

    // if (!category || category === "") {
    //   console.log("categoyr is empty",category)
    //   toast("Please choose a category !");
    //   return;
    // }
    // https://eureka-7ks7.onrender.com
    setLoading(true);
    setAnswer('');
    try {
      const response = await axios.post('https://eureka-7ks7.onrender.com/api/ask-pdf', { question: question, category }, {
        withCredentials: true,
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });



      if (response.data.message === "Response found") {
        setAnswer(response.data.answer);
      } else {
        toast(`❌ Unable to Generate a Response at the moment'}`);
      }
    } catch (err: any) {
      toast(`❌ Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  // state reset function handler that hides any toast or drop down when user clicks anywhere on screen



  return (
    <div className=" mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center justify-center  dark:bg-gray-900 text-gray-900 dark:text-gray-50 z-[1] relative">
      {/* draggable question mark */}

      {/* the dropdown */}
      <div className="z-[-1] absolute top-0 left-0 h-full w-full bg-gradient-to-br from-lime-400/15 to-red-400/15 blur-xl "></div>
      <UserForm setShowUserForm={setShowUserForm} shhowUserForm={shhowUserForm} selectedFile={selectedFile} setSelectedFile={setSelectedFile} handleUpload={handleUpload} loading={loading} />

      {/* the user form for contribution details */}
      <DropDown isVisible={isVisible} setIsVisible={setIsVisible} setCategory={setCategory} category={category} />






      {/* rest of the page */}
      <Card className="w-full max-w-2xl shadow-lg  bg-gray-100 shadow-black">

        <CardContent>
          <div className="space-y-6">

            {/* Ask Question Section */}
            <div className="grid w-full items-center gap-5 ">
              <Label className='bai-jamjuree-semibold ' htmlFor="question">
                {/* <BrainCircuit size={16} color='black' /> */}

                Ask any question !
              </Label>
              <textarea
                id="question"
                placeholder="1. Why is light the fastest thing in the universe ?
OR
2. Why it is nearly impossible to colonize Uranus ?
                "
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={6}
                // disabled={!currentDbName}
                className="resize-none disabled:opacity-70 space-grotesk text-sm md:text-md px-2 py-1 rounded-lg  shadow-sm shadow-black"
              />
              <motion.button whileTap={{ scale: 1.03 }} whileHover={{ scaleX: 1.05 }} onClick={handleAsk} className='cursor-pointer bg-black w-full p-2 rounded-lg space-grotesk text-white text-sm' >
                {loading ? '.....' : 'Ask Question'}
              </motion.button>
              {/* {!currentDbName && (
                <p className="text-sm text-red-500">Please upload and process a PDF before asking questions.</p>
              )} */}
            </div>

            {/* Answer Display Section */}
            {answer && (
              <div className="grid w-full items-center gap-5 mt-4 overflow-y-auto max-h-[50vh]">
                <Label className='space-grotesk text-sm font-semibold'>Response!</Label>
                <Card className="bg-gray-100 dark:bg-gray-800 rounded-md shadow-inner border border-black">
                  <MarkdownRenderer
                    content={answer}
                    className="p-4 text-sm text-gray-800 dark:text-gray-200"
                  />
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
    // <>
    //   <div className='h-screen '>
    //     <section className='flex items-center justify-start gap-4 py-2 px-3 '>
    //       <UserForm setShowUserForm={setShowUserForm} shhowUserForm={shhowUserForm} selectedFile={selectedFile} setSelectedFile={setSelectedFile} handleUpload={handleUpload} loading={loading} />
    //       <DropDown isVisible={isVisible} setIsVisible={setIsVisible} setCategory={setCategory} />
    //     </section>
    //     <div className='h-full '>
    //       {/* message display section */}
    //       <div className='  px-3 py-2'>
    //         {/* individual message container */}
    //         <section className={`bg-gray-300 rounded-xl w-fit px-3 py-2`}>
    //           <span className={`bai-jamjuree-regular text-md md:text-lg `}>Name</span>
    //           <ul className={`space-grotesk md:text-sm text-xs`}>hello</ul>
    //         </section>
    //       </div>
    //       {/* input and button part */}
    //       <section className='flex items-center justify-between px-2 py-2 gap-2 '>
    //         <textarea name="questionarea" placeholder='Ask your question' className='border border-gray-400 w-full rounded-lg p-2 space-grotesk front-semibold text-black'></textarea>
    //         <button className='bg-black text-white px-3 py-1 space-grotesk rounded-lg'>Ask</button>
    //       </section>

    //     </div>
    //   </div>
    // </>
  );

}

export default Interface;

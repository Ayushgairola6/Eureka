import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
const Interface = lazy(() => import('./pages/Interface.tsx'));
const LandingPage = lazy(() => import("./pages/LandingPage.tsx"))
const About = lazy(() => import('./pages/About.tsx'));
const Login = lazy(() => import('./pages/Login.tsx'));
const Register = lazy(() => import('./pages/Register.tsx'));
const Feedback = lazy(() => import('./pages/FeedbackPage.tsx'));
const EmailVerificationForm = lazy(() => import('./pages/EmailVerificationForm.tsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.tsx'));
const API = lazy(() => import("./pages/API.tsx"))
const DocsPage2 = lazy(() => import("./pages/docs_page2.tsx"));
const Privacy = lazy(() => import("./pages/docs_page3.tsx"));
const API_functions = lazy(() => import("./pages/docs_page4.tsx"))
const Query_Doc = lazy(() => import("./pages/docs_page5.tsx"));
const UploadDocuments = lazy(() => import("./pages/docs_page6.tsx"));
// const GetApiKey = lazy(()=>import("./pages/getAPI_Key.tsx"));

import { useAppDispatch } from './store/hooks.tsx';
import { GetUserDetails, } from './store/AuthSlice.ts';
import Navbar from './components/Navbar';
import Footer from './components/Footer'
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL
import "./App.css"
import axios from 'axios';
import { useStore } from './store/zustandHandler.ts'
const DocumentationLayout = lazy(() => import('./pages/DocumentationLayout.tsx'));


const App = () => {

  // const [currTab, setCurrTab] = useState("Home");
  const Loggedin = useStore((state) => state.Login);
  const loggedIn = useStore((state) => state.isLoggedIn);
  const currTab = useStore((state) => state.currTab);
  const setCurrTab = useStore((state) => state.setCurrTab)
  const dispatch = useAppDispatch()
  const { isDarkMode } = useStore();

  useEffect(() => {
    if (loggedIn) {
      dispatch(GetUserDetails())
    }
  }, [loggedIn, dispatch])

  useEffect(() => {
    const controller = new AbortController();
    const VerifyLoginState: () => Promise<void> = async () => {
      try {
        const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
        const response = await axios.get(`${BaseApiUrl}/api/verify/userstate`, {
          // signal: controller.signal,
          withCredentials: true,
          headers: {
            "Authorization": `Bearer ${AuthToken}`
          }
        })
        if (response.data.message === "verified") {
          Loggedin()
          return
        }
      } catch (error) {
        console.log(error);
      }
    }
    VerifyLoginState()
    return () => controller.abort()
  }, [loggedIn])

  // toggle dark class from the html body
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [isDarkMode])

  return (<>
    <Suspense fallback={<div className='h-screen bg-black flex items-center justify-center     text-6xl '>
      <ul className='rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-6 shadow-sm shadow-black animate-pulse bai-jamjuree-bold'>E</ul>
    </div>}>
      <Router >

        <Navbar currTab={currTab} setCurrTab={setCurrTab} />
        <Routes >
          <Route element={<LandingPage />} path='/'></Route>
          <Route element={<Interface />} path='/Interface' >
          </Route>
          <Route element={<About />} path="/About" />
          <Route element={<Login />} path="/Login" />
          <Route element={<Register />} path="/Register" />
          <Route element={<Feedback />} path="/Feedback" />
          <Route element={<EmailVerificationForm />} path="/ResetPassword" />
          <Route element={<ResetPassword />} path="/temp" />

          <Route element={<DocumentationLayout />}>
            <Route element={<API />} path="/API/featured" />
            <Route element={<DocsPage2 />} path="/docs/page2" />
            <Route element={<Privacy />} path="/docs/page3" />
            <Route element={<API_functions />} path="/docs/page4" />
            <Route element={<Query_Doc />} path="/docs/page5" />
            <Route element={<UploadDocuments />} path="/docs/page6" />



            {/* Add more documentation routes here */}
          </Route>
        </Routes>

        <Footer></Footer>

      </Router>
    </Suspense>
  </>)
}

export default App;
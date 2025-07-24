import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
const Interface = lazy(() => import('./pages/Interface.tsx'));
const LandingPage = lazy(() => import("./pages/LandingPage.tsx"))
const About = lazy(() => import('./pages/About.tsx'));
const Login = lazy(() => import('./pages/Login.tsx'));
const Register = lazy(() => import('./pages/Register.tsx'));
const Feedback = lazy(() => import('./pages/FeedbackPage.tsx'));
const EmailVerificationForm = lazy(() => import('./pages/EmailVerificationForm.tsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.tsx'));
import { useAppDispatch } from './store/hooks.tsx';
import { GetUserDetails, } from './store/AuthSlice.ts';
import Navbar from './components/Navbar';
import Footer from './components/Footer'

import "./App.css"
import axios from 'axios';
import { useStore } from './store/zustandHandler.ts'


const App = () => {

  const [currTab, setCurrTab] = useState("Home");
  const Loggedin = useStore((state) => state.Login);
  const loggedIn = useStore((state)=>state.isLoggedIn);
  const dispatch = useAppDispatch()


  useEffect(() => {
    if (loggedIn) {
      dispatch(GetUserDetails())
    }
  }, [loggedIn, dispatch])

  useEffect(() => {
    const VerifyLoginState: () => Promise<void> = async () => {
      try {
        const token = localStorage.getItem("Eureka_six_eta_v1_Auth_token")
        const response = await axios.get("http://localhost:1000/api/verify/userstate", {
          withCredentials: true,
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        if (response.data.message === "verified") {
          Loggedin()
          return
        }
      } catch (error) {
        console.error(error);
      }
    }
    VerifyLoginState()
  }, [])



  return (<>
    <Suspense fallback={<div className='h-screen bg-black flex items-center justify-center font-bold space-grotesk   text-6xl '>
    <ul className='rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-6 shadow-sm shadow-black animate-pulse'>E</ul>
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

        </Routes>
        <Footer></Footer>

      </Router>
    </Suspense>
  </>)
}

export default App;
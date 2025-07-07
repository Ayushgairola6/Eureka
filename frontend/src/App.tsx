import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import Interface from './pages/Interface'
import LandingPage from './pages/LandingPage';
import About from './pages/About'
import Navbar from './components/Navbar';
import Footer from './components/Footer'
import Login from './pages/Login';
import Register from './pages/Register';
import Feedback from './pages/FeedbackPage'
import "./App.css"
import axios from 'axios';
import { useStore } from './store/zustandHandler.ts'

const App = () => {

  const [currTab, setCurrTab] = useState("Home");
  const Loggedin = useStore((state) => state.Login);

  useEffect(() => {
    const VerifyLoginState = async () => {
      try {
        const token = localStorage.getItem("Eureka_six_eta_v1_Auth_token")
        const response = await axios.get("https://eureka-7ks7.onrender.com/api/verify/userstate", {
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
  },[])
  return (<>
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

      </Routes>
      <Footer></Footer>
    </Router>
  </>)
}

export default App;
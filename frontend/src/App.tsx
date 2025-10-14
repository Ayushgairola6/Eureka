import { useEffect, lazy, Suspense, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
const Interface = lazy(() => import("./pages/Interface.tsx"));
const LandingPage = lazy(() => import("./pages/LandingPage.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Register = lazy(() => import("./pages/Register.tsx"));
const Feedback = lazy(() => import("./pages/FeedbackPage.tsx"));
const EmailVerificationForm = lazy(
  () => import("./pages/EmailVerificationForm.tsx")
);
const LoadingIndicator = lazy(
  () => import("@/components/LoadingIndicator.tsx")
);
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const API = lazy(() => import("./pages/API.tsx"));
const DocsPage2 = lazy(() => import("./pages/docs_page2.tsx"));
const Privacy = lazy(() => import("./pages/docs_page3.tsx"));
const API_functions = lazy(() => import("./pages/docs_page4.tsx"));
const Query_Doc = lazy(() => import("./pages/docs_page5.tsx"));
const UploadDocuments = lazy(() => import("./pages/docs_page6.tsx"));
const UserDashboard = lazy(() => import("./pages/UserDashBoard.tsx"));
const ConversationDetail = lazy(() => import("./pages/Doc_History.tsx"));
const ChatRoom = lazy(() => import("./pages/chatRoom.tsx"));
const EmailVerification = lazy(() => import("./pages/EmailVerification.tsx"));
const OtherChats = lazy(() => import("./pages/OtherChats.tsx"));
import { connectSocket, disconnectSocket } from "./store/websockteSlice.ts";
import { useAppDispatch, useAppSelector } from "./store/hooks.tsx";
import {
  GetUserDashboardData,
  setIsLogin,
  setTheme,
  setUseStatus,
} from "./store/AuthSlice.ts";
import Navbar from "./components/Navbar";
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;
import "./App.css";
import axios from "axios";
import VerificationLink from "./components/VerficationLink.tsx";
import OAuthCallbackHandler from "./pages/OauthCallbackHandlers.tsx";

// import { BiError } from 'react-icons/bi';
const DocumentationLayout = lazy(
  () => import("./pages/DocumentationLayout.tsx")
);

// const [loadValue, setLoadValue] = useState<number>(0);
// useEffect(()=>{

// },)
const App = () => {
  // const [currTab, setCurrTab] = useState("Home");
  const dispatch = useAppDispatch();
  const { isDarkMode, isLoggedIn, userStatus } = useAppSelector(
    (state) => state.auth
  );
  const themeInitialized = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const VerifyLoginState: () => Promise<void> = async () => {
      try {
        const AuthToken = localStorage.getItem("Eureka_six_eta_v1_Authtoken");
        const response = await axios.get(`${BaseApiUrl}/api/verify/userstate`, {
          // signal: controller.signal,
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${AuthToken}`,
          },
        });
        if (response.data.message === "verified") {
          dispatch(setIsLogin(true));
          return;
        }
      } catch (error) {
        // console.log(error);
      }
    };
    VerifyLoginState();
    return () => controller.abort();
  }, []);

  // now if the user is loggedIn
  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoggedIn === true) {
        try {
          dispatch(GetUserDashboardData());
          dispatch(connectSocket());
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setUseStatus("idle");
        } finally {
        }
      }
    };

    fetchUserData();
  }, [isLoggedIn]);
  // re append the user chosen theme
  useEffect(() => {
    // Only run once on mount
    if (themeInitialized.current) return;

    try {
      const themeCookie = document.cookie
        .split(";")
        .find((cookie) => cookie.trim().startsWith("Eureka_Theme="));

      if (themeCookie) {
        const themeValue = themeCookie.split("=")[1];
        const shouldBeDark = themeValue === "dark";

        // Only dispatch if different from current state
        if (shouldBeDark !== isDarkMode) {
          dispatch(setTheme(shouldBeDark));
        }

        themeInitialized.current = true; // Mark as initialized
      }
    } catch (e) {
      // console.error('Error reading theme cookie:', e);
    }
  }, [dispatch, isDarkMode]);

  // Apply theme to DOM when isDarkMode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.cookie = "Eureka_Theme=dark; path=/; max-age=31536000"; // 1 year
    } else {
      document.documentElement.classList.remove("dark");
      document.cookie = "Eureka_Theme=light; path=/; max-age=31536000";
    }
  }, [isDarkMode]);

  // socket disconnect cleanup function
  useEffect(() => {
    return () => {
      dispatch(disconnectSocket());
    };
  }, [dispatch]);
  return (
    <>
      {/* Global Loading Overlay */}
      {userStatus === "pending" && (
        <LoadingIndicator text={"Setting up your dashboard"} />
      )}

      {/* main routers */}
      <Suspense
        fallback={
          <div className="h-screen bg-black flex items-center justify-center     text-6xl ">
            <section className="text-center bg-gray-50 p-3 rounded-md text-black flex flex-col items-center justify-center gap-2">
              <img
                src="/Group 1.svg"
                alt="Eureka logo"
                className="rounded-full h-18 w-18"
              />
              <span className="bebas-neue-regular text-xl">Ask?EUREKA</span>
            </section>
          </div>
        }
      >
        <Router>
          <Navbar />
          <Routes>
            <Route
              element={<OAuthCallbackHandler />}
              path="/client/OAuthCallback"
            />
            <Route element={<LandingPage />} path="/"></Route>
            <Route element={<EmailVerification />} path="/user/verify-email" />
            <Route element={<Interface />} path="/Interface"></Route>
            <Route element={<About />} path="/About" />
            <Route element={<Login />} path="/Login" />
            <Route element={<Register />} path="/Register" />
            <Route element={<Feedback />} path="/Feedback" />
            <Route element={<EmailVerificationForm />} path="/ResetPassword" />
            <Route element={<ResetPassword />} path="/reset-password" />
            <Route element={<VerificationLink />} path="/Verification" />

            <Route
              element={<ConversationDetail />}
              path="/User/document_chat_history/:id"
            />
            <Route element={<UserDashboard />} path="/User/dashboard" />
            <Route element={<ChatRoom />} path="/chatroom/:id" />
            <Route element={<OtherChats />} path="/user/misallaneous-chats" />

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
        </Router>
      </Suspense>
    </>
  );
};

export default App;

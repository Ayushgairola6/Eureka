import { useEffect, lazy, Suspense, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
const Interface = lazy(() => import("./pages/Interface.tsx"));
const LandingPage = lazy(() => import("./pages/LandingPage.tsx"));
// const About = lazy(() => import("./pages/About.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Register = lazy(() => import("./pages/Register.tsx"));
const Feedback = lazy(() => import("./pages/FeedbackPage.tsx"));
const EmailVerificationForm = lazy(
  () => import("./pages/EmailVerificationForm.tsx")
);
// const LoadingIndicator = lazy(
//   () => import("@/components/LoadingIndicator.tsx")
// );
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
const Tutorial = lazy(() => import("./pages/Tutorial.tsx"))
import { LogoRender } from '@/components/LogoRender.tsx'
import { connectSocket, disconnectSocket } from "./store/websockteSlice.ts";
import { useAppDispatch, useAppSelector } from "./store/hooks.tsx";
import {
  GetUserDashboardData,
  setIsLogin,
  setTheme,
  setUseStatus,
  StoreInIndexDb,
  StoreLocalCache,
  UpdateFromLocalCache,
} from "./store/AuthSlice.ts";
import Navbar from "./components/Navbar";
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;
import "./App.css";
import axios from "axios";
import VerificationLink from "./components/VerficationLink.tsx";
import OAuthCallbackHandler from "./pages/OauthCallbackHandlers.tsx";
import { toast, Toaster } from "sonner";
const DocumentationLayout = lazy(
  () => import("./pages/DocumentationLayout.tsx")
);
import TermsAndConditions from "./pages/TermsAndConditions.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import RefundPolicy from "./pages/RefundPolicy.tsx";
import UserChatRooms from "./pages/Rooms.tsx";
import { setCurrenTheme } from "./store/InterfaceSlice.ts";

// stripe api
// const stripePromise = loadStripe(
//   "pk_test_51BTUDGJAJfZb9HEBwDg86TN1KNprHjkfipXmEDMb0gSCassK5T3ZfxsAbcgKVmAIXF7oZ6ItlZZbXO6idTHE67IM007EwQ4uN3"
// );
const App = () => {
  const dispatch = useAppDispatch();
  const { isDarkMode, isLoggedIn } = useAppSelector((state) => state.auth);

  // updating the local states from local cache
  useEffect(() => {
    const request = StoreInIndexDb();

    request.onerror = () => {
      return;
    };

    request.onsuccess = (event: any) => {
      let db = event.target.result;

      //if an object store exists
      if (!db.objectStoreNames.contains("userinfo")) {
        // No store means brand new DB, safely exit or handle state reset
        return;
      }

      let transaction = db.transaction(["userinfo"], "readwrite");
      let objectStore = transaction.objectStore("userinfo");

      let getRequest = objectStore.get("currentUser");

      getRequest.onsuccess = function () {
        if (getRequest.result) {
          // User data exists in IndexedDB cache
          dispatch(UpdateFromLocalCache(getRequest.result));
          dispatch(setIsLogin(true)); // If not handled in the action creator
        } else {
          console.log("No user cache found. State remains logged out.");
          dispatch(setIsLogin(false)); // Optional: Explicitly reset/verify
        }
      };
    };

    // if the database is new create a new table
    request.onupgradeneeded = function (event: any) {
      let db = event?.target?.result;
      if (!db.objectStoreNames.contains("userinfo")) {
        db.createObjectStore("userinfo", {
          keypath: "ssn",
          autoIncrement: true,
        });
      }
    };
  }, []);
  const themeInitialized = useRef(false);

  const FetchCountRef = useRef(0);
  useEffect(() => {
    if (FetchCountRef.current >= 1) {
      return;
    }
    const VerifyLoginState: () => Promise<any> = async () => {
      try {
        setUseStatus("pending");
        const response = await axios.get(`${BaseApiUrl}/api/verify/userstate`, {
          withCredentials: true,

        });
        if (response.data.message === "verified") {
          dispatch(setIsLogin(true));
          setUseStatus("idle");
          toast.message("Session verified");
        } else {
          toast.message(response.data.message);
        }
        FetchCountRef.current = 1; //indicates that we have fetched the userstate once
      } catch (error) {
        // console.log(error);
        setUseStatus("failed");
        toast.info("No internet connection");

        const time = setTimeout(() => {
          setUseStatus("idle");
        }, 3000);
        return () => clearTimeout(time);
      }
    };
    VerifyLoginState();
  }, []);

  // now if the user is loggedIn
  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoggedIn === true) {
        try {
          dispatch(GetUserDashboardData())
            .unwrap()
            .then((res: any) => {
              if (res) {
                toast.message(res?.message)
                StoreLocalCache(res.user);
              }
            });
          dispatch(connectSocket());
        } catch (error: any) {
          toast.error(error)
          setUseStatus("idle");
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
        .find((cookie) => cookie.trim().startsWith("AntiNode_Theme="));

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
      document.cookie = "AntiNode_Theme=dark; path=/; max-age=31536000"; // 1 year
    } else {
      document.documentElement.classList.remove("dark");
      document.cookie = "AntiNode_Theme=light; path=/; max-age=31536000";
    }
  }, [isDarkMode]);

  // socket disconnect cleanup function
  useEffect(() => {
    return () => {
      dispatch(disconnectSocket());
    };
  }, [dispatch]);

  //update the theme of the interface for the user
  useEffect(() => {
    if (typeof window !== "undefined") {
      const lastChosenTheme = localStorage.getItem("AntiNode_Interface_Theme");

      if (lastChosenTheme) {
        dispatch(setCurrenTheme(JSON.parse(lastChosenTheme)));
      }
    }
  }, []);
  return (
    <>
      {/* Global Loading Overlay */}
      {/* {userStatus === "pending" && <LoadingIndicator userStatus={userStatus} />} */}

      {/* main routers */}
      <Suspense
        fallback={
          <div className='h-screen text-[2rem] space-grotesk bg-black flex items-center justify-center '>
            <LogoRender />
          </div>
        }
      >
        <Router>
          <Toaster />
          {/* <Elements stripe={stripePromise} options={options}> */}
          <Navbar />
          <Routes>
            <Route
              element={<OAuthCallbackHandler />}
              path="/client/OAuthCallback"
            />
            <Route element={<LandingPage />} path="/"></Route>
            <Route element={<EmailVerification />} path="/user/verify-email" />
            <Route element={<Interface />} path="/Interface"></Route>
            <Route element={<UserChatRooms />} path="/user/rooms" />
            <Route element={<Login />} path="/Login" />
            <Route element={<Register />} path="/Register" />
            <Route element={<Feedback />} path="/Feedback" />
            <Route element={<EmailVerificationForm />} path="/ResetPassword" />
            <Route element={<ResetPassword />} path="/reset-password" />
            <Route element={<VerificationLink />} path="/Verification" />
            <Route element={<Tutorial />} path="/userManual/AntiNode/Know-How" />
            <Route
              element={<TermsAndConditions />}
              path="/terms-and-conditions"
            />
            <Route element={<LandingPage />} path="/#pricing"></Route>

            <Route element={<PrivacyPolicy />} path="/Privacy" />
            <Route element={<RefundPolicy />} path="/Refund-Policy" />
            <Route
              element={<ConversationDetail />}
              path="/User/document_chat_history/:id"
            />
            <Route element={<UserDashboard />} path="/User/dashboard" />
            <Route element={<ChatRoom />} path="/chatroom/:id" />
            <Route element={<OtherChats />} path="/user/misallaneous-chats" />

            <Route element={<DocumentationLayout />}>
              <Route element={<API />} path="/Api/introduction" />
              <Route element={<DocsPage2 />} path="/Api/AntiNodeKnow-How" />
              <Route
                element={<Privacy />}
                path="/Api/AntiNodeManagaging-PrivateDocs"
              />
              <Route
                element={<API_functions />}
                path="/Api/AntiNodeGettingAllDocuments"
              />
              <Route
                element={<Query_Doc />}
                path="/Api/AntiNodeQueryIng-Documents"
              />
              <Route
                element={<UploadDocuments />}
                path="/Api/AntiNodeUploading_Documents"
              />

              {/* Add more documentation routes here */}
            </Route>
          </Routes>
          {/* </Elements> */}
        </Router>
      </Suspense>
    </>
  );
};

export default App;

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { toast } from "sonner";
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { GetUserDashboardData, setIsLogin } from "../store/AuthSlice";
import { connectSocket } from "../store/websockteSlice";
const EmailVerification = () => {
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const [isPending, setIsPending] = useState("idle");
  const [response, setResponse] = useState<string>("Verifying yout account");
  const navigate = useNavigate();
  //   const { isLoggedIn } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isLoggedIn === true) {
      navigate("/Interface");
      return;
    }
    const verifyEmail = async () => {
      if (typeof window === "undefined") return;

      setIsPending("pending");

      // Extract token from URL
      const urlParams = new URLSearchParams(window.location.search);
      const verificationtoken = urlParams.get("token");

      if (!verificationtoken) {
        setIsPending("failed");
        toast.error("Invalid verification link");
        return;
      }

      try {
        const response = await axios.put(
          `${BaseApiUrl}/api/user/verify-email/${verificationtoken}`,
          {},
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${verificationtoken}`,
            },
          }
        );

        if (
          response.data.message.includes(
            "Account already verified  Please login instead"
          )
        ) {
          navigate("/Login");
          // reload the app to get user data
        } else {
          localStorage.setItem(
            "AntiNode_eta_six_version1_AuthToken",
            response.data.AuthToken
          );
          dispatch(GetUserDashboardData());
          dispatch(setIsLogin(true));
          dispatch(connectSocket());
          navigate("/Interface");
        }
        setResponse(response.data.message);

        console.log(response);
        setIsPending("success");
      } catch (error: any) {
        console.log(error);

        setIsPending("failed");
        setResponse(error?.response?.data?.message || "Verification failed");

        // More specific error handling
        const errorMessage =
          error.response?.data?.message || "Verification failed";
        toast.error(errorMessage);

        // Optionally redirect to login or resend verification page on specific errors
        if (
          errorMessage.includes("expired") ||
          errorMessage.includes("invalid")
        ) {
          // You could navigate to a page where user can request new verification link
          setTimeout(() => navigate("/request-verification"), 3000);
        }
      }
    };

    verifyEmail();
  }, [dispatch, navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4 space-grotesk">
      <div className="max-w-md w-full bg-white dark:bg-white/10 rounded-xl shadow-lg p-8 text-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl bai-jamjuree-bold  text-gray-800 dark:text-white mb-2">
            {isPending === "success"
              ? "Email Verified!"
              : "Verifying your email"}
          </h1>
          <p className="bai-jamjuree-semibold text-gray-600 dark:text-gray-300">
            {isPending === "success"
              ? "Your email has been successfully verified. Redirecting you to the app..."
              : "Please wait while we verify your email address."}
          </p>
        </div>

        {/* Animated Loading/Success Indicator */}
        <div className="flex justify-center items-center mb-8">
          <div className="relative  flex items-center justify-center ">
            {isPending === "success" ? (
              // Success checkmark
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            ) : (
              // Loading animation
              <div className="flex space-x-2 ">
                <div
                  className={`h-3 w-3 rounded-full bg-green-600 animate-bounce ${
                    isPending === "failed" ? "bg-red-500" : ""
                  }`}
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className={`h-3 w-3 rounded-full bg-green-600 animate-bounce ${
                    isPending === "failed" ? "bg-red-500" : ""
                  }`}
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className={`h-3 w-3 rounded-full bg-green-600 animate-bounce ${
                    isPending === "failed" ? "bg-red-500" : ""
                  }`}
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Status Messages */}
        <div className="space-y-4">
          {isPending === "pending" && (
            <p className="text-green-600 dark:text-green-400">{response}...</p>
          )}

          {isPending === "success" && response.includes("Account verified") && (
            <>
              <div className="text-green-600 dark:text-green-400">
                <p>✓ Success! Your email has been verified.</p>
              </div>
              <div className="text-sky-600 dark:text-sky-400">
                <p>{response}</p>
                <button
                  onClick={() => {
                    window.location.reload();
                    console.log(response);
                  }}
                  className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-sky-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  LOGIN
                </button>
              </div>
            </>
          )}

          {isPending === "failed" && (
            <div className="text-red-600 dark:text-red-400">
              <p>{response}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Support Link */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help?{" "}
            <Link
              to="/Feedback"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Contact support
            </Link>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Already verified?{" "}
            <Link
              to="/Login"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;

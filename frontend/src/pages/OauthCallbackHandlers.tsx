// components/OAuthCallbackHandler.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface MessageState {
  type: "loading" | "success" | "error";
  text: string;
}

const OAuthCallbackHandler = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState<MessageState>({
    type: "loading",
    text: "Completing Authentication",
  });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const error = searchParams.get("error");
      const authSuccess = searchParams.get("auth");
      const serverMessage = searchParams.get("message");

      console.log("OAuth callback params:", {
        error,
        authSuccess,
        serverMessage,
      });

      if (error) {
        console.error("OAuth failed:", error);
        setMessage({
          type: "error",
          text: serverMessage || error || "Authentication failed",
        });
        return;
      }

      if (authSuccess === "success") {
        setMessage({
          type: "success",
          text: serverMessage || "Authentication successful!",
        });

        // Small delay to show success message before redirect
        setTimeout(() => {
          navigate("/Interface");
        }, 1500);
        return;
      }

      // If no specific outcome, assume still loading
      setMessage({
        type: "loading",
        text: "Completing Authentication",
      });
    };

    handleCallback();
  }, [navigate, searchParams]);

  // Determine styles based on message type
  const getMessageStyles = () => {
    switch (message.type) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "loading":
      default:
        return "text-white";
    }
  };

  const getSpinnerStyles = () => {
    switch (message.type) {
      case "success":
        return "border-green-500"; // Green spinner for success
      case "error":
        return "border-red-500"; // Red spinner for error
      case "loading":
      default:
        return "border-sky-400"; // Blue spinner for loading
    }
  };

  const shouldShowSpinner = message.type === "loading";

  return (
    <div className="flex items-center justify-center bai-jamjuree-semibold text-lg h-screen relative z-[2]">
      <div className="absolute h-full w-full top-0 left-0 bg-gradient-to-br from-indigo-500/20 to-white dark:from-white/10 dark:to-black z-[-2]"></div>
      <section className="flex flex-col items-center justify-center gap-4">
        {shouldShowSpinner && (
          <div
            className={`h-8 w-8 rounded-full border-t-4 animate-spin ${getSpinnerStyles()}`}
          ></div>
        )}

        {message.type === "success" && (
          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}

        <p
          className={`${getMessageStyles()} text-center transition-colors duration-300`}
        >
          {message.text}
          {message.type === "loading" && "..."}
        </p>

        {message.type === "error" && (
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Back to Login
          </button>
        )}
      </section>
    </div>
  );
};

export default OAuthCallbackHandler;

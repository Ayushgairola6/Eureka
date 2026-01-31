// components/OAuthCallbackHandler.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
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

  return (
    <div className="flex items-center justify-center bai-jamjuree-semibold text-lg h-screen relative z-[2]">
      {message.type === "loading" ? (
        <>
          <div>
            <h1 className="text-center bai-jamjuree-semibold">
              Setting up your account
            </h1>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 bg-green-500 rounded-sm" // Sharp corners (sm) and tech green
                animate={{
                  height: ["16px", "26px", "16px"], // Grow and shrink
                  opacity: [0.5, 1, 0.5], // Pulse opacity
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </>
      ) : message.type === "error" ? (
        <>
          <div className="flex flex-col items-center">
            <img className="h-60 w-60" src="/404.png" alt="error" />
            <h1 className="bai-jamjuree-semibold uppercase text-sm">
              User not found
            </h1>
          </div>
        </>
      ) : (
        <>
          <div>
            <h1 className="text-center bai-jamjuree-semibold uppercase">
              Redirecting...
            </h1>
            <p className="text-red-400 text-xs">
              If this takes too long, reload the page.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default OAuthCallbackHandler;

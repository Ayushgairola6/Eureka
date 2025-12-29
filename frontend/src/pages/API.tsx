import axios from "axios";
import React, { useState } from "react";
// import { Link } from 'react-router';
import { toast } from "sonner";
import { BiClipboard } from "react-icons/bi";
import { useAppSelector } from "../store/hooks";
const ApiDocs = React.lazy(() => import("@/components/ApiDocs"));
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;

const API = () => {
  const [key, setKey] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);
  const loggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const { user } = useAppSelector((state) => state.auth);

  // getting the api key handler
  const getAPI_key = async () => {
    try {
      if (loggedIn === false) {
        toast.error("Please Login to continue !");
        return;
      }
      if (user?.IsPremiumUser === false) {
        toast.info("You need an active subscription to get an API key.");
        return;
      }
      setGenerating(true);
      const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_AuthToken");
      const response = await axios.get(`${BaseApiUrl}/api/get/api-key`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${AuthToken}`,
        },
      });
      if (response.data.key) {
        setKey(response.data.key);
      } else {
        toast.message(response.data.message);
      }
      setGenerating(false);
      return response.data.key ? response.data.key : response.data.message;
    } catch (err: any) {
      toast.error(err?.response?.data?.message);
      // console.error(err);
      setGenerating(false);
    }
  };

  return (
    <>
      {/* Main Content Container */}
      <main className=" flex flex-col items-center justify-center   w-full">
        {/* Documentation Card */}
        <div className="bg-white dark:bg-black  dark:text-white text-black  shadow-md border  p-8 w-full flex flex-col items-center gap-8">
          {/* Header Section */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl lg:text-4xl  text-black dark:text-white bai-jamjuree-bold">
              AntiNode API Documentation
            </h1>
            <p className="bai-jamjuree-regular text-sm text-gray-500 dark:text-gray-300 max-w-2xl">
              The complete guide to integrating with our knowledge discovery
              platform
            </p>
          </div>

          {/* API Key Section */}
          <div className="w-full max-w-md space-y-4">
            <div className="text-center">
              <h2 className="text-lg bai-jamjuree-semibold text-indigo-500">
                API Access
              </h2>
            </div>

            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2 space-grotesk">
                <input
                  value={key}
                  readOnly
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-black focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  placeholder="Your API key will appear here"
                />
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(key);
                    toast("Copied to clipboard");
                  }}
                  disabled={!key}
                  className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  aria-label="Copy API Key"
                >
                  <BiClipboard className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <button
                onClick={getAPI_key}
                disabled={generating}
                className={`w-full py-2.5 px-4 rounded-lg  text-sm transition-all ${
                  generating
                    ? "bg-gray-100 text-black  cursor-not-allowed"
                    : "bg-black hover:bg-indigo-500 dark:bg-white dark:text-black text-white shadow-sm bai-jamjuree-regular"
                }`}
              >
                {generating ? (
                  <span className="flex items-center justify-center ">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  "Generate New API Key"
                )}
              </button>
            </div>
          </div>
          <p className="space-grotesk text-sm text-gray-800 dark:text-gray-300 mt-1">
            Gettin an API key requires an active subscription. The sdk itself is
            open source so you can look at our{" "}
            <a
              className="text-green-500"
              href="https://github.com/Ayushgairola6/AntiNodek"
            >
              github
            </a>{" "}
            and modify the sdk for your own plug and use system as per your own
            requirements.
          </p>
          {/* Documentation Content */}
          <div className="w-full mt-8 border-t border-gray-100 pt-8">
            <ApiDocs />
          </div>
        </div>
      </main>
      {/* </div> */}
    </>
  );
};

export default API;

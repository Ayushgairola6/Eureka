import axios from 'axios';
import React, { useState } from 'react';
// import { Link } from 'react-router';
import { toast, Toaster } from 'sonner';
import { BiClipboard } from 'react-icons/bi';
import { useStore } from '../store/zustandHandler';
const ApiDocs = React.lazy(() => import("@/components/ApiDocs"));

const API = () => {
    const [key, setKey] = useState<string>('');
    const [generating, setGenerating] = useState<boolean>(false);
    const loggedIn = useStore((state) => state.isLoggedIn)

    const getAPI_key = async () => {
        try {
            if (!loggedIn) {
                toast("Please Login to continue !");
                return;
            }
            setGenerating(true);
            const AuthToken = localStorage.getItem("Eureka_six_eta_v1_AuthToken");
            const RefreshToken = localStorage.getItem("Eureka_six_eta_v1_RefreshToken");
            const response = await axios.get("http://localhost:1000/api/get/api-key", {
                withCredentials: true, headers: {
                    'Authorization': `Bearer ${{ AuthToken, RefreshToken }}`
                }
            })
            if (response.data.key) {

                setKey(response.data.key);
            } else {
                toast(response.data.message);
            }
            setGenerating(false);
            return response.data.key ? response.data.key : response.data.message;
        } catch (err: any) {
            console.error(err);
            setGenerating(false)
        }
    }
    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden z-[1]">
                {/* Subtle gradient mesh background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-100/40 to-blue-100/20 z-[-1]" />

                {/* Main Content Container */}
                <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-4xl w-full">
                    <Toaster />

                    {/* Documentation Card */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 w-full flex flex-col items-center gap-8">
                        {/* Header Section */}
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 font-sans">
                                Eureka API Documentation
                            </h1>
                            <p className="text-lg text-gray-600 max-w-2xl">
                                The complete guide to integrating with our knowledge discovery platform
                            </p>
                        </div>

                        {/* API Key Section */}
                        <div className="w-full max-w-md space-y-4">
                            <div className="text-center">
                                <h2 className="text-lg font-semibold text-gray-800">API Access</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Requires an active subscription and valid API key
                                </p>
                            </div>

                            <div className="flex flex-col space-y-3">
                                <div className="flex items-center space-x-2">
                                    <input
                                        value={key}
                                        readOnly
                                        className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                                        placeholder="Your API key will appear here"
                                    />
                                    <button
                                        onClick={async () => { await navigator.clipboard.writeText(key); toast("Copied to clipboard"); }}
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
                                    className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${generating
                                            ? "bg-gray-100 text-black cursor-not-allowed"
                                            : "bg-black hover:bg-blue-700 text-white shadow-sm bai-jamjuree-regular"
                                        }`}
                                >
                                    {generating ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating...
                                        </span>
                                    ) : "Generate New API Key"}
                                </button>
                            </div>
                        </div>

                        {/* Documentation Content */}
                        <div className="w-full mt-8 border-t border-gray-100 pt-8">
                            <ApiDocs />
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default API;
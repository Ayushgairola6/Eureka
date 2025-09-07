import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { toast, Toaster } from 'sonner';
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { GetUserDashboardData, setIsLogin } from '../store/AuthSlice';
import { connectSocket, disconnectSocket } from '../store/websockteSlice';


const EmailVerification = () => {
    const dispatch = useAppDispatch();
    const [isPending, setIsPending] = useState('idle');
    const [token, setToken] = useState<string | null>(null);
    const navigate = useNavigate();
    const { isLoggedIn } = useAppSelector(state => state.auth);

    useEffect(() => {
        setIsPending("pending");

        // Extract token from URL
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const verificationtoken = urlParams.get('token');
            setToken(verificationtoken);
        }

        const VerifyEmail = async () => {
            try {
                if (!token) {
                    setIsPending("idle");
                    toast.error("No valid verification token found");
                    return;
                }

                const response = await axios.put(
                    `${BaseApiUrl}/api/user/verify-email/${token}`,
                    {},
                    {
                        withCredentials: true,
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (response.data.message === 'Account verified') {
                    localStorage.setItem("Eureka_six_eta_v1_Authtoken", response.data.AuthToken);
                    toast.success(response.data.message);
                    setIsPending("success");
                    setIsLogin(true);
                    // Redirect after a brief delay to show success state
                    try {
                        await dispatch(GetUserDashboardData());

                        // Connect socket after user data is fetched
                        dispatch(connectSocket());
                    } catch (error) {
                        toast.error("Failed to load your account details , please reload!");
                    }
                    setTimeout(() => {
                        navigate("/");
                    }, 2000);
                }

                return response.data;
            } catch (error: any) {
                setIsPending("failed");
                toast.error(error.response?.data?.message || "Verification failed");
                console.error(error);

                // Reset after error
                setTimeout(() => {
                    setIsPending("idle");
                }, 3000);
            }
        };

        if (token) {
            VerifyEmail();
        }
    }, [token, navigate]);


    // if the user is verifed update the login state and get the user account data
    useEffect(() => {
        if (isLoggedIn === true) {
            navigate("/")
            //get the users informations 
            dispatch(GetUserDashboardData());

            dispatch(connectSocket());


            return () => {
                dispatch(disconnectSocket());
                return undefined;
            };
        }
    }, [isLoggedIn, dispatch])


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4">
            <Toaster />
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        {isPending === 'success' ? 'Email Verified!' : 'Verifying your email'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        {isPending === 'success'
                            ? 'Your email has been successfully verified. Redirecting you to the app...'
                            : 'Please wait while we verify your email address.'
                        }
                    </p>
                </div>

                {/* Animated Loading/Success Indicator */}
                <div className="flex justify-center items-center mb-8">
                    <div className="relative h-20 w-20">
                        {isPending === 'success' ? (
                            // Success checkmark
                            <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        ) : (
                            // Loading animation
                            <div className="flex space-x-2">
                                <div className={`h-3 w-3 rounded-full bg-blue-600 animate-bounce ${isPending === 'failed' ? 'bg-red-500' : ''}`} style={{ animationDelay: '0ms' }}></div>
                                <div className={`h-3 w-3 rounded-full bg-blue-600 animate-bounce ${isPending === 'failed' ? 'bg-red-500' : ''}`} style={{ animationDelay: '150ms' }}></div>
                                <div className={`h-3 w-3 rounded-full bg-blue-600 animate-bounce ${isPending === 'failed' ? 'bg-red-500' : ''}`} style={{ animationDelay: '300ms' }}></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Messages */}
                <div className="space-y-4">
                    {isPending === 'pending' && (
                        <p className="text-blue-600 dark:text-blue-400">Verifying your account...</p>
                    )}

                    {isPending === 'success' && (
                        <div className="text-green-600 dark:text-green-400">
                            <p>✓ Success! Your email has been verified.</p>
                            <p className="text-sm mt-2">Redirecting you to the application...</p>
                        </div>
                    )}

                    {isPending === 'failed' && (
                        <div className="text-red-600 dark:text-red-400">
                            <p>Verification failed. The link may be invalid or expired.</p>
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
                        Need help?{' '}
                        <a href="/support" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Contact support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;
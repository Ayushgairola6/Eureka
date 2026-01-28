import axios from "axios";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { MessageSquare, Send, Star, Briefcase, Target, Check, Loader2 } from "lucide-react";
import { useAppSelector } from "../store/hooks.tsx";

const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;

const ratingOptions = [
  { value: "Very Poor", label: "Very Poor", stars: 1 },
  { value: "Poor", label: "Poor", stars: 2 },
  { value: "Decent", label: "Decent", stars: 3 },
  { value: "Good", label: "Good", stars: 4 },
  { value: "Very Good", label: "Very Good", stars: 5 },
  { value: "Impressive", label: "Impressive", stars: 5 },
];

const Feedback = () => {
  const InputRef = useRef<HTMLTextAreaElement>(null);
  const helpRef = useRef<HTMLInputElement>(null);
  const Occupation = useRef<HTMLInputElement>(null);

  const LoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const [isSending, setIsSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState<string>("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    if (!LoggedIn) {
      toast.error("Please login to submit feedback");
      setIsSending(false);
      return;
    }

    if (
      !InputRef?.current?.value ||
      !helpRef.current?.value ||
      !rating
    ) {
      toast.error("All fields are required");
      setIsSending(false);
      return;
    }

    const AuthToken = localStorage.getItem("AntiNode_six_eta_v1_Authtoken");

    try {
      const response = await axios.post(
        `${BaseApiUrl}/api/user/review-data`,
        {
          review: InputRef.current?.value,
          where: helpRef.current?.value,
          Rating: rating,
          Occupation: Occupation.current?.value || "Not specified",
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${AuthToken}`,
          },
        }
      );

      toast.success(response.data.message || "Feedback submitted successfully");
      setSubmitted(true);

      // Reset form
      setTimeout(() => {
        setSubmitted(false);
        setRating("");
        if (InputRef.current) InputRef.current.value = "";
        if (helpRef.current) helpRef.current.value = "";
        if (Occupation.current) Occupation.current.value = "";
      }, 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit feedback");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {submitted ? (
            // Success State
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 border border-green-200 dark:border-green-900 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-500" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight mb-2 space-grotesk">
                Thank You!
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 space-grotesk">
                Your feedback helps us improve AntiNode
              </p>
            </motion.div>
          ) : (
            // Form State
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl"
            >
              {/* Header */}
              <div className="px-6 py-6 border-b border-zinc-200 dark:border-zinc-800">
                <h1 className="text-2xl font-semibold tracking-tight mb-2 bai-jamjuree-semibold">
                  Share Your Feedback
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 bai-jamjuree-regular">
                  Help us make AntiNode better for everyone
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                {/* Use Case */}
                <div className="space-y-2">
                  <label
                    htmlFor="use-case"
                    className="flex items-center gap-2 text-sm bai-jamjuree-semibold  text-zinc-700 dark:text-zinc-300"
                  >
                    <Target className="w-4 h-4 " />
                    What do you use AntiNode for?
                  </label>
                  <input
                    ref={helpRef}
                    id="use-case"
                    type="text"
                    placeholder="e.g., Research paper analysis, market research..."
                    className="space-grotesk w-full px-3 py-2.5 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 transition-colors"
                    required
                  />
                </div>

                {/* Occupation */}
                <div className="space-y-2">
                  <label
                    htmlFor="occupation"
                    className=" flex items-center gap-2 text-sm bai-jamjuree-semibold  text-zinc-700 dark:text-zinc-300"
                  >
                    <Briefcase className="w-4 h-4" />
                    What do you do? (optional)
                  </label>
                  <input
                    ref={Occupation}
                    id="occupation"
                    type="text"
                    placeholder="e.g., Researcher, Student, Analyst..."
                    className="space-grotesk w-full px-3 py-2.5 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 transition-colors"
                  />
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <label
                    htmlFor="rating"
                    className="bai-jamjuree-semibold  flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    <Star className="w-4 h-4" />
                    How would you rate AntiNode?
                  </label>
                  <div className="grid grid-cols-2 gap-2 space-grotesk">
                    {ratingOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRating(option.value)}
                        className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${rating === option.value
                          ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-2 border-zinc-900 dark:border-white"
                          : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                <div className="space-y-2">
                  <label
                    htmlFor="feedback"
                    className="flex items-center gap-2 text-sm bai-jamjuree-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Your Feedback
                  </label>
                  <textarea
                    ref={InputRef}
                    id="feedback"
                    rows={4}
                    placeholder="Tell us what you think..."
                    className="space-grotesk w-full px-3 py-2.5 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 transition-colors resize-none"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSending}
                  className="bai-jamjuree-semibold  w-full px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Feedback
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black text-center">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Need help?{" "}

                  <a href="mailto:AntiNode5@gmail.com"
                    className="font-medium text-zinc-900 dark:text-white hover:underline"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div >
  );
};

export default Feedback;
import axios from "axios";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "sonner";
import { FiMessageSquare, FiSend, FiStar } from "react-icons/fi";
import { useAppSelector } from "../store/hooks.tsx";
import { FaResearchgate } from "react-icons/fa";
import { MdWork } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { IoHourglass } from "react-icons/io5";
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;

const Feedback = () => {
  const InputRef = useRef<HTMLTextAreaElement>(null);
  const helpRef = useRef<HTMLInputElement>(null);
  const Occupation = useRef<HTMLInputElement>(null);

  const LoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const [isActive, setIsActive] = useState(false);
  const [isSending, setIsSending] = useState("idle");
  const [Rating, setRating] = useState<string>("");
  const HandleFormSubmit = async () => {
    setIsSending("pending");
    if (LoggedIn === false) {
      toast.info("Please Login to continue!");
      setIsSending("idle");

      return;
    }
    if (
      InputRef?.current?.value === "" ||
      helpRef.current?.value === "" ||
      Rating === "" ||
      !Rating
    ) {
      toast.info("All fields are neccessary !");
      setIsSending("idle");

      // console.log(InputRef?.current?.value, helpRef.current?.value)
      return;
    }
    const token = localStorage.getItem("Eureka_six_eta_v1_Auth_token");

    try {
      const response = await axios.post(
        `${BaseApiUrl}/api/user/review-data`,
        {
          review: InputRef.current?.value,
          where: helpRef.current?.value,
          rating: Rating,
          Occupation: Occupation.current?.value,
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.message.includes("Thanks for you valuable time.")) {
        setIsSending("idle");
        toast.message("Thanks for your valuable feedback !");
      }
    } catch (error: any) {
      setIsSending("idle");
      toast.error(error.response.data.message || "Something went wrong.");
      throw new Error("Error while Submitting Feedback");
    }
  };

  return (
    <>
      <div className="h-screen flex items-center justify-center relative z-[2]">
        <Toaster />

        {/* Gradient accent background */}
        <div className="absolute h-full w-full top-0 left-0 bg-gradient-to-br from-blue-800/30 to-cyan-600/20 dark:from-black dark:to-black blur-2xl z-[-1]"></div>

        <motion.div
          drag
          whileDrag={{ scale: 0.9 }}
          dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
          className="bg-white  dark:bg-white/5  grid grid-cols-1 py-6 px-4 rounded-lg gap-4 w-4/5 md:w-1/3 lg:w-1/3 shadow-sm shadow-black border  text-black dark:text-white cursor-grab"
        >
          <section className="my-4 space-y-1">
            <h1 className="text-center bai-jamjuree-bold text-3xl">
              Spare us some time.
            </h1>
            <ul className="bai-jamjuree-regular w-full text-xs text-gray-700 dark:text-gray-300 space-grotesk text-center">
              You can help us make Eureka better !
            </ul>
          </section>

          {/* <span className="flex flex-col gap-2">
            <label
              className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2"
              htmlFor="name"
            >
              <FiUser /> Your Name
            </label>
            <input
              className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk"
              type="text"
              placeholder="What should we call you?"
            />
          </span> */}

          <span className="flex flex-col gap-2">
            <label
              className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2"
              htmlFor="email"
            >
              <FaResearchgate /> What do you use Eureka for?
            </label>
            <input
              ref={helpRef}
              className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk"
              type="text"
              placeholder="Summarizing Research papers."
            />
          </span>
          <span className="flex flex-col gap-2">
            <label
              className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2"
              htmlFor="email"
            >
              <MdWork /> What fascinating work do you do?
            </label>
            <input
              ref={Occupation}
              className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk"
              type="text"
              placeholder="Creative builder"
            />
          </span>
          <span className="flex flex-col gap-2">
            <label
              className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2"
              htmlFor="feedback"
            >
              <FiMessageSquare /> Your Feedback
            </label>
            <textarea
              ref={InputRef}
              rows={2}
              className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk "
              placeholder="What's on your mind?"
              spellCheck
            />
          </span>
          <span className="flex flex-col gap-2 relative">
            <label
              className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2"
              htmlFor="feedback"
            >
              <FiStar /> Rate the performance of Eureka AI
            </label>
            <button
              onClick={() => setIsActive(!isActive)}
              className=" rounded-full p-1 cursor-pointer flex items-center justify-between space-grotesk"
            >
              {"-> "}
              {Rating ? Rating : "Rate us"}
              <IoIosArrowDown
                className={`transition-transform duration-300 ${
                  isActive ? "rotate-90" : "rotate-0"
                }`}
              />
            </button>

            <div
              className={`space-grotesk text-sm bg-white dark:bg-black absolute z-[3]  top-5 right-5 w-4/5 overflow-hidden  rounded-lg shadow-lg dark:shadow-white/10 
        transition-[max-height] duration-500 ease-in-out ${
          isActive ? "max-h-96 border" : "max-h-0 "
        }`}
            >
              <ul className="grid grid-cols-1">
                {[
                  "Very Poor",
                  "Poor",
                  "Decent",
                  "Good",
                  "Very Good",
                  "Impressive",
                ].map((val) => (
                  <li key={val}>
                    <button
                      className="w-full text-left p-2 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white"
                      onClick={() => {
                        setRating(val);
                        setIsActive(false); // Close dropdown after selection
                      }}
                    >
                      {val}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </span>
          <span className="flex items-center justify-center py-4 flex-col gap-2">
            <motion.button
              disabled={isSending === "pending"}
              onClick={HandleFormSubmit}
              whileHover={{
                boxShadow: "2px 2px 2px black",
                transform: "translateY(-3px)",
              }}
              whileTap={{ scale: 0.9, boxShadow: "2px 2px 2px blue" }}
              transition={{ duration: 0.2 }}
              className={`${
                isSending === "pending"
                  ? "bg-green-500 "
                  : "bg-black dark:bg-white"
              } py-2 px-3 rounded-lg space-grotesk dark:text-black text-white w-full CustPoint flex items-center justify-center gap-2`}
            >
              {isSending === "pending" ? (
                <>
                  Submitting
                  <IoHourglass />
                </>
              ) : (
                <>
                  Submit Feedback
                  <FiSend />
                </>
              )}
            </motion.button>
          </span>

          <ul className="space-grotesk text-sm text-center">
            Need help?{" "}
            <a
              className="text-transparent bg-clip-text font-semibold bg-gradient-to-r from-blue-600 to-cyan-600"
              href="mailto:askeureka25@gmail.com"
            >
              Contact Support
            </a>
          </ul>
        </motion.div>
      </div>
    </>
  );
};

export default Feedback;

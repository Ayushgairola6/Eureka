import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { IoIosHourglass, IoMdCode } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { useState, useRef } from "react";
import axios from "axios";
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;
const EmailVerificationForm = () => {
  const [isPending, setIsPending] = useState("idle");
  const EmailRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const HandleEmailVerification = async () => {
    try {
      setIsPending("pending");
      if (EmailRef?.current?.value === "") {
        toast.info("Please Enter you Email Address first !");
        setIsPending("idle");
        return;
      }
      const response = await axios.post(
        `${BaseApiUrl}/api/user/reset-password`,
        { email: EmailRef.current?.value },
        {
          withCredentials: true,
          headers: {},
        }
      );

      if (
        response.data.message ===
        "An email has been sent to you account with the reset link ."
      ) {
        toast.info(
          "An email has been sent to you account with the reset link ."
        );
        setMessage(
          "An email has been sent to you account with the reset link ."
        );
      }
      setIsPending("idle");
      return response.data;
    } catch (err: any) {
      setIsPending("idle");
      toast.error("An error occured, please try again !");
      setMessage("An error occured, please try again !");
      throw new Error(`An error has occured ${err}`);
    }
  };
  return (
    <>
      <div className="h-screen flex items-center justify-center relative z-[2]  ">
        {/* gradient accent background */}
        {/* <div className="absolute h-full w-full top-0 left-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 dark:from-black dark:to-black blur-2xl z-[-1]"></div> */}

        <motion.div
          drag
          whileDrag={{ scale: 0.9 }}
          dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
          className="bg-gradient-to-br from-gray-100 to-gray-200 
            dark:from-black dark:to-white/10 grid grid-cols-1  py-6 px-4 rounded-lg gap-4 w-4/5 md:w-1/3 lg:w-1/3 shadow-sm shadow-black border dark:border-gray-400 cursor-grab"
        >
          <h1 className="text-center space-grotesk font-bold  text-2xl">
            Identify yourself{" "}
          </h1>
          <span className="text-xs text-purple-500  space-grotesk text-center">
            verification is the first step
          </span>

          <span className="flex flex-col gap-2">
            <label
              className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2"
              htmlFor="email"
            >
              <MdEmail /> Email Address
            </label>
            <input
              ref={EmailRef}
              className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk"
              type="text"
              placeholder="Your email address"
            />
          </span>

          {/* server response as message */}
          {message && (
            <div className="w-full space-grotesk p-1 dark:text-white text-black text-center text-xs ">
              {message}
            </div>
          )}
          {/* buttons */}
          <span className="flex items-center justfify-center py-4 flex-col gap-2">
            <motion.button
              disabled={isPending !== "idle"}
              onClick={HandleEmailVerification}
              whileHover={{
                boxShadow: "2px 2px 2px black",
                transform: "translateY(-3px)",
              }}
              whileTap={{ scale: 0.9, boxShadow: "2px 2px 2px blue" }}
              transition={{ duration: 0.2 }}
              className="bg-black dark:bg-white py-2 px-3 rounded-lg space-grotesk dark:text-black text-white w-full CustPoint flex items-center justify-center gap-2"
            >
              {isPending === "idle" ? (
                <>
                  Get Code <IoMdCode />
                </>
              ) : (
                <>
                  Sending <IoIosHourglass className="animate-spin" />
                </>
              )}
            </motion.button>
          </span>
          <ul className="space-grotesk  text-sm text-center ">
            Have an Account?
            <Link
              className="text-transparent bg-clip-text font-semibold bg-gradient-to-r from-purple-600 to-blue-600 "
              to="/Login"
            >
              {" "}
              Login
            </Link>
          </ul>
        </motion.div>
      </div>
    </>
  );
};

export default EmailVerificationForm;

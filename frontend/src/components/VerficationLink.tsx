import axios from "axios";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { BiLink } from "react-icons/bi";
import { IoIosHourglass } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { Link } from "react-router";
import { toast } from "sonner";
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;

const VerificationLink = () => {
  const EmailRef = useRef<HTMLInputElement>(null);
  const [isPending, setIsPending] = useState(false);

  const GetEmail = async () => {
    try {
      setIsPending(true);
      if (!EmailRef.current || !EmailRef.current.value) {
        toast.error("Please use a valid email address");
        setIsPending(false);
        return;
      }

      const response = await axios.post(
        `${BaseApiUrl}/api/user/get-verification-email`,
        { email: EmailRef?.current.value },
        {
          withCredentials: true,
        }
      );
      setIsPending(false);
      toast.info(response.data.message);
      return response.data;
    } catch (err: any) {
      setIsPending(false);
      toast.error(err.response.data.message || "Something went wrong");
    }
  };
  return (
    <>
      <div className="h-screen flex items-center justify-center relative z-[2] overflow-hidden ">
        {/* gradient accent background */}
        <div className="absolute h-full w-full top-0 left-0 blur-2xl flex  z-[-1]">
          <div
            style={{
              background: `
          radial-gradient(circle at 30% 30%, #4B0082 0%, transparent 50%),
          radial-gradient(circle at 70% 20%, #87CEEB 10%, transparent 50%),
          radial-gradient(circle at 50% 70%, #FF69B4 15%, transparent 50%),
          radial-gradient(circle at 80% 60%, #FFBF00 20%, transparent 50%),
          radial-gradient(circle at 20% 50%, #9370DB 25%, transparent 50%)
        `,
              backgroundBlendMode: "screen",
            }}
            className=" h-[70%] w-[90%] md:w-[40%] m-auto  opacity-70 rounded-t-xl    rounded-br-md rounded-bl-sm Indicator"
          ></div>
        </div>

        <motion.div
          drag
          whileDrag={{ scale: 0.9 }}
          dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
          className="bg-white dark:bg-black grid grid-cols-1  py-6 px-4 rounded-lg gap-4 w-4/5 md:w-1/3 lg:w-1/3 shadow-sm shadow-black border dark:border-gray-400 cursor-grab"
        >
          <h1 className="text-center space-grotesk font-bold  text-2xl">
            Identify yourself{" "}
          </h1>

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
              type="email"
              placeholder="Your email address"
            />
          </span>

          {/* buttons */}
          <span className="flex items-center justfify-center py-4 flex-col gap-2">
            <motion.button
              disabled={isPending === true}
              onClick={GetEmail}
              whileHover={{
                boxShadow: "2px 2px 2px black",
                transform: "translateY(-3px)",
              }}
              whileTap={{ scale: 0.9, boxShadow: "2px 2px 2px blue" }}
              transition={{ duration: 0.2 }}
              className="bg-black dark:bg-white py-2 px-3 rounded-lg space-grotesk dark:text-black text-white w-full CustPoint flex items-center justify-center gap-2"
            >
              {isPending === false ? (
                <>
                  Get Link <BiLink />
                </>
              ) : (
                <>
                  Processing <IoIosHourglass className="animate-spin" />
                </>
              )}
            </motion.button>
          </span>
          <ul className="space-grotesk  text-sm text-center ">
            Already Verified?
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
export default VerificationLink;

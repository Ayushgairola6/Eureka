import { motion } from "framer-motion";
import { Link } from "react-router";
import { IoIosHourglass } from "react-icons/io";
import { MdPassword, MdLockReset } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;

const ResetPassword = () => {
  const [isPending, setIsPending] = useState("idle");
  const [type, setType] = useState("password");
  const [token, setToken] = useState<string | null>(null);
  const Input1 = useRef<HTMLInputElement>(null);
  const Input2 = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      // console.log(urlParams);
      const resetToken = urlParams.get("token");
      setToken(resetToken);
    }
  }, []);

  const HandlePasswordReset = async () => {
    try {
      setIsPending("pending");
      if (!token) {
        toast.error("No resetToken found");
        setIsPending("idle");

        return;
      } else if (!Input1?.current?.value || !Input2.current?.value) {
        toast.info("All fields are mandatory");
        setIsPending("idle");

        return;
      } else if (Input1.current.value !== Input2.current.value) {
        setIsPending("idle");

        toast.error("Password does not match");
        return;
      }

      const response = await axios.put(
        `${BaseApiUrl}/api/user/reset-password/confirm`,
        {
          newpassword1: Input1.current.value,
          newpassword2: Input2.current.value,
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.message(response.data.message);
      setIsPending("idle");

      return response.data;
    } catch (error) {
      toast.error(`Error while resetting your password`);
      setIsPending("idle");

      throw new Error(`Error while resetting your password : ${error}`);
    }
  };

  return (
    <>
      <div className="h-screen flex items-center justify-center relative z-[2]">
        {/* gradient accent background */}
        <div className="absolute h-full w-full top-0 left-0 bg-gradient-to-br from-pink-800/30 to-fushia-600/20 blur-2xl z-[-1] dark:from-black dark:to-black"></div>

        <motion.div
          drag
          whileDrag={{ scale: 0.9 }}
          dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
          className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-black dark:to-white/10 grid grid-cols-1  py-6 px-4 rounded-lg gap-4 w-4/5 md:w-1/3 lg:w-1/3 border border-gray-400 cursor-grab"
        >
          <span className="text-xl bai-jamjuree-semibold text-gray-100  text-center">
            Let's reset your password
          </span>

          <span className="flex flex-col gap-2">
            <label
              className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2"
              htmlFor="password"
            >
              <MdPassword />
              New Password
            </label>
            <input
              ref={Input1}
              spellCheck
              className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk"
              type={type}
              placeholder="Choose a strong password"
            />
          </span>
          <span className="flex flex-col gap-2">
            <label
              className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2"
              htmlFor="password"
            >
              <MdPassword />
              Confirm Password
            </label>
            <input
              ref={Input2}
              spellCheck
              className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk"
              type={type}
              placeholder="Choose a strong password"
            />
          </span>
          {/* show password thing */}
          <span className="flex items-center justify-end gap-4 text-sm space-grotesk">
            <input
              onChange={() => {
                if (type === "password") {
                  setType("text");
                } else {
                  setType("password");
                }
              }}
              type="checkbox"
            />
            <label htmlFor="show">show password</label>
          </span>
          {/* cta buttons */}
          <span className="flex items-center justfify-center py-4 flex-col gap-2">
            <motion.button
              onClick={HandlePasswordReset}
              disabled={isPending !== "idle"}
              whileHover={{
                boxShadow: "2px 2px 2px black",
                transform: "translateY(-3px)",
              }}
              whileTap={{ scale: 0.9, boxShadow: "2px 2px 2px blue" }}
              transition={{ duration: 0.2 }}
              className="bg-black dark:bg-white dark:text-black py-2 px-3 rounded-lg space-grotesk text-white w-full CustPoint flex items-center justify-center gap-2"
            >
              {isPending === "idle" ? (
                <>
                  Reset Password <MdLockReset />
                </>
              ) : (
                <>
                  Please wait <IoIosHourglass />
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

export default ResetPassword;

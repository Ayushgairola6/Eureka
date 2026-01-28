import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { CiLogin } from "react-icons/ci";
import { IoIosHourglass } from "react-icons/io";
import { MdEmail, MdPassword } from "react-icons/md";
import { useAppDispatch } from "../store/hooks.tsx";
import { setIsLogin } from "../store/AuthSlice.ts";
import { LuEye, LuEyeClosed, LuUserPlus } from "react-icons/lu";
import { PiArrowUpRight } from "react-icons/pi";
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;

const Login = () => {
  const [isPending, setIsPending] = useState("idle");
  const [type, setType] = useState<string>("password");
  const navigate = useNavigate();
  const Email = useRef<HTMLInputElement>(null);
  const Password = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isPending === "success") {
      navigate("/Interface");
    }
  }, [isPending]);

  // google auth
  const handleGoogleAuth = () => {
    window.location.href = `${BaseApiUrl}/api/auth/google`;
  };

  // manual auth
  const HandleUserLogin = async () => {
    try {
      setIsPending("pending");
      if (!Email?.current?.value || !Password?.current?.value) {
        setIsPending("idle");
        toast.info("All fields are mandatory.");
        return;
      }

      if (!Email.current.value.split("").includes("@")) {
        setIsPending("idle");
        toast.message("Please Enter a valid email address.");
        return;
      }

      const userInformation = {
        email: Email.current?.value,
        password: Password.current?.value,
      };

      const response = await axios.post(
        `${BaseApiUrl}/api/user/login`,
        userInformation,
        {
          withCredentials: true,
          headers: {},
        }
      );

      if (response.data.message.includes("Login successful")) {
        setIsPending("success");
        dispatch(setIsLogin(true));
        setTimeout(() => {
          setIsPending("idle");
        }, 3000);
        // console.log(response.data)
        localStorage.setItem(
          "AntiNode_six_eta_v1_Authtoken",
          response.data.AuthToken
        );
      }
    } catch (error: any) {

      toast.error(error.message || error?.response?.data?.message);

      setIsPending("idle");
    }
  };

  return (
    <>
      <div className="relative h-screen flex items-center justify-center  z-[2]  dark:bg-black overflow-hidden">
        <div className="relative bg-white dark:bg-black grid grid-cols-1  py-6 px-4 rounded-md gap-4 w-[90%] md:w-1/3 lg:w-1/3 shadow-2xl cursor-grab border dark:border-white/10 border-black/10">
          <h1 className="text-center bai-jamjuree-bold  md:text-3xl text-2xl ">
            Welcome back!
          </h1>
          <span className="text-xs md:text-sm text-gray-700 dark:text-gray-400 bai-jamjuree-regular text-center">
            Continue from where you left off
          </span>

          <span className="flex flex-col gap-2">
            <label
              className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2"
              htmlFor="email"
            >
              <MdEmail /> Email Address
            </label>
            <input
              ref={Email}
              className="border-none outline-none focus:ring-0  px-2 py-1 rounded-lg space-grotesk"
              type="email"
              placeholder="Your email address"
            />
          </span>
          <span className="flex flex-col gap-2">
            <label
              className="bai-jamjuree-semibold text-sm  gap-2 flex items-center justify-between"
              htmlFor="password"
            >
              <ul className="flex gap-2 items-center justify-center ">
                <MdPassword /> Password
              </ul>

              <Link
                to="/ResetPassword"
                className="bai-jamjuree-semibold text-xs text-end text-gray-700 dark:text-gray-300 dark:hover:text-sky-600 hover:text-sky-600 transition-colors duration-300"
              >
                Forgot password?
              </Link>
            </label>

            <section className="relative ">
              <input
                ref={Password}
                spellCheck
                className="w-full border-none outline-none focus:ring-0 px-2 py-1 rounded-lg space-grotesk"
                type={type}
                placeholder="Choose a strong password"
              />
              <button
                onClick={() =>
                  setType((prev) => (prev === "text" ? "password" : "text"))
                }
                className="absolute right-2 top-2 cursor-pointer"
              >
                {type === "password" ? (
                  <LuEyeClosed size={20} />
                ) : (
                  <LuEye size={20} />
                )}
              </button>
            </section>
          </span>

          <span className="flex items-center justfify-center py-4 flex-col gap-2 ">
            {/*normal button */}
            <motion.button
              disabled={isPending !== "idle"}
              whileHover={{
                boxShadow: "2px 2px 2px black",
                transform: "translateY(-3px)",
              }}
              onClick={HandleUserLogin}
              whileTap={{ scale: 0.9, boxShadow: "2px 2px 2px blue" }}
              transition={{ duration: 0.2 }}
              className={`${isPending === "idle"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-green-500"
                } py-2 px-3 rounded-lg bai-jamjuree-regular  w-full  flex items-center justify-center gap-2`}
            >
              {isPending === "idle" ? (
                <>
                  Login <CiLogin />
                </>
              ) : (
                <>
                  Please wait <IoIosHourglass className="animate-spin" />
                </>
              )}
            </motion.button>

            <span className="text-xs space-grotesk">OR</span>
            {/* google button */}
            <motion.button
              onClick={handleGoogleAuth}
              whileHover={{
                boxShadow: "2px 2px 2px black",
                transform: "translateY(-3px)",
              }}
              whileTap={{ scale: 0.9, boxShadow: "2px 2px 2px black" }}
              transition={{ duration: 0.2 }}
              className="bg-indigo-400 py-2 px-3 rounded-lg bai-jamjuree-regular text-black w-full flex items-center justify-center gap-2  "
            >
              Continue with Google
              <img className="h-6 w-6" src="/googleLogo.png" alt="" />
            </motion.button>
          </span>
          {/* links to other pages */}
          <div className="space-grotesk flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            {/* Register - Outlined Glass Chip */}
            <Link
              to="/Register"
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 dark:text-gray-300 text-xs font-space-grotesk hover:bg-white/10 dark:hover:text-white hover:border-white/30 transition-all duration-300"
            >
              <LuUserPlus className="w-3.5 h-3.5 text-blue-400 dark:group-hover:text-white transition-colors" />
              <span>Create Account</span>
            </Link>

            {/* Verify - Subtle Text Link on the right */}
            <Link
              to="/Verification"
              className="group flex items-center gap-1 text-xs dark:text-gray-500 font-medium dark:hover:text-gray-300 transition-colors"
            >
              <span>Verification link expired?</span>
              <PiArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

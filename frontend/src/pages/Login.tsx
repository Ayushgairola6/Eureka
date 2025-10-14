import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast, Toaster } from "sonner";
import { CiLogin } from "react-icons/ci";
import { IoIosHourglass } from "react-icons/io";
import { MdEmail, MdPassword } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../store/hooks.tsx";
import { setIsLogin } from "../store/AuthSlice.ts";
import { LuEye, LuEyeClosed } from "react-icons/lu";
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;

const Login = () => {
  const [isPending, setIsPending] = useState("idle");
  const [type, setType] = useState<string>("password");
  const navigate = useNavigate();
  const Email = useRef<HTMLInputElement>(null);
  const Password = useRef<HTMLInputElement>(null);
  const { isDarkMode } = useAppSelector((state) => state.auth);
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
        toast("Please fill in all fields !");
        return;
      }

      if (!Email.current.value.split("").includes("@")) {
        setIsPending("idle");
        toast("Please Enter a valid email address");
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
          "Eureka_six_eta_v1_Authtoken",
          response.data.AuthToken
        );
      }
    } catch (error: any) {
      setIsPending("failed");

      toast.error(error?.response?.data?.message);

      setTimeout(() => {
        setIsPending("idle");
      }, 3000);
    }
  };

  return (
    <>
      <div className="h-screen flex items-center justify-center relative z-[2]  dark:bg-black ">
        <Toaster />

        {/* gradient accent background */}
        {!isDarkMode && (
          <div className="absolute h-full w-full top-0 left-0  blur-2xl z-[-1] bg-gradient-to-br from-pink-600/30 to-fuchsia-600/30 "></div>
        )}

        <motion.div
          drag
          whileDrag={{ scale: 0.9 }}
          dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
          className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/10 dark:to-indigo-900/20 grid grid-cols-1  py-6 px-4 rounded-lg gap-4 w-4/5 md:w-1/3 lg:w-1/3 shadow-sm shadow-black cursor-grab border dark:border-gray-400"
        >
          <h1 className="text-center space-grotesk font-bold  text-2xl">
            Welcome back{" "}
          </h1>
          <span className="text-xs text-gray-700 dark:text-gray-400 space-grotesk text-center">
            Login to continue contributing !
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
              className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk"
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
                Do not remember your password ?
              </Link>
            </label>

            <section className="relative ">
              <input
                ref={Password}
                spellCheck
                className="w-full border border-gray-300 px-2 py-1 rounded-lg space-grotesk"
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

          <span className="flex items-center justfify-center py-4 flex-col gap-2">
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
              className={`${
                isPending === "idle"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-green-500"
              } py-2 px-3 rounded-lg space-grotesk  w-full CustPoint flex items-center justify-center gap-2`}
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
              className="bg-indigo-400 py-2 px-3 rounded-lg space-grotesk text-black w-full flex items-center justify-center gap-2 CustPoint "
            >
              Login with Google
              <img className="h-6 w-6" src="/googleLogo.png" alt="" />
            </motion.button>
          </span>
          <div>
            <ul className="space-grotesk  text-sm text-center ">
              New Here ?
              <Link className="text-teal-600" to="/Register">
                {" "}
                Register
              </Link>
            </ul>
            <ul className="space-grotesk  text-xs text-center ">
              Need to verify account ?
              <Link className="text-sky-600" to="/Verification">
                {" "}
                Get link
              </Link>
            </ul>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;

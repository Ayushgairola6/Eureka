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

      }
    } catch (error: any) {
      toast.error(error.message || error?.response?.data?.message);
      setIsPending("idle");
    }
  };

  return (
    <>
      <div className="relative h-screen flex items-center justify-center z-[2] bg-neutral-50 dark:bg-[#050505] overflow-hidden">
        {/* --- Background System Grid (Subtle) --- */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

        <div className="relative flex flex-col w-[95%] md:w-[420px] transition-all duration-500">

          {/* --- Top Metadata Strip --- */}
          <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 dark:bg-neutral-800 rounded-t-xl border-x border-t border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
              <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-[0.2em]">Auth_Protocol_v2.0</span>
            </div>
            <span className="font-mono text-[9px] text-neutral-500 uppercase">Ver: 1.0.1-beta</span>
          </div>

          {/* --- Main Identity Card --- */}
          <div className="bg-white dark:bg-[#0A0A0A] p-8 rounded-b-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl">

            {/* Header */}
            <div className="mb-8">
              <h1 className="bai-jamjuree-bold text-3xl text-neutral-900 dark:text-white tracking-tighter">
                ACCESS_IDENTITY
              </h1>
              <p className="text-xs space-grotesk text-neutral-500 dark:text-neutral-400 mt-1 uppercase tracking-widest">
                Establish secure connection to AntiNode
              </p>
            </div>

            <div className="space-y-6">
              {/* Email Field */}
              <div className="group flex flex-col gap-2">
                <label className="font-mono text-[10px] font-black text-neutral-400 uppercase tracking-tighter flex items-center gap-2 group-focus-within:text-orange-600 transition-colors">
                  <MdEmail size={12} /> User_Identifier
                </label>
                <input
                  ref={Email}
                  className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-neutral-800 px-4 py-3 rounded-lg space-grotesk text-sm outline-none focus:border-orange-600/50 transition-all placeholder:opacity-30"
                  type="email"
                  placeholder="name@domain.com"
                />
              </div>

              {/* Password Field */}
              <div className="group flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[10px] font-black text-neutral-400 uppercase tracking-tighter flex items-center gap-2 group-focus-within:text-orange-600 transition-colors">
                    <MdPassword size={12} /> Access_Key
                  </label>
                  <Link to="/ResetPassword" title="Recovery" className="text-[10px] font-mono text-neutral-400 hover:text-orange-600 transition-colors uppercase">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    ref={Password}
                    className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-neutral-800 px-4 py-3 rounded-lg space-grotesk text-sm outline-none focus:border-orange-600/50 transition-all"
                    type={type}
                    placeholder="••••••••"
                  />
                  <button
                    onClick={() => setType((prev) => (prev === "text" ? "password" : "text"))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-orange-600 transition-colors"
                  >
                    {type === "password" ? <LuEyeClosed size={16} /> : <LuEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col gap-3">
                <motion.button
                  disabled={isPending !== "idle"}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={HandleUserLogin}
                  className={`w-full py-4 rounded-lg bai-jamjuree-bold text-sm uppercase tracking-widest transition-all
              ${isPending === "idle"
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white"
                      : "bg-orange-600/20 text-orange-600 cursor-wait"} 
              flex items-center justify-center gap-2`}
                >
                  {isPending === "idle" ? (
                    <>Initiate Login <CiLogin className="stroke-2" /></>
                  ) : (
                    <>Authenticating... <IoIosHourglass className="animate-spin" /></>
                  )}
                </motion.button>

                <div className="relative flex items-center justify-center my-2">
                  <div className="w-full h-[1px] bg-neutral-100 dark:bg-neutral-800" />
                  <span className="absolute bg-white dark:bg-[#0A0A0A] px-4 font-mono text-[9px] text-neutral-500 tracking-[0.3em]">SECURE_SSO</span>
                </div>

                <motion.button
                  onClick={handleGoogleAuth}
                  whileHover={{ y: -2 }}
                  className="w-full py-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-transparent font-mono text-[11px] uppercase tracking-tighter flex items-center justify-center gap-3 hover:bg-neutral-50 dark:hover:bg-white/5 transition-all"
                >
                  <img className="h-4 w-4 " src="/googleLogo.png" alt="" />
                  Continue via Google
                </motion.button>
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-10 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link to="/Register" className="flex items-center gap-2 text-[10px] font-mono font-bold text-neutral-500 hover:text-orange-600 transition-all uppercase">
                <LuUserPlus size={14} /> New_Operator?
              </Link>
              <Link to="/Verification" className="text-[10px] font-mono text-neutral-400 hover:text-neutral-200 transition-all flex items-center gap-1">
                Expired link? <PiArrowUpRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

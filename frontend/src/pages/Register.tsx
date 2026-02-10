import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { toast } from "sonner";
import { FaUserPlus, FaUser } from "react-icons/fa";
import { MdEmail, MdPassword } from "react-icons/md";
import { LuEyeClosed, LuEye, LuLogIn } from "react-icons/lu";
const BaseApiUrl = import.meta.env.VITE_BACKEND_API_URL;
import { IoIosHourglass } from "react-icons/io";

const Register = () => {
  const navigate = useNavigate();
  const [Strength, setStrength] = useState(0);
  const [issue, setIssue] = useState(false);
  const Username = useRef<HTMLInputElement>(null);
  const Email = useRef<HTMLInputElement>(null);
  const Password = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<string>("password");
  const [isPending, setIsPending] = useState("idle");
  const [HasAccepted, setHasAccepted] = useState(false);
  // google auth handler
  const handleGoogleAuth = () => {
    window.location.href = `${BaseApiUrl}/api/auth/google`;
  };

  useEffect(() => {
    if (isPending === "success") {
      navigate("/Login");
    }
  }, [isPending]);
  const symboles = ["@", "!", "#", "$", "%", "^", "&", "*"];
  const Numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  //   password strength handler
  const ReflectPasswordStrength = (e: ChangeEvent<HTMLInputElement>) => {
    const inputvalue = e.target.value.trim();
    let strength = 0;

    // Your original checks - but calculated fresh each time
    if (inputvalue.split("").some((char) => symboles.includes(char)))
      strength += 2;
    if (inputvalue.split("").some((char) => Numbers.includes(char)))
      strength += 2;
    if (
      inputvalue
        .split("")
        .some(
          (char) => char === char.toUpperCase() && char !== char.toLowerCase()
        )
    )
      strength += 2;
    if (inputvalue.length >= 8) strength += 1;

    setStrength(Math.min(strength, 7));
  };

  const HandleRegister = async () => {
    setIsPending("pending");

    if (HasAccepted === false) {
      toast.message(
        "You need to accept our terms and conditions in order to continue"
      );
      setIsPending("idle");

      return;
    }
    if (Strength < 7) {
      toast.message("Please choose a stronger password");
      setIsPending("idle");

      return;
    } else if (!Username.current?.value.includes("_")) {
      setIsPending("idle");

      toast.message("Username must include underscore ( _ )");
      return;
    } else if (
      !Username.current?.value ||
      !Email.current?.value ||
      !Password.current?.value
    ) {
      setIsPending("idle");

      toast.message("All fields are Mandatory !");
      return;
    }

    const UserInformation = {
      username: Username.current.value.trim(),
      email: Email.current.value,
      password: Password.current.value,
      AcceptedConditions: HasAccepted,
    };

    try {
      const response = await axios.post(
        `${BaseApiUrl}/api/user/register`,
        UserInformation,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${"token"}`,
          },
        }
      );

      let reset: any;
      if (
        response.data.message ===
        "An email has been sent to your registered email !"
      ) {
        toast("An email has been sent to your registered email !");
        setIsPending("success");
        reset = setTimeout(() => {
          setIsPending("idle");
        }, 2000);
      }
      return () => clearTimeout(reset);
    } catch (error: any) {
      setIsPending("failed");

      toast.error(error.response.data.message);
      setTimeout(() => {
        setIsPending("idle");
      }, 3000);
    }
  };

  return (
    <>
      <div className="relative min-h-screen flex items-center justify-center z-[2] bg-neutral-50 dark:bg-[#050505] overflow-hidden py-10">
        {/* --- Background Industrial Accent --- */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

        <div className="relative flex flex-col w-[95%] md:w-[450px] transition-all">

          {/* --- Header Authentication Strip --- */}
          <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 dark:bg-neutral-800 rounded-t-xl border-x border-t border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">Protocol: NEW_USER_REG</span>
            </div>
            <span className="font-mono text-[9px] text-neutral-500 uppercase italic">Ver: 1.0.1-beta</span>
          </div>

          {/* --- Main Registration Form --- */}
          <div className="bg-white dark:bg-[#0A0A0A] p-8 rounded-b-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl">

            <div className="mb-8">
              <h1 className="space-grotesk font-bold text-3xl text-neutral-900 dark:text-white tracking-tight">
                Join AntiNode
              </h1>
              <p className="text-sm bai-jamjuree-regular text-neutral-500 dark:text-neutral-400 mt-2">
                Create your decentralized identity to start contributing.
              </p>
            </div>

            <div className="space-y-5">

              {/* Username Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold space-grotesk text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <FaUser className="text-neutral-400" size={12} /> Username
                </label>
                <input
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, "");
                    setIssue(!value.includes("_") && value !== "");
                    e.target.value = value;
                  }}
                  ref={Username}
                  className={`w-full bg-neutral-50 dark:bg-white/5 border px-4 py-2.5 rounded-lg space-grotesk text-sm transition-all outline-none 
              ${issue ? 'border-red-500/50' : 'border-neutral-200 dark:border-neutral-800 focus:border-orange-600/50'}`}
                  type="text"
                  placeholder="e.g. John_Doe"
                />
                {issue && (
                  <span className="font-mono text-[10px] text-red-500 uppercase tracking-tighter animate-pulse">
                    [!] System Requirement: Must include underscore (_)
                  </span>
                )}
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold space-grotesk text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <MdEmail className="text-neutral-400" size={14} /> Email Address
                </label>
                <input
                  ref={Email}
                  className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-neutral-800 px-4 py-2.5 rounded-lg space-grotesk text-sm outline-none focus:border-orange-600/50 transition-all"
                  type="email"
                  placeholder="contact@domain.com"
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold space-grotesk text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <MdPassword className="text-neutral-400" size={14} /> Secure Password
                </label>
                {Strength < 7 && <p className='text-[10px] text-red-600 space-grotesk'>
                  * Password must be minimum 8 characters long and should included one UPPERCASE, one SYMBOL and one NUMBER at least.
                </p>}
                <div className="relative">
                  <input
                    ref={Password}
                    onChange={(e) => ReflectPasswordStrength(e)}
                    className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-neutral-800 px-4 py-2.5 rounded-lg space-grotesk text-sm outline-none focus:border-orange-600/50 transition-all"
                    type={type}
                    placeholder="Min. 8 characters"
                  />
                  <button
                    onClick={() => setType(t => t === "text" ? "password" : "text")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                  >
                    {type === "password" ? <LuEyeClosed size={18} /> : <LuEye size={18} />}
                  </button>
                </div>

                {/* Enhanced Strength Bar */}
                <div className="mt-1 space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="font-mono text-[8px] uppercase text-neutral-500 tracking-widest">Strength_Index</span>
                    <span className={`font-mono text-[8px] uppercase ${Strength > 5 ? 'text-green-500' : 'text-neutral-500'}`}>
                      {Strength > 5 ? 'PASSED' : 'ANALYZING...'}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-white/5 rounded-full h-[3px] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(Strength + 1) * 14.2}%`,
                        backgroundColor: Strength < 3 ? "#ef4444" : Strength < 6 ? "#f59e0b" : "#22c55e"
                      }}
                      className="h-full transition-all duration-500"
                    />
                  </div>
                  {Strength < 7 && Password.current?.value && (
                    <span className="text-[10px] bai-jamjuree-regular text-neutral-500 italic">
                      Include uppercase, numbers, and symbols for better security.
                    </span>
                  )}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-white/[0.02] rounded-lg border border-neutral-100 dark:border-neutral-800/50">
                <input
                  onClick={() => setHasAccepted(!HasAccepted)}
                  type="checkbox"
                  className="mt-1 accent-orange-600 rounded cursor-pointer"
                />
                <p className="text-[11px] bai-jamjuree-regular text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  I acknowledge and accept the <Link className="text-orange-600 font-bold hover:underline" to="/terms">Terms of Service</Link> and the operational protocols of the AntiNode community.
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-4 flex flex-col gap-3">
                <motion.button
                  disabled={isPending !== "idle"}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={HandleRegister}
                  className={`w-full py-4 rounded-lg space-grotesk font-bold text-xs uppercase tracking-[0.2em] transition-all
              ${isPending === "idle"
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500 cursor-wait"} 
              flex items-center justify-center gap-2`}
                >
                  {isPending === "idle" ? (
                    <>Register Identity <FaUserPlus /></>
                  ) : (
                    <>Syncing Database... <IoIosHourglass className="animate-spin" /></>
                  )}
                </motion.button>

                <div className="relative flex items-center justify-center py-2">
                  <div className="w-full h-[1px] bg-neutral-100 dark:bg-neutral-800" />
                  <span className="absolute bg-white dark:bg-[#0A0A0A] px-4 font-mono text-[9px] text-neutral-500 tracking-[0.3em]">OAUTH_BYPASS</span>
                </div>

                <motion.button
                  onClick={handleGoogleAuth}
                  className="w-full py-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-transparent font-mono text-[11px] uppercase tracking-tighter flex items-center justify-center gap-3 hover:bg-neutral-50 dark:hover:bg-white/5 transition-all text-neutral-600 dark:text-neutral-400"
                >
                  <img className="h-4 w-4 " src="/googleLogo.png" alt="Google" />
                  Join via Google
                </motion.button>
              </div>
            </div>

            {/* Footer Switcher */}
            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 text-center">
              <Link to="/Login" className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-neutral-500 hover:text-orange-600 transition-all uppercase tracking-widest">
                <LuLogIn size={14} /> Already a Node Operator? Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;

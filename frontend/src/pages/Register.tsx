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
      <div className="h-screen flex items-center justify-center relative z-[2] dark:bg-black dark:text-white overflow-hidden">
        {/* gradient accent background */}

        <div className="bg-white dark:bg-black grid grid-cols-1  py-6 px-4 rounded-lg gap-4 w-[90%] md:w-1/3 lg:w-1/3 shadow-2xl border dark:border-white/10 border-black/10 cursor-grab relative">
          <h1 className="text-center space-grotesk font-bold  text-2xl">
            Join AntiNode{" "}
          </h1>
          <span className="text-xs text-gray-700 dark:text-gray-400 space-grotesk text-center">
            Start contributing today and become a part of our community .
          </span>
          <span className="flex flex-col gap-2">
            <label
              className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2"
              htmlFor="username"
            >
              {" "}
              <FaUser />
              Username{" "}
            </label>
            {Username.current?.value && issue === true && (
              <ul className="text-xs text-red-500 space-grotesk">
                *must include underscore
              </ul>
            )}
            <input
              onChange={(e) => {
                const value = e.target.value.replace(/\s/g, "");
                if (!value) {
                  setIssue(false);
                }
                if (!value.includes("_")) {
                  setIssue(true);
                } else {
                  setIssue(false);
                }
                e.target.value = value; // Remove spaces
              }}
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault(); // Block spacebar
                }
              }}
              ref={Username}
              className=" px-2 py-1 rounded-lg space-grotesk border-none outline-none focus:ring-0 "
              type="text"
              placeholder="John_Doe"
            />
          </span>
          <span className="flex flex-col gap-2">
            <label
              className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2"
              htmlFor="email"
            >
              <MdEmail />
              Email Address{" "}
            </label>
            <input
              ref={Email}
              className="border-none outline-none focus:ring-0 px-2 py-1 rounded-lg space-grotesk"
              type="email"
              placeholder="JohnDoe12@yahoo.com"
            />
          </span>
          <span className="flex flex-col gap-2">
            <label
              className="bai-jamjuree-semibold text-sm flex items-center justify-start gap-2"
              htmlFor="username"
            >
              <MdPassword /> Password{" "}
            </label>
            {Password.current?.value && Strength < 7 && (
              <ul className="text-xs space-grotesk text-red-500">
                * must include uppercase letters, symbols and numbers
              </ul>
            )}
            <section className="relative ">
              <input
                ref={Password}
                spellCheck
                onChange={(e) => ReflectPasswordStrength(e)}
                className="w-full border-none outline-none focus:ring-0  px-2 py-1 rounded-lg space-grotesk"
                type={type}
                placeholder="A strong password"
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

            {Password.current?.value && (
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-500 ${
                    Strength === 0
                      ? "bg-red-600 w-1/6"
                      : Strength === 1
                      ? "bg-red-500 w-2/6"
                      : Strength === 2
                      ? "bg-orange-500 w-3/6"
                      : Strength === 3
                      ? "bg-yellow-500 w-4/6"
                      : Strength === 4
                      ? "bg-yellow-400 w-5/6"
                      : Strength === 5
                      ? "bg-green-400 w-6/6"
                      : Strength === 6
                      ? "bg-green-500 w-11/12"
                      : "bg-green-600 w-full"
                  }`}
                />
              </div>
            )}
            <section className=" flex items-center justify-between w-full bai-jamjuree-regular text-xs gap-2 p-2">
              <input
                spellCheck
                onClick={() =>
                  setHasAccepted((prev) => (prev === true ? false : true))
                }
                type="checkbox"
              />
              <span>
                By clicking this you agree to our
                <Link className="text-sky-600" to="/terms-and-conditions">
                  {" "}
                  terms-and-conditions
                </Link>
              </span>
            </section>
          </span>
          <span className="flex items-center justfify-center py-4 flex-col gap-2">
            <motion.button
              disabled={isPending !== "idle"}
              whileHover={{
                boxShadow: "2px 2px 2px black",
                transform: "translateY(-3px)",
              }}
              onClick={HandleRegister}
              whileTap={{ scale: 0.9, boxShadow: "2px 2px 2px blue" }}
              transition={{ duration: 0.2 }}
              className="bg-black dark:bg-white dark:text-black py-2 px-3 rounded-lg space-grotesk text-white w-full CustPoint flex items-center justify-center gap-2"
            >
              {isPending === "idle" ? (
                <>
                  Create Account <FaUserPlus />
                </>
              ) : (
                <>
                  Setting up your Account{" "}
                  <IoIosHourglass className="animate-spin" />
                </>
              )}{" "}
            </motion.button>
            {/* google button */}
            <span className="text-xs space-grotesk">OR</span>
            <motion.button
              whileHover={{
                boxShadow: "2px 2px 2px black",
                transform: "translateY(-3px)",
              }}
              onClick={handleGoogleAuth}
              whileTap={{ scale: 0.9, boxShadow: "2px 2px 2px black" }}
              transition={{ duration: 0.2 }}
              className="bg-indigo-400 py-2 px-3 rounded-lg space-grotesk text-black w-full flex items-center justify-center gap-2 CustPoint "
            >
              Continue with Google
              <img src="/googleLogo.png" alt="Google" width="20" height="20" />
            </motion.button>
          </span>
          {/* Footer Section - Absolute Bottom */}
          <div className=" px-8 flex items-center justify-between border-t border-white/10 pt-4 mx-2">
            {/* Login Button - Glass Pill Style */}
            <Link
              to="/Login"
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 dark:text-gray-300 text-xs font-space-grotesk hover:bg-white/10 dark:hover:text-white hover:border-white/30 transition-all duration-300"
            >
              <LuLogIn className="w-3.5 h-3.5 text-green-400 gdark:roup-hover:text-green-300 transition-colors" />
              <span>Login</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { FaUserPlus, FaUser, FaGoogle } from "react-icons/fa";
import { MdEmail, MdPassword } from "react-icons/md";
import { LuEyeClosed, LuEye } from "react-icons/lu";
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
      <div className="h-screen flex items-center justify-center relative z-[2] dark:bg-black dark:text-white">
        {/* gradient accent background */}
        <div className="absolute h-full w-full top-0 left-0 bg-gradient-to-br from-blue-600/30 to-indigo-600/30 dark:from-black dark:to-black blur-2xl z-[-1]"></div>

        <motion.div
          drag
          whileDrag={{ scale: 0.9 }}
          dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
          className="bg-gradient-to-br from-gray-100 to-gray-200
            dark:from-black dark:to-white/15 grid grid-cols-1  py-6 px-4 rounded-lg gap-4 w-4/5 md:w-1/3 lg:w-1/3 shadow-sm shadow-black border dark:border-gray-400 cursor-grab relative"
        >
          <h1 className="text-center space-grotesk font-bold  text-2xl">
            Welcome to Eureka !{" "}
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
              className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk"
              type="text"
              placeholder="Your full name"
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
              className="border border-gray-300 px-2 py-1 rounded-lg space-grotesk"
              type="email"
              placeholder="Your email address"
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
            <motion.button
              whileHover={{
                boxShadow: "2px 2px 2px black",
                transform: "translateY(-3px)",
              }}
              whileTap={{ scale: 0.9, boxShadow: "2px 2px 2px black" }}
              transition={{ duration: 0.2 }}
              className="bg-indigo-400 py-2 px-3 rounded-lg space-grotesk text-black w-full flex items-center justify-center gap-2 CustPoint "
            >
              Continue with Google <FaGoogle />
            </motion.button>
          </span>
          <ul className="space-grotesk  text-sm text-center ">
            Have an Account ?
            <Link
              className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 font-semibold"
              to="/Login"
            >
              {" "}
              Login
            </Link>
          </ul>
        </motion.div>
        <Toaster />
      </div>
    </>
  );
};

export default Register;

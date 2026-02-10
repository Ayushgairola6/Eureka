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


        <div className='w-4/5 md:w-1/3 lg:w-1/3 flex flex-col items-center justify-center rounded-sm border'>
          {/* top headers */}
          <section className='bg-black text-white dark:bg-neutral-900 dark:text-white w-full font-mono flex items-center justify-start gap-2 px-3 py-2'>
            <ul className='h-1 w-1 rounded-full bg-orange-600' />
            <p className='text-xs'>Email Verification Protocol</p>
          </section>
          {/* main section */}
          <div

            className="bg-white dark:bg-black grid grid-cols-1  py-6 px-4 rounded-lg gap-4 w-full shadow-xl  "
          >
            <h1 className="text-center space-grotesk font-bold  text-2xl">
              Identify yourself{" "}
            </h1>

            <span className="flex flex-col gap-2">
              <label
                className="bai-jamjuree-semibold  text-sm flex items-center justify-start gap-2"
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
            <motion.button
              disabled={isPending === true}
              onClick={GetEmail}
              whileHover={{
                boxShadow: "2px 2px 2px black",
                transform: "translateY(-3px)",
              }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`${isPending === true ? "bg-gray-400 dark:bg-neutal-600" : "bg-black dark:bg-white "} transition-colors duration-400  py-2 px-3  space-grotesk dark:text-black text-white w-full CustPoint flex items-center justify-center gap-2  relative group`}
            >
              <div className="absolute bottom-0 let-0 h-[3px] w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></div>
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
            <ul className="space-grotesk  text-sm text-center ">
              Already Verified?
              <Link
                className="dark:text-gray-400 text-gray-700"
                to="/Login"
              >
                {" "}
                Login
              </Link>
            </ul>
          </div>
        </div>

      </div>
    </>
  );
};
export default VerificationLink;

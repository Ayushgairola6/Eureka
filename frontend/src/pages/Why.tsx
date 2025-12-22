import { FiZap } from "react-icons/fi";
import { MdOutlineHourglassEmpty } from "react-icons/md";
import { FiUploadCloud } from "react-icons/fi";
import { BsArrowUpRight } from "react-icons/bs";
import { motion } from "framer-motion";
import { useAppSelector } from "../store/hooks";
// import { GravityWell } from "@/components/gravity_well";
const Why = () => {
  const { isDarkMode } = useAppSelector((state) => state.auth);
  const aboutEureka = [
    {
      id: "about-1",
      title: "The Purpose",
      subtitle: "Verified Insight",
      description:
        "Misinformation is everywhere. Eureka builds a protective layer around your brain, filtering the noise to ensure you consume only high-signal, verified data.",
      icon: <FiZap />,
      gradient: "from-blue-600 to-cyan-500", // Sharp, intellectual blue
      badgeColor: "bg-blue-500/10",
      border: "border-blue-500/50",
      img: "/purpose.png",
      message: "Our Mission",
    },
    {
      id: "about-2",
      title: "The Problem",
      subtitle: "Search is Broken",
      description:
        "Traditional search engines prioritize SEO over truth. You don't need more links; you need human-verified data backed by deep AI synthesis.",
      icon: <MdOutlineHourglassEmpty />,
      gradient: "from-slate-700 to-slate-900", // "Serious" problem-solving tone
      badgeColor: "bg-slate-500/10",
      border: "border-slate-500/50",
      img: "/problem.png",
      message: "The Truth",
    },
    {
      id: "about-3",
      title: "How to Use Eureka",
      subtitle: "The Workflow",
      description:
        "Choose a category, ask your question, and get a community-verified response. Missing info? Upload files to teach Eureka and earn reputation.",
      icon: <FiUploadCloud />,
      gradient: "from-amber-400 to-orange-600", // Warm, helpful onboarding tone
      badgeColor: "bg-orange-500/10",
      border: "border-orange-500/50",
      img: "/workflow.png",
      message: "Start Query",
    },
  ];
  return (
    <>
      <div className="relative bg-gray md:py-30 dark:bg-black text-black dark:text-white  p-4 z-[2] overflow-hidden ">
        {isDarkMode === false && (
          <motion.div
            animate={{ rotate: [10, 20, 15, 5, -10, -40, -20, 10, 20] }}
            transition={{
              duration: 1,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className={`  pointer-events-none absolute  bottom-25 -left-35  dark:opacity-60 opacity-80 z-[-20]
                h-60 w-40 blur-[150px]  bg-gradient-to-r from-indigo-500 via-sky-500 to-teal-500
                  `}
          />
        )}

        <section className="p-2 text-center mt-4 mb-8">
          <h1 className="bai-jamjuree-bold text-3xl md:text-4xl">
            Why AskEureka ?
          </h1>
          <p className="bai-jamjuree-regular text-xs">
            Find why there is need for a tool like AskEureka{" "}
          </p>
        </section>
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-8"></div> */}
        {/* cards ssection rendering */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:w-4/5 mx-auto  gap-6 p-4">
          {aboutEureka.map((data, index) => {
            return (
              <>
                <motion.div
                  key={`${data.id}+${index}_${data.title}`}
                  className={`  bg-gradient-to-br from-gray-100 to-gray-200 border dark:text-white dark:from-black/30 dark:to-black rounded-md w-full md:w-100 h-auto  p-2 relative group overflow-hidden group `}
                >
                  <div
                    className={`bg-gradient-to-r ${data.gradient} absolute -bottom-5 w-full left-0 h-20  opacity-70 z-[-3] rounded-full blur-xl `}
                  />
                  <div className=" px-4 py-2 flex items-center justify-start gap-2 rounded-lg">
                    <ul
                      className={`bg-gradient-to-br ${data.gradient} rounded-md p-1`}
                    >
                      {data.icon}
                    </ul>
                    <h2 className="bai-jamjuree-semibold text-xl">
                      {data.title}
                    </h2>
                  </div>

                  <p className="px-4 py-2 space-grotesk text-sm">
                    {data.description}
                  </p>
                  <section className="p-2 justify-self-end cursor-pointer">
                    <h6
                      className={`text-xs space-grotesk text-center w-fit 
                      ${data.badgeColor}
                      rounded-xl px-2 py-1 border ${data.border} flex items-center justify-center gap-2 `}
                    >
                      {data.subtitle}
                      <BsArrowUpRight />
                    </h6>
                  </section>
                </motion.div>
              </>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Why;
// {/* <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: true }}
//                   transition={{ delay: index * 0.1, duration: 0.5 }}
//                   className="group relative flex flex-col gap-4 max-w-md mx-auto"
//                 >
//                   {/* 1. THE HEADER (Outside the card) */}
//                   <div className="flex items-center gap-4 z-10">
//                     {/* Icon Box with Glow */}
//                     <div
//                       className={`relative flex items-center justify-center  w-8  h-8 rounded-lg bg-gradient-to-br ${data.gradient} shadow-lg shrink-0`}
//                     >
//                       <div className="text-white text-sm md:text-lg ">
//                         {data.icon}
//                       </div>
//                       {/* Decorative glowing dot */}
//                       <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-white dark:bg-gray-900 border-2 border-inherit rounded-full"></span>
//                     </div>

//                     {/* Title */}
//                     <h2 className="bai-jamjuree-semibold text-2xl text-gray-900 dark:text-white tracking-tight">
//                       {data.title}
//                     </h2>
//                   </div>

//                   {/* Decorative Connector Line (The "Tech" feel) */}
//                   <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 via-gray-200 to-transparent dark:from-white/20 dark:via-white/5 z-0 group-hover:from-sky-500 group-hover:via-sky-500/50 transition-colors duration-500" />

//                   {/* 2. THE CONTENT MODULE (Offset to the right) */}
//                   <div className="ml-12 relative bg-white dark:bg-black/80 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden hover:border-sky-500/30 dark:hover:border-sky-500/50 transition-colors duration-300 shadow-sm">
//                     {/* Image Section */}
//                     {data.img ? (
//                       <div className="relative h-40 w-full overflow-hidden group-hover:opacity-90 transition-opacity">
//                         <img
//                           src={data.img}
//                           alt={data.title}
//                           className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
//                         />
//                         {/* Overlay Gradient for text readability if needed */}
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

//                         {/* Badge floating on image */}
//                         <span
//                           className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-black/50 backdrop-blur-md text-white border-white/20 ${data.badgeColor}`}
//                         >
//                           {data.subtitle}
//                         </span>
//                       </div>
//                     ) : (
//                       // Fallback pattern if no image is provided
//                       <div
//                         className={`h-24 w-full bg-gradient-to-r ${data.gradient} opacity-20`}
//                       />
//                     )}

//                     {/* Body Content */}
//                     <div className="p-5 flex flex-col gap-4">
//                       <p className="space-grotesk text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
//                         {data.description}
//                       </p>

//                       {/* 3. TERMINAL FOOTER */}
//                       <div className="mt-2 pt-4 border-t border-gray-100 dark:border-white/5">
//                         <div className="flex flex-col gap-2">
//                           {/* Link/Message Row */}
//                           <div className="flex justify-between items-center text-xs">
//                             <span className="text-gray-400 font-mono flex items-center gap-1">
//                               <BsTerminal className="inline text-[10px]" />{" "}
//                               Find-with-eureka
//                             </span>
//                             <Link
//                               to="/"
//                               className="text-sky-600 hover:text-sky-500 flex items-center gap-1 transition-all group-hover:translate-x-1"
//                             >
//                               Open Detail <BsArrowUpRight />
//                             </Link>
//                           </div>

//                           {/* Input Area */}
//                           <div className="relative flex items-center justify-center">
//                             <span className="absolute left-3 text-sky-500 font-bold">
//                               {">"}
//                             </span>
//                             <input
//                               type="text"
//                               placeholder={data.message || "Initiate query..."}
//                               className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg py-2 pl-6 pr-16 text-xs md:text-sm font-mono focus:outline-none focus:border-sky-500 transition-colors text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
//                             />
//                             <button className="absolute right-1 top-1 bottom-1 px-3 bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-[10px] font-bold uppercase tracking-wider rounded border border-gray-200 dark:border-white/10 transition-colors">
//                               Run
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div> */}

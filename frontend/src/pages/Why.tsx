import { FiZap } from "react-icons/fi";
import { FaGitAlt } from "react-icons/fa";
import { MdOutlineHourglassEmpty } from "react-icons/md";
import { FiUploadCloud } from "react-icons/fi";
import { BsArrowUpRight, BsPeople } from "react-icons/bs";
import { FaResearchgate } from "react-icons/fa6";
import { motion } from "framer-motion";
const Why = () => {
  const cardsData = [
    {
      id: 1,
      title: "Purpose",
      subtitle: "Authenticity",
      description:
        "Misinformation is everywhere. We can't end it, but we can filter it. Eureka builds a protective layer around your brain, ensuring you consume only verified data.",
      icon: <FiZap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: "from-indigo-500 to-sky-500",
      badgeColor: "bg-teal-500/10",
      border: "border-teal-500",
      img: "/feature1.png",
      message: "See detail",
    },
    {
      id: 2,
      title: "Problem we solve?",
      subtitle: "Misinformation",
      description:
        "Traditional search is noisy and unverified. You don't need more links; you need the truth. We provide human-verified data backed by AI synthesis.",
      icon: <FaGitAlt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: "from-emerald-500 to-teal-500",
      badgeColor: "bg-amber-500/10",
      border: "border-amber-500",
      img: "/2.png",
      message: "See detail",
    },
    {
      id: 3,
      title: "How Eureka is different?",
      subtitle: "Differentiator",
      description:
        "Eureka combines AI speed with human trust. Our community-driven knowledge base ensures that information is voted on and verified by experts like you.",
      icon: (
        <MdOutlineHourglassEmpty className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      ),
      gradient: "from-amber-500 to-red-500",
      badgeColor: "bg-purple-500/10",
      border: "border-purple-500",
      img: "/1.png",
      message: "Synthesize",
    },
    {
      id: 4,
      title: "How to use it!",
      subtitle: "Know-how",
      description:
        "1. Choose category → 2. Select subdomain → 3. Ask question → 4. Get AI response from community knowledge → 5. Missing info? Upload a file to teach Eureka and build an authentic knowledge hub.",
      icon: <FiUploadCloud className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: "from-yellow-500 to-pink-500",
      badgeColor: "bg-orange-500/10",
      border: "border-orange-500",
      img: "/2.png",
      message: "Query",
    },
    {
      id: 5,
      title: "Collbarotive Research/Planning",
      subtitle: "Research with teams",
      description:
        "Create Eureka rooms an experience AI powered research room where you can perform from basic web search to advanced multi-file analysis in real time and experience same results in real time.",
      icon: <BsPeople className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: "from-pink-500 to-red-500",
      badgeColor: "bg-red-500/20",
      border: "border-red-500",
      img: "/1.png",
      message: "Create/Join",
    },
    {
      id: 6,
      title: "Synthesis Mode",
      subtitle: "Collaborative Intelligence",
      description:
        "Solo or create Eureka Rooms to research as a team. Synthesize insights from private member documents, community knowledge, and the web in a shared, real-time workspace, with the power of deep reasoning.",
      icon: <FaResearchgate className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: "from-purple-500 to-indigo-500",
      badgeColor: "bg-purple-500/20",
      border: "border-purple-500",
      img: "/1.png",
      message: "Synthesizes",
    },
  ];
  return (
    <>
      <div className=" bg-gray dark:bg-black text-black dark:text-white relative p-4 ">
        <div className="z-[-1] absolute top-0 left-0 h-full w-full bg-gradient-to-br from-blue-600/10 to-pink-600/10 blur-3xl"></div>
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
          {cardsData.map((data, index) => {
            return (
              <>
                <motion.div
                  key={`${data.id}+${index}_${data.title}`}
                  className="border bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/10 dark:to-black  rounded-sm w-full md:w-100 h-auto  p-2 relative group overflow-hidden"
                >
                  <div
                    className={`absolute bottom-0 h-20  left-0 rounded-tl-xl rounded-tr-xl blur-[100px] opacity-40 w-full  bg-gradient-to-r ${data.gradient}`}
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

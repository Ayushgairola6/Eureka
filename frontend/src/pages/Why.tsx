import { FiZap } from "react-icons/fi";
import { MdOutlineHourglassEmpty } from "react-icons/md";
import { FiUploadCloud } from "react-icons/fi";
import { BsArrowUpRight, BsTerminal } from "react-icons/bs";
import { motion } from "framer-motion";
const aboutAntiNode = [
  {
    id: "about-1",
    title: "The Purpose",
    subtitle: "Verified Insight",
    description:
      "Misinformation is everywhere. AntiNode builds a protective layer around your brain, filtering the noise to ensure you consume only high-signal, verified data.",
    icon: <FiZap />,
    gradient: "from-blue-600 to-cyan-500", // Sharp, intellectual blue
    badgeColor: "bg-blue-500/10",
    border: "border-blue-500/50",
    img: "/misinformation.webp",
    message: "Our Mission",
    source:
      "https://www.apa.org/topics/journalism-facts/misinformation-disinformation",
  },
  {
    id: "about-2",
    title: "The Problem",
    subtitle: "Search is Broken",
    description:
      "Traditional search engines prioritize SEO over truth. You don't need more links; you need human-verified data backed by deep AI synthesis.",
    icon: <MdOutlineHourglassEmpty />,
    gradient: "from-pink-700 to-fushia-900", // "Serious" problem-solving tone
    badgeColor: "bg-pink-500/10",
    border: "border-fushia-500/50",
    img: "/fake_seo.webp",
    message: "The Truth",
    source: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8294234/",
  },
  {
    id: "about-3",
    title: "How to Use AntiNode",
    subtitle: "The Workflow",
    description:
      "Choose a category, ask your question, and get a community-verified response. Missing info? Upload files to teach AntiNode and earn reputation.",
    icon: <FiUploadCloud />,
    gradient: "from-green-400 to-green-600", // Warm, helpful onboarding tone
    badgeColor: "bg-green-500/10",
    border: "border-green-500/40",
    img: "/feature1.png",
    message: "Start Query",
    source: "https://youtube.come/AntiNodefeatures",
  },
];
const Why = () => {
  return (
    <>
      <div className="relative bg-gray md:py-30 dark:bg-black text-black dark:text-white  p-4 z-[2] overflow-hidden ">
        <section className="p-2 text-center mt-4 mb-8">
          <h1 className="bai-jamjuree-bold text-3xl md:text-4xl">
            Why AntiNode?
          </h1>
          <p className="bai-jamjuree-regular text-xs">
            Find why there is need for a tool like AntiNode
          </p>
        </section>
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-8"></div> */}
        {/* cards ssection rendering */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:w-4/5 mx-auto  gap-6 p-4">
          {aboutAntiNode.map((data, index) => {
            return (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group relative flex flex-col gap-4 max-w-md mx-auto shadow-2xl group overflow-hidden"
                >
                  <div
                    className={`absolute rotate-60 opacity-20  rounded-full blur-[100px] z-[-10] left-0 h-full w-full bg-gradient-to-r ${data.gradient}`}
                  />
                  {/* 1. THE HEADER (Outside the card) */}
                  <div className="flex items-center gap-4 z-10">
                    {/* Icon Box with Glow */}
                    <div
                      className={`relative flex items-center justify-center  w-8  h-8 rounded-lg bg-gradient-to-br ${data.gradient} shadow-lg shrink-0`}
                    >
                      <div className="text-white text-sm md:text-lg ">
                        {data.icon}
                      </div>
                      {/* Decorative glowing dot */}
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-white dark:bg-gray-900 border-2 border-inherit rounded-full"></span>
                    </div>

                    {/* Title */}
                    <h2 className="bai-jamjuree-semibold text-2xl text-gray-900 dark:text-white tracking-tight">
                      {data.title}
                    </h2>
                  </div>

                  {/* Decorative Connector Line (The "Tech" feel) */}
                  <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 via-gray-200 to-transparent dark:from-white/20 dark:via-white/5 z-0 group-hover:from-sky-500 group-hover:via-sky-500/50 transition-colors duration-500" />

                  {/* 2. THE CONTENT MODULE (Offset to the right) */}
                  <div className="ml-12 relative bg-white dark:bg-black/80 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden hover:border-sky-500/30 dark:hover:border-sky-500/50 transition-colors duration-300 shadow-sm">
                    {/* Image Section */}
                    {data.img ? (
                      <div className="relative h-40 w-full overflow-hidden group-hover:opacity-90 transition-opacity">
                        <img
                          src={data.img}
                          alt={data.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        {/* Overlay Gradient for text readability if needed */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                        {/* Badge floating on image */}
                        <span
                          className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-black/50 backdrop-blur-md text-white border-white/20 ${data.badgeColor}`}
                        >
                          {data.subtitle}
                        </span>
                      </div>
                    ) : (
                      // Fallback pattern if no image is provided
                      <div
                        className={`h-24 w-full bg-gradient-to-r ${data.gradient} opacity-20`}
                      />
                    )}

                    {/* Body Content */}
                    <div className="p-5 flex flex-col gap-4">
                      <p className="space-grotesk text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {data.description}
                      </p>

                      {/* 3. TERMINAL FOOTER */}
                      <div className="mt-2 pt-4 border-t border-gray-100 dark:border-white/5">
                        <div className="flex flex-col gap-2">
                          {/* Link/Message Row */}
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-mono flex items-center gap-1">
                              <BsTerminal className="inline text-[10px]" />{" "}
                              Find-with-AntiNode
                            </span>
                            <a
                              href={data.source}
                              className="text-sky-600 hover:text-sky-500 flex items-center gap-1 transition-all group-hover:translate-x-1"
                            >
                              Read in detail <BsArrowUpRight />
                            </a>
                          </div>

                          {/* Input Area */}
                          <div className="relative flex items-center justify-center">
                            <span className="absolute left-3 text-sky-500 font-bold">
                              {">"}
                            </span>
                            <input
                              type="text"
                              placeholder={data.message || "Initiate query..."}
                              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg py-2 pl-6 pr-16 text-xs md:text-sm font-mono focus:outline-none focus:border-sky-500 transition-colors text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                            />
                            <button className="absolute right-1 top-1 bottom-1 px-3 bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-[10px] font-bold uppercase tracking-wider rounded border border-gray-200 dark:border-white/10 transition-colors">
                              Run
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
//                               Find-with-AntiNode
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

import { FiZap } from "react-icons/fi";
import { FaGitAlt } from "react-icons/fa";
import { MdOutlineHourglassEmpty } from "react-icons/md";
import { FiUploadCloud } from "react-icons/fi";
import { BsPeople } from "react-icons/bs";
import { FaResearchgate } from "react-icons/fa6";
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
        {/* cards ssection rendering */}
        <div className="flex items-center justify-center flex-wrap gap-6 p-4">
          {cardsData.map((data, index) => {
            return (
              <>
                <div
                  key={`${data.id}+${index}_${data.title}`}
                  className="border bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/10 dark:to-black  rounded-sm w-full md:w-100 h-auto md:h-50 p-2"
                >
                  {/* heading section with icon */}
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
                  <section className="p-2 justify-self-end">
                    <h6
                      className={`text-xs bai-jamjuree-regular text-center w-fit mx-auto 
                      ${data.badgeColor}
                      rounded-xl px-2 py-1 border ${data.border}`}
                    >
                      {data.subtitle}
                    </h6>
                  </section>
                </div>
              </>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Why;

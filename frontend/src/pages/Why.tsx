import { FiZap } from "react-icons/fi";
import { FaGitAlt } from "react-icons/fa";
import { MdOutlineHourglassEmpty } from "react-icons/md";
import { FiUploadCloud } from "react-icons/fi";
import { BsPeople } from "react-icons/bs";

const Why = () => {
  function HandleCardTiltEffect(e: any) {
    const rect = e.currentTarget.getBoundingClientRect();
    // current position of the mouse
    const x = e.clientX - rect.left; // X position within the element
    const y = e.clientY - rect.top; // Y position within the element

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 3; // Max 3 degrees rotation
    const rotateX = ((centerY - y) / centerY) * 3; // Max 3 degrees rotation

    e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }
  const cardsData = [
    {
      id: 1,
      title: "Purpose",
      subtitle: "Authenticity",
      description:
        "Misinformation has been on this planet since millenia we can't end it but creating filters to protect our brains is necessary, and only we can do that.",
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
        "Traditional knowledge sources are siloed and filled with all types of information but, what you need is the trueh not the typical web search result but actual human verified data.",
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
        "Eureka uses Community contributions as knowledge base and trusts  👉you👈 to verify information through voting, reducing false information.",
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
      title: "Collbarotive sessions",
      subtitle: "Doing stuff together",
      description:
        "With Eureka Rooms you can create collborative AI powered research/study/chat rooms and can surf the web and private documents of the members together .",
      icon: <BsPeople className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: "from-pink-500 to-red-500",
      badgeColor: "bg-red-500/20",
      border: "border-red-500",
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
            Find why there is need for a tool like AskEureka
          </p>
        </section>
        {/* cards ssection rendering */}
        <div className="flex items-center justify-center flex-wrap gap-6 p-4">
          {cardsData.map((data, index) => {
            return (
              <>
                <div
                  onMouseOver={(e) => HandleCardTiltEffect(e)}
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

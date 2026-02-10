import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { useAppSelector } from "../store/hooks";
const QuestionAskedChart = () => {
  const { Querycount, user } = useAppSelector((state: any) => state.auth);

  const data = [
    { name: "Questions", value: Querycount, fill: "lime" },
    {
      name: "Remaining",
      value: user.IsPremiumUser === false ? 10 - Querycount : 100 - Querycount,
      fill: "orange",
    },
  ];
  const limit = user.IsPremiumUser ? 100 : 10;

  // Calculate percentage: (Current / Total) * 100
  // We use Math.min to ensure it never exceeds 100% visually
  const progressPercentage = Querycount
    ? Math.min((Querycount / limit) * 100, 100)
    : 0;
  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className="h-40 bg-gray-100 dark:bg-black p-6 rounded-xl border shadow-2xl"
      >
        <h3 className="text-sm md:text-lg opacity-70 bai-jamjuree-semibold mb-4">
          Your monthly credit limit
        </h3>

        <div className="flex items-center gap-4">
          {/* Radial Progress */}
          <div className="w-24 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={data}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar background dataKey="value" />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="relative -top-20 text-center">
              <span className="text-2xl font-bold text-green-500">
                {Querycount}
              </span>
              <div className="text-xs dark:text-white text-black">
                /{limit}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-2">

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Usage Progress</span>
              <span className={`text-sm font-bold ${progressPercentage > 90 ? 'text-red-500' : 'text-green-500'}`}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-400">
              {Querycount} / {limit} Shards used
            </p>
          </div>
          <div></div>

        </div >
      </motion.div >
    </>
  );
};

export default QuestionAskedChart;

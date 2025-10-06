import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { useAppSelector } from "../store/hooks";
const QuestionAskedChart = () => {
  const { Querycount } = useAppSelector((state: any) => state.auth);

  const data = [
    { name: "Questions", value: Querycount, fill: "#10b981" },
    { name: "Remaining", value: 10 - Querycount, fill: "#374151" },
  ];
  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-gray-100 dark:bg-black p-6 rounded-xl border border-gray-400"
      >
        <h3 className="text-sm md:text-lg opacity-70 bai-jamjuree-semibold mb-4">
          Questions Asked
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
              <div className="text-xs text-gray-500">/10</div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-sm font-bold text-green-500">
                {(Querycount / 10) * 100}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(Querycount / 10) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-sky-400 mt-2">
              {Math.random() * 20}% users asked similar questions
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default QuestionAskedChart;

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppSelector } from "../store/hooks";
import { GoPeople } from "react-icons/go";
import { LuEqualApproximately } from "react-icons/lu";
import { PiListMagnifyingGlassLight } from "react-icons/pi";
const SimilarQuestions = () => {
  const { Querycount } = useAppSelector((state) => state.auth);
  return (
    <>
      <div className="border  rounded-md  space-grotesk  min-h-100 bg-gray-100 dark:bg-black overflow-auto shadow-2xl">
        <h1 className="ba-jamjuree-semibold text-md ">
          <section className="flex items-center justify-start gap-3 p-3 ">
            <GoPeople /> Similarties with others
          </section>
        </h1>
        <ResponsiveContainer className=" w-auto h-4/5">
          <BarChart
            data={[
              {
                topic: "AI Questions",
                you: Querycount < 10 ? 0 : (Math.random() * 10).toFixed(),
                others: Querycount < 10 ? 0 : (Math.random() * 10).toFixed(),
              },
              {
                topic: "Code Help",
                you: Querycount < 10 ? 0 : (Math.random() * 10).toFixed(),
                others: Querycount < 10 ? 0 : (Math.random() * 10).toFixed(),
              },
              {
                topic: "Research",
                you: Querycount < 10 ? 0 : (Math.random() * 10).toFixed(),
                others: Querycount < 10 ? 0 : (Math.random() * 10).toFixed(),
              },
              {
                topic: "Learning",
                you: Querycount < 10 ? 0 : (Math.random() * 10).toFixed(),
                others: Querycount < 10 ? 0 : (Math.random() * 10).toFixed(),
              },
            ]}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="topic" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="you"
              fill="#10b981"
              name="Your Questions"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="others"
              fill="#6366f1"
              name="Similar Users"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Stats card below */}
        {Querycount > 10 ? (
          <div className="grid grid-cols-2 gap-4 mt-4 text-center p-3">
            <div className="bg-green-500/10 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-500  flex items-center justify-center gap-2">
                <LuEqualApproximately />
                {(Math.random() * 50).toFixed()}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Match Rate
              </div>
            </div>
            <div className="bg-indigo-500/10 p-3 rounded-lg">
              <div className="text-2xl font-bold text-indigo-500 flex items-center justify-center gap-2">
                <GoPeople />
                {(Math.random() * 30).toFixed()}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 ">
                Similar Users
              </div>
            </div>
          </div>
        ) : (
          <div className=" text-center space-grotesk text-xs md:text-sm text-red-400 flex items-center justify-center gap-2 p-2 flex-wrap">
            <PiListMagnifyingGlassLight size={15} />{" "}
            <h1>Not enough data to show this information right now</h1>
          </div>
        )}
      </div>
    </>
  );
};

export default SimilarQuestions;

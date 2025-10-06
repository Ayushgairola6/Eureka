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

const SimilarQuestions = () => {
  return (
    <>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={[
            { topic: "AI Questions", you: 8, others: 12 },
            { topic: "Code Help", you: 5, others: 9 },
            { topic: "Research", you: 3, others: 7 },
            { topic: "Learning", you: 6, others: 11 },
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
      <div className="grid grid-cols-2 gap-4 mt-4 text-center">
        <div className="bg-green-500/10 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-500">87%</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Match Rate
          </div>
        </div>
        <div className="bg-blue-500/10 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-500">24</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Similar Users
          </div>
        </div>
      </div>
    </>
  );
};

export default SimilarQuestions;

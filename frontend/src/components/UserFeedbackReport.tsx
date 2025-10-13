import { useAppSelector } from "../store/hooks";
import React from "react";
import { motion } from "framer-motion";
import { PieChart, ResponsiveContainer, Pie, Cell } from "recharts";
import { FaThumbsUp } from "react-icons/fa";

// import { FaExclamation, FaThumbsDown, FaThumbsUp } from "react-icons/fa";

type props = {
  score: any;
};

const UserFeedbackReport: React.FC<props> = ({ score }) => {
  const { FeedbackCounts, isDarkMode } = useAppSelector((state) => state.auth);

  //   rendering data
  const data = [
    { name: "Upvotes", value: FeedbackCounts.upvotes || 0 },
    { name: "Downvotes", value: FeedbackCounts.downvotes || 0 },
    { name: "Partial", value: FeedbackCounts.partial_upvotes || 0 },
  ];
  return (
    <>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="bg-gray-100 dark:bg-black p-6 rounded-2xl border border-gray-400 transition-all duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
            Community Feedback
          </h3>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: Pie Chart */}
          <div className="flex items-center justify-center">
            <div className="w-48 h-48 bai-jamjuree-semibold">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data} // ← This needs to be defined!
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={2}
                    dataKey="value" // ← Add this too
                  >
                    <Cell key="up" fill="#10b981" />
                    <Cell key="down" fill="#ef4444" />
                    <Cell key="partial" fill="#f59e0b" />
                  </Pie>
                  {/* Center text shows total */}
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isDarkMode === true ? "white" : "#6b7280"} // gray-800 for light theme
                    className="text-lg font-bold"
                  >
                    {FeedbackCounts.partial_upvotes +
                    FeedbackCounts.downvotes +
                    FeedbackCounts.upvotes
                      ? FeedbackCounts.partial_upvotes +
                        FeedbackCounts.downvotes +
                        FeedbackCounts.upvotes
                      : 0}
                  </text>
                  <text
                    x="50%"
                    y="60%"
                    textAnchor="middle"
                    fill={isDarkMode === true ? "white" : "#6b7280"} // gray-500
                    className="text-sm"
                  >
                    Total Votes
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Stats & Metrics */}
          <div className="space-y-4 space-grotesk">
            {/* Stats Grid */}

            {/* Confidence Score */}
            <div className="space-grotesk bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confidence Score
                </span>
                <span
                  className={`text-sm font-bold ${
                    score > 70
                      ? "text-green-500"
                      : score > 30
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {score || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score || 0}%` }}
                  transition={{ duration: 1 }}
                  className={`h-full rounded-full ${
                    score > 70
                      ? "bg-green-500"
                      : score > 30
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
              </div>
            </div>

            {/* Peer Reviews */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Based on{" "}
              {(FeedbackCounts?.upvotes || 0) +
                (FeedbackCounts?.downvotes || 0) +
                (FeedbackCounts?.partial_upvotes || 0) || 0}{" "}
              peer reviews
            </div>
          </div>
        </div>
        <div className="bai-jamjuree-regular text-md  w-full text-center flex items-center justify-center gap-4">
          <FaThumbsUp />
          Keep Up the good work
        </div>
      </motion.div>
    </>
  );
};

export default UserFeedbackReport;

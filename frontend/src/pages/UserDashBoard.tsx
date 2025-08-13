import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { FiSettings, FiDownload, FiStar, FiMessageSquare } from 'react-icons/fi';
import { useStore } from '../store/zustandHandler';
import { useAppSelector } from '../store/hooks';
import { TbTextCaption } from "react-icons/tb";
import { useEffect, useState } from 'react';
import { FaCloudSunRain } from "react-icons/fa";
import { TbSunset2 } from "react-icons/tb";
import { IoSunnyOutline } from "react-icons/io5";

const UserDashboard = () => {
    // Mock user data
    const user = useAppSelector((state) => state.auth.user);
    const QueryCount = useAppSelector((state) => state.auth.Querycount);
    const Feedback = useAppSelector((state) => state.auth.FeedbackCounts);
    const [score, setScore] = useState<number>(100);
    const { isDarkMode } = useStore();
    // Mock conversations


    useEffect(() => {
        const totalVotes = Feedback?.upvotes + Feedback?.partial_upvotes + Feedback?.downvotes;
        if (totalVotes === 0) {
            // Handle case with no votes, e.g., display 0 or 'N/A'
            setScore(0);
        } else {
            const weightedSum = (Feedback?.upvotes * 1) + (Feedback?.partial_upvotes * 0.5) - (Feedback?.downvotes * 1);
            setScore((weightedSum / totalVotes) * 100);
        }
    }, [Feedback]);



    return (
        <div className={`dark:bg-black dark:text-white bg-white text-black relative flex min-h-screen w-full overflow-hidden z-[1]`}>
            {!isDarkMode && (
                <div className='h-full w-full absolute z-[-1] bg-gradient-to-br from-white to-emerald-600/20 blur-3xl'></div>
            )}

            {/* Sidebar */}
            <div className="w-64 p-6 border-r dark:border-gray-800 hidden md:block">
                <div className="flex flex-col items-center justify-center mb-10">
                    <span
                        className="rounded-full h-24 w-24 text-5xl flex flex-col items-center justify-center border-2 bg-indigo-500 mb-4 dark:text-white text-black relative"
                    >
                        {user?.username.trim().split(' ')[0].split("")[0].toUpperCase()}
                        <ul className='absolute -top-4 -right-11'>
                            {score > 70 ? <IoSunnyOutline color='red'/> : score > 30 && score < 70 ? <TbSunset2 color='yellow' /> : <FaCloudSunRain color='ghostwhite'/>}
                        </ul>
                    </span>
                    <h3 className="font-bold text-xl">{ }</h3>
                    {/* <p className="text-sm opacity-70">{user.role}</p> */}
                    <p className="text-xs mt-1 opacity-50">Joined on :{user?.created_at.split("T")[0]}</p>

                </div>

                <nav className="space-y-2">
                    <Link to="#" className="block py-2 px-4 rounded-lg dark:hover:bg-gray-800 hover:bg-gray-100 transition-all">
                        Dashboard
                    </Link>
                    <Link to="#" className=" py-2 px-4 rounded-lg dark:hover:bg-gray-800 hover:bg-gray-100 transition-all flex items-center gap-2">
                        <FiMessageSquare /> My Questions
                    </Link>
                    <Link to="#" className=" py-2 px-4 rounded-lg dark:hover:bg-gray-800 hover:bg-gray-100 transition-all flex items-center gap-2">
                        <FiStar /> Saved Conversations
                    </Link>
                    <Link to="#" className=" py-2 px-4 rounded-lg dark:hover:bg-gray-800 hover:bg-gray-100 transition-all flex items-center gap-2">
                        <FiSettings /> Settings
                    </Link>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bai-jamjuree-regular">Welcome back, {user?.username.trim().split(' ')[0].toUpperCase()}!</h1>
                        <p className="opacity-70  space-grotesk">Here's what's happening with your Public Contributions </p>
                    </div>

                    <div className="flex gap-4 space-grotesk">
                        <div className="bg-gradient-to-r from-purple-600 to-sky-600 p-0.5 rounded-lg">
                            <input
                                type="text"
                                placeholder="Search your knowledge..."
                                className="bg-white dark:bg-black rounded-md px-4 py-2 w-full md:w-64 focus:outline-none"
                            />
                        </div>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bai-jamjuree-regular">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-gradient-to-br from-purple-500/10 to-sky-500/10 p-6 rounded-xl border dark:border-gray-800 border-gray-200"
                    >
                        <h3 className="text-sm opacity-70">Questions Asked</h3>
                        {/* <p className="text-3xl font-bold mt-2">{user.stats.questions}</p> */}
                        <p className="text-xs mt-1 text-green-500">{QueryCount / 100}% this month</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-gradient-to-br from-amber-500/10 to-pink-500/10 p-6 rounded-xl border dark:border-gray-800 border-gray-200"
                    >
                        <h3 className="text-sm opacity-70">Average Rating</h3>
                        <div className="flex items-center gap-2 mt-2 flex-col">
                            {/* <span className="text-3xl font-bold">{user.stats.rating}</span> */}
                            <div className="flex items-center justify-evenly space-grotesk gap-4 text-xs">
                                <ul
                                    className='py-1 px-2 rounded-lg bg-white/20 text-yellow-500'>
                                    Upvotes {Feedback?.upvotes}
                                </ul>
                                <ul
                                    className='py-1 px-2 rounded-lg bg-white/20 text-yellow-500'>
                                    Downvotes  {Feedback?.downvotes}
                                </ul><ul
                                    className='p-1 px-2 rounded-lg bg-white/20 text-yellow-500'>
                                    Partial_Upvotes  {Feedback?.partial_upvotes}
                                </ul>
                            </div>


                        </div>
                        <p className="text-xs mt-5 flex items-center justify-between w-full">from peer reviews {Feedback !== null && <span className={`  bai-jamjuree-regular text-sm ${score > 70 ? 'text-green-500' : score > 30 && score < 70 ? 'text-yellow-500' : 'text-red-500'}`}>AuthenticityScore = {score}</span>}</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-6 rounded-xl border dark:border-gray-800 border-gray-200"
                    >
                        <h3 className="text-sm opacity-70">Active Projects</h3>
                        <p className="text-3xl font-bold mt-2">{user?.Contributions_user_id_fkey.length}</p>
                        <span className="text-xs mt-1 truncate">{user?.Contributions_user_id_fkey.map((doc) => {
                            return <ul key={`${doc.id}_${doc.created_at}`}>{doc.feedback.trim().split("")}</ul>
                        })}</span>
                    </motion.div>
                </div>

                {/* Recent Conversations */}
                <section className="mb-8">
                    <div className="flex justify-between items-center mb-4 bai-jamjuree-regular">
                        <h2 className="text-xl font-bold ">Your documents</h2>
                        <Link to="#" className="text-sm text-sky-500 hover:underline">View all</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-grotesk">
                        {user?.Contributions_user_id_fkey.map(conv => (
                            <motion.div
                                key={conv.id}
                                whileHover={{ scale: 1.02 }}
                                className="p-4 rounded-lg border dark:border-gray-800 border-gray-200 dark:hover:bg-gray-900/50 hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium space-grotesk flex items-center justify-center gap-2"><TbTextCaption color='green' /> {conv.feedback}</h3>
                                    <span className="text-xs opacity-50 text-red-500">{conv.created_at.split("T")[0]}</span>
                                </div>
                                <p className="text-sm opacity-70 mt-2">{conv.id}...</p>
                                <div className="flex justify-end items-center mt-4">
                                    <button className="text-xs text-sky-500 hover:underline">View full chat →</button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Documents Section */}
                <section>
                    <div className="flex justify-between items-center mb-4 space-grotesk">
                        <h2 className="text-xl font-bold">Chatrooms</h2>
                        <Link to="#" className="text-sm text-sky-500 hover:underline">Creat New</Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bai-jamjuree-regular">
                        {[1, 2, 3, 4].map(doc => (
                            <motion.div
                                key={doc}
                                whileHover={{ y: -5 }}
                                className="p-4 rounded-lg border dark:border-gray-800 border-gray-200 flex flex-col items-center text-center"
                            >
                                <div className="bg-gray-200/20 dark:bg-gray-800/50 p-6 rounded-lg mb-3">
                                    <FiDownload className="w-8 h-8 opacity-70" />
                                </div>
                                <h3 className="font-medium text-sm">Room-Name_{doc}</h3>
                                <p className="text-xs opacity-50 mt-1">{(Math.random() * 5).toFixed(1)} MB</p>
                                <div className="flex gap-2 mt-3">
                                    <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full">Private</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default UserDashboard;
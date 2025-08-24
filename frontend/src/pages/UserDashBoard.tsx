import { lazy, useRef } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { FiUsers } from 'react-icons/fi';
// FiSettings, FiStar, FiMessageSquare, 
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { TbTextCaption } from "react-icons/tb";
import { useEffect, useState } from 'react';
import { FaArrowRight, FaCloudSunRain, FaUserSecret } from "react-icons/fa";
import { TbSunset2 } from "react-icons/tb";
import { IoSunnyOutline } from "react-icons/io5";
import { MdRoomPreferences } from 'react-icons/md';
import { JoinAChatRoom } from '../store/chatRoomSlice.ts';
import { toast, Toaster } from 'sonner';
import { joinAChatRoom } from '../store/websockteSlice.ts';
const CreateRoom = lazy(() => import("@/components/createRoom.tsx"));

const UserDashboard = () => {
    // Mock user data
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const QueryCount = useAppSelector((state) => state.auth.Querycount);
    const Feedback = useAppSelector((state) => state.auth.FeedbackCounts);
    const chatrooms = useAppSelector((state) => state.auth.chatrooms)
    const isJoining = useAppSelector((state) => state.chats.isJoiningRoom);
    const InputRef = useRef<HTMLInputElement>(null)
    const [score, setScore] = useState<number>(0);
    const [showcard, setShowCard] = useState(false);
    const isDarkMode = useAppSelector(state => state.auth.isDarkMode);
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

    const handleJoinRoom = async () => {
        if (InputRef?.current?.value) {
            try {
                const result = await dispatch(JoinAChatRoom(InputRef.current.value)).unwrap();
                toast.success(result.message);
            } catch (rejectedAction: any) {
                console.error('Rejected Action:', rejectedAction);
                toast.error(rejectedAction.message);
            }
        }
    };

    return (
        <div className={`dark:bg-black dark:text-white bg-white text-black relative flex min-h-screen w-full overflow-hidden z-[1] realative`}>
            <Toaster />
            <CreateRoom showcard={showcard} setShowCard={setShowCard} />
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
                            {score > 70 ? <IoSunnyOutline color='green' /> : score > 30 && score < 70 ? <TbSunset2 color='yellow' /> : <FaCloudSunRain color='ghostwhite' />}
                        </ul>
                    </span>
                    <h3 className="font-bold text-xl">{ }</h3>
                    {/* <p className="text-sm opacity-70">{user.role}</p> */}
                    <p className="text-xs mt-1 opacity-50">Joined on :{user?.created_at.split("T")[0]}</p>
                    <p className="text-xs mt-1 opacity-50">{user?.email}</p>

                </div>

                {/* <nav className="space-y-2 bai-jamjuree-regular">
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
                </nav> */}
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
                        <div className="bg-gradient-to-r from-purple-600 to-sky-600 p-0.5 rounded-lg animate-pulse">
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
                        <p className="text-3xl font-bold mt-2">{user?.Contributions_user_id_fkey?.length}</p>
                        <span className="text-xs mt-1 truncate">{user?.Contributions_user_id_fkey && user?.Contributions_user_id_fkey.map((doc) => {
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
                        {user?.Contributions_user_id_fkey ? user?.Contributions_user_id_fkey.map(conv => (
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
                                    <Link to={`/User/document_chat_history/${conv.document_id}`} className="text-xs text-sky-500 hover:underline">View full chat →</Link>
                                </div>
                            </motion.div>
                        )) : <div className='dark:bg-white/10 bg-black/20 border border-gray-400 rounded-lg w-full p-4 flex '>
                            <h1 className="m-auto text-sm">No private documents uploaded</h1>
                        </div>}
                    </div>
                </section>

                {/* Rooms 229675 Section */}
                <section>
                    <div className="flex justify-between items-center mb-4 space-grotesk">
                        <h2 className="text-xl font-bold">Chatrooms</h2>
                        <button onClick={() => setShowCard(!showcard)} className="text-sm text-sky-500 hover:underline">Creat New</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bai-jamjuree-regular">
                        {chatrooms.map(room => (
                            <motion.div
                                key={room?.room_id}
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => console.log(room)}
                                className="w-full sm:w-[300px] p-4 rounded-xl border border-gray-400 bg-white dark:bg-white/5 shadow-sm hover:shadow-md transition-all cursor-pointer relative"
                            >
                                {/* Admin badge */}
                                {user?.id === room.chat_rooms.created_by && (
                                    <span className="absolute top-3 right-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        Admin
                                    </span>
                                )}

                                {/* Room icon */}
                                <div className="flex justify-center mb-4">
                                    <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-300">
                                        <MdRoomPreferences className="w-6 h-6" />
                                    </div>
                                </div>

                                {/* Room info */}
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-1">
                                        {room?.chat_rooms?.room_name || "Untitled Room"}
                                    </h3>

                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 min-h-[40px]">
                                        {room?.chat_rooms?.Room_Description || "No description"}
                                    </p>

                                    <div className="flex justify-center gap-3 pt-2 flex-wrap">
                                        <span className={`text-xs px-3 py-1 rounded-full ${room?.chat_rooms?.room_type === 'private'
                                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                                            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                            }`}>
                                            {room?.chat_rooms?.room_type || 'unknown'}
                                        </span>

                                        <span className="flex items-center text-xs bg-yellow-600/10 px-3 py-1 rounded-full text-yellow-600 ">
                                            <FiUsers className="mr-1" />
                                            {room?.chat_rooms?.participant_count || 0}
                                        </span>
                                        <span className="flex items-center text-xs  dark:bg-red-700/10 px-3 py-1 rounded-full text-red-700 ">
                                            <FaUserSecret className="mr-1" />
                                            {room?.chat_rooms?.Room_Joining_code}
                                        </span>
                                    </div>

                                    <div className="pt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between flex-wrap">
                                        <ul>
                                            Created: {room?.chat_rooms?.created_at?.split("T")[0] || 'Unknown date'}
                                        </ul>
                                        <ul className=' flex items-center justify-center gap-2'>
                                            <button onClick={() => {
                                                if (user && room) {
                                                    const roomInfo = {
                                                        room_id: room.room_id,
                                                        room_name: room.chat_rooms.room_name,
                                                        username: user.username
                                                    };

                                                    // Dispatch the join action
                                                    dispatch(joinAChatRoom(roomInfo));
                                                }
                                            }}>
                                                <Link className=' text-indigo-600  text-xs ' to={`/chatroom/${room?.room_id}`}>Enter</Link>
                                            </button>
                                            <FaArrowRight />
                                        </ul>
                                    </div>
                                </div>


                            </motion.div>
                        ))}
                    </div>
                </section>
                {/* join a room with a code section */}
                <section className='dark:bg-white/5 bg-gray-100 rounded-lg w-full p-3 mt-4 space-y-3'>
                    <h1 className='bai-jamjuree-semibold '>Have a room code ?</h1>
                    <div className='flex items-center justify-start gap-4'>
                        <input ref={InputRef} className='rounded-lg border border-gray-400 px-2 py-1 text-sm space-grotesk ' type="text" placeholder="Enter 6 digit code here " />
                        <button disabled={isJoining === true} onClick={handleJoinRoom}
                            className={` text-white dark:text-black  ${isJoining === true ? "bg-green-500" : "dark:bg-white bg-black"} rounded-lg px-2 py-1 text-sm space-grotesk font-semibold CustPoint`}>{isJoining === false ? (<>
                                Join +
                            </>) : (<>
                                Joining..
                            </>)}</button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default UserDashboard;
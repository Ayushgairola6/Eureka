import { FaArrowLeft } from "react-icons/fa";
import { motion } from 'framer-motion'
import { useRef } from "react";
import { CreateChatRoom } from '../store/chatRoomSlice.ts';
import { useAppDispatch, useAppSelector } from '../store/hooks.tsx';
import { toast, Toaster } from "sonner";
import { IoIosHourglass } from 'react-icons/io';
import { LuCircleFadingPlus } from "react-icons/lu";
//defining the prop types
type RoomProps = {
    showcard: boolean;
    setShowCard: React.Dispatch<React.SetStateAction<boolean>>;
}


const CreateRoom: React.FC<RoomProps> = ({ showcard, setShowCard }) => {
    const dispatch = useAppDispatch();
    const isPending = useAppSelector(state => state.chats.RoomCreationIspending);
    const RoomNameRef = useRef<HTMLInputElement>(null);
    const ParticipantCountRef = useRef<HTMLSelectElement>(null);
    const RoomTypeRef = useRef<HTMLInputElement>(null);
    const RoomDescriptions = useRef<HTMLTextAreaElement>(null);


    function HandleCreateRoom() {
        if (!RoomNameRef?.current?.value ||
            !ParticipantCountRef?.current?.value ||
            !RoomTypeRef?.current?.value ||
            !RoomDescriptions?.current?.value) {
            toast.error("All fields are mandatory!");
            return;
        }

        // 2. Create properly typed data object
        const Data = {
            Room_name: RoomNameRef.current.value,
            participant_count: Number(ParticipantCountRef.current.value),
            Room_type: RoomTypeRef.current.value,
            Description: RoomDescriptions.current.value
        };

        // 3. Properly handle the async dispatch
        dispatch(CreateChatRoom(Data))
            .unwrap()
            .then((response) => {
                if (response.message === 'Room created Successfully !') {
                    toast.success("Room created successfully!");
                    // Optional: Redirect or clear form
                }
            })
            .catch((error) => {
                toast.error(error || "Failed to create room");
            });
    }



    return (<>
        <div className={` absolute top-0 left-0 inset-0 z-[2] bg-black/80 backdrop-blur-sm transition-all duration-300 ${showcard ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"} flex items-center justify-center p-4`}>
            <Toaster />
            <div className=" max-w-md w-full relative">
                {/* Close Button */}
                <motion.button
                    onClick={() => setShowCard(false)}
                    className={`absolute top-5 right-5 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 ${showcard ? "rotate-90" : "-rotate-90"}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <FaArrowLeft className="text-red-500" size={20} />
                </motion.button>

                {/* Card Container */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl overflow-hidden p-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 bai-jamjuree-semibold">Create New Chat Room</h2>

                    <div className="space-y-4">
                        {/* Room Name */}
                        <div className="space-y-1">
                            <label className="block bai-jamjuree-regular text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="roomName">
                                Room Name
                            </label>
                            <input
                                ref={RoomNameRef}
                                id="roomName"
                                type="text"
                                placeholder="e.g. Dragon's Den"
                                className="w-full space-grotesk text-sm px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Max Participants */}
                        <div className="space-y-1">
                            <label className="block bai-jamjuree-regular text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="maxParticipants">
                                Max Participants
                            </label>
                            <select
                                ref={ParticipantCountRef}
                                id="maxParticipants"
                                className="w-full space-grotesk text-sm px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="2">2</option>
                                <option value="4">4</option>
                                <option value="8">8</option>
                                <option value="16">16</option>
                                <option value="50">50 (Large)</option>
                                <option value="100">100 (Huge)</option>
                            </select>
                        </div>

                        {/* Room Type */}
                        <div className="space-y-1">
                            <label className="block bai-jamjuree-regular text-sm font-medium text-gray-700 dark:text-gray-300">
                                Room Type
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <label className="inline-flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-700">
                                    <input ref={RoomTypeRef} type="radio" name="roomType" value="public" className="h-4 w-4 text-indigo-600" defaultChecked />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Public</span>
                                </label>
                                <label className="inline-flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-700">
                                    <input ref={RoomTypeRef} type="radio" name="roomType" value="private" className="h-4 w-4 text-indigo-600" />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Private</span>
                                </label>
                            </div>
                        </div>

                        {/* Room Description */}
                        <div className="space-y-1">
                            <label className="block bai-jamjuree-regular text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="description">
                                Description (Optional)
                            </label>
                            <textarea
                                ref={RoomDescriptions}
                                id="description"
                                rows={3}
                                placeholder="What's this room about?"
                                className="w-full space-grotesk text-sm px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>


                        {/* Create Button */}
                        <motion.button
                            disabled={isPending === true}
                            onClick={HandleCreateRoom}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full mt-6 ${isPending === true ? "bg-green-500" : "bg-indigo-500"}  text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 bai-jamjuree-semibold flex items-center justify-center gap-2`}
                        >
                            {isPending === false ? (<>
                                Create Room
                                <LuCircleFadingPlus />
                            </>) :
                                (<>
                                    Setting things up for you
                                    <IoIosHourglass className="animate-spin" />
                                </>)}
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    </>)
}

export default CreateRoom;
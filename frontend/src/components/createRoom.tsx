import { X, Users, Tag, UserPlus, Home, FileText, Loader2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { CreateChatRoom } from "../store/chatRoomSlice.ts";
import { useAppDispatch, useAppSelector } from "../store/hooks.tsx";
import { toast } from "sonner";

type RoomProps = {
  showcard: boolean;
  setShowCard: React.Dispatch<React.SetStateAction<boolean>>;
};

const participantOptions = [
  { count: 2, label: "1-on-1 session" },
  { count: 4, label: "Small group" },
  { count: 8, label: "Study group" },
  { count: 16, label: "Research team" },
  { count: 50, label: "Large team" },
  { count: 100, label: "Organization" },
];

const CreateRoom: React.FC<RoomProps> = ({ showcard, setShowCard }) => {
  const dispatch = useAppDispatch();
  const [participantCount, setParticipantCount] = useState(2);
  const [showParticipants, setShowParticipants] = useState(false);
  const [roomType, setRoomType] = useState("public");
  const isPending = useAppSelector((state) => state.chats.RoomCreationIspending);

  const RoomNameRef = useRef<HTMLInputElement>(null);
  const RoomDescriptions = useRef<HTMLTextAreaElement>(null);

  const handleCreateRoom = () => {
    if (
      !RoomNameRef?.current?.value ||
      !participantCount ||
      !RoomDescriptions?.current?.value
    ) {
      toast.error("All fields are required");
      return;
    }


    const data = {
      Room_name: RoomNameRef.current.value,
      participant_count: Number(participantCount),
      Room_type: roomType,
      Description: RoomDescriptions.current.value,
    };

    dispatch(CreateChatRoom(data))
      .unwrap()
      .then(() => {
        toast.success("Room created successfully");
        setShowCard(false);
        // Reset form
        if (RoomNameRef.current) RoomNameRef.current.value = "";
        if (RoomDescriptions.current) RoomDescriptions.current.value = "";
        setParticipantCount(2);
        setRoomType("public");
      })
      .catch((error) => {
        toast.error(error || "Failed to create room");
      });
  };

  return (
    <AnimatePresence>
      {showcard && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCard(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 flex items-end justify-center px-4 pb-4 sm:px-0"
          >
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* Drag Handle */}
              <div className="flex items-center justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 space-grotesk">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Users className="w-5 h-5 text-zinc-900 dark:text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg space-grotesk font-medium tracking-tight text-zinc-900 dark:text-white">
                      Create Workspace
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 bai-jamjuree-regular">
                      Set up a collaborative workspace
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCard(false)}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </button>
              </div>

              {/* Form Content - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 space-grotesk">
                {/* Room Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="roomName"
                    className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    <Tag className="w-4 h-4" />
                    Workspace Name
                  </label>
                  <input
                    ref={RoomNameRef}
                    id="roomName"
                    type="text"
                    placeholder="e.g., Research Team Alpha"
                    className="w-full px-3 py-2.5 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 transition-colors"
                    disabled={isPending}
                  />
                </div>

                {/* Max Participants */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <UserPlus className="w-4 h-4" />
                    Max Participants
                  </label>

                  <div className="relative space-grotesk">
                    <button
                      type="button"
                      onClick={() => setShowParticipants(!showParticipants)}
                      disabled={isPending}
                      className="w-full px-3 py-2.5 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-left flex items-center justify-between hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors disabled:opacity-50"
                    >
                      <span className="text-zinc-900 dark:text-white">
                        {participantOptions.find(opt => opt.count === participantCount)?.label ||
                          `${participantCount} participants`}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          {participantCount}
                        </span>
                        <motion.div
                          animate={{ rotate: showParticipants ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.div>
                      </span>
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {showParticipants && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full mt-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-10 overflow-hidden"
                        >
                          {participantOptions.map((option) => (
                            <button
                              key={option.count}
                              type="button"
                              onClick={() => {
                                setParticipantCount(option.count);
                                setShowParticipants(false);
                              }}
                              className="w-full px-3 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                            >
                              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                {option.label}
                              </span>
                              <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                {option.count}
                              </span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Room Type */}
                <div className="space-y-2 space-grotesk">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <Home className="w-4 h-4" />
                    Workspace Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRoomType("public")}
                      disabled={isPending}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border-2 ${roomType === "public"
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white"
                        : "bg-white dark:bg-black text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
                        }`}
                    >
                      Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoomType("private")}
                      disabled={isPending}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border-2 ${roomType === "private"
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white"
                        : "bg-white dark:bg-black text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
                        }`}
                    >
                      Private
                      {/* {!user?.IsPremiumUser && (
                        <span className="ml-1 text-[10px] opacity-60">Premium</span>
                      )} */}
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    <FileText className="w-4 h-4" />
                    Description
                  </label>
                  <textarea
                    ref={RoomDescriptions}
                    id="description"
                    rows={3}
                    placeholder="What's this workspace about?"
                    className="w-full px-3 py-2.5 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 transition-colors resize-none"
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Footer - Fixed at bottom */}
              <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black">
                <button
                  onClick={handleCreateRoom}
                  disabled={isPending === true}
                  className={`bai-jamjuree-regular w-full px-4 py-3 ${isPending === false ? "bg-zinc-900 dark:bg-white" : "bg-neutral-700 dark:bg-gray-400"} text-white dark:text-black rounded-sm  text-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2`}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Setting up workspace...
                    </>
                  ) : (
                    <>
                      Setup Workspace
                      <Plus className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateRoom;
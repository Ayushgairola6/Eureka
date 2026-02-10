import { FaThumbsDown, FaThumbsUp } from "react-icons/fa";
import { IoHeartHalfOutline } from "react-icons/io5";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { likeResponse, setLikeness } from "../store/InterfaceSlice";
import { toast } from "sonner";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
type FeedbackProps = {
  chat: any;
  ReceivedResponseId: any;
};

const ResponseFeedback: React.FC<FeedbackProps> = ({ chat }) => {
  const dispatch = useAppDispatch();
  const { sendingFeedback, docUsed, likeness, ResponseStatus } = useAppSelector(
    (state) => state.interface
  );
  const { user } = useAppSelector((s) => s.auth);

  //handle feedback recording
  React.useEffect(() => {
    if (ResponseStatus?.length === 0) return;
    const isLiked = ResponseStatus.some(
      (i) => i.id === chat.id && i.status !== ""
    );
    if (isLiked) {
      toast.info("Feedback recorded");
    }
  }, [ResponseStatus]);

  //handle response feedback
  const ResponseAuthenticity_Handler = () => {
    if (!likeness || likeness === "" || !docUsed) {
      toast("Some fields are missing !");
      return;
    }
    // insert in the response received array

    const cleanedIds: any = [];

    // filter the ids
    docUsed.forEach((doc) => {
      if (doc.MessageId === chat.id) {
        doc.docs.forEach((i) => {
          cleanedIds.push(i.doc_id);
        });
      }
    });
    const information = {
      data: cleanedIds,
      vote_type: likeness,
      user_id: user?.id,
      id: chat.id,
    };
    // const information = {
    //   data: ["872fdfae-0175-4ee9-aa68-cf350a29952b"],
    //   id: "d5f48887-de3f-44c6-8fda-f0a9c2ece57e",
    //   user_id: "38f4a59b-ab88-48f6-a928-2c9e987c49e3",
    //   vote_type: "upvote",
    // };

    dispatch(likeResponse(information));
  };

  return (
    <>
      <div className="flex items-center justify-end mt-3 group">
        {/* Container - Pill shape, subtle border */}
        <div className="flex items-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full p-1 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-700">
          {/* Label - Only shows on hover to save space */}
          <span className="text-[10px] text-gray-400 font-medium px-2 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Rate response
          </span>

          {/* Icons Group */}
          <div className="flex items-center gap-1">
            {/* Upvote */}
            <button
              onClick={() => dispatch(setLikeness("upvote"))}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                likeness === "upvote"
                  ? "bg-green-50 text-green-600 ring-1 ring-inset ring-green-200 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-800"
                  : "text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-green-600 dark:hover:text-green-400"
              }`}
              title="Helpful"
            >
              <FaThumbsUp size={12} />
            </button>

            {/* Partial */}
            <button
              onClick={() => dispatch(setLikeness("partial_upvote"))}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                likeness === "partial_upvote"
                  ? "bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-800"
                  : "text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
              title="Partially helpful"
            >
              <IoHeartHalfOutline size={13} />
            </button>

            {/* Downvote */}
            <button
              onClick={() => dispatch(setLikeness("downvote"))}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                likeness === "downvote"
                  ? "bg-red-50 text-red-600 ring-1 ring-inset ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800"
                  : "text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-red-600 dark:hover:text-red-400"
              }`}
              title="Incorrect"
            >
              <FaThumbsDown size={12} />
            </button>
          </div>

          {/* Submit Button - Animated Popup */}
          <AnimatePresence>
            {likeness && (
              <motion.div
                initial={{ width: 0, opacity: 0, scale: 0.9 }}
                animate={{ width: "auto", opacity: 1, scale: 1 }}
                exit={{ width: 0, opacity: 0, scale: 0.9 }}
                className="overflow-hidden flex items-center"
              >
                <div className="w-[1px] h-3 bg-gray-200 dark:bg-zinc-700 mx-1.5" />{" "}
                {/* Divider */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={sendingFeedback}
                  onClick={ResponseAuthenticity_Handler}
                  className={`px-3 py-1 mr-1 rounded-full text-[10px] font-bold tracking-wide transition-colors whitespace-nowrap ${
                    sendingFeedback
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                  }`}
                >
                  {sendingFeedback ? "..." : "SEND"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};
export default ResponseFeedback;

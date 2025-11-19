import { FaThumbsDown, FaThumbsUp } from "react-icons/fa";
import { IoHeartHalfOutline } from "react-icons/io5";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import {
  AuthenticityResponseHandler,
  setLikeness,
} from "../store/InterfaceSlice";
import { toast } from "sonner";

type FeedbackProps = {
  chat: any;
  setReceivedRsponseId: any;
};

const ResponseFeedback: React.FC<FeedbackProps> = ({
  chat,
  setReceivedRsponseId,
}) => {
  const dispatch = useAppDispatch();
  const { sendingFeedback, docUsed, likeness, suggestion } = useAppSelector(
    (state) => state.interface
  );
  const ResponseAuthenticity_Handler = async () => {
    if (!likeness || likeness === "" || !docUsed) {
      toast("Some fields are missing !");
      return;
    }
    // insert in the response received array
    setReceivedRsponseId((prev: string) => [...prev, chat.id]);

    const data = {
      likeness: likeness,
      suggestions: suggestion,
      docId: docUsed,
    };
    dispatch(AuthenticityResponseHandler(data))
      .unwrap()
      .catch((err) => toast.error(err))
      .then((res: any) => {
        if (res.message) {
          toast.success(res.message);
        }
      });
  };

  return (
    <>
      <div className="p-2 rounded-lg bg-gray-100 dark:bg-black border border-gray-200 dark:border-gray-700 mt-4">
        {/* Rating prompt */}
        <h1 className="bai-jamjuree-semibold text-sm text-black dark:text-white my-2">
          Was this helpful ?
        </h1>

        {/* Feedback buttons - simplified icons only */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(setLikeness("upvote"))}
              className={`p-2 rounded-full transition-colors ${
                likeness === "upvote"
                  ? "bg-green-100 text-green-600 border border-green-300"
                  : "bg-black/10 dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20"
              }`}
              title="Helpful"
            >
              <FaThumbsUp size={14} />
            </button>

            <button
              onClick={() => dispatch(setLikeness("downvote"))}
              className={`p-2 rounded-full transition-colors ${
                likeness === "downvote"
                  ? "bg-red-100 text-red-600 border border-red-300"
                  : "bg-black/10 dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              }`}
              title="Incorrect"
            >
              <FaThumbsDown size={14} />
            </button>

            <button
              onClick={() => dispatch(setLikeness("partial_upvote"))}
              className={`p-2 rounded-full transition-colors ${
                likeness === "partial_upvote"
                  ? "bg-sky-100 text-blue-600 border border-blue-300"
                  : "bg-black/10 dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-sky-900/40"
              }`}
              title="Partially helpful"
            >
              <IoHeartHalfOutline size={14} />
            </button>
          </div>

          <button
            disabled={sendingFeedback}
            onClick={ResponseAuthenticity_Handler}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              sendingFeedback
                ? "bg-green-600 text-white"
                : "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
            }`}
          >
            {sendingFeedback ? "..." : "Submit"}
          </button>
        </div>
      </div>
    </>
  );
};
export default ResponseFeedback;

import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toast } from "sonner";
import { DeleteDocuments } from "../store/InterfaceSlice";

type Props = {
  ShowBox: boolean;
  setShowBox: React.Dispatch<React.SetStateAction<boolean>>;
  DocToDel: string;
  setDocToDel: React.Dispatch<React.SetStateAction<string>>;
};

const ConfirmationBox: React.FC<Props> = ({
  ShowBox,
  setShowBox,
  DocToDel,
  setDocToDel,
}) => {
  const dispatch = useAppDispatch();
  const { deleting } = useAppSelector((state) => state.interface);
  // const { Contributions_user_id_fkey } = useAppSelector((state) => state.auth);
  return (
    <>
      <div
        className={`${
          ShowBox === true
            ? "flex pointer-events-auto"
            : "pointer-event-none hidden"
        } fixed top-0 left-0 h-full w-full  bg-black/30 backdrop-blur-sm`}
      >
        <section className="m-auto space-y-8  p-2 dark:bg-black bg-gray-100 border border-gray-300 rounded-lg h-35 w-90 bai-jamjuree-regular">
          <div className="text-center space-grotesk mt-4">
            <h1 className="text-sm">
              All information of this document will be deleted Including the
              chat history
            </h1>
          </div>
          <div className="flex items-center justify-evenly">
            <button
              onClick={() => {
                setShowBox(false);
                setDocToDel("");
              }}
              className="text-green-500 border-green-500 bg-green-500/20 rounded-lg px-3 py-1"
            >
              Cancel
            </button>
            <button
              disabled={deleting === true}
              onClick={() => {
                // if the document id is not empty delete it
                if (DocToDel !== "") {
                  dispatch(DeleteDocuments(DocToDel))
                    .unwrap()
                    .then((res: any) => {
                      if (res) {
                        setShowBox(false);
                        // dispatch(DeleteFromDocs(DocToDel));
                        toast.message("Record deleted Successfully");
                      }
                    })
                    .catch((error: any) => toast.error(error?.message));
                }
              }}
              aria-busy={deleting === true}
              className={`text-red-500 border-red-500 bg-red-500/20 rounded-lg px-3 py-1 flex items-center gap-2 ${
                deleting === true
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-red-500/30"
              }`}
            >
              {deleting === true ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Deleting...
                </>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </section>
      </div>
    </>
  );
};

export default ConfirmationBox;

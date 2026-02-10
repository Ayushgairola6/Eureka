import { FaRocketchat } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import RoomCard from "./Room_card";
import { FiPlus } from "react-icons/fi";
import React from "react";
import { BiPlus, BiUserPlus } from "react-icons/bi";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { toast } from "sonner";
import { JoinAChatRoom } from "../store/chatRoomSlice";
import { IoMdHourglass } from "react-icons/io";
type Props = {
  showcard: boolean;
  setShowCard: React.Dispatch<React.SetStateAction<boolean>>;
};

export const UserChatRoom: React.FC<Props> = ({ showcard, setShowCard }) => {
  const containeRef = React.useRef<HTMLDivElement>(null);

  function ScrollLeft() {
    if (containeRef.current) {
      containeRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  }
  function ScrollRight() {
    if (containeRef.current) {
      containeRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  }
  const dispatch = useAppDispatch();
  const InputRef = React.useRef<HTMLInputElement>(null)
  const { chatrooms } = useAppSelector((state) => state.auth);
  const { isJoiningRoom } = useAppSelector(s => s.chats)
  return (
    <section
      className={`border  transition-discrete ease-linear duration-300  rounded-md p-2`}
    >
      <div className="flex justify-between items-center mb-4 space-grotesk">
        <h2 className="md:text-xl text-lg  font-bold flex items-center justify-center gap-2">
          Workspace <FaRocketchat />
        </h2>
        <section className="inline-flex gap-5">
          <button
            onClick={() => setShowCard(!showcard)}
            className="text-xs md:text-sm text-sky-500 hover:underline"
          >
            Creat room +
          </button>
        </section>
        <span className="flex items-center justify-center gap-2">
          <button
            onClick={ScrollLeft}
            className="dark:bg-neutral-900 bg-black/5 rounded-full flex items-center justify-center p-1 "
          >
            <BsArrowLeft />
          </button>
          <button
            onClick={ScrollRight}
            className="dark:bg-neutral-900 bg-black/5 rounded-full flex items-center justify-center p-1 "
          >
            <BsArrowRight />
          </button>
        </span>
      </div>

      {/* list of chatrooms section */}
      <div
        ref={containeRef}
        className="flex flex-row gap-4 overflow-x-auto pb-4 scrollbar-hide md:scrollbar-default 
                  snap-x snap-mandatory no-scrollbar "
      >
        {chatrooms.length > 0 ? (
          chatrooms.map((room, index) => (
            <RoomCard room={room} index={index}></RoomCard>
          ))
        ) : (
          <div className="flex  items-center justify-center gap-4 w-full flex-wrap">
            <div role='button' onClick={() => setShowCard(!showcard)} className="space-grotesk uppercase text-xs dark:text-black text-white font-medium  bg-neutral-950 dark:bg-white  px-4 py-2 flex items-center justify-center gap-2 my-4 shadow-md  transition-all duration-300 cursor-pointer">
              Setup New Workspace
              <FiPlus />
            </div>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-neutral-300 dark:border-neutral-800"></div>
              <span className="flex-shrink-0 mx-4 text-neutral-400 text-xs uppercase tracking-widest space-grotesk">
                or
              </span>
              <div className="flex-grow border-t border-neutral-300 dark:border-neutral-800"></div>
            </div>
            <section className="shadow-2xl bg-gray-50 dark:bg-black p-3 space-y-3 border-2 dark:border-white/5 border-black/10 rounded-sm">
              <h5 className="bai-jamjuree-semibold flex items-center justify-normal gap-2">
                <BiUserPlus />
                Join a room{" "}
              </h5>
              <div className=" flex items-center justify-center rounded-md w-full  p-3">
                <input
                  ref={InputRef}
                  type="text"
                  placeholder="eg-3#482@2.."
                  className="outline-0 ring-0 focus:ring-0 border-none text-xs md:text-sm space-grotesk px-2 py-1 rounded-sm text-black dark:text-white"
                />
                <button
                  onClick={() => {
                    if (!InputRef?.current?.value) {
                      toast.error("Please enter a valid room code")
                      return;
                    }
                    dispatch(JoinAChatRoom(InputRef?.current?.value))
                      .unwrap()
                      .then((res: any) => {
                        if (res) {
                          toast.success(res.message);
                        }
                      })
                      .catch((error: any) => {
                        toast.error(error);
                      });
                  }}
                  className={` dark:text-black text-white  md:text-sm text-xs py-2 px-2 rounded-sm flex items-center justify-center gap-1 bai-jamjuree-semibold active:scale-1.01 cursor-pointer ${isJoiningRoom === true ? "dark:bg-gray-400 bg-neutral-700" : "dark:bg-white bg-black"}`}
                >
                  {isJoiningRoom === false ? (<>
                    Send Join request <BiPlus />
                  </>) : (<>Checking status <IoMdHourglass className='animate-spin' /></>)}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </section>
  );
};

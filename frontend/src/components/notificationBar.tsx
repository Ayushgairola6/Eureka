import { useRef, useState } from "react";
import { MdCheck, MdChevronRight } from "react-icons/md";
import { BiTrash } from "react-icons/bi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  AcceptOrRejectRequest,
  SetNotifications,
  DeleteNotification,
} from "../store/AuthSlice";
import { toast } from "sonner";
import { motion } from "framer-motion";
const NotificationPanel = () => {
  const { isOpen } = useAppSelector((state) => state.chats);
  const dispatch = useAppDispatch();
  const panelRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<any>("");
  const [action_type, setAction_type] = useState<string>("");
  // Sample notifications data
  const { notifications, notificationcount, user, isCleaning } = useAppSelector(
    (state) => state.auth
  );

  const handleAction = (action_type: string, notification: any) => {
    setAction_type(action_type);
    setCurrent(notification.id);

    if (notification.metadata.room_id && user)
      dispatch(
        AcceptOrRejectRequest({
          action_type: action_type,
          room_id: notification.metadata?.room_id,
          requested_user_id: notification.metadata.sent_by_id,
          room_name: notification.metadata.room_name,
          admin_id: user.id,
        })
      )
        .unwrap()
        .then((res) => {
          if (res.message) {
            // console.log(res.message)
            dispatch(SetNotifications(notification.id));

            // toast.info(res.message)
          }
        });
  };

  return (
    <motion.div
      initial={{ y: "100vh", opacity: "0%", pointerEvents: "none" }}
      animate={{
        y: isOpen === true ? 0 : "100vh",
        pointerEvents: isOpen === true ? "auto" : "none",
        opacity: isOpen === true ? "100%" : "0%",
      }}
      transition={{ duration: 0.6, ease: "anticipate" }}
      // onClick={() => console.log(notifications)}
      className="border z-[19] h-full md:w-100 w-full bg-gray-100  dark:bg-neutral-950 dark:border-gray-700 border-gray-300 m-auto  fixed top-20 md:left-3 left-0  rounded-lg overflow-x-hidden overflow-y-auto"
      ref={panelRef}
    >
      {/* <motion.div className=" w-80 dark:bg-black bg-white rounded-lg shadow-xl max-h-96 overflow-hidden bai-jamjuree-regular z-[2]"> */}
      {/* Panel Header */}

      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-black dark:text-white">
            My notifications
          </h3>
          <span className="text-sm text-green-600 dark:text-gray-200">
            {notificationcount} unread
          </span>
          {/* <div
                role="button"
                onClick={() => dispatch(setOpen(false))}
                className=" my-1 mx-1 bg-red-600/30 border border-red-600/20 p-0.5 rounded-full text-red-300 cursor-pointer "
              >
                <IoClose />
              </div> */}
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto max-h-80 ">
        {notifications?.length === 0 ? (
          <div className="p-4 bai-jamjuree-regular text-center text-gray-500 dark:text-gray-400">
            No notifications
          </div>
        ) : (
          notifications.map((notification: any) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 `}
            >
              {/* ${!notification ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                        } */}
              {/* Notification Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full `} />
                  <span
                    className={`text-sm font-medium ${
                      notification.notification_type === "room_joining_request"
                        ? "text-blue-600 dark:text-blue-400"
                        : notification.notification_type === "Informatory"
                        ? "text-green-500 dark:text-green-500"
                        : "text-amber-500 dark:text-amber-500"
                    }`}
                  >
                    {notification.title}
                  </span>
                </div>
                <span className="text-xs text-indigo-500 dark:text-indigo-400">
                  {notification?.sent_at
                    ? notification?.sent_at.split("T")[0]
                    : "unknown"}
                </span>
              </div>

              {/* Notification Message */}
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between gap-2">
                {notification.notification_message}
                {notification.notification_type === "Informatory" && (
                  <span
                    onClick={() => {
                      dispatch(DeleteNotification(notification.id))
                        .unwrap()
                        .then((res) => {
                          if (res.message === "deleted") {
                            dispatch(SetNotifications(notification.id));
                          } else {
                            toast.error("Something went wrong !");
                          }
                        })
                        .catch((error) => {
                          console.error(error);
                        });
                    }}
                  >
                    <BiTrash color="red" size={22} />
                  </span>
                )}
              </p>

              {/* Action Buttons for Request-type Notifications */}
              {notification.notification_type === "room_joining_request" && (
                <div className="flex space-x-2">
                  {/* Reject Button */}
                  <button
                    onClick={() => handleAction("Rejected", notification)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-1 px-3 rounded text-xs font-medium transition-colors"
                    disabled={isCleaning} // Disable button while an action is in progress
                  >
                    {isCleaning &&
                    current === notification.id &&
                    action_type === "Rejected" ? (
                      <div className="flex items-center justify-center w-full">
                        <div className="h-4 w-4 rounded-full border-t-2 border-gray-500 animate-spin" />
                      </div>
                    ) : (
                      "Reject"
                    )}
                  </button>

                  {/* Accept Button */}
                  <button
                    onClick={() => handleAction("Accepted", notification)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                    disabled={isCleaning} // Disable button while an action is in progress
                  >
                    {isCleaning &&
                    current === notification.id &&
                    action_type === "Accepted" ? (
                      <div className="flex items-center justify-center w-full">
                        <div className="h-4 w-4 rounded-full border-t-2 border-white animate-spin" />
                      </div>
                    ) : (
                      <>
                        <MdCheck size={14} />
                        <span>Accept</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* View Button for Non-actionable Notifications */}
              {notification.notification_type !== "room_joining_request" && (
                <button
                  // onClick={() => markAsRead(notification.id)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium flex items-center space-x-1"
                >
                  <span>View</span>
                  <MdChevronRight size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
      {/* </motion.div> */}
    </motion.div>
  );
};

export default NotificationPanel;

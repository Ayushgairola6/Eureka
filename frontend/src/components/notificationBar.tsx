import { useRef, useState } from 'react';
import { MdCheck, MdChevronRight } from 'react-icons/md';
import { BiTrash } from 'react-icons/bi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { AcceptOrRejectRequest, SetNotifications, DeleteNotification } from '../store/AuthSlice';
import { toast, Toaster } from 'sonner'

const NotificationPanel = () => {
    const { isOpen } = useAppSelector(state => state.chats);
    const dispatch = useAppDispatch();
    const panelRef = useRef<HTMLDivElement>(null);
    const [current, setCurrent] = useState<any>('')
    const [action_type, setAction_type] = useState<string>('')
    // Sample notifications data
    const { notifications, notificationcount, user, isCleaning } = useAppSelector(state => state.auth);


    const handleAction = (action_type: string, notification: any) => {
        setAction_type(action_type);
        setCurrent(notification.id)

        if (notification.metadata.room_id && user)
            dispatch(AcceptOrRejectRequest({ action_type: action_type, room_id: notification.metadata?.room_id, requested_user_id: notification.metadata.sent_by_id, room_name: notification.metadata.room_name, admin_id: user.id })).unwrap().then(res => {
                if (res.message) {
                    // console.log(res.message)
                    dispatch(SetNotifications(notification.id))

                    // toast.info(res.message)
                }
            })

    }

    return (
        <div className=" absolute top-15 right-3 z-50" ref={panelRef}>
            <Toaster />
            {isOpen && (
                <div className=" w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700  max-h-96 overflow-hidden bai-jamjuree-regular">
                    {/* Panel Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Notifications
                            </h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {notificationcount} unread
                            </span>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto max-h-80 space-grotesk">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
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
                                            <span className={`text-sm font-medium ${notification.notification_type === 'room_joining_request' ? 'text-blue-600 dark:text-blue-400' :
                                                notification.notification_type === 'Informatory' ? 'text-yellow-600 dark:text-yellow-400' :
                                                    'text-gray-600 dark:text-gray-400'
                                                }`}>
                                                {notification.title}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            {notification.sent_at.split("T")[0]}
                                        </span>
                                    </div>

                                    {/* Notification Message */}
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between gap-2">
                                        {notification.notification_message}
                                        {notification.notification_type === "Informatory" && (<span onClick={() => {
                                            dispatch(DeleteNotification(notification.id)).unwrap().then((res) => {
                                                if (res.message === "deleted") {
                                                    dispatch(SetNotifications(notification.id))
                                                } else {
                                                    toast.error("Something went wrong !");
                                                }
                                            })
                                        }}>
                                            <BiTrash color="red" size={22} />
                                        </span>)}
                                    </p>

                                    {/* Action Buttons for Request-type Notifications */}
                                    {notification.notification_type === 'room_joining_request' && (
                                        <div className="flex space-x-2">
                                            {/* Reject Button */}
                                            <button
                                                onClick={() => handleAction("Rejected", notification)}
                                                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-1 px-3 rounded text-xs font-medium transition-colors"
                                                disabled={isCleaning} // Disable button while an action is in progress
                                            >
                                                {isCleaning && current === notification.id && action_type === 'Rejected' ? (
                                                    <div className='flex items-center justify-center w-full'>
                                                        <div className='h-4 w-4 rounded-full border-t-2 border-gray-500 animate-spin' />
                                                    </div>
                                                ) : (
                                                    'Reject'
                                                )}
                                            </button>

                                            {/* Accept Button */}
                                            <button
                                                onClick={() => handleAction("Accepted", notification)}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                                                disabled={isCleaning} // Disable button while an action is in progress
                                            >
                                                {isCleaning && current === notification.id && action_type === 'Accepted' ? (
                                                    <div className='flex items-center justify-center w-full'>
                                                        <div className='h-4 w-4 rounded-full border-t-2 border-white animate-spin' />
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
                                    {notification.notification_type !== 'room_joining_request' && (
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
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
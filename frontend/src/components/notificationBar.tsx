import { useState, useRef, useEffect } from 'react';
import { MdCheck, MdChevronRight } from 'react-icons/md';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setOpen } from '../store/chatRoomSlice';
interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'request';
    timestamp: string;
    read: boolean;
    actionRequired?: boolean;
    sender?: string;
}

const NotificationPanel = () => {
    const { isOpen } = useAppSelector(state => state.chats);
    const dispatch = useAppDispatch();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const panelRef = useRef<HTMLDivElement>(null);

    // Sample notifications data
    const sampleNotifications: Notification[] = [
        {
            id: '1',
            title: 'Friend Request',
            message: 'Sarah Johnson wants to add you as a friend',
            type: 'request',
            timestamp: '2 min ago',
            read: false,
            actionRequired: true,
            sender: 'Sarah Johnson'
        },
        {
            id: '2',
            title: 'New Message',
            message: 'You have a new message in General Chat',
            type: 'info',
            timestamp: '5 min ago',
            read: false
        },
        {
            id: '3',
            title: 'Room Invitation',
            message: 'You have been invited to join Developers Room',
            type: 'request',
            timestamp: '10 min ago',
            read: true,
            actionRequired: true,
            sender: 'Alex Chen'
        },
        {
            id: '4',
            title: 'Document Shared',
            message: 'Project_Requirements.pdf has been shared with you',
            type: 'info',
            timestamp: '1 hour ago',
            read: true
        }
    ];

    useEffect(() => {
        setNotifications(sampleNotifications);

        // Close panel when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                dispatch(setOpen(false));
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = (notificationId: string, _accepted: boolean) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId
                    ? { ...notif, read: true, actionRequired: false }
                    : notif
            )
        );

        // console.log(`Notification ${notificationId} ${accepted ? 'accepted' : 'rejected'}`);
        // Add your API call or state update logic here
    };

    const markAsRead = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId ? { ...notif, read: true } : notif
            )
        );
    };

    const unreadCount = notifications.filter(notif => !notif.read).length;

    return (
        <div className=" absolute top-15 right-0 z-50" ref={panelRef}>
            {isOpen && (
                <div className=" w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700  max-h-96 overflow-hidden">
                    {/* Panel Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Notifications
                            </h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {unreadCount} unread
                            </span>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto max-h-80">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                        }`}
                                >
                                    {/* Notification Header */}
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${!notification.read ? 'bg-blue-500' : 'bg-transparent'
                                                }`} />
                                            <span className={`text-sm font-medium ${notification.type === 'request' ? 'text-blue-600 dark:text-blue-400' :
                                                notification.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                                                    'text-gray-600 dark:text-gray-400'
                                                }`}>
                                                {notification.title}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            {notification.timestamp}
                                        </span>
                                    </div>

                                    {/* Notification Message */}
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                        {notification.message}
                                    </p>

                                    {/* Action Buttons for Request-type Notifications */}
                                    {notification.actionRequired && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleAction(notification.id, false)}
                                                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-1 px-3 rounded text-xs font-medium transition-colors"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleAction(notification.id, true)}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                                            >
                                                <MdCheck size={14} />
                                                <span>Accept</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* View Button for Non-actionable Notifications */}
                                    {!notification.actionRequired && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
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

                    {/* Panel Footer */}
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                        <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                            View All Notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
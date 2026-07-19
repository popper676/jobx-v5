import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, Eye, FileText, Check, X, Briefcase } from 'lucide-react';
import { useStore } from '../../store/StoreProvider';
import { Notification } from '../../services/notificationService';

interface NotificationListProps {
  onClose?: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const store = useStore();
  const unreadCount = store.notifications.filter(n => !n.read).length;

  const renderIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like': return <div className="bg-red-500 w-full h-full rounded-full flex justify-center items-center"><Heart className="w-2.5 h-2.5 text-white fill-current" /></div>;
      case 'comment': return <div className="bg-blue-500 w-full h-full rounded-full flex justify-center items-center"><MessageCircle className="w-2.5 h-2.5 text-white fill-current" /></div>;
      case 'connection': return <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-full h-full rounded-full flex justify-center items-center"><UserPlus className="w-2.5 h-2.5 text-white" /></div>;
      case 'view': return <div className="bg-violet-500 w-full h-full rounded-full flex justify-center items-center"><Eye className="w-2.5 h-2.5 text-white" /></div>;
      case 'post': return <div className="bg-blue-500 w-full h-full rounded-full flex justify-center items-center"><FileText className="w-2.5 h-2.5 text-white" /></div>;
      case 'job_alert': return <div className="bg-amber-500 w-full h-full rounded-full flex justify-center items-center"><Briefcase className="w-2.5 h-2.5 text-white" /></div>;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200/80 overflow-hidden z-50 flex flex-col"
    >
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50/50 to-gray-50/30">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        {unreadCount > 0 && (
          <button onClick={() => store.markAllNotificationsRead()} className="text-xs text-[#014BAA] font-medium hover:underline">
            Mark all as read
          </button>
        )}
      </div>
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        <AnimatePresence initial={false}>
          {store.notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              className="px-4 py-8 text-center text-gray-500 text-sm"
            >
              No notifications
            </motion.div>
          ) : (
            store.notifications.map((notification) => (
              <motion.div 
                key={notification.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className={`group px-4 py-3 hover:bg-blue-50/50 transition-colors border-b border-gray-50 last:border-0 relative overflow-hidden ${
                  !notification.read ? 'bg-[#F8F3F0]/50' : ''
                }`}
              >
                {!notification.read && (
                  <motion.div layoutId={`unread-${notification.id}`} className="absolute left-0 top-0 bottom-0 w-1 bg-[#014BAA]" />
                )}
                
                <div className="flex gap-3 relative z-10">
                  <Link
                    to={notification.link || (notification.type === 'connection' ? `/friend/${notification.userId}` : '#')}
                    onClick={() => {
                      if (!notification.read) store.markNotificationRead(notification.id);
                      if (notification.type === 'connection' && onClose) onClose();
                    }}
                    className="relative shrink-0 mt-1"
                  >
                    {notification.userAvatar ? (
                      <img src={notification.userAvatar} alt={notification.userName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-blue-500" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                      {renderIcon(notification.type)}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">
                      {notification.userName && <span className="font-semibold text-gray-900">{notification.userName} </span>}
                      {notification.action || notification.title}
                    </p>
                    {notification.message && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                    )}
                    <p className="text-[11px] font-medium text-gray-400 mt-1.5">{notification.time}</p>
                    
                    {notification.type === 'connection' && (
                      <div className="flex gap-2 mt-2.5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            store.acceptFriendRequest(notification.friendRequestId || notification.userId || '');
                          }}
                          className="flex items-center justify-center flex-1 gap-1 py-1.5 bg-[#014BAA] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors hover:bg-[#013b86]"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            store.declineFriendRequest(notification.friendRequestId || notification.userId || '');
                          }}
                          className="flex items-center justify-center flex-1 gap-1 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-semibold rounded-lg transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Decline
                        </motion.button>
                      </div>
                    )}
                  </div>
                  
                  {!notification.read && (
                    <button
                      onClick={() => store.markNotificationRead(notification.id)}
                      className="w-2 h-2 bg-[#014BAA] rounded-full mt-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      <div className="p-2 border-t border-gray-100 text-center bg-[#F8F3F0]/50">
        <span className="text-xs font-medium text-gray-400">End of notifications</span>
      </div>
    </motion.div>
  );
}

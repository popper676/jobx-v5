import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, MoreVertical, Phone, Video, Send, Image as ImageIcon, Smile, Paperclip } from 'lucide-react';
import { useStore } from '../store/StoreProvider';
import { Link } from 'react-router-dom';

const CANDIDATE_ROLES: Record<string, string> = {
  'Sarah Chen': 'Senior React Engineer',
  'Marcus Rodriguez': 'Product Designer',
  'Jenna Miles': 'UX Researcher',
};

export default function Messages() {
  const store = useStore();
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    store.searchConversations(query);
  };

  const handleSend = () => {
    if (!messageText.trim() || !store.activeChat) return;
    store.sendMessage(store.activeChat.id, messageText.trim());
    setMessageText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div>
      <Link to="/employer" className="product-button-secondary mb-4 inline-flex"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex h-[calc(100vh-11rem)]">
      <div className="w-full md:w-80 border-r border-gray-100 flex flex-col flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 border-b border-gray-100 flex items-center justify-between"
        >
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Messages</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-primary hover:bg-blue-50 p-2 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-3"
        >
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
            placeholder="Search candidate or role"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8F3F0] border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
        </motion.div>

        <div className="overflow-y-auto flex-1">
          {store.conversations.map((chat, index) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={() => store.setActiveChat(chat)}
              className={`flex items-start gap-3 p-3 mx-2 rounded-lg cursor-pointer transition-colors ${
                store.activeChat?.id === chat.id ? 'bg-blue-50' : 'hover:bg-[#F8F3F0]'
              }`}
            >
              <div className="relative flex-shrink-0">
                <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                {chat.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className={`text-sm font-semibold truncate ${store.activeChat?.id === chat.id ? 'text-gray-900' : 'text-gray-800'}`}>
                    {chat.name}
                  </h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {chat.time}
                  </span>
                </div>
                <p className="mb-1 truncate text-[0.68rem] font-bold text-[#173b67]">{chat.role || CANDIDATE_ROLES[chat.name] || 'JobX candidate'}</p>
                <div className="flex justify-between items-center">
                  <p className={`truncate text-xs ${chat.unread && store.activeChat?.id !== chat.id ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>{chat.lastMessage}</p>
                  {chat.unread > 0 && store.activeChat?.id !== chat.id && (
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col hidden md:flex min-w-0 bg-[#F8F3F0]/30">
        <AnimatePresence mode="wait">
          {store.activeChat ? (
            <motion.div
              key={store.activeChat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col flex-1 min-h-0"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={store.activeChat.avatar} alt={store.activeChat.name} className="w-10 h-10 rounded-full object-cover" />
                    {store.activeChat.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-blue-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{store.activeChat.name}</h3>
                    <p className="text-xs text-gray-500">{store.activeChat.role || CANDIDATE_ROLES[store.activeChat.name] || 'JobX candidate'} · {store.activeChat.online ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-500">
                  <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="hover:text-primary transition-colors"><Phone className="w-5 h-5" /></motion.button>
                  <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="hover:text-primary transition-colors"><Video className="w-5 h-5" /></motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="hover:text-gray-900 transition-colors"><MoreVertical className="w-5 h-5" /></motion.button>
                </div>
              </motion.div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="text-center text-xs text-gray-400 my-4">Today</div>
                {store.currentMessages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[70%] ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                      {!msg.isMe && (
                        <img src={store.activeChat!.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover my-auto" />
                      )}
                      <div>
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                            msg.isMe
                              ? 'bg-primary text-white rounded-br-sm'
                              : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <div className={`text-[10px] text-gray-400 mt-1 ${msg.isMe ? 'text-right' : 'text-left'}`}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                <div className="flex items-end gap-2 bg-[#F8F3F0] border border-gray-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors shrink-0"
                  >
                    <Paperclip className="w-5 h-5" />
                  </motion.button>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[40px] py-2 px-1 text-sm outline-none"
                    rows={1}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors shrink-0 mb-0.5"
                  >
                    <Smile className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSend}
                    className="p-2 gradient-primary text-white rounded-full transition-colors shrink-0 mb-0.5 shadow-md hover:shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col items-center justify-center text-gray-500 h-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-gray-300"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <p className="text-lg font-medium text-gray-900">Your messages</p>
              <p className="text-sm mt-1">Select a conversation to start chatting</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div></div>
  );
}

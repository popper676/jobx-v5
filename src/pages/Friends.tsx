import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, UserPlus, Users, MessageSquare, Check, X, Clock, UserCheck, UserX, Send } from 'lucide-react';
import { useStore } from '../store/StoreProvider';

export default function Friends() {
  const store = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Friend Requests');

  const tabs = [
    { name: 'Friend Requests', count: store.friendRequests.length },
    { name: 'Sent Requests', count: store.sentRequests.length },
    { name: 'My Connections', count: store.connections.length },
    { name: 'Discover', count: 0 },
  ];

  const matchSearch = (person: any) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    if (person.name?.toLowerCase().includes(q)) return true;
    if (person.title?.toLowerCase().includes(q)) return true;
    if (person.fromName?.toLowerCase().includes(q)) return true;
    if (person.toName?.toLowerCase().includes(q)) return true;
    if (person.skills?.some((s: string) => s.toLowerCase().includes(q))) return true;
    return false;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) store.searchPeople(query);
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search people by name, skill, or company..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#F8F3F0] border border-transparent rounded-xl focus:bg-white focus:border-primary/50 outline-none transition-colors text-sm"
          />
        </div>
      </motion.div>

      <motion.div
        className="flex items-center gap-2 border-b border-gray-200 pb-px overflow-x-auto custom-scrollbar"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {tabs.map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === tab.name
                ? 'border-blue-500 text-[#014BAA]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.name} {tab.count > 0 && <span className="ml-1 bg-blue-100 text-[#014BAA] px-1.5 py-0.5 rounded-full text-[10px] font-bold">{tab.count}</span>}
          </button>
        ))}
      </motion.div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'Friend Requests' && (
            <motion.div
              key="friend-requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 bg-[#F8F3F0]/50">
                <h2 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#014BAA]" /> Incoming Requests
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">People who want to connect with you</p>
              </div>
              {store.friendRequests.filter(matchSearch).length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {store.friendRequests.filter(matchSearch).map((req, index) => (
                    <motion.div
                      key={req.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8F3F0] transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <Link to={`/friend/${req.fromId}`} className="flex items-center gap-4 hover:opacity-90 transition-opacity">
                        <img src={req.fromAvatar} alt={req.fromName} className="w-14 h-14 rounded-full object-cover border border-gray-100" />
                        <div>
                          <h3 className="font-semibold text-gray-900 hover:text-[#014BAA] transition-colors">{req.fromName}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => store.declineFriendRequest(req.id)}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          <UserX className="w-4 h-4" /> Decline
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => store.acceptFriendRequest(req.id)}
                          className="flex items-center gap-1.5 px-4 py-2.5 gradient-primary text-white rounded-lg text-sm font-medium transition-colors shadow-md"
                        >
                          <UserCheck className="w-4 h-4" /> Accept
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No pending friend requests</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'Sent Requests' && (
            <motion.div
              key="sent-requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 bg-[#F8F3F0]/50">
                <h2 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-500" /> Sent Requests
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Requests you sent that are waiting for a response</p>
              </div>
              {store.sentRequests.filter(matchSearch).length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {store.sentRequests.filter(matchSearch).map((req, index) => (
                    <motion.div
                      key={req.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8F3F0] transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <Link to={`/friend/${req.toId}`} className="flex items-center gap-4 hover:opacity-90 transition-opacity">
                        <img src={req.toAvatar} alt={req.toName} className="w-14 h-14 rounded-full object-cover border border-gray-100" />
                        <div>
                          <h3 className="font-semibold text-gray-900 hover:text-[#014BAA] transition-colors">{req.toName}</h3>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" /> Pending • {new Date(req.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </Link>
                      <button disabled className="flex items-center gap-1.5 px-4 py-2 bg-[#F8F3F0] border border-gray-200 text-gray-500 rounded-lg text-sm font-medium">
                        <Clock className="w-4 h-4" /> Waiting
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <Send className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No sent requests</p>
                  <p className="text-xs text-gray-400 mt-1">Discover people and send friend requests</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'My Connections' && (
            <motion.div
              key="my-connections"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {store.connections.filter(matchSearch).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {store.connections.filter(matchSearch).map((connection, index) => (
                    <motion.div
                      key={connection.id}
                      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow card-hover"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="relative">
                          <Link to={`/friend/${connection.friendId}`} className="hover:opacity-90 transition-opacity">
                            <img src={connection.avatar} alt={connection.name} className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 mb-3" />
                          </Link>
                          {connection.online && (
                            <span className="absolute bottom-1 right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <Link to={`/friend/${connection.friendId}`} className="hover:text-[#014BAA] transition-colors">
                          <h3 className="font-bold text-gray-900">{connection.name}</h3>
                        </Link>
                        <p className="text-sm text-gray-500 line-clamp-2 h-10 mt-1">{connection.title}</p>
                        <p className="text-xs text-gray-400 mt-2">Connected {connection.connectedSince}</p>
                        <Link to={`/friend/${connection.friendId}`} className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-[#014BAA] hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors">
                          <MessageSquare className="w-4 h-4" /> View Profile
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No connections yet</p>
                  <p className="text-xs text-gray-400 mt-1">Accept friend requests or discover people to connect</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'Discover' && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {store.recommendations.filter(matchSearch).map((person, index) => (
                <motion.div
                  key={person.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-md transition-shadow flex flex-col items-center card-hover"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Link to={`/friend/${person.id}`} className="hover:opacity-90 transition-opacity">
                    <img src={person.avatar} alt={person.name} className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 mb-3" />
                  </Link>
                  <Link to={`/friend/${person.id}`} className="hover:text-[#014BAA] transition-colors">
                    <h3 className="font-bold text-gray-900 truncate w-full">{person.name}</h3>
                  </Link>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{person.title}</p>

                  <div className="text-xs text-gray-500 mt-3 flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" /> {person.mutual} mutual friends
                  </div>

                  <div className="flex flex-wrap justify-center gap-1 mb-4 mt-2 h-10 overflow-hidden">
                    {person.skills.map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded text-[10px] font-medium uppercase tracking-wide">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto w-full space-y-2">
                    {person.connectionStatus === 'none' ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => store.sendConnectionRequest(person.id)}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 gradient-primary text-white rounded-lg text-sm font-semibold transition-colors shadow-md"
                      >
                        <UserPlus className="w-4 h-4" /> Connect
                      </motion.button>
                    ) : person.connectionStatus === 'pending' ? (
                      <button disabled className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-[#F8F3F0] border border-gray-200 text-gray-500 rounded-lg text-sm font-semibold">
                        <Clock className="w-4 h-4" /> Pending...
                      </button>
                    ) : (
                      <button disabled className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-50 border border-blue-200 text-[#014BAA] rounded-lg text-sm font-semibold">
                        <Check className="w-4 h-4" /> Connected
                      </button>
                    )}
                    <Link
                      to={`/friend/${person.id}`}
                      className="w-full text-sm text-[#014BAA] hover:text-[#014BAA] font-medium py-1 transition-colors hover:underline block"
                    >
                      View Profile
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
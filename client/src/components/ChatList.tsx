'use client';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { User, Message, Chat } from "../../../shared/types";
import { Loader } from "lucide-react";

interface ChatListProps {
  token?: string | null;
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat) => void;
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  isCollapsed: boolean;
}

const ChatList: React.FC<ChatListProps> = ({
  token,
  selectedChat,
  setSelectedChat,
  chats,
  setChats,
  isCollapsed,
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchChats = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success && res.data.chats) {
          setChats(res.data.chats);
        }
      } catch (err) {
        console.error("❌ Error fetching chat list:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [token, setChats]);

  const formatTime = (time: Date | string | undefined) =>
    time ? formatDistanceToNow(new Date(time), { addSuffix: true }) : "";

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        {isCollapsed ? "..." : <Loader/>}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-900 text-gray-100">
      {chats.length === 0 ? (
        <div className={`p-4 text-center text-gray-500 ${isCollapsed ? 'text-xs' : ''}`}>
          {isCollapsed ? "No chats" : "No chats yet — start one!"}
        </div>
      ) : (
        chats.map((chat) => (
          <div
            key={chat.roomId}
            onClick={() => setSelectedChat(chat)}
            className={`flex items-center ${
              isCollapsed ? 'p-2 justify-center relative' : 'p-3 sm:p-4'
            } cursor-pointer border-b border-gray-800 hover:bg-gray-800 transition ${
              selectedChat?.roomId === chat.roomId ? "bg-gray-800" : ""
            }`}
          >
            {/* Profile Picture or Avatar */}
            {chat.user.profilePic ? (
              <img
                src={chat.user.profilePic}
                alt={chat.user.name}
                className={`${
                  isCollapsed ? 'w-8 h-8' : 'w-10 h-10 sm:w-12 sm:h-12'
                } rounded-full object-cover ${
                  isCollapsed ? '' : 'mr-2 sm:mr-3'
                } flex-shrink-0`}
              />
            ) : (
              <div
                className={`${
                  isCollapsed ? 'w-8 h-8' : 'w-10 h-10 sm:w-12 sm:h-12'
                } bg-gray-700 rounded-full flex items-center justify-center ${
                  isCollapsed ? '' : 'mr-2 sm:mr-3'
                } text-base sm:text-lg font-semibold text-gray-300 flex-shrink-0`}
              >
                {chat.user.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Chat Details - Only show when expanded */}
            {!isCollapsed && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex justify-between items-center mb-1 gap-2">
                  <h2 className="font-semibold text-sm sm:text-base text-gray-100 truncate">
                    {chat.user.name}
                  </h2>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                    {formatTime(chat.lastMessageTime)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 truncate">
                  {chat.lastMessage || "Start chatting..."}
                </p>
              </div>
            )}

            {/* Unread Count Badge - Expanded View */}
            {!isCollapsed && chat.unreadCount > 0 && (
              <div className="ml-2 bg-blue-600 text-white text-xs font-semibold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center flex-shrink-0">
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </div>
            )}

            {/* Unread Count Badge - Collapsed View (positioned on avatar) */}
            {isCollapsed && chat.unreadCount > 0 && (
              <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ChatList;
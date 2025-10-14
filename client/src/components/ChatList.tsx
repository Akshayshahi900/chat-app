'use client';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import {User , Message , Chat} from "../../../shared/types"

interface ChatListProps {
  token?: string | null;
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat) => void;
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
}

const ChatList: React.FC<ChatListProps> = ({
  token,
  selectedChat,
  setSelectedChat,
  chats,
  setChats,
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
        Loading chats...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-900 text-gray-100">
      {chats.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No chats yet — start one!</div>
      ) : (
        chats.map((chat) => (
          <div
            key={chat.roomId}
            onClick={() => setSelectedChat(chat)}
            className={`flex items-center p-4 cursor-pointer border-b border-gray-800 hover:bg-gray-800 transition ${
              selectedChat?.roomId === chat.roomId ? "bg-gray-800" : ""
            }`}
          >
            {chat.user.profilePic ? (
              <img
                src={chat.user.profilePic}
                alt={chat.user.name}
                className="w-12 h-12 rounded-full object-cover mr-3"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mr-3 text-lg font-semibold text-gray-300">
                {chat.user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h2 className="font-semibold text-gray-100 truncate">
                  {chat.user.name}
                </h2>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                  {formatTime(chat.lastMessageTime)}
                </span>
              </div>
              <p className="text-sm text-gray-400 truncate">
                {chat.lastMessage || "Start chatting..."}
              </p>
            </div>

            {chat.unreadCount > 0 && (
              <div className="ml-2 bg-blue-600 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">
                {chat.unreadCount}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ChatList;

'use client'
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface User {
  id: string;
  name: string;
  username: string;
  profilePic?: string;
  About?: string;
  isOnline?: boolean;
}

interface Message {
  id: string;
  roomId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: string;
  timestamp: Date;
  sender: User;
}

interface Chat {
  user: User;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

export default function ChatApp() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [foundUsers, setFoundUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Load token + connect socket automatically
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      console.warn("No token found, redirecting to login...");
      window.location.href = "/login";
      return;
    }

    setToken(storedToken);

    const newSocket = io(process.env.NEXT_PUBLIC_SERVER_URL!, {
      auth: { token: storedToken },
    });

    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));

    newSocket.on("message:received", (message: Message) => {
      setMessages((prev) => [...prev, message]);
      setChats((prev) =>
        prev.map((chat) =>
          chat.user.id === message.senderId || chat.user.id === message.receiverId
            ? {
                ...chat,
                lastMessage: message.content,
                lastMessageTime: message.timestamp,
                unreadCount:
                  selectedChat?.user.id === message.senderId ? 0 : chat.unreadCount + 1,
              }
            : chat
        )
      );
    });

    newSocket.on("user:found", (user: User) => {
      setFoundUsers((prev) => [...prev, user]);
    });

    newSocket.on("user:online", (data: { userId: string }) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.user.id === data.userId
            ? { ...chat, user: { ...chat.user, isOnline: true } }
            : chat
        )
      );
    });

    newSocket.on("user:offline", (data: { userId: string }) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.user.id === data.userId
            ? { ...chat, user: { ...chat.user, isOnline: false } }
            : chat
        )
      );
    });

    setSocket(newSocket);

    // ✅ cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // ✅ Search + chat functions stay same
  const searchUsers = () => {
    if (socket && searchQuery.trim()) {
      setFoundUsers([]);
      socket.emit("user:search", { username: searchQuery });
    }
  };

  const startChat = (user: User) => {
    const existingChat = chats.find((chat) => chat.user.id === user.id);
    if (!existingChat) {
      const newChat: Chat = {
        user: { ...user, isOnline: true },
        lastMessage: "Chat started",
        lastMessageTime: new Date(),
        unreadCount: 0,
      };
      setChats((prev) => [newChat, ...prev]);
      setSelectedChat(newChat);
    } else {
      setSelectedChat(existingChat);
      setChats((prev) =>
        prev.map((chat) =>
          chat.user.id === user.id ? { ...chat, unreadCount: 0 } : chat
        )
      );
    }
    setFoundUsers([]);
    setSearchQuery("");
  };

  const sendMessage = () => {
    if (socket && selectedChat && newMessage.trim()) {
      socket.emit("message:send", {
        receiverId: selectedChat.user.id,
        content: newMessage,
      });
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-300 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-300">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Zing</h1>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              placeholder="Search users..."
              className="flex-1 p-2 border border-gray-300 rounded"
            />
            <button
              onClick={searchUsers}
              className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
            >
              Search
            </button>
          </div>
        </div>

        {/* Search Results */}
        {foundUsers.length > 0 && (
          <div className="border-b border-gray-200 p-2">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Search Results</h3>
            {foundUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded"
                onClick={() => startChat(user)}
              >
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">@{user.username}</div>
                </div>
                <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                  Chat
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <div
              key={chat.user.id}
              className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedChat?.user.id === chat.user.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedChat(chat)}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {chat.user.name.charAt(0).toUpperCase()}
                </div>
                {chat.user.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              <div className="flex-1 ml-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{chat.user.name}</h3>
                  <span className="text-xs text-gray-500">
                    {chat.lastMessageTime && new Date(chat.lastMessageTime).toLocaleTimeString([], {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 truncate max-w-[150px]">
                    {chat.lastMessage}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {chats.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              No chats yet
            </div>
          )}
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-300 p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                  {selectedChat.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold">{selectedChat.user.name}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedChat.user.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              <div className="space-y-4">
                {messages
                  .filter(msg =>
                    msg.senderId === selectedChat.user.id ||
                    msg.receiverId === selectedChat.user.id
                  )
                  .map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === selectedChat.user.id ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === selectedChat.user.id
                            ? 'bg-white border border-gray-200'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderId === selectedChat.user.id
                              ? 'text-gray-500'
                              : 'text-blue-100'
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-300 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Your Messages
              </h3>
              <p className="text-gray-500">
                Select a chat or search for users to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import ChatList from "@/components/ChatList";
import {User , Message , Chat} from "../../../../shared/types"
// ✅ Shared interfaces


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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect Socket
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

    // Receive message
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

    // User found
    newSocket.on("user:found", (user: User) => {
      setFoundUsers((prev) => [...prev, user]);
    });

    // User online/offline
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
    return () => newSocket.disconnect();
  }, [selectedChat]);

  // Search users
  const searchUsers = () => {
    if (socket && searchQuery.trim()) {
      setFoundUsers([]);
      socket.emit("user:search", { username: searchQuery });
    }
  };

  // Start chat
  const startChat = (user: User) => {
    const existingChat = chats.find((chat) => chat.user.id === user.id);
    if (!existingChat) {
      const newChat: Chat = {
        roomId: `temp-${user.id}`,
        user,
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

  // Send message
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
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Left Sidebar */}
      <div className="w-1/3 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-blue-400 mb-3">Zing ⚡</h1>

          {/* Search */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              placeholder="Search users..."
              className="flex-1 p-2 bg-gray-800 border border-gray-700 text-gray-100 rounded focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={searchUsers}
              className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>

        {/* Search Results */}
        {foundUsers.length > 0 && (
          <div className="border-b border-gray-800 p-2">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Search Results</h3>
            {foundUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center p-3 hover:bg-gray-800 cursor-pointer rounded"
                onClick={() => startChat(user)}
              >
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3 text-gray-300">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{user.name}</div>
                </div>
                <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                  Chat
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ✅ Integrated ChatList */}
        <ChatList
          token={token}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          chats={chats}
          setChats={setChats}
        />
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="border-b border-gray-800 p-4 flex items-center bg-gray-850">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                {selectedChat.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold">{selectedChat.user.name}</h2>
                <p className="text-sm text-gray-400">
                  {selectedChat.user.isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950">
              {messages
                .filter(
                  (msg) =>
                    msg.senderId === selectedChat.user.id ||
                    msg.receiverId === selectedChat.user.id
                )
                .map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === selectedChat.user.id
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.senderId === selectedChat.user.id
                          ? "bg-gray-800 text-gray-100"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800 bg-gray-850 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 disabled:bg-gray-600"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">💬</div>
              <h3 className="text-lg font-semibold">Your Messages</h3>
              <p>Select a chat or search for users to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

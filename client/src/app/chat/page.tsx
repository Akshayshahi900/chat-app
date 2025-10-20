'use client';
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Menu, X, Search, Zap } from "lucide-react";
import ChatList from "@/components/ChatList";
import { User, Message, Chat } from "../../../../shared/types"
import Messages from "@/components/Messages";
import Logo from "@/components/ui/Logo";
import Profile from "@/components/Profile";

export default function ChatApp() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [foundUsers, setFoundUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    hasMore: true,
    nextCursor: null as string | null,
    isLoadingMore: false
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get current user on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUserId(data.user.id);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };

    if (token) getCurrentUser();
  }, [token]);

  // Load messages when chat is selected
  const loadMessages = async (roomId: string, loadMore: boolean = false) => {
    if (!token) return;

    try {
      if (!loadMore) {
        setMessages([]); // Clear messages for new chat
        setPagination({ hasMore: true, nextCursor: null, isLoadingMore: false });
      } else {
        setPagination(prev => ({ ...prev, isLoadingMore: true }));
      }

      const cursorParam = loadMore && pagination.nextCursor ? `&cursor=${pagination.nextCursor}` : '';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/messages/${roomId}?limit=20${cursorParam}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (loadMore) {
          // Prepend older messages
          setMessages(prev => [...data.messages, ...prev]);
        } else {
          // Set initial messages
          setMessages(data.messages);
        }

        setPagination({
          hasMore: data.pagination.hasMore,
          nextCursor: data.pagination.nextCursor,
          isLoadingMore: false
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setPagination(prev => ({ ...prev, isLoadingMore: false }));
    }
  };

  // Update selectChat function
  const selectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    await loadMessages(chat.roomId, false); // Load initial messages

    // Reset unread count
    setChats(prev => prev.map(c =>
      c.roomId === chat.roomId ? { ...c, unreadCount: 0 } : c
    ));
  };

  // Load more messages function
  const loadMoreMessages = () => {
    if (selectedChat && pagination.hasMore && !pagination.isLoadingMore) {
      loadMessages(selectedChat.roomId, true);
    }
  };

  // Connect Socket - FIXED VERSION
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

    // Receive message - UPDATED to handle real-time messages properly
    newSocket.on("message:received", (message: Message) => {
      console.log("📩 Real-time message received:", message);

      // If this message belongs to the currently selected chat, add it
      if (selectedChat && message.roomId === selectedChat.roomId) {
        setMessages(prev => [...prev, message]);
      }

      // Update chat list with new message
      setChats(prev => {
        const updatedChats = prev.map(chat => {
          if (chat.roomId === message.roomId) {
            return {
              ...chat,
              lastMessage: message.content,
              lastMessageTime: message.timestamp,
              unreadCount: selectedChat?.roomId === message.roomId ? 0 : chat.unreadCount + 1
            };
          }
          return chat;
        });

        // If this is a new chat (not in our list), add it
        const isNewChat = !prev.find(chat => chat.roomId === message.roomId);
        if (isNewChat) {
          const newChat: Chat = {
            roomId: message.roomId,
            user: message.sender, // The sender is the other user
            lastMessage: message.content,
            lastMessageTime: message.timestamp,
            unreadCount: selectedChat?.roomId === message.roomId ? 0 : 1
          };
          return [newChat, ...updatedChats];
        }

        return updatedChats;
      });
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

    // FIXED CLEANUP: Return a function that returns void
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [selectedChat]); // Added selectedChat dependency

  // Search users
  const searchUsers = () => {
    if (socket && searchQuery.trim()) {
      setFoundUsers([]);
      socket.emit("user:search", { username: searchQuery });
    }
  };

  // Start chat - UPDATED to use selectChat
  const startChat = async (user: User) => {
    const existingChat = chats.find((chat) => chat.user.id === user.id);

    if (existingChat) {
      await selectChat(existingChat);
    } else {
      // For new chat, create temporary entry
      const tempChat: Chat = {
        roomId: `temp-${Date.now()}`,
        user: user,
        lastMessage: 'Start chatting...',
        lastMessageTime: new Date(),
        unreadCount: 0
      };
      setSelectedChat(tempChat);
      setMessages([]);
    }
    setFoundUsers([]);
    setSearchQuery("");
  };

  // Send message
  // const sendMessage = () => {
  //   if (socket && selectedChat && newMessage.trim()) {
  //     socket.emit("message:send", {
  //       receiverId: selectedChat.user.id,
  //       content: newMessage,
  //     });
  //     setNewMessage("");
  //   }
  // };

  // ------------------------------
const sendMessage = (customMessage?: {
  messageType?: string;
  content?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
}) => {
  if (!socket || !selectedChat) return;

  // If sending text
  if (!customMessage && newMessage.trim()) {
    socket.emit("message:send", {
      receiverId: selectedChat.user.id,
      content: newMessage,
      type: "text",
    });
    setNewMessage("");
    return;
  }

  // If sending file (customMessage passed)
  if (customMessage) {
    socket.emit("message:send", {
      receiverId: selectedChat.user.id,
      content: customMessage.content || "",
      type: customMessage.messageType,
      fileUrl:customMessage.fileUrl,
      fileType: customMessage.fileType,
      fileName: customMessage.fileName,
      fileSize: customMessage.fileSize,
    });
  }
};

// --- Handle File Upload + Send ---
// const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//   const file = e.target.files?.[0];
//   if (!file) return;
//   if (file.size > 10 * 1024 * 1024) {
//     alert("File size must be less than 10MB");
//     return;
//   }

//   try {
//     const formData = new FormData();
//     formData.append("file", file);

//     const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/messages/upload`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       body: formData,
//     });

//     const data = await res.json();
//     if (!res.ok) {
//       alert(data.message || "Upload failed");
//       return;
//     }

//     // Send via socket after successful upload
//     sendMessage({
//       type: data.type.startsWith("image")
//         ? "image"
//         : data.type.startsWith("video")
//         ? "video"
//         : "file",
//       content: data.url,
//       fileName: data.name,
//       fileSize: data.size,
//     });
//   } catch (err) {
//     console.error("File upload error:", err);
//     alert("File upload failed");
//   }
// };

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    alert("File size must be less than 10MB");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/messages/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Upload failed");
      return;
    }

    // Send message through socket after upload
    socket?.emit("message:send", {
      receiverId: selectedChat?.user.id,
      content: data.url,
      messageType: data.type,
      fileUrl: data.url,
      fileType: file.type,
      fileName: data.name,
      fileSize: data.size,
    });
  } catch (err) {
    console.error("File upload error:", err);
    alert("File upload failed");
  }
};

  // ---------------------------------
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   if (file.size > 10 * 1024 * 1024) {
  //     alert("File size must be less than 10MB");
  //     return;
  //   }
  //   const formdata = new FormData();
  //   formdata.append("file", file);

  //   const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/messages/upload`, {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${token}`
  //     }
  //     ,
  //     body: formdata
  //   });

  //   const data = await res.json();
  //   if(res.ok){
  //     sendMessage({
  //       type: "file",
  //       content: data.url,
  //       sender: user
  //     });
  //   }
  // }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Left Sidebar with Hamburger Menu */}
      <div className={`${isCollapsed ? 'w-16' : 'md:w-1/2 lg:w-1/3'} bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300`}>
        <div className="p-4 border-b border-gray-800">
          {/* Header with Logo and Hamburger */}
          <div className="flex items-center justify-between mb-3">
            {!isCollapsed && <Logo isCollapsed={isCollapsed} />}
            {isCollapsed && (
              <div className="w-full flex justify-center">
                <Logo isCollapsed={isCollapsed} />
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>

          {/* Search - Expanded View */}
          {!isCollapsed && (
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
          )}

          {/* Search - Collapsed View (Icon Only) */}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-full p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors flex items-center justify-center"
              title="Search users"
            >
              <Search className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Search Results - Only show when expanded */}
        {!isCollapsed && foundUsers.length > 0 && (
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

        {/* Integrated ChatList */}
        <ChatList
          token={token}
          selectedChat={selectedChat}
          setSelectedChat={selectChat}
          chats={chats}
          setChats={setChats}
          isCollapsed={isCollapsed}
        />
        <Profile isCollapsed={isCollapsed} />
      </div>

      {/* Right Chat Area */}
      <Messages
        selectedChat={selectedChat}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSendMessage={sendMessage}
        onKeyPress={handleKeyPress}
        messagesEndRef={messagesEndRef}
        currentUserId={currentUserId}
        onLoadMore={loadMoreMessages}
        isLoadingMore={pagination.isLoadingMore}
        hasMore={pagination.hasMore}
        handleFileChange={handleFileChange}
      />
    </div>
  );
}
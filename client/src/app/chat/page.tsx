'use client'

import { useEffect, useRef, useState } from "react";
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
  const [token, setToken] = useState('');

  //chat states

  const [searchQuery, setSearchQuery] = useState('');
  const [foundUsers, setFoundUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, seSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  //Auto scroll to Bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [messages]);


  //connect to Socket.io
  const connectSocket = () => {
    if (!token) {
      alert('Please enter your JWT token');
      return;
    }
    const newSocket = io(process.env.NEXT_PUBLIC_SERVER_URL, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('message:received', (message: Message) => {
      setMessages(prev => [...prev, message]);

      //Update chats list with new messages
      setChats(prev => prev.map(chat => {
        if (chat.user.id === message.senderId || chat.user.id === message.receiverId) {
          return {
            ...chat,
            lastMessage: message.content,
            lastMessageTime: message.timestamp,
            unreadCount: selectedChat?.user.id === message.senderId ? 0 : chat.unreadCount + 1
          };
        }
        return chat;
      }));
    });

    newSocket.on('user:found', (user: User) => {
      setFoundUsers(prev => [...prev, user]);
    })

    newSocket.on('user:online', (data: { userId: string; username: string }) => {
      setChats(prev => prev.map(chat => chat.user.id === data.userId ? { ...chat, user: { ...chat.user, isOnline: true } }
        : chat
      ));
    });
    
    newSocket.on('user:offline', (data:{userId :string ; username :string}) =>{
      setChats(prev => prev.map(chat =>
        chat.user.id === data.userId
        ? {...chat, user :{...chat.user , isOnline :false}}
        : chat
      ));
    });

    setSocket(newSocket);

    //search users
    const searchUsers = () =>{
      if(socket && searchQuery.trim()){
        setFoundUsers([]);
        socket.emit('user:search', {username:searchQuery});
      }
    };

    

  }
}
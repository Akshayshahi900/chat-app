'use client'

import { useState } from "react";
import { Socket } from "socket.io-client";

interface User{
  id:String;
  name:string;
  username:string;
  profilePic?:string;
  About?:string;
}
interface Message{
  id:string;
  roomId :string;
  senderId: string;
  receiverId:string;
  content:string;
  messageType:string;
  timestamp:Date;
  sender:User;
}

interface OnlineUser{
  userId :string;
  username:string;
  isOnline:boolean;
}

export default function ChatPage() {
  const [socket, setsocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [token , setToken] = useState('');
  const [searchUsername , setSearchUsername] = useState('');
  const [foundUsers , setReceiverId] = useState<User[]>([]);
  
  return (
    <></>
  )
}

export interface User {
  id: string;
  name: string;
  username: string;
  profilePic?: string;
  About?: string;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: string;
  timestamp: Date;
  sender: User;
}

export interface Chat {
  user: User;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}
// ✅ Shared interfaces
export interface User {
  id: string;
  name: string;
  username?: string;
  profilePic?: string | null;
  About?: string | null;
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
  roomId: string;
  user: User;
  lastMessage?: string;
  lastMessageTime?: Date | string;
  unreadCount: number;
}

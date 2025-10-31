export interface ServerToClientEvents {
  'user:online': (data: { userId: string; username: string }) => void;
  'user:offline': (data: { userId: string; username: string }) => void;
  'message:received': (data: SimpleMessage) => void; // Changed to SimpleMessage
  'user:found': (data: SimpleUser) => void; // Changed to SimpleUser
  'user:not_found': () => void;
}

export interface ClientToServerEvents {
  'user:online': () => void;
  'user:search': (data: { username: string }) => void;
  'message:send': (data: {
    fileUrl: null;
    fileSize: null;
    fileType: null;
    fileName: null;
    messageType: string; 
    receiverId: string; 
    content: string; 
  }) => void;
  'room:join': (data: { roomId: string }) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId: string;
  username: string;
}

// Simple user without sensitive data
export interface SimpleUser {
  id: string;
  name: string;
  username: string;
  profilePic?: string;
  About?: string;
}

// Simple message for real-time communication
export interface SimpleMessage {
  id: string;
  roomId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: string;
  timestamp: Date;
  sender: SimpleUser;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  fileSize?: number;
}


// Keep the original User interface for database
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  profilePic?: string;
  About?: string;
}


export interface MessageReceivedPayload {
  receiverId: string;
  content?: string;
  messageType?: 'text' | 'image' | 'video' | 'file';
  fileUrl?: string | null;
  fileType?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
}
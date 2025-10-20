export interface MessageSendPayload {
  receiverId: string;
  content?: string;
  messageType?: string;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  fileSize?: number;
}

export interface MessageReceivedPayload {
  id: string;
  roomId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: string;
  timestamp: Date;
  sender: {
    id: string;
    name: string;
    username: string;
    profilePic?: string;
  };
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  fileSize?: number;
}

// Define all socket events
export interface ServerToClientEvents {
  "message:received": (data: MessageReceivedPayload) => void;
  "user:online": (userId: string) => void;
  "user:offline": (userId: string) => void;
}

export interface ClientToServerEvents {
  "message:send": (data: MessageSendPayload) => void;
  "user:online": () => void;
}
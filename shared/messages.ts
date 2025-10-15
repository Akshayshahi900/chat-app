import { Message, Chat } from './types';

export interface MessagesProps {
  selectedChat: Chat | null;
  messages: Message[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null> ;
   currentUserId: string | null; // 🆕 ADD THIS
  onLoadMore: () => void; // 🆕 ADD THIS
  isLoadingMore: boolean; // 🆕 ADD THIS
  hasMore: boolean; // 🆕 ADD THIS
}
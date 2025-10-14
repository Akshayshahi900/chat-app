import React from 'react';
import { MessagesProps } from '../../../shared/messages';

const Messages: React.FC<MessagesProps> = ({
  selectedChat,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  onKeyPress,
  messagesEndRef
}) => {
  return (
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
              onKeyPress={onKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={onSendMessage}
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
  );
};

export default Messages;